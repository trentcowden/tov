import json
import urllib.request

source_id = 3034

books = json.load(open("data/books.json"))


def get_chapter(chapter_id: str):
    fetch_url = (
        "https://audio-bible.youversionapi.com/3.1/chapter.json"
        "?version_id="
        f"{source_id}"
        f"&reference={chapter_id}"
    )

    print(fetch_url)

    try:
        req = urllib.request.Request(fetch_url)
        resp = urllib.request.urlopen(req).read()
        json_response = json.loads(resp.decode("utf-8"))

        urllib.request.urlretrieve(
            f"https:{json_response['response']['data'][0]['download_urls']['format_mp3_32k']}",
            f"data/net_audio/{chapter_id}.mp3",
        )
    except Exception as e:
        print(f"Error: {e}")


for book in books:
    for chapter in book["chapters"]:
        get_chapter(chapter)
