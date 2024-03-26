import { Ionicons } from '@expo/vector-icons'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { FlashList } from '@shopify/flash-list'
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Dimensions,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  FlatList,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler'
import Animated, {
  FadeInRight,
  FadeOut,
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
  type,
  zoomOutReq,
} from '../constants'
import books from '../data/books.json'
import chapters from '../data/chapters.json'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getBook, getReference } from '../functions/bible'
import { setActiveChapterIndex } from '../redux/activeChapter'
import { addToHistory } from '../redux/history'
import { useAppDispatch } from '../redux/hooks'
import Fade from './Fade'

interface Props {
  searchRef: RefObject<TextInput>
  searchText: string
  chapterListRef: RefObject<FlashList<NavigatorChapterItem>>
  setSearchText: Dispatch<SetStateAction<string>>
  textPinch: SharedValue<number>
  savedTextPinch: SharedValue<number>
  activeChapter: Chapters[number]
}

const numColumns = 5

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

  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [navigatorBook, setNavigatorBook] = useState<Books[number]>()

  const booksWithSections = useMemo<
    Array<Books[number] | { sectionName: Books[number]['englishDivision'] }>
  >(() => {
    const booksWithSections: Array<
      { sectionName: Books[number]['englishDivision'] } | Books[number]
    > = []
    let prevSection = ''

    ;(books as Books).forEach((book) => {
      if (prevSection !== book.englishDivision) {
        booksWithSections.push({
          sectionName: book.englishDivision as Books[number]['englishDivision'],
        })
        prevSection = book.englishDivision
      }

      booksWithSections.push(book as Books[number])
    })

    return booksWithSections
  }, [])

  const chaptersWithBooks = useMemo(() => {
    const chapterList = []

    for (const chapter of chapters as Chapters) {
      const [bookId, chapterNumber] = chapter.chapterId.split('.')
      if (chapterNumber === '1')
        chapterList.push(getBook(chapter.chapterId).name)

      chapterList.push(chapter)
    }

    return chapterList
  }, [chapters])

  useEffect(() => {
    chapterListRef.current?.scrollToOffset({ animated: false, offset: 0 })
  }, [searchText])

  const bookIndices = useMemo(() => {
    const indices: number[] = []

    booksWithSections.forEach((bookOrSection, index) => {
      if ('sectionName' in bookOrSection) {
        indices.push(index)
      }
    })
    return indices
  }, [])

  /** Used to store the fuse.js object. */
  const searchResults = useFuzzySearchList({
    list: chaptersWithBooks,
    // If `queryText` is blank, `list` is returned in whole
    queryText: searchText,
    // optional `getText` or `key`, same as with `createFuzzySearch`
    getText: (item) => [
      typeof item === 'object' ? getReference(item.chapterId) : '',
    ],
    // arbitrary mapping function, takes `FuzzyResult<T>` as input
    mapResultItem: ({ item, score, matches: [highlightRanges] }) => ({
      item,
      highlightRanges,
    }),
  })

  function closeNavigator() {
    searchRef.current?.blur()
    textPinch.value = withSpring(1)
    savedTextPinch.value = 1
    searchRef.current?.clear()
    setSearchText('')
    // runOnJS(setPastOverlayOffset)(false)
    // if (overlayOpacity.value !== 0) overlayOpacity.value = withTiming(1)
    chapterTransition.value = withTiming(0)
    setTimeout(() => setNavigatorBook(undefined), 500)
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

  function renderMainNavigatorItem({ item, index }: NavigatorChapterItem) {
    const highlight =
      index === 0 && searchResults.length > 0 && searchText !== ''

    if ('item' in item)
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
          }}
        >
          <Text style={type(20, 'uir', 'l', colors.fg1)}>
            {getReference(item.item.chapterId)}
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
    else if ('sectionName' in item)
      return (
        <View
          key={item.sectionName}
          style={{
            width: '100%',
            paddingHorizontal: gutterSize,
            // marginTop: index === 0 ? 0 : gutterSize * 1.5,
            marginBottom: 4,
            backgroundColor: colors.bg2,
          }}
        >
          <Text style={type(15, 'uir', 'l', colors.fg3)}>
            {sectionNames[item.sectionName]}
          </Text>
          <Spacer units={2} />
          <View
            style={{ width: '100%', height: 1, backgroundColor: colors.bg3 }}
          />
        </View>
      )
    else
      return (
        <TouchableOpacity
          key={item.bookId}
          style={{
            alignItems: 'center',
            // width: '100%',
            // height: 32,
            marginBottom:
              index === booksWithSections.length - 1
                ? 0
                : 'sectionName' in booksWithSections[index + 1]
                  ? gutterSize * 1.5
                  : 0,
            paddingVertical: 6,
            paddingHorizontal: gutterSize / 2,
            backgroundColor:
              navigatorBook?.bookId === item.bookId ? colors.bg3 : undefined,
            flexDirection: 'row',
            borderRadius: 12,
            marginHorizontal: gutterSize / 2,
            justifyContent: 'space-between',
          }}
          onPress={() => {
            chapterTransition.value = withTiming(1)
            setNavigatorBook(item)
            searchRef.current?.blur()
          }}
        >
          <Text style={type(20, 'uir', 'l', colors.fg1)}>{item.name}</Text>
        </TouchableOpacity>
      )
  }

  const navigatorAnimatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(textPinch.value, [zoomOutReq, 1], [1, 0]),
      zIndex: textPinch.value !== 1 ? 2 : -1,
    }
  })

  const chapterBoxesAnimatedStyles = useAnimatedStyle(() => {
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

  function renderChapterBox({
    item,
    index,
  }: {
    item: Chapters[number]
    index: number
  }) {
    // const availableWidth =
    return (
      <Animated.View
        entering={FadeInRight.duration(200).delay(index * 5)}
        exiting={FadeOut}
        style={{
          flex: 1,
          aspectRatio: 1,
          backgroundColor: colors.bg3,
          marginHorizontal: gutterSize / 4,
          borderRadius: 16,
        }}
      >
        <TouchableOpacity
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => goToChapter(item.chapterId)}
        >
          <Text style={type(18, 'uib', 'c', colors.fg1)}>
            {item.chapterId.split('.')[1]}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }
  const panActivateConfig = { mass: 0.5, damping: 20, stiffness: 140 }

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

  function resetNavigatorBook() {
    setNavigatorBook(undefined)
  }

  const searchAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(chapterTransition.value, [0, 1], [0, -50]) },
    ],
    opacity: interpolate(chapterTransition.value, [0, 0.5], [1, 0]),
  }))

  const bookNameAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(chapterTransition.value, [0, 1], [50, 0]) },
    ],
    opacity: interpolate(chapterTransition.value, [1, 0.5], [1, 0]),
  }))

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
          navigatorAnimatedStyles,
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
              <FlatList
                // contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
                ref={chapterListRef as any}
                keyboardShouldPersistTaps="always"
                estimatedItemSize={25}
                stickyHeaderIndices={
                  searchText === '' ? bookIndices : undefined
                }
                renderItem={renderMainNavigatorItem}
                ListFooterComponent={<Spacer units={4} />}
                data={searchText !== '' ? searchResults : booksWithSections}
              />
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
            chapterBoxesAnimatedStyles,
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
            <FlashList
              estimatedItemSize={64}
              keyboardShouldPersistTaps="always"
              numColumns={5}
              renderItem={renderChapterBox}
              data={(chapters as Chapters).filter(
                (chapter) =>
                  getBook(chapter.chapterId).bookId === navigatorBook?.bookId
              )}
              ListHeaderComponent={<Spacer units={3} />}
              contentContainerStyle={{
                paddingHorizontal: (gutterSize * 3) / 4,
              }}
              ItemSeparatorComponent={() => <Spacer units={3} />}
              ListFooterComponent={<Spacer units={4} />}
            />
            <Fade place="top" color={colors.bg2} />
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}
