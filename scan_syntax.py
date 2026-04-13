
import os
import re

def check_syntax(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Check for unterminated regexp-like stuff
                    # e.g., something followed by a single slash not in quotes
                    # This is tricky, but let's look for common mistakes
                    pass

check_syntax('src/pages')
