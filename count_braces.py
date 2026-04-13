
def count_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
        curly = content.count('{') - content.count('}')
        paren = content.count('(') - content.count(')')
        square = content.count('[') - content.count(']')
        print(f"File: {filename}")
        print(f"  Curly braces diff: {curly}")
        print(f"  Parentheses diff: {paren}")
        print(f"  Square brackets diff: {square}")

count_braces(r"c:\Users\spriy\Downloads\busconnect-main\src\pages\ConfirmationPage.tsx")
count_braces(r"c:\Users\spriy\Downloads\busconnect-main\src\pages\ETicketPage.tsx")
count_braces(r"c:\Users\spriy\Downloads\busconnect-main\src\pages\TrackingPage.tsx")
count_braces(r"c:\Users\spriy\Downloads\busconnect-main\src\pages\LoginPage.tsx")
