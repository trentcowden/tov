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

export function getReference(chapterId: Chapters[number]['chapterId']): string {
  const book = getBook(chapterId)
  const [_, chapterNumber] = chapterId.split('.')
  return `${book.name} ${chapterNumber}`
}