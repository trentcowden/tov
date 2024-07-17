import json
import re

from bs4 import BeautifulSoup
from ebooklib import epub
from markdownify import MarkdownConverter, markdownify

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
    "Psalm": "PSA",
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


class MyConverter(MarkdownConverter):
    def convert_p(self, el, text, convert_as_inline):
        if "paragraphtitle" in el.get("class"):
            return ""
            # return "\n## " + text.strip().replace("*", "") + "\n\n"
        elif "bodytext" in el.get("class"):
            return "\n" + text.strip() + "\n"
        elif "bodyblock" in el.get("class"):
            return "\n" + text.strip() + "\n"
        elif "poetry" in el.get("class"):
            return text
        elif "otpoetry" in el.get("class"):
            return text
        elif "quote" in el.get("class"):
            return text + "\n"
        elif "poetrybreak" in el.get("class"):
            return "\n" + text
        elif "psasuper" in el.get("class"):
            return f"*{text}*\n\n"
        elif "lamhebrew" in el.get("class"):
            return "**" + text.strip().replace("*", "") + "**\n"
        elif "hebrew" in el.get("class"):
            return "**" + text.strip().replace("*", "") + "**\n"
        elif "sosspeaker" in el.get("class"):
            return "**" + text.strip().replace("*", "") + "**\n"

        else:
            # print("Not found", el.get("class"))
            return text + "\n"

    def convert_b(self, el, text, convert_as_inline):
        return f"*{text}*"

    def convert_i(self, el, text, convert_as_inline):
        return f"*{text}*"

    def convert_span(self, el, text, convert_as_inline):
        if "verse" in el.get("class"):
            return f"[{text.strip().split(':')[1]}]"
        elif "smcaps" in el.get("class"):
            return text.strip().upper()
        else:
            # print("Not found", el.get("class"))
            return text

    def convert_h1(self, el, text, convert_as_inline):
        return ""

    def convert_h2(self, el, text, convert_as_inline):
        return ""


# Create shorthand method for conversion
def md(html, **options):
    return MyConverter(**options).convert(html)


book = epub.read_epub("/Users/trentcowden/Downloads/net.epub")

chapters = []

for index, item in enumerate(book.items):
    if not isinstance(item, epub.EpubHtml):
        continue
    # if index != 508:
    #     continue

    html = item.get_content().decode()
    soup = BeautifulSoup(html, features="html.parser")

    h1 = soup.find("h1")
    if h1 is None:
        h2 = soup.find("h2")
        if h2 is None:
            continue
        full = h2.text.strip()
    else:
        full = h1.text.replace("Chapter", "").strip()
    book = " ".join(full.split(" ")[0:-1])

    if book not in BOOK_NAMES:
        continue

    book_id = BOOK_NAMES[book]
    chapter_num = full.split(" ")[-1]

    file_name = f"{book_id}.{chapter_num}.md"

    # if "otpoetry" in html:
    #     print("otpoerty", file_name)
    # if "bodyblock" in html:
    #     print("bodyblock", file_name)
    # if "quote" in html:
    #     print("quote", file_name)
    # if "sosspeaker" in html:
    #     print("sosspeaker", file_name)
    # if "poetrybreak" in html:
    #     print("poetrybreak", file_name)
    if "hebrew" in html and "lamhebrew" not in html:
        print("hebrew", file_name)
    # if "lamhebrew" in html:
    #     print("lamhebrew", file_name)
    # if "1PE.3" in file_name:
    #     print(html)

    try:
        text = md(html)
        text = text.replace("xml version\\='1\\.0' encoding\\='utf\\-8'?", "")
        text = text.replace("\\", "")
        text = text.replace("\n\n\n", "\n\n")
        text = text.replace("]]", "")
        text = text.replace("[[", "")
        text = text.strip()

        first_verse = re.findall(r"\[[0-9]+\]", text)[0]

        if first_verse != "[1]":
            print("First verse is not 1", file_name)
            text_before_1 = text.split("[1]")[0]
            # Add text to previous chapter
            chapters[-1]["md"] += "\n\n" + text_before_1
            text = text.replace(text_before_1, "")

        # Fix spacing around verses.
        text = re.sub(r"([^ \n])\[", r"\1 [", text)

        text = text.replace("***", "*")
        text = text.replace("**", "*")
        chapters.append(
            {
                "chapterId": f"{book_id}.{chapter_num}",
                "md": text,
            }
        )
        open(f"/Users/trentcowden/Downloads/net/{file_name}", "w").write(text)
    except Exception as e:
        print(html)


with open("data/net_chapters.json", "w", encoding="utf-8") as file:
    json.dump(chapters, file)
