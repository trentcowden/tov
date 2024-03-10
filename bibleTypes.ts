export type BookTitle = string
export type TempBooks = Record<BookTitle, Chapter[]>

export interface Book {
  id: string
  bibleId: string
  abbreviation: string
  name: string
  nameLong: string
}

export interface Chapter extends LightChapter {
  bibleId: string
  reference: string
  data: Paragraph[]
  bookId: string
}

export interface LightChapter {
  id: string
  number: string
}

export interface Paragraph {
  name: string
  type: string
  attrs: Attributes
  items: any[]
}

export interface Attributes {
  number?: string
  style: string
  sid?: string
}

export interface GroupedChapters {
  title: BookTitle
  id: string
  content: LightChapter[]
}

export interface Bible {
  name: string
  books: Book[]
  chapters: Chapter[]
}

export interface ActiveChapter {
  index: number
  going: 'back' | 'forward'
  id: string
}

export type BibleStyle =
  // Book name
  | 'mt1'
  // Chapter title
  | 'c'
  // Section title
  | 's1'
  //
  | 'm'
  // Verse number
  | 'v'
  // Different type of verse number.
  | 'nb'
  // Text break
  | 'b'
  // Indented paragraph
  | 'li1'
  // Indented paragraph
  | 'pm'
  // Quote level 1
  | 'qm1'
  // Quote level 2
  | 'qm2'
  // Name of God (e.g. LORD)
  | 'nd'
  // ??
  | 'p'
  // Quote level 1
  | 'q1'
  // Quote level 2
  | 'q2'
  // Table row
  | 'tr'
  // Table header 1
  | 'th1'
  // Table header 2
  | 'th2'
  // Table column 1
  | 'tc1'
  // Table column 2
  | 'tc2'
  // Table header 3
  | 'th3'
  // Table column 3
  | 'tc3'
  // Indented paragraph
  | 'pmo'
  // Indented paragraph
  | 'lim1'
  // Italics
  | 'it'
  // Group chapters (e.g. BOOK ONE (Psalms 1-41))
  | 'ms1'
  // Goes with ms1. ALL CAPS
  | 'sc'
  // Description. Use italics.
  | 'd'
  // Psalm interlude. Use italics and align to right.
  | 'qs'
  // Psalm response. Use italics and align to right.
  | 'qr'
  // Psalm heading. Use italics and align center.
  | 'qa'
  // Speaker name. Use italics and align left.
  | 'sp'
  // Quote level 3
  | 'q3'
  // Words of Jesus
  | 'wj'
  // Notes. Use italics.
  | 'pc'

// Use the below code to figure out the styles and their locations for a new bible translation.

// useEffect(() => {
//   const styles: Style[] = []

//   filteredChapters.forEach((chapter) => {
//     chapter.data.forEach((paragraph) => {
//       renderText(fontSize, paragraph, styles)
//     })
//   })

//   console.log(styles)
// }, [])

// let currentVerse = ''

// function renderText(fontSize: number, paragraph: any, styles: Style[]) {
//   if (paragraph.attrs?.style === 'v') currentVerse = paragraph.attrs.sid

//   if (
//     paragraph.attrs?.style &&
//     !styles.some((style) => style.style === paragraph.attrs.style)
//   ) {
//     styles.push({
//       verse: currentVerse,
//       style: paragraph.attrs.style,
//     })
//   }

//   if (paragraph.items) {
//     return paragraph.items.map((item: any) =>
//       renderText(fontSize, item, styles)
//     )
//   } else if (paragraph.text) {
//     return (
//       <Text key={uuid.v4().toString()} style={standardTextStyles}>
//         {paragraph.text}
//       </Text>
//     )
//   }
// }
