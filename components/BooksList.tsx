import { useMemo } from 'react'
import { SectionList, Text, useWindowDimensions } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, sizes, typography } from '../constants'
import books from '../data/books.json'
import { Books } from '../data/types/books'
import useColors from '../hooks/useColors'
import TovPressable from './TovPressable'

interface Props {
  navigatorBook: Books[number] | undefined
  goToBook: (book: Books[number]) => void
}

type Sections = Array<{
  sectionName: Books[number]['englishDivision']
  data: Books
}>

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
          marginHorizontal: gutterSize,
          width: width - gutterSize * 4,
          // paddingHorizontal: gutterSize,
          // marginTop: index === 0 ? 0 : gutterSize * 1.5,
          paddingBottom: gutterSize / 3,
          backgroundColor: colors.bg2,
        }}
      >
        <Text style={typography(sizes.caption, 'uil', 'l', colors.fg3)}>
          {sectionNames[section.sectionName]}
        </Text>
        {/* <Spacer units={1.5} />
        <View style={{ width: '100%', height: 1, backgroundColor: colors.b }} /> */}
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
          paddingHorizontal: gutterSize / 2,
          alignItems: 'center',
          flexDirection: 'row',
          borderRadius: 12,
          marginHorizontal: gutterSize / 2,
          justifyContent: 'space-between',
        }}
        onPressColor={colors.bg3}
        onPress={() => {
          goToBook(item)
        }}
      >
        <Text style={typography(sizes.body, 'uir', 'l', colors.fg1)}>
          {item.name}
        </Text>
      </TovPressable>
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
