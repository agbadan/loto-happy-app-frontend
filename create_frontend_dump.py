import os

# --- Configuration ---
# Répertoires à inclure dans la recherche. '.' signifie la racine du projet.
SEARCH_ROOTS = ['.'] 
OUTPUT_FILE = "frontend_dump.txt"

# Extensions de fichiers de code source à inclure
INCLUDE_EXTENSIONS = (
    '.ts', '.tsx',   # TypeScript / React
    '.js', '.jsx',   # JavaScript / React
    '.vue',          # Vue.js
    '.svelte',       # Svelte
    '.css', '.scss', # Stylesheets
    '.html',         # HTML
    'package.json',  # Pour voir les dépendances
    'vite.config.ts',# Configuration du build
    'tailwind.config.js' # Configuration Tailwind
)

# Dossiers à ignorer COMPLÈTEMENT (très important)
EXCLUDE_DIRS = {
    'node_modules',  # Absolument essentiel d'ignorer ce dossier
    'dist',          # Dossier de build
    'build',         # Dossier de build
    '.git',          # Dossier Git
    'public',        # Souvent des assets statiques (index.html est une exception)
    'assets',        # Images, polices, etc.
    '.vscode',       # Configuration de l'éditeur
    '__pycache__'
}

# Fichiers spécifiques à ignorer par leur nom
EXCLUDE_FILES = {
    'package-lock.json',
    'yarn.lock',
    '.env' # Ne jamais inclure les secrets
}

def dump_frontend_code():
    """
    Parcourt le projet frontend, lit le contenu des fichiers de code source pertinents,
    et les écrit dans un seul fichier de sortie.
    """
    print(f"Début de la création du dump dans '{OUTPUT_FILE}'...")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        outfile.write("# Dump du code source du projet LOTO-HAPPY-FRONTEND\n\n")

    file_count = 0
    for root_dir in SEARCH_ROOTS:
        for root, dirs, files in os.walk(root_dir, topdown=True):
            # Filtre les répertoires à ne pas visiter
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for filename in files:
                file_path = os.path.join(root, filename)
                
                # Vérifie si le fichier doit être inclus
                if filename.endswith(INCLUDE_EXTENSIONS) and filename not in EXCLUDE_FILES:
                    normalized_path = file_path.replace(os.sep, '/')
                    
                    print(f"  -> Lecture de : {normalized_path}")
                    
                    with open(OUTPUT_FILE, "a", encoding="utf-8") as outfile:
                        outfile.write("=" * 80 + "\n")
                        outfile.write(f"--- FICHIER : {normalized_path} ---\n")
                        outfile.write("=" * 80 + "\n\n")
                        
                        try:
                            with open(file_path, "r", encoding="utf-8") as infile:
                                outfile.write(infile.read())
                            outfile.write("\n\n")
                            file_count += 1
                        except Exception as e:
                            error_message = f"!!! ERREUR de lecture du fichier {normalized_path}: {e}\n\n"
                            print(f"  [AVERTISSEMENT] {error_message}")
                            outfile.write(error_message)

    print("-" * 30)
    print(f"✅ Opération terminée. {file_count} fichiers ont été ajoutés à '{OUTPUT_FILE}'.")
    print("Vous pouvez maintenant m'envoyer le contenu de ce fichier pour analyse.")

if __name__ == "__main__":
    dump_frontend_code()