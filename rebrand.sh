#!/bin/bash
# Rebranding script: AnythingLLM -> Shroud LLM

# Files to exclude from rebranding
EXCLUDE_DIRS="node_modules|\.git|\.vscode|LICENSE\.upstream"

# Function to replace in files
replace_in_files() {
    local pattern=$1
    local replacement=$2
    local file_types=$3

    find . -type f \( $file_types \) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -name "LICENSE.upstream" ! -name "rebrand.sh" -exec sed -i "s|$pattern|$replacement|g" {} +
}

echo "Starting Shroud LLM rebranding..."

# Replace package and database names
replace_in_files "anything-llm" "shroud-llm" "-name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' -o -name '*.env*' -o -name '*.md' -o -name '*.txt' -o -name '*.sh' -o -name 'Dockerfile*'"

replace_in_files "anything_llm" "shroud_llm" "-name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.py' -o -name '*.env*'"

replace_in_files "anythingllm" "shroudllm" "-name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.db' -o -name '*.env*'"

replace_in_files "ANYTHING_LLM" "SHROUD_LLM" "-name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.env*' -o -name '*.sh'"

# Replace display names and titles
replace_in_files "AnythingLLM" "Shroud LLM" "-name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.html' -o -name '*.md' -o -name '*.txt'"

replace_in_files "Anything LLM" "Shroud LLM" "-name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.html' -o -name '*.md'"

# Replace author references (but keep @mintplex-labs dependencies intact)
find . -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.md' \) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -name "LICENSE.upstream" ! -name "NOTICE.md" ! -name "rebrand.sh" -exec sed -i "s|Timothy Carambat (Mintplex Labs)|Shadow Protocol Team|g" {} +

find . -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.md' \) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -name "LICENSE.upstream" ! -name "NOTICE.md" ! -name "rebrand.sh" -exec sed -i "s|Mintplex Labs Inc\.|Shadow Protocol Team|g" {} +

# Replace URLs (but preserve in NOTICE.md)
find . -type f \( -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.html' \) ! -path "*/node_modules/*" ! -path "*/.git/*" ! -name "NOTICE.md" -exec sed -i "s|mintplex-labs/anything-llm|lilbub1234/Shadow-Protocol|g" {} +

echo "Rebranding complete!"
echo "Note: Package dependencies like @mintplex-labs/* are preserved."
