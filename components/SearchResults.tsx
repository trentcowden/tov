import { FlashList } from '@shopify/flash-list'
import { RefObject } from 'react'
import { Text } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, sizes, typography } from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getBook, getChapterReference } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { SearchResult } from './Navigator'
import TovIcon from './SVG'
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
          marginHorizontal: gutterSize / 2,
          borderRadius: 12,
          // height: 48,
          paddingVertical: gutterSize / 3,
          paddingHorizontal: gutterSize / 2,
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
        <Text style={typography(sizes.body, 'uir', 'l', colors.fg1)}>
          {getChapterReference(item.item.chapterId)}
        </Text>
        {highlight ? (
          <TovIcon name="arrowRightSquare" size={24} color={colors.p1} />
        ) : null}
      </TovPressable>
    )
  }

  return (
    <FlatList
      ref={searchResultsRef as any}
      keyboardShouldPersistTaps="always"
      keyExtractor={(item) => item.item.chapterId}
      renderItem={renderSearchResultItem}
      ListFooterComponent={<Spacer units={4} />}
      ItemSeparatorComponent={() => <Spacer units={1} />}
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
  )
}
