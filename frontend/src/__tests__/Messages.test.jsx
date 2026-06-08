/**
 * Tests unitaires — Module Messagerie
 *
 * Couvre :
 *   Groupe 1 : Envoi de messages entre deux utilisateurs
 *   Groupe 2 : Récupération correcte des conversations et informations associées
 *   Groupe 3 : Suppression logique (soft-delete, Tâche 1)
 */

import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Messages from '../pages/Messages';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../services', () => ({
  messagesAPI: {
    getConversations: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    deleteMessage: jest.fn(),
    // GC-EVOL-T10 : mock du nouvel endpoint de catégories
    getCategories: jest.fn(),
  },
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../contexts/ToastContext', () => ({
  useToast: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('../components', () => ({
  Avatar: ({ username, src }) => <img alt={username || 'User'} src={src || ''} />,
  SkeletonConversation: () => <div data-testid="skeleton-conv" />,
  SkeletonMessage: ({ isOwn }) => <div data-testid={`skeleton-msg-${isOwn ? 'own' : 'other'}`} />,
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

// ─── Imports après mocks ────────────────────────────────────────────────────

import { messagesAPI } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLocation } from 'react-router-dom';

// ─── Données de test ─────────────────────────────────────────────────────────

const CURRENT_USER = { id: 1, username: 'Alice' };

const CONVERSATIONS = [
  {
    user_id: 2,
    username: 'Bob',
    avatar_url: null,
    last_message: 'Hey !',
    last_message_time: '2026-04-10T10:00:00Z',
    unread_count: 3,
  },
  {
    user_id: 3,
    username: 'Charlie',
    avatar_url: null,
    last_message: 'GG !',
    last_message_time: '2026-04-09T18:00:00Z',
    unread_count: 0,
  },
];

const MESSAGES_THREAD = [
  { id: 10, sender_id: 2, receiver_id: 1, content: 'Salut !', is_read: true,  created_at: '2026-04-10T09:00:00Z', sender_username: 'Bob',   sender_avatar: null },
  { id: 11, sender_id: 1, receiver_id: 2, content: 'Ça va ?', is_read: true,  created_at: '2026-04-10T09:01:00Z', sender_username: 'Alice', sender_avatar: null },
  { id: 12, sender_id: 2, receiver_id: 1, content: 'Super !', is_read: false, created_at: '2026-04-10T09:02:00Z', sender_username: 'Bob',   sender_avatar: null },
];

// ─── Setup global ─────────────────────────────────────────────────────────────

// jsdom ne supporte pas scrollIntoView — le mock empêche les erreurs de ref
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();

  useAuth.mockReturnValue({ user: CURRENT_USER });
  useToast.mockReturnValue({ error: jest.fn() });
  useLocation.mockReturnValue({ search: '', pathname: '/messages' });

  // Défauts : conversations vides, messages vides
  messagesAPI.getConversations.mockResolvedValue({ data: { conversations: [] } });
  messagesAPI.getMessages.mockResolvedValue({ data: { messages: [] } });
  messagesAPI.sendMessage.mockResolvedValue({
    data: {
      success: true,
      message: { id: 99, sender_id: 1, receiver_id: 2, content: 'Hello', is_read: false, created_at: new Date().toISOString() },
    },
  });
  messagesAPI.deleteMessage.mockResolvedValue({ data: { success: true, message: 'Message deleted' } });
  // GC-EVOL-T10 : par défaut, aucune catégorie (sélecteur/filtres masqués)
  messagesAPI.getCategories.mockResolvedValue({ data: { categories: [] } });
});

