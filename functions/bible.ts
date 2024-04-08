import books from '../data/books.json'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'

export function getBook(
  chapterId: Chapters[number]['chapterId']
): Books[number] {
  const activeBookId = chapterId.split('.')[0]

  const activeBook: Books[number] | undefined = (books as Books).find(
    (book) => book.bookId === activeBookId
  )

  return activeBook ?? (books as Books)[0]
}

export function getChapterReference(
  chapterId: Chapters[number]['chapterId']
): string {
  const book = getBook(chapterId)
  const [_, chapterNumber] = chapterId.split('.')
  return `${book.name} ${chapterNumber}`
}
export function getVerseReference(verseId: string): string {
  const [bookId, chapterNumber, verseNumber] = verseId.split('.')
  const book = getBook(`${bookId}.${chapterNumber}`)

  return `${book.name} ${chapterNumber}:${verseNumber}`
}

export function isPassageAfter(p1: string, p2: string) {
  const [p1BookStr, p1chapterStr, p1VerseStr] = p1.split('.')
  const [p2BookStr, p2chapterStr, p2VerseStr] = p2.split('.')

  const p1Book = getBook(p1BookStr)
  const p2Book = getBook(p2BookStr)

  if (p1Book.order === p2Book.order) {
    const p1Chapter = parseInt(p1chapterStr)
    const p2Chapter = parseInt(p2chapterStr)

    if (p1Chapter === p2Chapter) {
      const p1Verse = parseInt(p1VerseStr)
      const p2Verse = parseInt(p2VerseStr)

      return p1Verse - p2Verse
    } else {
      return p1Chapter - p2Chapter
    }
  } else {
    return p1Book.order - p2Book.order
  }
}
