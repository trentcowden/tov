import { FlashList } from '@shopify/flash-list'
import { RefObject } from 'react'
import { Text } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { colors, gutterSize, sizes, typography } from '../constants'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import { SearchResult } from './Navigator'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  searchResults: SearchResult[]
  searchText: string
  searchResultsRef: RefObject<FlashList<Chapters[number]>>
  jumpToChapter: JumpToChapter
  closeNavigator: () => void
}

export default function SearchResults({
  searchText,
  searchResultsRef,
  jumpToChapter,
  closeNavigator,
  searchResults,
}: Props) {
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
        style={{
          alignItems: 'center',
          marginHorizontal: gutterSize / 2,
          borderRadius: 12,
          height: 48,
          paddingHorizontal: gutterSize / 2,
          borderBottomWidth: 0,
          backgroundColor: highlight ? colors.bg3 : colors.bg2,
          marginBottom: 0,
          borderColor: colors.bg3,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
        onPressColor={colors.bg3}
        onPress={() => {
          jumpToChapter({ chapterId: item.item.chapterId })
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
      data={searchResults}
    />
  )
}