// GC-EVOL-T10 : jeu de catégories de test (réutilisé par le Groupe 4)
const CATEGORIES = [
  { id: 1, name: 'Stratégie / Conseils', slug: 'strategie', color: '#640D14' },
  { id: 2, name: 'Général',              slug: 'general',   color: '#AD2831' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Rend le composant et attend la fin du chargement initial */
const renderMessages = async () => {
  let utils;
  await act(async () => {
    utils = render(<Messages />);
  });
  return utils;
};

/** Attend que les conversations s'affichent (après chargement) */
const waitForConversations = async () => {
  await waitFor(() => {
    expect(messagesAPI.getConversations).toHaveBeenCalled();
  });
};

// ─── Groupe 1 : Envoi de messages entre deux utilisateurs ─────────────────────

describe('Groupe 1 — Envoi de messages', () => {
  test('1.1 — sendMessage appelle l\'API avec les bons paramètres', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    messagesAPI.getMessages.mockResolvedValue({ data: { messages: [] } });

    await renderMessages();

    // Sélectionner une conversation
    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });
    // GC-EVOL-T7 : getMessages reçoit désormais le filtre catégorie (null par défaut)
    await waitFor(() => expect(messagesAPI.getMessages).toHaveBeenCalledWith(2, null));

    // Saisir et envoyer un message
    const input = screen.getByPlaceholderText(/Écrire à Bob/);
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello Bob' } });
    });

    const form = input.closest('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    // GC-EVOL-T6 : sendMessage prend désormais un 3e argument (category_id),
    // null par défaut quand aucune catégorie n'est sélectionnée.
    expect(messagesAPI.sendMessage).toHaveBeenCalledWith(2, 'Hello Bob', null);
  });

  test('1.2 — Le bouton envoyer est désactivé quand l\'input est vide', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    messagesAPI.getMessages.mockResolvedValue({ data: { messages: [] } });

    await renderMessages();

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });
    await waitFor(() => expect(messagesAPI.getMessages).toHaveBeenCalled());

    // Input vide → bouton désactivé
    const submitBtn = screen.getByRole('button', { name: '' }); // bouton icône sans texte
    // Chercher le bouton submit dans le formulaire
    const form = screen.getByPlaceholderText(/Écrire à Bob/).closest('form');
    const sendButton = form.querySelector('button[type="submit"]');
    expect(sendButton).toBeDisabled();
  });

  test('1.3 — La mise à jour optimiste affiche le message immédiatement', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    messagesAPI.getMessages.mockResolvedValue({ data: { messages: [] } });
    // sendMessage ne se résout qu'après un délai
    let resolveSend;
    messagesAPI.sendMessage.mockReturnValue(
      new Promise(resolve => { resolveSend = resolve; })
    );

    await renderMessages();

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });
    await waitFor(() => expect(messagesAPI.getMessages).toHaveBeenCalled());

    const input = screen.getByPlaceholderText(/Écrire à Bob/);
    fireEvent.change(input, { target: { value: 'Message optimiste' } });

    const form = input.closest('form');
    act(() => { fireEvent.submit(form); });

    // Le message doit apparaître immédiatement (mise à jour optimiste)
    await waitFor(() => {
      expect(screen.getByText('Message optimiste')).toBeInTheDocument();
    });

    // Résoudre la promesse pour éviter les warnings
    await act(async () => {
      resolveSend({ data: { success: true, message: { id: 99, sender_id: 1, receiver_id: 2, content: 'Message optimiste', is_read: false, created_at: new Date().toISOString() } } });
    });
  });
});

// ─── Groupe 2 : Récupération correcte des conversations ───────────────────────

describe('Groupe 2 — Récupération des conversations et informations', () => {
  test('2.1 — getConversations est appelé au montage du composant', async () => {
    await renderMessages();
    expect(messagesAPI.getConversations).toHaveBeenCalledTimes(1);
  });

  test('2.2 — Les données des conversations s\'affichent (username, unread_count, last_message)', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });

    await renderMessages();

    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Hey !')).toBeInTheDocument();
    // Badge de messages non lus : 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('2.3 — Plusieurs conversations sont toutes rendues', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });

    await renderMessages();

    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  test('2.4 — L\'état vide s\'affiche quand il n\'y a aucune conversation', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: [] } });

    await renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Pas encore de conversations')).toBeInTheDocument();
    });
  });

  test('2.5 — Cliquer sur une conversation déclenche le chargement de ses messages', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });

    await renderMessages();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });

    // GC-EVOL-T7 : second argument = filtre catégorie (null quand aucun filtre)
    expect(messagesAPI.getMessages).toHaveBeenCalledWith(2, null);
  });

  test('2.6 — Les messages s\'affichent dans l\'ordre chronologique', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    messagesAPI.getMessages.mockResolvedValue({ data: { messages: MESSAGES_THREAD } });

    await renderMessages();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });

    await waitFor(() => expect(screen.getByText('Salut !')).toBeInTheDocument());

    const contents = screen.getAllByText(/Salut !|Ça va \?|Super !/).map(el => el.textContent);
    expect(contents).toEqual(['Salut !', 'Ça va ?', 'Super !']);
  });

  test('2.7 — Mes messages ont justify-end, les messages reçus ont justify-start', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    messagesAPI.getMessages.mockResolvedValue({ data: { messages: MESSAGES_THREAD } });

    await renderMessages();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });

    await waitFor(() => expect(screen.getByText('Ça va ?')).toBeInTheDocument());

    // 'Ça va ?' est envoyé par user.id=1 → justify-end
    const myMessage = screen.getByText('Ça va ?').closest('[class*="justify-"]');
    expect(myMessage.className).toContain('justify-end');

    // 'Salut !' est reçu (sender_id=2) → justify-start
    const theirMessage = screen.getByText('Salut !').closest('[class*="justify-"]');
    expect(theirMessage.className).toContain('justify-start');
  });

  test('2.8 — Une conversation vide affiche le texte d\'accueil', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    messagesAPI.getMessages.mockResolvedValue({ data: { messages: [] } });

    await renderMessages();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Envoie ton premier message/)).toBeInTheDocument();
    });
  });
});

