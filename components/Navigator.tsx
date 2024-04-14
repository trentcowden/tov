import { HighlightRanges } from '@nozbe/microfuzz'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { FlashList } from '@shopify/flash-list'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import {
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  SharedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  colors,
  gutterSize,
  iconSize,
  modalWidth,
  typography,
} from '../constants'
import chapters from '../data/chapters.json'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import BooksList from './BooksList'
import ChapterBoxes from './ChapterBoxes'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import TovIcon from './SVG'
import SearchResults from './SearchResults'

interface Props {
  searchRef: RefObject<TextInput>
  searchText: string
  searchResultsRef: RefObject<FlashList<Chapters[number]>>
  setSearchText: Dispatch<SetStateAction<string>>
  textPinch: SharedValue<number>
  savedTextPinch: SharedValue<number>
  goToChapter: (chapterId: Chapters[number]['chapterId']) => void
}

export interface SearchResult {
  item: {
    chapterId: string
    md: string
  }
  highlightRanges: HighlightRanges | null
}

export default function Navigator({
  searchRef,
  searchText,
  setSearchText,
  textPinch,
  savedTextPinch,
  searchResultsRef,
  goToChapter,
}: Props) {
  const insets = useSafeAreaInsets()
  /**
   * Whether or not new search results should be calculated. We disable it as
   * the user is typing to prevent lag.
   */
  const chapterTransition = useSharedValue(0)

  const [navigatorBook, setNavigatorBook] = useState<Books[number]>()

  /** Used to store the fuse.js object. */
  const searchResults: SearchResult[] = useFuzzySearchList({
    list: chapters as Chapters,
    // If `queryText` is blank, `list` is returned in whole
    queryText: searchText,
    // optional `getText` or `key`, same as with `createFuzzySearch`
    getText: (item) => [getChapterReference(item.chapterId)],
    // arbitrary mapping function, takes `FuzzyResult<T>` as input
    mapResultItem: ({ item, score, matches: [highlightRanges] }) => ({
      item,
      highlightRanges,
    }),
  })

  useEffect(() => {
    searchResultsRef.current?.scrollToOffset({ animated: false, offset: 0 })
  }, [searchText])

  function resetNavigatorBook() {
    setNavigatorBook(undefined)
  }

  function closeNavigator() {
    impactAsync(ImpactFeedbackStyle.Light)
    searchRef.current?.blur()
    textPinch.value = withTiming(
      0,
      { duration: 200 },
      () => (chapterTransition.value = 0)
    )

    savedTextPinch.value = 0

    setTimeout(() => {
      resetNavigatorBook()
      searchRef.current?.clear()
      setSearchText('')
    }, 200)

    // if (overlayOpacity.value !== 0) overlayOpacity.value = withTiming(1)
  }

  function goToBook(book: Books[number]) {
    chapterTransition.value = withTiming(1)
    setNavigatorBook(book)
    searchRef.current?.blur()
  }

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 2

  return (
    <ModalScreen
      onBack={resetNavigatorBook}
      nestedScreen={
        <>
          <ModalScreenHeader
            paddingLeft={0}
            icon={
              <TouchableOpacity
                onPress={() => {
                  chapterTransition.value = withTiming(0)
                  setNavigatorBook(undefined)
                }}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  paddingLeft: gutterSize,
                  // paddingRight: gutterSize / 2,
                }}
              >
                <TovIcon name="arrowLeft" size={iconSize} />
              </TouchableOpacity>
            }
            close={closeNavigator}
          >
            {navigatorBook?.name}
          </ModalScreenHeader>
          <View style={{ height: navigatorHeight - gutterSize * 2 - 50 }}>
            <ChapterBoxes
              goToChapter={goToChapter}
              navigatorBook={navigatorBook}
              closeNavigator={closeNavigator}
            />
            <Fade place="top" color={colors.bg2} />
          </View>
        </>
      }
      close={closeNavigator}
      openModal={textPinch}
      openNested={chapterTransition}
    >
      <KeyboardAvoidingView
        behavior="height"
        style={{
          width: modalWidth,
          height: navigatorHeight,
        }}
      >
        <View
          style={{
            width: modalWidth,
            backgroundColor: colors.bg2,
            borderRadius: 16,
            flex: 1,
            // height: '100%',
            overflow: 'hidden',
            paddingTop: gutterSize,
          }}
        >
          <ModalScreenHeader
            close={closeNavigator}
            // icon={<TovIcon name="search" size={iconSize} />}
          >
            <>
              <TextInput
                placeholder="Find a chapter"
                placeholderTextColor={colors.fg3}
                ref={searchRef}
                clearButtonMode="never"
                cursorColor={colors.fg1}
                selectionColor={colors.fg1}
                onChangeText={(text) => setSearchText(text)}
                autoCorrect={false}
                style={{
                  flex: 1,
                  paddingLeft: gutterSize + 14,
                  backgroundColor: colors.bg3,
                  borderRadius: 12,
                  ...typography(17, 'uis', 'l', colors.fg1),
                  height: 50,
                }}
                returnKeyType={'go'}
                onSubmitEditing={() => {
                  if (
                    searchText !== '' &&
                    searchResults.length > 0 &&
                    typeof searchResults[0].item !== 'string'
                  ) {
                    goToChapter(searchResults[0].item.chapterId)
                    closeNavigator()
                  }
                }}
              />
              <View style={{ position: 'absolute', left: gutterSize / 2 }}>
                <TovIcon name="search" size={18} />
              </View>
            </>
          </ModalScreenHeader>
          <View
            style={{
              // height: navigatorHeight - 50 - gutterSize,
              flex: 1,
              width: modalWidth,
              justifyContent: 'center',
              paddingTop: gutterSize,
            }}
          >
            {searchText === '' ? (
              <BooksList navigatorBook={navigatorBook} goToBook={goToBook} />
            ) : (
              <SearchResults
                goToChapter={goToChapter}
                searchText={searchText}
                searchResultsRef={searchResultsRef}
                searchResults={searchResults}
                closeNavigator={closeNavigator}
              />
            )}
          </View>
        </View>
        <Pressable
          style={{ height: gutterSize, width: '100%' }}
          onPress={closeNavigator}
        />
      </KeyboardAvoidingView>
    </ModalScreen>
  )
}
