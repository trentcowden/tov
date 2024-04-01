import json
import os
import re
from typing import List


# Function to convert USFM to Markdown
def usfm_to_markdown(book: str, chapter: int, usfm_text: str):

    # Remove chapters
    usfm_text = re.sub(r"\\c +(\d+) +", "", usfm_text)

    # Remove footnotes
    usfm_text = re.sub(r"\\f.+\\f\*", "", usfm_text)

    # Remove cross references
    usfm_text = re.sub(r" ?\\x *(.+?)([^a-zA-Z]*)\\x\*", r"", usfm_text)

    # Remove poetry
    usfm_text = re.sub(r"\\q\d+", "", usfm_text)

    # Convert verses
    usfm_text = re.sub(r"\n\\v (\d+) *", r"[\1] ", usfm_text)
    usfm_text = re.sub(r"\\p", "\n", usfm_text)
    usfm_text = re.sub(r"\n ", "\n", usfm_text)

    # TODO: add footnote support
    # Remove strong's words
    usfm_text = re.sub(r"\\w (\S*)\|strong=\"\S*\"\\w\*", r"\1", usfm_text)
    usfm_text = re.sub(r"\\\+w (\S*)\|strong=\"\S*\"\\\+w\*", r"\1", usfm_text)
    # usfm_text = re.sub(r"(LORD)", r"**\1**", usfm_text)

    # Words of Jesus
    usfm_text = re.sub(r"\\wj( *)(.+?)( *)\\wj\*", r"**\2**", usfm_text)

    # Bold text
    usfm_text = re.sub(r"\\bd (.+?)\\bd\*", r"**\1**", usfm_text)

    # Italics text
    usfm_text = re.sub(r"\\it( *)(.+?)( *)\\it\*", r"**\2**", usfm_text)

    # Descriptions (mostly in the psalms)
    usfm_text = re.sub(r"\\d( *)(.+?)( *)\n", r"*\2*\n\n", usfm_text)

    # Selahs
    usfm_text = re.sub(r"\\qs ?(.+) ?\\qs\*", r"\n*\1*", usfm_text)

    # Remove any remaining USFM tags (simplistic approach)
    usfm_text = re.sub(r"\\[a-z0-9]+\*?", "", usfm_text)

    return usfm_text.strip()


chapters = []

unsorted_book_files = os.listdir("data/web_usfm")

# Define the biblical order of the books
biblical_order = [
    "GEN",
    "EXO",
    "LEV",
    "NUM",
    "DEU",
    "JOS",
    "JDG",
    "RUT",
    "1SA",
    "2SA",
    "1KI",
    "2KI",
    "1CH",
    "2CH",
    "EZR",
    "NEH",
    "EST",
    "JOB",
    "PSA",
    "PRO",
    "ECC",
    "SNG",
    "ISA",
    "JER",
    "LAM",
    "EZK",
    "DAN",
    "HOS",
    "JOL",
    "AMO",
    "OBA",
    "JON",
    "MIC",
    "NAM",
    "HAB",
    "ZEP",
    "HAG",
    "ZEC",
    "MAL",
    "MAT",
    "MRK",
    "LUK",
    "JHN",
    "ACT",
    "ROM",
    "1CO",
    "2CO",
    "GAL",
    "EPH",
    "PHP",
    "COL",
    "1TH",
    "2TH",
    "1TI",
    "2TI",
    "TIT",
    "PHM",
    "HEB",
    "JAS",
    "1PE",
    "2PE",
    "1JN",
    "2JN",
    "3JN",
    "JUD",
    "REV",
]


def sort_books(file_names: List[str]):
    # Create a dictionary that maps book id to its order
    order_map = {book: i for i, book in enumerate(biblical_order)}

    # Extract book IDs from file names
    book_ids = [name.split(".")[0] for name in file_names]

    # Sort the book IDs based on their order in the Bible, then reconstruct filenames
    sorted_books = sorted(book_ids, key=lambda book: order_map.get(book, float("inf")))
    sorted_file_names = [f"{book}.usfm" for book in sorted_books]

    return sorted_file_names


# Example usage
sorted_book_files = sort_books(unsorted_book_files)

# Example usage
for book_file in sorted_book_files:
    book_file_path = f"data/web_usfm/{book_file}"

    # Read the USFM file
    with open(book_file_path, "r", encoding="utf-8") as file:
        usfm_content = file.read()

    book_id = os.path.basename(book_file)[:3]

    chapters_raw = usfm_content.split("\\c ")

    for index, chapter in enumerate(chapters_raw):
        if index == 0:
            continue

        chapter_number = re.search(r"\d+", chapter)
        if chapter_number:
            chapter_number = chapter_number.group()

        # Convert to Markdown
        chapters.append(
            {
                "chapterId": f"{book_id}.{chapter_number}",
                "md": usfm_to_markdown(book_id, index, "\\c " + chapter),
            }
        )

with open("data/chapters.json", "w", encoding="utf-8") as file:
    json.dump(chapters, file)
