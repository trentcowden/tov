import json

cross_references = open("./cross_references.txt").read()

book_map = {
    "Gen": "GEN",
    "Exod": "EXO",
    "Lev": "LEV",
    "Num": "NUM",
    "Deut": "DEU",
    "Josh": "JOS",
    "Judg": "JDG",
    "Ruth": "RUT",
    "1Sam": "1SA",
    "2Sam": "2SA",
    "1Kgs": "1KI",
    "2Kgs": "2KI",
    "1Chr": "1CH",
    "2Chr": "2CH",
    "Ezra": "EZR",
    "Neh": "NEH",
    "Esth": "EST",
    "Job": "JOB",
    "Ps": "PSA",
    "Prov": "PRO",
    "Eccl": "ECC",
    "Song": "SNG",
    "Isa": "ISA",
    "Jer": "JER",
    "Lam": "LAM",
    "Ezek": "EZK",
    "Dan": "DAN",
    "Hos": "HOS",
    "Joel": "JOL",
    "Amos": "AMO",
    "Obad": "OBA",
    "Jonah": "JON",
    "Mic": "MIC",
    "Nah": "NAM",
    "Hab": "HAB",
    "Zeph": "ZEP",
    "Hag": "HAG",
    "Zech": "ZEC",
    "Mal": "MAL",
    "Matt": "MAT",
    "Mark": "MRK",
    "Luke": "LUK",
    "John": "JHN",
    "Acts": "ACT",
    "Rom": "ROM",
    "1Cor": "1CO",
    "2Cor": "2CO",
    "Gal": "GAL",
    "Eph": "EPH",
    "Phil": "PHP",
    "Col": "COL",
    "1Thess": "1TH",
    "2Thess": "2TH",
    "1Tim": "1TI",
    "2Tim": "2TI",
    "Titus": "TIT",
    "Phlm": "PHM",
    "Heb": "HEB",
    "Jas": "JAS",
    "1Pet": "1PE",
    "2Pet": "2PE",
    "1John": "1JN",
    "2John": "2JN",
    "3John": "3JN",
    "Jude": "JUD",
    "Rev": "REV",
}

references = {}

for index, line in enumerate(cross_references.split("\n")):
    if len(line.split()) < 2:
        print(index, line)
    verse = line.split()[0]
    reference = line.split()[1]

    (original_book, original_chapter, original_verse) = verse.split(".")
    original_book = book_map[original_book]

    if "-" in reference:
        (start_book, start_chapter, start_verse) = reference.split("-")[0].split(".")
        (end_book, end_chapter, end_verse) = reference.split("-")[1].split(".")
        start_book = book_map[start_book]
        end_book = book_map[end_book]
        start = f"{start_book}.{start_chapter}.{start_verse}"
        end = f"{end_book}.{end_chapter}.{end_verse}"
    else:
        (start_book, start_chapter, start_verse) = reference.split(".")
        start_book = book_map[start_book]
        start = f"{start_book}.{start_chapter}.{start_verse}"
        end = None

    original = f"{original_book}.{original_chapter}.{original_verse}"

    if original in references:
        if end:
            references[original].append([start, end])
        else:
            references[original].append([start])
    else:
        if end:
            references[original] = [[start, end]]
        else:
            references[original] = [[start]]

json.dump(references, open("./data/references.json", "w+", encoding="utf-8"))
