import os
import re
import argparse

def check_imports(pages_dir):
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith(".tsx"):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if ("motion." in content or "<motion" in content) and "framer-motion" in content:
                        # Regex to find import line containing framer-motion
                        import_match = re.search(r'import\s+.*?(?:from\s+)?[\'"]framer-motion[\'"]', content, re.MULTILINE)
                        if not import_match:
                            print(f"File missing framer-motion import: {path}")
                        elif 'motion' not in import_match.group(0):
                            print(f"File missing 'motion' in framer-motion import: {path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Check for framer-motion imports in TSX files.")
    parser.add_argument("dir", nargs="?", default=os.environ.get("PAGES_DIR", os.getcwd()), help="Directory to scan")
    args = parser.parse_args()
    check_imports(args.dir)
