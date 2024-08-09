import { FlashList } from '@shopify/flash-list'
import { RefObject } from 'react'
import { Text, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import ArrowRightSquare from '../assets/icons/duotone/arrow-square-right.svg'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getBook, getChapterReference } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { br, ic, sp, tx, typography } from '../styles'
import Fade from './Fade'
import { SearchResult } from './Navigator'
import Spacer from './Spacer'
import TovPressable from './TovPressable'

interface Props {
  searchResults: SearchResult[]
  searchText: string
  searchResultsRef: RefObject<FlashList<Chapters[number]>>
  jumpToChapter: JumpToChapter
  closeNavigator: () => void
  activeBook: Books[number]
}

export default function SearchResults({
  searchText,
  searchResultsRef,
  jumpToChapter,
  closeNavigator,
  searchResults,
  activeBook,
}: Props) {
  const colors = useColors()
  function renderSearchResultItem({
    item,
    index,
  }: {
    item: (typeof searchResults)[number]
    index: number
  }) {
    const highlight =
      index === 0 && searchResults.length > 0 && searchText !== ''

    return (
      <TovPressable
        entering={FadeIn}
        exiting={FadeOut}
        bgColor={highlight ? colors.ph : colors.bg2}
        style={{
          alignItems: 'center',
          marginHorizontal: sp.md,
          borderRadius: br.sm,
          paddingVertical: sp.sm,
          paddingHorizontal: sp.md,
          borderBottomWidth: 0,
          marginBottom: 0,
          borderColor: colors.bg3,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
        onPressColor={highlight ? colors.p1 : colors.bg3}
        onPress={() => {
          jumpToChapter({
            chapterId: item.item.chapterId,
            comingFrom: 'search',
          })
          closeNavigator()
        }}
      >
        <Text style={typography(tx.body, 'uir', 'l', colors.fg1)}>
          {getChapterReference(item.item.chapterId)}
        </Text>
        {highlight ? <ArrowRightSquare {...ic.lg} color={colors.p1} /> : null}
      </TovPressable>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={searchResultsRef as any}
        keyboardShouldPersistTaps="always"
        keyExtractor={(item) => item.item.chapterId}
        renderItem={renderSearchResultItem}
        ListFooterComponent={<Spacer s={sp.xl} />}
        ListHeaderComponent={<Spacer s={sp.md} />}
        ItemSeparatorComponent={() => <Spacer s={sp.sm} />}
        data={searchResults.sort((a, b) =>
          getBook(a.item.chapterId).bookId === activeBook.bookId &&
          getBook(b.item.chapterId).bookId !== activeBook.bookId
            ? -1
            : getBook(b.item.chapterId).bookId === activeBook.bookId &&
                getBook(a.item.chapterId).bookId !== activeBook.bookId
              ? 1
              : 0
        )}
      />
      <Fade place="top" color={colors.bg2} />
    </View>
  )
}
