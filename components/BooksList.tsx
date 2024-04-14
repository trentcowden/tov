import { useMemo } from 'react'
import { SectionList, Text, TouchableOpacity, View } from 'react-native'
import Spacer from '../Spacer'
import { colors, gutterSize, typography } from '../constants'
import books from '../data/books.json'
import { Books } from '../data/types/books'

interface Props {
  navigatorBook: Books[number] | undefined
  goToBook: (book: Books[number]) => void
}

type Sections = Array<{
  sectionName: Books[number]['englishDivision']
  data: Books
}>

export default function BooksList({ navigatorBook, goToBook }: Props) {
  const sections = useMemo<Sections>(() => {
    const sections: Sections = []

    ;(books as Books).forEach((book) => {
      const existingSection = sections.find(
        (section) => section.sectionName === book.englishDivision
      )
      if (!existingSection) {
        sections.push({
          sectionName: book.englishDivision as Books[number]['englishDivision'],
          data: [book],
        })
      } else {
        existingSection.data.push(book)
      }
    })

    return sections
  }, [])

  const sectionNames: Record<Books[number]['englishDivision'], string> = {
    acts: 'Acts',
    epistles: 'Epistles',
    gospels: 'Gospels',
    historical: 'Historical',
    majorProphets: 'Major Prophets',
    minorProphets: 'Minor Prophets',
    pentateuch: 'Pentateuch',
    revelation: 'Revelation',
    wisdom: 'Wisdom',
  }

  function renderSectionHeader({ section }: { section: Sections[number] }) {
    return (
      <View
        key={section.sectionName}
        style={{
          width: '100%',
          paddingHorizontal: gutterSize,
          // marginTop: index === 0 ? 0 : gutterSize * 1.5,
          marginBottom: 5,
          backgroundColor: colors.bg2,
        }}
      >
        <Text style={typography(13, 'uil', 'l', colors.fg3)}>
          {sectionNames[section.sectionName]}
        </Text>
        <Spacer units={1.5} />
        <View style={{ width: '100%', height: 1, backgroundColor: colors.b }} />
      </View>
    )
  }

  function renderBookItem({ item }: { item: Books[number] }) {
    return (
      <TouchableOpacity
        key={item.bookId}
        style={{
          alignItems: 'center',
          paddingVertical: 6,
          paddingHorizontal: gutterSize / 2,
          backgroundColor:
            navigatorBook?.bookId === item.bookId ? colors.bg3 : undefined,
          flexDirection: 'row',
          borderRadius: 12,
          marginHorizontal: gutterSize / 2,
          justifyContent: 'space-between',
        }}
        onPress={() => {
          goToBook(item)
        }}
      >
        <Text style={typography(18, 'uir', 'l', colors.fg1)}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SectionList
      ListFooterComponent={<Spacer units={4} />}
      sections={sections}
      renderItem={renderBookItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={() => <Spacer units={4} />}
      keyboardShouldPersistTaps="always"
    />
  )
}