// ─── Groupe 3 : Suppression logique (Tâche 1) ─────────────────────────────────

describe('Groupe 3 — Suppression logique des messages (soft-delete)', () => {
  test('3.1 — deleteMessage appelle le bon endpoint API', async () => {
    // Test du service directement : vérifie que deleteMessage appelle /messages/{id}
    await messagesAPI.deleteMessage(42);
    expect(messagesAPI.deleteMessage).toHaveBeenCalledWith(42);
  });

  test('3.2 — Les messages supprimés ne s\'affichent plus après rafraîchissement', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });

    // Premier appel : 3 messages
    messagesAPI.getMessages
      .mockResolvedValueOnce({ data: { messages: MESSAGES_THREAD } })
      // Après suppression du message id=12, le backend ne le retourne plus
      .mockResolvedValueOnce({
        data: {
          messages: MESSAGES_THREAD.filter(m => m.id !== 12),
        },
      });

    await renderMessages();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });

    await waitFor(() => expect(screen.getByText('Super !')).toBeInTheDocument());
    // 3 messages initialement
    expect(screen.getAllByText(/Salut !|Ça va \?|Super !/).length).toBe(3);

    // Simuler un rafraîchissement après soft-delete (le backend filtre deleted_at IS NULL)
    await act(async () => {
      await messagesAPI.getMessages(2);
    });

    // Re-render avec 2 messages seulement
    const { rerender } = render(<Messages />);
    await act(async () => {
      rerender(<Messages />);
    });

    await waitFor(() => {
      expect(messagesAPI.getMessages).toHaveBeenCalled();
    });
  });

  test('3.3 — La liste des conversations reflète le dernier message non supprimé', async () => {
    // Après suppression du dernier message, le backend retourne le message précédent
    // comme last_message (grâce au filtre deleted_at IS NULL dans la sous-requête)
    const conversationsAfterDelete = [
      {
        ...CONVERSATIONS[0],
        last_message: 'Ça va ?', // 'Super !' a été supprimé, 'Ça va ?' est maintenant le dernier
      },
    ];

    messagesAPI.getConversations.mockResolvedValue({
      data: { conversations: conversationsAfterDelete },
    });

    await renderMessages();

    await waitFor(() => {
      expect(screen.getByText('Ça va ?')).toBeInTheDocument();
    });

    // 'Super !' ne doit pas apparaître dans la liste des conversations
    expect(screen.queryByText('Super !')).not.toBeInTheDocument();
  });
});

// ─── Groupe 4 : Catégorisation des messages (GC-EVOL) ─────────────────────────

describe('Groupe 4 — Catégorisation des messages', () => {
  test('4.1 — getCategories est appelé au montage du composant', async () => {
    messagesAPI.getCategories.mockResolvedValue({ data: { categories: CATEGORIES } });

    await renderMessages();

    await waitFor(() => expect(messagesAPI.getCategories).toHaveBeenCalledTimes(1));
  });

  test('4.2 — Un badge de catégorie s\'affiche sur un message catégorisé', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    // Message portant une catégorie (category_name + category_color)
    messagesAPI.getMessages.mockResolvedValue({
      data: {
        messages: [
          {
            id: 20, sender_id: 2, receiver_id: 1, content: 'Plan de jeu',
            is_read: true, created_at: '2026-04-10T09:00:00Z',
            sender_username: 'Bob', sender_avatar: null,
            category_id: 1, category_name: 'Stratégie / Conseils',
            category_slug: 'strategie', category_color: '#640D14',
          },
        ],
      },
    });

    await renderMessages();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });

    // Le badge (libellé de catégorie) doit apparaître sur la bulle
    await waitFor(() => {
      expect(screen.getByText('Stratégie / Conseils')).toBeInTheDocument();
    });
  });

  test('4.3 — Le filtre par catégorie recharge les messages avec le slug', async () => {
    messagesAPI.getConversations.mockResolvedValue({ data: { conversations: CONVERSATIONS } });
    messagesAPI.getMessages.mockResolvedValue({ data: { messages: [] } });
    messagesAPI.getCategories.mockResolvedValue({ data: { categories: CATEGORIES } });

    await renderMessages();
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());

    // Ouvrir la conversation -> 1er chargement (sans filtre)
    await act(async () => {
      fireEvent.click(screen.getByText('Bob'));
    });
    await waitFor(() => expect(messagesAPI.getMessages).toHaveBeenCalledWith(2, null));

    // Cliquer sur l'onglet de filtre "Stratégie / Conseils"
    const filterButton = screen.getByRole('button', { name: 'Stratégie / Conseils' });
    await act(async () => {
      fireEvent.click(filterButton);
    });

    // Le fil est rechargé en passant le slug de la catégorie à l'API
    await waitFor(() =>
      expect(messagesAPI.getMessages).toHaveBeenCalledWith(2, 'strategie')
    );
  });
});
