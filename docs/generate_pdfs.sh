#!/usr/bin/env bash
# ============================================================
# GameConnect — Génération des PDFs depuis les fichiers Markdown
# Usage : cd docs && bash generate_pdfs.sh
# Dépendances : npx md-to-pdf (installé via npm)
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PDF_DIR="$SCRIPT_DIR/pdf"

echo "📄 Génération des PDFs — GameConnect Documentation"
echo "=================================================="

# Créer le dossier pdf/ s'il n'existe pas
mkdir -p "$PDF_DIR"

# Style CSS pour les PDFs (thème professionnel)
CSS="
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
  h1 { color: #8B0000; border-bottom: 3px solid #8B0000; padding-bottom: 8px; }
  h2 { color: #AD2831; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  h3 { color: #555; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th { background: #8B0000; color: white; padding: 8px 12px; text-align: left; }
  td { border: 1px solid #ddd; padding: 6px 12px; }
  tr:nth-child(even) { background: #f9f9f9; }
  code { background: #f4f4f4; border-radius: 3px; padding: 2px 6px; font-size: 12px; }
  pre { background: #1e1e1e; color: #d4d4d4; border-radius: 6px; padding: 16px; overflow-x: auto; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #8B0000; margin: 16px 0; padding: 8px 16px; background: #fff8f8; }
  .mermaid { background: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; padding: 16px; }
"

# Fonction de conversion
convert_md() {
  local src="$1"
  local name=$(basename "$src" .md)
  local dir=$(basename "$(dirname "$src")")
  local dest="$PDF_DIR/${dir}_${name}.pdf"

  echo -n "  → $dir/$name.md ... "
  local src_pdf="${src%.md}.pdf"
  md-to-pdf \
    --stylesheet-encoding utf-8 \
    --highlight-style github \
    --launch-options '{"args":["--no-sandbox","--disable-setuid-sandbox"]}' \
    "$src" \
    2>/dev/null

  if [ -f "$src_pdf" ]; then
    mv "$src_pdf" "$dest"
    echo "✅ $(basename "$dest")"
  else
    echo "⚠️  Erreur"
  fi
}

# ============================================================
# Conversion de tous les fichiers Markdown
# ============================================================

echo ""
echo "01 — Contexte"
convert_md "$SCRIPT_DIR/01_contexte/cahier_des_charges.md"
convert_md "$SCRIPT_DIR/01_contexte/expression_besoins.md"

echo ""
echo "02 — Analyse"
convert_md "$SCRIPT_DIR/02_analyse/cas_utilisation.md"
convert_md "$SCRIPT_DIR/02_analyse/regles_metier.md"
convert_md "$SCRIPT_DIR/02_analyse/choix_technologiques.md"

echo ""
echo "03 — Conception"
convert_md "$SCRIPT_DIR/03_conception/MCD.md"
convert_md "$SCRIPT_DIR/03_conception/MLD.md"
convert_md "$SCRIPT_DIR/03_conception/diagramme_classes.md"
convert_md "$SCRIPT_DIR/03_conception/diagrammes_sequences.md"
convert_md "$SCRIPT_DIR/03_conception/architecture.md"
convert_md "$SCRIPT_DIR/03_conception/maquettes.md"

echo ""
echo "04 — Réalisation"
convert_md "$SCRIPT_DIR/04_realisation/environnement_dev.md"
convert_md "$SCRIPT_DIR/04_realisation/base_de_donnees.md"

echo ""
echo "05 — Tests"
convert_md "$SCRIPT_DIR/05_tests/plan_tests.md"
convert_md "$SCRIPT_DIR/05_tests/rapport_tests.md"

echo ""
echo "06 — Documentation"
convert_md "$SCRIPT_DIR/06_documentation/guide_installation.md"
convert_md "$SCRIPT_DIR/06_documentation/guide_utilisateur.md"

echo ""
echo "07 — Bilan"
convert_md "$SCRIPT_DIR/07_bilan/bilan.md"

echo ""
echo "=================================================="
echo "✅ Génération terminée. PDFs disponibles dans : $PDF_DIR"
echo ""
ls -lh "$PDF_DIR"/*.pdf 2>/dev/null || echo "Aucun PDF généré (vérifier les erreurs ci-dessus)"
