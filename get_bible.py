import json
import urllib.request
from typing import Any, List, TypedDict

from halo import Halo


class Book(TypedDict):
    bookId: str
    name: str
    chapters: List[str]


translation_code = "d6e14a625393b4da-01"


class DblResponse(TypedDict):
    id: str
    bibleId: str
    number: str
    bookId: str
    reference: str
    copyright: str
    verseCount: int
    content: Any


class BibleTranslationChapter(TypedDict):
    book_id: str
    chapter_id: str
    markdown: str


recent_style = ""
current_chapter_text = ""


def add_dbl_text(item: Any):
    """API.Bible-specific function to add text to the chapter object."""

    global current_chapter_text
    global recent_style

    if "text" in item:
        text = item["text"].strip()
        if text != "":
            # Section header.
            if recent_style == "s1":
                current_chapter_text += f"## {text}"
            # Verse number.
            elif recent_style == "v" or recent_style == "vp":
                current_chapter_text += f"`{text}` "
            # Description (like of a psalm).
            elif recent_style == "d":
                current_chapter_text += f"*{text}*"
            # Italics.
            elif recent_style == "it":
                current_chapter_text += f"*{text}* "
            # Words of Jesus.
            elif recent_style == "wj":
                current_chapter_text += f"**{text}** "
            else:
                current_chapter_text += f"{text} "

    if "attrs" in item and "style" in item["attrs"]:
        recent_style = item["attrs"]["style"]
        if recent_style == "b":
            current_chapter_text = current_chapter_text[:-2]
    else:
        recent_style = ""

    if "items" in item:
        for subitem in item["items"]:
            add_dbl_text(subitem)


def get_chapter(book: Book, chapter_id: str) -> BibleTranslationChapter:
    """
    Retrieves formatted scripture text for a chapter from YouVersion.
    """

    global current_chapter_text
    current_chapter_text = ""

    spinner = Halo(
        text=f"Fetching text for {chapter_id}...",
        spinner="dots",
    ).start()

    req = urllib.request.Request(
        "https://api.scripture.api.bible/v1"
        f"/bibles/{translation_code}"
        f"/chapters/{chapter_id}"
        "?content-type=json&include-notes=false&include-titles=true"
        "&include-chapter-numbers=false&include-verse-numbers=true"
        "&include-verse-spans=false"
    )
    req.add_header("api-key", "7e254660b0b36d5c0efb256914733c55")
    resp = urllib.request.urlopen(req).read()
    json_response = json.loads(resp.decode("utf-8"))

    chapter_data: DblResponse = json_response["data"]

    # Iterate through reponse and add all text to an object.
    for index, paragraph in enumerate(chapter_data["content"]):
        add_dbl_text(paragraph)

        if index != len(chapter_data["content"]) - 1:
            current_chapter_text += "\n\n"

    spinner.succeed(f"Fetched text for {chapter_id}")

    return {"book_id": book["bookId"], "chapter_id": chapter, "markdown": current_chapter_text}


f = open("./data/chapters.json")

books: List[Book] = json.load(f)

bible: List[BibleTranslationChapter] = []


for book_index, book in enumerate(books):
    for chapter_index, chapter in enumerate(book["chapters"]):
        if chapter not in ["GEN.1", "GEN.2", "GEN.3"]:
            continue

        chapter_number = chapter.split(".")[1]

        bible.append(get_chapter(book, chapter))

f = open(f"./bible.json", "w+", encoding="utf-8")
json.dump(bible, f)
