import books from './data/books.json'

const map = {}

books.forEach(book => {
  map[book.name] = book.bookId
})

console.log(map)