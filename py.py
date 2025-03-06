#!/usr/bin/env python3
from bs4 import BeautifulSoup, Comment
import re

def clean_html(content: str) -> str:
    soup = BeautifulSoup(content, "html.parser")
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
        c.extract()
    for style in soup.find_all("style"):
        if style.string is not None:
            cleaned = re.sub(r'/\*.*?\*/', '', style.string, flags=re.DOTALL)
            style.string.replace_with(cleaned)
    return str(soup)

def main():
    file_path = input("Enter the path to the HTML file: ").strip()
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    cleaned = clean_html(content)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(cleaned)
    print("Comments removed successfully.")

if __name__ == "__main__":
    main()