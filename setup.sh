#!/bin/sh
echo "Installing git hooks..."
mkdir -p .git/hooks
cp hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "Done. Pre-commit type check enabled."
