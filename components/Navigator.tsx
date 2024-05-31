import { HighlightRanges } from '@nozbe/microfuzz'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { FlashList } from '@shopify/flash-list'
import { RefObject, useEffect, useState } from 'react'
import { Dimensions, KeyboardAvoidingView, TextInput, View } from 'react-native'
import {
  SharedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  gutterSize,
  modalWidth,
  panActivateConfig,
  shadow,
  showOverlayOffset,
  sizes,
  typography,
} from '../constants'
import bibles from '../data/bibles'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import BackButton from './BackButton'
import BooksList from './BooksList'
import ChapterBoxes from './ChapterBoxes'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import TovIcon from './SVG'
import SearchResults from './SearchResults'
import TovPressable from './TovPressable'

interface Props {
  searchRef: RefObject<TextInput>
  searchResultsRef: RefObject<FlashList<Chapters[number]>>
  openNavigator: SharedValue<number>
  jumpToChapter: JumpToChapter
  scrollOffset: SharedValue<number>
  overlayOpacity: SharedValue<number>
  activeBook: Books[number]
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
  openNavigator,
  searchResultsRef,
  jumpToChapter,
  overlayOpacity,
  scrollOffset,
  activeBook,
}: Props) {
  const colors = useColors()
  const settings = useAppSelector((state) => state.settings)
  const insets = useSafeAreaInsets()
  /**
   * Whether or not new search results should be calculated. We disable it as
   * the user is typing to prevent lag.
   */
  const openNavigatorNested = useSharedValue(0)

  const [navigatorBook, setNavigatorBook] = useState<Books[number]>()
  const [searchText, setSearchText] = useState('')

  /** Used to store the fuse.js object. */
  const searchResults: SearchResult[] = useFuzzySearchList({
    list: bibles[settings.translation],
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
    if (scrollOffset.value < showOverlayOffset) {
      overlayOpacity.value = withTiming(0)
    }

    setTimeout(() => searchRef.current?.blur(), 200)
    openNavigator.value = withSpring(
      0,
      // { duration: 200 },
      panActivateConfig,
      () => (openNavigatorNested.value = 0)
    )

    setTimeout(() => {
      resetNavigatorBook()
      searchRef.current?.clear()
      setSearchText('')
    }, 200)
  }

  function goToBook(book: Books[number]) {
    openNavigatorNested.value = withSpring(1, panActivateConfig)
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
      nestedScreen={
        <>
          <ModalScreenHeader
            paddingLeft={0}
            icon={
              <BackButton
                onPress={() => {
                  openNavigatorNested.value = withSpring(0, panActivateConfig)
                  setNavigatorBook(undefined)
                }}
              />
            }
            close={closeNavigator}
          >
            {navigatorBook?.name}
          </ModalScreenHeader>
          <View style={{ height: navigatorHeight - gutterSize * 2 - 50 }}>
            <ChapterBoxes
              jumpToChapter={jumpToChapter}
              navigatorBook={navigatorBook}
              closeNavigator={closeNavigator}
            />
            <Fade place="top" color={colors.bg2} />
          </View>
        </>
      }
      close={closeNavigator}
      openModal={openNavigator}
      openNested={openNavigatorNested}
      onBack={resetNavigatorBook}
      overlayOpacity={overlayOpacity}
      scrollOffset={scrollOffset}
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
            borderRadius: 12,
            flex: 1,
            // height: '100%',
            // overflow: 'hidden',
            paddingTop: gutterSize,
            ...shadow,
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
                  // flex: 1,
                  // marginTop: gutterSize / 2,
                  height: 50,
                  paddingLeft: gutterSize + 14,
                  backgroundColor: colors.bg3,
                  borderRadius: 12,
                  ...typography(sizes.body, 'uis', 'l', colors.fg1),
                }}
                returnKeyType={'done'}
                onSubmitEditing={() => {
                  if (
                    searchText !== '' &&
                    searchResults.length > 0 &&
                    typeof searchResults[0].item !== 'string'
                  ) {
                    jumpToChapter({
                      chapterId: searchResults[0].item.chapterId,
                      comingFrom: 'navigator',
                    })
                    closeNavigator()
                  }
                }}
              />
              <View style={{ position: 'absolute', left: gutterSize / 2 }}>
                <TovIcon name="search" size={18} color={colors.p1} />
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
                jumpToChapter={jumpToChapter}
                searchText={searchText}
                searchResultsRef={searchResultsRef}
                searchResults={searchResults}
                closeNavigator={closeNavigator}
                activeBook={activeBook}
              />
            )}
          </View>
        </View>
        <TovPressable
          style={{ height: gutterSize * 2, width: '100%' }}
          onPress={closeNavigator}
        />
      </KeyboardAvoidingView>
    </ModalScreen>
  )
}
