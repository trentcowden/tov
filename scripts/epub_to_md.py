import os.path
import re
import subprocess
from typing import Any

import pandoc
from bs4 import BeautifulSoup
from ebooklib import epub
from pandoc.types import *

# This is just a basic example which can easily break in real world.

BOOK_NAMES = {
    "Genesis": "GEN",
    "Exodus": "EXO",
    "Leviticus": "LEV",
    "Numbers": "NUM",
    "Deuteronomy": "DEU",
    "Joshua": "JOS",
    "Judges": "JDG",
    "Ruth": "RUT",
    "1 Samuel": "1SA",
    "2 Samuel": "2SA",
    "1 Kings": "1KI",
    "2 Kings": "2KI",
    "1 Chronicles": "1CH",
    "2 Chronicles": "2CH",
    "Ezra": "EZR",
    "Nehemiah": "NEH",
    "Esther": "EST",
    "Job": "JOB",
    "Psalms": "PSA",
    "Proverbs": "PRO",
    "Ecclesiastes": "ECC",
    "Song of Solomon": "SNG",
    "Isaiah": "ISA",
    "Jeremiah": "JER",
    "Lamentations": "LAM",
    "Ezekiel": "EZK",
    "Daniel": "DAN",
    "Hosea": "HOS",
    "Joel": "JOL",
    "Amos": "AMO",
    "Obadiah": "OBA",
    "Jonah": "JON",
    "Micah": "MIC",
    "Nahum": "NAM",
    "Habakkuk": "HAB",
    "Zephaniah": "ZEP",
    "Haggai": "HAG",
    "Zechariah": "ZEC",
    "Malachi": "MAL",
    "Matthew": "MAT",
    "Mark": "MRK",
    "Luke": "LUK",
    "John": "JHN",
    "Acts": "ACT",
    "Romans": "ROM",
    "1 Corinthians": "1CO",
    "2 Corinthians": "2CO",
    "Galatians": "GAL",
    "Ephesians": "EPH",
    "Philippians": "PHP",
    "Colossians": "COL",
    "1 Thessalonians": "1TH",
    "2 Thessalonians": "2TH",
    "1 Timothy": "1TI",
    "2 Timothy": "2TI",
    "Titus": "TIT",
    "Philemon": "PHM",
    "Hebrews": "HEB",
    "James": "JAS",
    "1 Peter": "1PE",
    "2 Peter": "2PE",
    "1 John": "1JN",
    "2 John": "2JN",
    "3 John": "3JN",
    "Jude": "JUD",
    "Revelation": "REV",
}

# read epub
book = epub.read_epub("/Users/trentcowden/Downloads/net.epub")

# get base filename from the epub
# base_name = os.path.basename(os.path.splitext(sys.argv[1])[0])


def parse_bible_chapter(html_content: Any):
    # Parse the HTML
    soup = BeautifulSoup(html_content, "html.parser")

    # Create a list to store verse and line break data
    chapter_content = []

    # Iterate through all paragraph and line break elements
    for element in soup.find_all(["p", "br"]):
        if element.name == "br":
            # Add empty string for line breaks
            chapter_content.append("")
        elif element.find("span", class_="verse"):
            # Find the verse span
            verse_span = element.find("span", class_="verse")

            # Extract verse number from the span's text
            verse_number = int(verse_span.text.split(":")[1])

            # Extract text, removing the verse number
            verse_text = element.get_text().replace(verse_span.text, "").strip()

            # Create verse dictionary
            verse = {"number": verse_number, "text": verse_text}

            chapter_content.append(verse)

    return chapter_content


for index, item in enumerate(book.items):
    if not isinstance(item, epub.EpubHtml):
        continue
    if index != 100:
        continue

    html = item.get_content().decode()
    verses = parse_bible_chapter(html)
    print(verses)
    # pandoc.write(
    #     chapter_doc,
    #     file="/Users/trentcowden/Downloads/net/TEST.md",
    #     format="markdown",
    # )
    # for element in pandoc.iter(chapter_doc):
    # print(element)

    continue

    proc = subprocess.Popen(
        ["pandoc", "-f", "html", "-t", "markdown", "-"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
    )
    content, error = proc.communicate(item.content)

    print(content.decode())

    # if "Psalm" in md:
    #     print(md)

    # regex pattern to match between "##" and the next newline
    pattern = r"# (.*?)\n"
    md = content.decode()
    # find all matches in the content
    matches = re.findall(pattern, md)

    if len(matches) == 0:
        print(item.file_name)
        continue

    # Likely a TOC page.
    if len(matches[0].split(" ")) == 1:
        continue

    if "Chapter" in matches[0]:
        full = matches[0].replace("Chapter ", "").strip()
        book = " ".join(full.split(" ")[0:-1])
    elif "Psalm" in matches[0]:
        full = matches[0].strip()
        book = "Psalms"
    else:
        continue

    if book not in BOOK_NAMES:
        print(f"Book not found: {book}")
        continue
    book_id = BOOK_NAMES[book]
    chapter_num = full.split(" ")[-1]

    file_name = f"{book_id}.{chapter_num}.md"

    # create needed directories
    # dir_name = "{0}/{1}".format(base_name, os.path.dirname(file_name))
    dir_name = f"/Users/trentcowden/Downloads/net"
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)

    # write content to file
    with open(f"{dir_name}/{file_name}", "w", encoding="utf-8") as f:
        f.write(md)
