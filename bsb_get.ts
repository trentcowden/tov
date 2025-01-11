import { writeFileSync } from 'fs'

interface Verse {
  number: number
  text: string
}
async function main() {
  const chapters = []

  const books = (
    await (await fetch('https://bible.helloao.org/api/BSB/books.json')).json()
  ).books

  for (const book of books) {
    for (
      let chapterNum = 1;
      chapterNum <= book.numberOfChapters;
      chapterNum++
    ) {
      console.log(book.name, chapterNum)
      const firstChapterApiLink = book.firstChapterApiLink
      // Replace the chapter number in the API link with the current chapter. It will
      // need to only replace the last "1" in the link
      const last1Index = firstChapterApiLink.lastIndexOf('1')
      const chapterApiLink = `${firstChapterApiLink.slice(0, last1Index)}${chapterNum}`
      const url = `https://bible.helloao.org${chapterApiLink}.json`
      const chapterData = await (await fetch(url)).json()
      chapters.push(chapterData)
    }
  }
  writeFileSync('data/bsb_chapters_raw.json', JSON.stringify(chapters, null, 2))
}

main()
