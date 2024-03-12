import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { FlashList } from '@shopify/flash-list'
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NavigatorChapterItem } from '../Bible'
import Spacer from '../Spacer'
import { ActiveChapter, Chapter } from '../bibleTypes'
import { colors, gutterSize, type, zoomOutReq } from '../constants'
import books from '../data/books.json'

interface Props {
  searchRef: RefObject<TextInput>
  searchText: string
  chapterListRef: RefObject<FlashList<NavigatorChapterItem>>
  setSearchText: Dispatch<SetStateAction<string>>
  setActiveChapter: Dispatch<SetStateAction<ActiveChapter>>
  textPinch: SharedValue<number>
  savedTextPinch: SharedValue<number>
  chapters: Chapter[]
}

export default function Navigator({
  searchRef,
  searchText,
  setSearchText,
  textPinch,
  savedTextPinch,
  chapterListRef,
  chapters,
  setActiveChapter,
}: Props) {
  const insets = useSafeAreaInsets()

  /**
   * Whether or not new search results should be calculated. We disable it as
   * the user is typing to prevent lag.
   */
  const [shouldSearch, setShouldSearch] = useState(true)

  /** A timer used to reset `shouldSearch` back to true when it's been disabled. */
  const timer = useRef<NodeJS.Timer>()

  const chaptersWithBooks = useMemo(() => {
    const chapterList = []

    for (const chapter of chapters) {
      if (chapter.number === '1')
        chapterList.push(chapter.reference.split(' ').slice(0, -1).join(' '))

      chapterList.push(chapter)
    }

    return chapterList
  }, [chapters])

  const bookIndices = useMemo(() => {
    return [
      0,
      ...books.map((book, index) =>
        books.slice(0, index + 1).reduce((a, b) => a + b.chapters.length + 1, 0)
      ),
    ]
  }, [])

  /** Used to store the fuse.js object. */
  const searchResults = useFuzzySearchList({
    list: chaptersWithBooks,
    // If `queryText` is blank, `list` is returned in whole
    queryText: searchText,
    // optional `getText` or `key`, same as with `createFuzzySearch`
    getText: (item) => [typeof item === 'object' ? item.reference : ''],
    // arbitrary mapping function, takes `FuzzyResult<T>` as input
    mapResultItem: ({ item, score, matches: [highlightRanges] }) => ({
      item,
      highlightRanges,
    }),
  })

  function renderSearchItem({ item: { item } }: NavigatorChapterItem) {
    const isBook = typeof item === 'string'
    const chapterIndex = isBook
      ? -1
      : chapters.findIndex((chapter) => chapter.id === item.id)

    return (
      <TouchableOpacity
        disabled={isBook}
        style={{
          justifyContent: 'center',
          width: '100%',
          height: isBook ? 54 : 48,
          paddingHorizontal: gutterSize,
          borderBottomWidth: isBook ? 1 : 0,
          backgroundColor: colors.bg2,
          marginBottom: isBook ? 8 : 0,
          borderColor: colors.bg3,
        }}
        onPress={() => {
          setActiveChapter({
            going: 'forward',
            id: chapters[chapterIndex].id,
            index: chapterIndex,
          })
          searchRef.current?.blur()
          textPinch.value = withSpring(1)
          savedTextPinch.value = 1
        }}
      >
        <Text
          style={type(isBook ? 26 : 20, isBook ? 'b' : 'r', 'l', colors.fg1)}
        >
          {isBook
            ? item
            : searchText === ''
              ? `Chapter ${item.number}`
              : item.reference}
        </Text>
      </TouchableOpacity>
    )
  }

  const navigatorAnimatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(textPinch.value, [zoomOutReq, 1], [1, 0]),
      zIndex: textPinch.value !== 1 ? 2 : -1,
    }
  })

  return (
    <Animated.View
      style={[
        {
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
          position: 'absolute',
          alignItems: 'center',
          paddingTop: insets.top + gutterSize,
        },
        navigatorAnimatedStyles,
      ]}
    >
      <View
        style={{
          width: Dimensions.get('window').width - gutterSize * 2,
          backgroundColor: colors.bg2,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            marginTop: gutterSize,
          }}
        >
          <Spacer units={4} />
          <TextInput
            placeholder='Quick find; try "Ex 34"'
            placeholderTextColor={colors.fg3}
            ref={searchRef}
            clearButtonMode="always"
            cursorColor={colors.fg1}
            selectionColor={colors.fg1}
            onChangeText={(text) => setSearchText(text)}
            autoCorrect={false}
            style={{
              flex: 1,
              paddingHorizontal: gutterSize,
              paddingVertical: gutterSize / 2,
              backgroundColor: colors.bg3,
              borderRadius: 12,
              ...type(18, 'b', 'l', colors.fg1),
            }}
          />
          <TouchableOpacity
            onPress={() => {
              textPinch.value = withSpring(1)
              savedTextPinch.value = 1
              searchRef.current?.blur()
            }}
            style={{
              paddingLeft: gutterSize,
              paddingRight: gutterSize * 1.5,
              paddingVertical: gutterSize / 2,
              top: 0,
              right: 0,
              zIndex: 4,
            }}
          >
            <Text style={type(16, 'r', 'c', colors.fg2)}>Close</Text>
            {/* <Ionicons name="close-circle" size={32} color={colors.fg1} /> */}
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 300,
            width: '100%',
            justifyContent: 'center',
            marginTop: gutterSize,
          }}
        >
          {!shouldSearch ? (
            <ActivityIndicator size="large" color={colors.fg2} />
          ) : (
            <FlashList
              ref={chapterListRef}
              keyboardShouldPersistTaps="always"
              stickyHeaderIndices={searchText === '' ? bookIndices : undefined}
              estimatedItemSize={25}
              renderItem={renderSearchItem}
              data={searchResults}
            />
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          textPinch.value = withSpring(1)
          savedTextPinch.value = 1
          searchRef.current?.blur()
        }}
        style={{ flex: 1, width: '100%' }}
      />
    </Animated.View>
  )
}
