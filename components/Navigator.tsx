import { Ionicons } from '@expo/vector-icons'
import { HighlightRanges } from '@nozbe/microfuzz'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { FlashList } from '@shopify/flash-list'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react'
import {
  Dimensions,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NavigatorChapterItem } from '../Bible'
import Spacer from '../Spacer'
import {
  colors,
  gutterSize,
  horizVelocReq,
  panActivateConfig,
  type,
  zoomOutReq,
} from '../constants'
import chapters from '../data/chapters.json'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getReference } from '../functions/bible'
import { setActiveChapterIndex } from '../redux/activeChapter'
import { addToHistory } from '../redux/history'
import { useAppDispatch } from '../redux/hooks'
import BooksList from './BooksList'
import ChapterBoxes from './ChapterBoxes'
import Fade from './Fade'
import SearchResults from './SearchResults'

interface Props {
  searchRef: RefObject<TextInput>
  searchText: string
  chapterListRef: RefObject<FlashList<NavigatorChapterItem>>
  setSearchText: Dispatch<SetStateAction<string>>
  textPinch: SharedValue<number>
  savedTextPinch: SharedValue<number>
  activeChapter: Chapters[number]
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
  chapterListRef,
  activeChapter,
}: Props) {
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
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
    getText: (item) => [getReference(item.chapterId)],
    // arbitrary mapping function, takes `FuzzyResult<T>` as input
    mapResultItem: ({ item, score, matches: [highlightRanges] }) => ({
      item,
      highlightRanges,
    }),
  })

  useEffect(() => {
    chapterListRef.current?.scrollToOffset({ animated: false, offset: 0 })
  }, [searchText])

  function resetNavigatorBook() {
    setNavigatorBook(undefined)
  }

  function closeNavigator() {
    impactAsync(ImpactFeedbackStyle.Light)
    searchRef.current?.blur()
    searchRef.current?.clear()
    setSearchText('')
    textPinch.value = withTiming(
      1,
      { duration: 200 },
      () => (chapterTransition.value = 0)
    )

    savedTextPinch.value = 1

    setTimeout(resetNavigatorBook, 500)

    // if (overlayOpacity.value !== 0) overlayOpacity.value = withTiming(1)
  }

  function goToBook(book: Books[number]) {
    chapterTransition.value = withTiming(1)
    setNavigatorBook(book)
    searchRef.current?.blur()
  }

  function goToChapter(chapterId: Chapters[number]['chapterId']) {
    const chapterIndex = (chapters as Chapters).findIndex(
      (chapter) => chapter.chapterId === chapterId
    )

    dispatch(
      addToHistory({
        chapterId: activeChapter.chapterId,
        date: Date.now(),
      })
    )
    dispatch(
      setActiveChapterIndex({
        going: 'forward',
        index: chapterIndex,
      })
    )
    closeNavigator()
  }

  const navigatorStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(textPinch.value, [zoomOutReq, 1], [1, 0]),
      zIndex: textPinch.value !== 1 ? 2 : -1,
    }
  })

  const selectedBookStyles = useAnimatedStyle(() => {
    return {
      opacity: chapterTransition.value,
      zIndex: chapterTransition.value !== 0 ? 4 : -1,
      transform: [
        { translateX: interpolate(chapterTransition.value, [0, 1], [200, 0]) },
      ],
    }
  })

  const closeButton = (
    <TouchableOpacity
      onPress={closeNavigator}
      style={{
        paddingLeft: gutterSize,
        paddingRight: gutterSize * 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        top: 0,
        right: 0,
        zIndex: 4,
      }}
    >
      <Text style={type(16, 'uir', 'c', colors.fg2)}>Close</Text>
    </TouchableOpacity>
  )

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 2

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (chapterTransition.value === 0) return

      chapterTransition.value = interpolate(
        event.translationX,
        [0, 200],
        [1, 0]
      )
    })
    .onFinalize((e) => {
      if (chapterTransition.value === 0) return

      if (
        (chapterTransition.value < 0.5 || e.velocityX > horizVelocReq) &&
        e.velocityX > 0
      ) {
        chapterTransition.value = withSpring(
          0,
          panActivateConfig,
          runOnJS(resetNavigatorBook)
        )
      } else {
        chapterTransition.value = withSpring(1, panActivateConfig)
      }
    })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            position: 'absolute',
            alignItems: 'center',
            paddingTop: insets.top + gutterSize,
            justifyContent: 'flex-start',
          },
          navigatorStyles,
        ]}
      >
        <TouchableOpacity
          onPress={closeNavigator}
          style={{
            position: 'absolute',
            height: Dimensions.get('window').height,
            width: '100%',
          }}
        />
        <KeyboardAvoidingView
          behavior="height"
          style={{
            width: Dimensions.get('window').width - gutterSize * 2,
            height: navigatorHeight,
          }}
        >
          <View
            style={{
              width: Dimensions.get('window').width - gutterSize * 2,
              backgroundColor: colors.bg2,
              borderRadius: 16,
              flex: 1,
              // height: '100%',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                height: 50,
                alignItems: 'center',
                marginTop: gutterSize,
                zIndex: 5,
                paddingLeft: gutterSize,
              }}
            >
              <View style={{ flex: 1, height: '100%' }}>
                <TextInput
                  placeholder="Quick find"
                  placeholderTextColor={colors.fg3}
                  ref={searchRef}
                  clearButtonMode="always"
                  cursorColor={colors.fg1}
                  selectionColor={colors.fg1}
                  onChangeText={(text) => setSearchText(text)}
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    paddingHorizontal: gutterSize / 1.5,
                    backgroundColor: colors.bg3,
                    borderRadius: 12,
                    ...type(18, 'uib', 'l', colors.fg1),
                    height: 50,
                  }}
                  returnKeyType={'go'}
                  onSubmitEditing={() => {
                    if (
                      searchResults.length > 0 &&
                      typeof searchResults[0].item !== 'string'
                    ) {
                      goToChapter(searchResults[0].item.chapterId)
                    }
                  }}
                />
              </View>
              {closeButton}
            </View>
            <View
              style={{
                // height: navigatorHeight - 50 - gutterSize,
                flex: 1,
                width: Dimensions.get('window').width - gutterSize * 2,
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
                  chapterListRef={chapterListRef}
                  searchResults={searchResults}
                />
              )}
            </View>
          </View>
          <Spacer units={4} />
        </KeyboardAvoidingView>
        <Animated.View
          style={[
            {
              top: insets.top + gutterSize,
              height: navigatorHeight - gutterSize,
              width: Dimensions.get('window').width - gutterSize * 2,
              borderRadius: 16,
              position: 'absolute',
              paddingTop: gutterSize,
              backgroundColor: colors.bg2,
              overflow: 'hidden',
            },
            selectedBookStyles,
          ]}
        >
          <View
            style={[
              {
                width: '100%',
                height: 50,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
          >
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
                paddingRight: gutterSize / 2,
              }}
            >
              <Ionicons name="arrow-back" size={32} color={colors.fg2} />
            </TouchableOpacity>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[type(22, 'uib', 'l', colors.fg2), { flex: 1 }]}
            >
              {navigatorBook?.name}
            </Text>
            {closeButton}
          </View>
          <View style={{ height: navigatorHeight - gutterSize * 2 - 50 }}>
            <ChapterBoxes
              goToChapter={goToChapter}
              navigatorBook={navigatorBook}
            />
            <Fade place="top" color={colors.bg2} />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}
