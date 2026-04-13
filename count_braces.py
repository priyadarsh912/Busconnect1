import sys
import os

def count_braces(filename):
    if not os.path.exists(filename):
        print(f"Error: File not found: {filename}")
        return
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        curly = content.count('{') - content.count('}')
        paren = content.count('(') - content.count(')')
        square = content.count('[') - content.count(']')
        print(f"File: {filename}")
        print(f"  Curly braces diff: {curly}")
        print(f"  Parentheses diff: {paren}")
        print(f"  Square brackets diff: {square}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            count_braces(arg)
    else:
        print("Usage: python count_braces.py <file1> <file2> ...")
