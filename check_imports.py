
import os
import re

def check_imports():
    pages_dir = r"c:\Users\spriy\Downloads\busconnect-main\src\pages"
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith(".tsx"):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if "motion." in content or "<motion" in content:
                        if 'import {' not in content or 'framer-motion' not in content:
                            print(f"File missing framer-motion import: {path}")
                        elif 'motion' not in content.split('import')[1].split('from')[0]:
                             print(f"File missing 'motion' in framer-motion import: {path}")

if __name__ == "__main__":
    check_imports()
