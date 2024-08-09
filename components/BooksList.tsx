import { useMemo } from 'react'
import { SectionList, Text, useWindowDimensions } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import books from '../data/books.json'
import { Books } from '../data/types/books'
import useColors from '../hooks/useColors'
import { br, sp, tx, typography } from '../styles'
import Spacer from './Spacer'
import TovPressable from './TovPressable'

interface Props {
  navigatorBook: Books[number] | undefined
  goToBook: (book: Books[number]) => void
}

type Sections = {
  sectionName: Books[number]['englishDivision']
  data: Books
}[]

export default function BooksList({ navigatorBook, goToBook }: Props) {
  const { width } = useWindowDimensions()
  const colors = useColors()
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
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        key={section.sectionName}
        style={{
          marginHorizontal: sp.xl,
          width: width - sp.xl * 4,
          paddingBottom: sp.sm,
          backgroundColor: colors.bg2,
        }}
      >
        <Text style={typography(tx.caption, 'uil', 'l', colors.fg3)}>
          {sectionNames[section.sectionName]}
        </Text>
      </Animated.View>
    )
  }

  function renderBookItem({ item }: { item: Books[number] }) {
    return (
      <TovPressable
        entering={FadeIn}
        exiting={FadeOut}
        key={item.bookId}
        bgColor={
          navigatorBook?.bookId === item.bookId ? colors.bg3 : colors.bg2
        }
        style={{
          paddingVertical: 6,
          paddingHorizontal: sp.md,
          alignItems: 'center',
          flexDirection: 'row',
          borderRadius: br.md,
          marginHorizontal: sp.md,
          justifyContent: 'space-between',
        }}
        onPressColor={colors.bg3}
        onPress={() => {
          goToBook(item)
        }}
      >
        <Text style={typography(tx.body, 'uir', 'l', colors.fg1)}>
          {item.name}
        </Text>
      </TovPressable>
    )
  }

  return (
    <SectionList
      ListFooterComponent={<Spacer s={sp.xl} />}
      sections={sections}
      renderItem={renderBookItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={() => <Spacer s={sp.xl} />}
      keyboardShouldPersistTaps="always"
    />
  )
}
