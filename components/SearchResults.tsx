import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { RefObject } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import Spacer from '../Spacer'
import { colors, gutterSize, typography } from '../constants'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import { SearchResult } from './Navigator'

interface Props {
  searchResults: SearchResult[]
  searchText: string
  searchResultsRef: RefObject<FlashList<Chapters[number]>>
  goToChapter: (chapterId: Chapters[number]['chapterId']) => void
  closeNavigator: () => void
}

export default function SearchResults({
  searchText,
  searchResultsRef,
  goToChapter,
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
      <TouchableOpacity
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
        onPress={() => {
          goToChapter(item.item.chapterId)
          closeNavigator()
        }}
      >
        <Text style={typography(20, 'uir', 'l', colors.fg1)}>
          {getChapterReference(item.item.chapterId)}
        </Text>
        {highlight ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              borderWidth: 1,
              borderColor: colors.fg3,
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Ionicons name="arrow-forward" size={16} color={colors.fg2} />
          </View>
        ) : null}
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      ref={searchResultsRef as any}
      keyboardShouldPersistTaps="always"
      keyExtractor={(item) => JSON.stringify(item)}
      renderItem={renderSearchResultItem}
      ListFooterComponent={<Spacer units={4} />}
      data={searchResults}
    />
  )
}
