import os
import re

def check_syntax(directory):
    issues = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Simplified check for unterminated regexp-like slash sequences
                        # This avoids complex JS parsing but catches unescaped slashes at line ends
                        # or slashes followed by spaces that look like divisions but might be intended as regex
                        
                        # Look for lines ending with an unescaped slash that isn't a comment
                        lines = content.splitlines()
                        for i, line in enumerate(lines):
                            # Basic check: unescaped / at end of line (ignoring trailing whitespace)
                            stripped = line.rstrip()
                            if stripped.endswith('/') and not stripped.endswith('\\/') and not stripped.startswith('//'):
                                # Check if it's potentially part of a multi-line string or comment
                                if not ('"' in stripped or "'" in stripped or '`' in stripped):
                                    issues.append(f"{path}:{i+1} : Potential unterminated slash or division at EOL: {stripped}")
                                    
                except (OSError, UnicodeDecodeError) as e:
                    print(f"Error reading {path}: {e}")
                    
    return issues

if __name__ == "__main__":
    found_issues = check_syntax('src')
    if found_issues:
        print("\n".join(found_issues))
    else:
        print("No syntax issues found.")
