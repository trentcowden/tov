import { HighlightRanges } from '@nozbe/microfuzz'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { FlashList } from '@shopify/flash-list'
import { RefObject, useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import {
  FadeIn,
  FadeOut,
  SharedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Delete from '../assets/icons/duotone/delete.svg'
import Search from '../assets/icons/duotone/search-lg.svg'
import { panActivateConfig } from '../constants'
import bibles from '../data/bibles'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import { getModalHeight, getModalWidth } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, ic, sans, shadow, sp, tx } from '../styles'
import BackButton from './BackButton'
import BooksList from './BooksList'
import ChapterBoxes from './ChapterBoxes'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SearchResults from './SearchResults'
import TovPressable from './TovPressable'

interface Props {
  searchRef: RefObject<TextInput>
  searchResultsRef: RefObject<FlashList<Chapters[number]>>
  openNavigator: SharedValue<number>
  jumpToChapter: JumpToChapter
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
  activeBook,
}: Props) {
  const colors = useColors()
  const settings = useAppSelector((state) => state.settings)
  const insets = useSafeAreaInsets()
  const { height, width } = useWindowDimensions()
  const modalWidth = getModalWidth(width)
  const modalHeight = getModalHeight(height, insets)
  const navigatorHeight = modalHeight - sp.xl * 2
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
    // Remove symbols from the search text
    queryText: searchText.split(':')[0].replace(/[^a-zA-Z0-9 ]/g, ''),
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
  }, [searchResultsRef, searchText])

  function resetNavigatorBook() {
    setNavigatorBook(undefined)
  }

  function closeNavigator() {
    // if (scrollOffset.value < showOverlayOffset) {
    //   overlayOpacity.value = withTiming(0)
    // }

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

  return (
    <ModalScreen
      nestedScreen={
        <View
          style={{
            height: navigatorHeight,
          }}
        >
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
          <View style={{ flex: 1 }}>
            <ChapterBoxes
              jumpToChapter={jumpToChapter}
              navigatorBook={navigatorBook}
              closeNavigator={closeNavigator}
            />
            <Fade place="top" color={colors.bg2} />
          </View>
        </View>
      }
      nestedHeight={navigatorHeight}
      close={closeNavigator}
      openModal={openNavigator}
      openNested={openNavigatorNested}
      onBack={resetNavigatorBook}
    >
      <KeyboardAvoidingView
        behavior="height"
        style={{
          width: modalWidth,
          height: modalHeight,
        }}
      >
        <View
          style={{
            width: modalWidth,
            backgroundColor: colors.bg2,
            borderRadius: br.xl,
            flex: 1,
            paddingTop: sp.xl,
            ...shadow,
          }}
        >
          <ModalScreenHeader close={closeNavigator}>
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
                  // marginTop: sp.md,
                  height: 50,
                  paddingLeft: sp.xl + 14,
                  paddingRight: 18 + sp.xl,
                  backgroundColor: colors.bg3,
                  borderRadius: br.lg,
                  ...sans(tx.body, 's', 'l', colors.fg1),
                  lineHeight: undefined,
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
              <View style={{ position: 'absolute', left: sp.md }}>
                <Search {...ic.md} color={colors.p1} />
              </View>
              {searchText !== '' ? (
                <TovPressable
                  bgColor={colors.bg3}
                  entering={FadeIn}
                  exiting={FadeOut}
                  onPress={() => {
                    setSearchText('')
                    searchRef.current?.clear()
                  }}
                  onPressColor={colors.bg4}
                  outerOuterStyle={{
                    zIndex: 5,
                    position: 'absolute',
                    right: 0,
                  }}
                  style={{
                    justifyContent: 'center',
                    height: 50,
                    padding: sp.md,
                    // backgroundColor: colors.bg4,
                    borderRadius: br.lg,
                  }}
                >
                  <Delete {...ic.md} color={colors.fg3} />
                </TovPressable>
              ) : null}
            </>
          </ModalScreenHeader>
          <View
            style={{
              flex: 1,
              width: modalWidth,
              justifyContent: 'center',
              paddingTop: searchText === '' ? sp.lg : sp.md,
              overflow: 'hidden',
              borderRadius: br.xl,
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
          bgColor="transparent"
          style={{ height: sp.xl * 2, width: '100%' }}
          onPress={closeNavigator}
        />
      </KeyboardAvoidingView>
    </ModalScreen>
  )
}
