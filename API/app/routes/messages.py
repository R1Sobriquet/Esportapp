"""
Messages routes.
Handles conversations and messaging between matched users.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Depends

from ..models.message import Message
from ..services.auth import get_current_user_id
from ..database import DatabaseSession

router = APIRouter()


# =====================================================================
# GC-EVOL-T3 : Catégories de messages — endpoint public
# =====================================================================
# Renvoie la table de référence message_categories (Besoin 2).
# Public : pas besoin d'un match accepté, le front en a besoin pour
# alimenter le sélecteur de catégorie et la barre de filtres.
@router.get("/messages/categories")
def get_message_categories():
    """
    Liste toutes les catégories de messages disponibles.

    Endpoint public — utilisé par le front pour le sélecteur d'envoi
    et la barre de filtres. Triées par id (ordre d'insertion).
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute(
            """
            SELECT id, name, slug, color
            FROM message_categories
            ORDER BY id ASC
            """
        )
        return {"categories": db.fetchall()}


@router.get("/messages")
def get_conversations(user_id: int = Depends(get_current_user_id)):
    """
    Get all conversations for the current user.

    Returns a list of conversations with last message and unread count.
    Only considers non-deleted messages (deleted_at IS NULL).
    """
    with DatabaseSession(dict_cursor=True) as db:
        db.execute(
            """
            SELECT
                u.id as user_id,
                u.username,
                p.avatar_url,
                MAX(m.created_at) as last_message_time,
                (
                    SELECT content FROM messages
                    WHERE ((sender_id = u.id AND receiver_id = %s)
                       OR (sender_id = %s AND receiver_id = u.id))
                       AND deleted_at IS NULL
                    ORDER BY created_at DESC LIMIT 1
                ) as last_message,
                COUNT(CASE WHEN m.is_read = 0 AND m.receiver_id = %s THEN 1 END) as unread_count
            FROM users u
            JOIN user_profiles p ON u.id = p.user_id
            JOIN messages m ON ((m.sender_id = u.id AND m.receiver_id = %s)
                            OR (m.sender_id = %s AND m.receiver_id = u.id))
                           AND m.deleted_at IS NULL
            WHERE u.id != %s
            GROUP BY u.id
            ORDER BY last_message_time DESC
            """,
            (user_id, user_id, user_id, user_id, user_id, user_id),
        )

        return {"conversations": db.fetchall()}


@router.get("/messages/{other_user_id}")
def get_messages(
    other_user_id: int,
    category: Optional[str] = None,
    user_id: int = Depends(get_current_user_id),
):
    """
    Get messages between current user and another user.

    Only returns non-deleted messages (deleted_at IS NULL).

    Args:
        other_user_id: The ID of the other user in the conversation
        category: GC-EVOL-T3 — slug de catégorie optionnel pour filtrer
                  le fil (ex: "strategie"). Si absent, tous les messages.

    Returns:
        List of messages in the conversation
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Check if users are matched
        db.execute(
            """
            SELECT id FROM matches
            WHERE ((user1_id = %s AND user2_id = %s) OR (user1_id = %s AND user2_id = %s))
                AND status = 'accepted'
            """,
            (user_id, other_user_id, other_user_id, user_id),
        )

        if not db.fetchone():
            raise HTTPException(status_code=403, detail="You can only message matched users")

        # GC-EVOL-T3 : LEFT JOIN sur message_categories pour récupérer le
        # libellé/slug/couleur de la catégorie (NULL si message non catégorisé).
        # Le filtre optionnel `category` (slug) est ajouté dynamiquement.
        params = [user_id, other_user_id, other_user_id, user_id]
        category_filter = ""
        if category:
            category_filter = " AND mc.slug = %s"
            params.append(category)

        # Get messages — exclut les messages supprimés logiquement
        db.execute(
            f"""
            SELECT
                m.id,
                m.sender_id,
                m.receiver_id,
                m.content,
                m.is_read,
                m.created_at,
                m.category_id,
                mc.name AS category_name,
                mc.slug AS category_slug,
                mc.color AS category_color,
                u.username as sender_username,
                p.avatar_url as sender_avatar
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            JOIN user_profiles p ON u.id = p.user_id
            LEFT JOIN message_categories mc ON m.category_id = mc.id
            WHERE ((m.sender_id = %s AND m.receiver_id = %s)
               OR (m.sender_id = %s AND m.receiver_id = %s))
               AND m.deleted_at IS NULL
               {category_filter}
            ORDER BY m.created_at ASC
            """,
            tuple(params),
        )

        messages = db.fetchall()

        # Mark as read — uniquement les messages non supprimés
        db.execute(
            """
            UPDATE messages SET is_read = TRUE
            WHERE sender_id = %s AND receiver_id = %s
                AND is_read = FALSE
                AND deleted_at IS NULL
            """,
            (other_user_id, user_id),
        )

        return {"messages": messages}


@router.post("/messages")
def send_message(message: Message, user_id: int = Depends(get_current_user_id)):
    """
    Send a message to another user.

    Users can only message each other if they have an accepted match.
    """
    with DatabaseSession() as db:
        # Verify users are matched
        db.execute(
            """
            SELECT id FROM matches
            WHERE (
                (user1_id = %s AND user2_id = %s) OR
                (user1_id = %s AND user2_id = %s)
            )
            AND status = 'accepted'
            """,
            (user_id, message.receiver_id, message.receiver_id, user_id),
        )

        if not db.fetchone():
            raise HTTPException(status_code=403, detail="You can only message matched users")

        # Insert the message
        # GC-EVOL-T3 : on persiste category_id (peut être NULL si non fourni).
        db.execute(
            """
            INSERT INTO messages (sender_id, receiver_id, content, category_id, is_read)
            VALUES (%s, %s, %s, %s, FALSE)
            """,
            (user_id, message.receiver_id, message.content, message.category_id),
        )

        return {"success": True, "message": "Message sent"}


@router.delete("/messages/{message_id}")
def delete_message(message_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Suppression logique d'un message (soft-delete).

    Le message n'est pas réellement supprimé de la base de données —
    sa colonne deleted_at est renseignée avec l'heure courante.
    L'historique est ainsi préservé, mais le message ne s'affiche plus.

    Seuls l'expéditeur ou le destinataire peuvent supprimer un message.
    """
    with DatabaseSession(dict_cursor=True) as db:
        # Vérifier que le message existe et que l'utilisateur y a accès
        db.execute(
            """
            SELECT id, sender_id, receiver_id, deleted_at
            FROM messages
            WHERE id = %s
            """,
            (message_id,),
        )
        message = db.fetchone()

        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        if message["deleted_at"] is not None:
            raise HTTPException(status_code=404, detail="Message not found")

        if message["sender_id"] != user_id and message["receiver_id"] != user_id:
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own messages",
            )

        # Soft-delete : on horodate la suppression sans effacer la ligne
        db.execute(
            "UPDATE messages SET deleted_at = NOW() WHERE id = %s",
            (message_id,),
        )

        return {"success": True, "message": "Message deleted"}
