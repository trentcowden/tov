import { Ionicons } from '@expo/vector-icons'
import { useFuzzySearchList } from '@nozbe/microfuzz/react'
import { FlashList } from '@shopify/flash-list'
import { impactAsync } from 'expo-haptics'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  TextInput,
} from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from './Spacer'
import bible from './bible.json'
import { Bible, Chapter } from './bibleTypes'
import { colors, gutterSize, screenHeight, type } from './constants'
import chapters from './data/chapters.json'
import { renderFirstLevelText } from './functions/renderBible'

const chapterChangeDuration = 300
const overScrollReq = 100
const zoomOutReq = 0.4
const horizReq = Dimensions.get('window').width * 0.6
interface SearchItem {
  item: { item: string | Chapter }
}

export default function BibleView() {
  const [activeChapter, setActiveChapter] = useState<{
    going: 'forward' | 'back'
    index: number
    id: string
  }>({ index: 0, going: 'forward', id: 'GEN.1' })
  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<SearchItem>>(null)
  const chapterTransition = useSharedValue(0)
  const showPrevIndicator = useSharedValue(0)
  const showNextIndicator = useSharedValue(0)
  const goPrev = useSharedValue(0)
  const goNext = useSharedValue(0)
  const [searchText, setSearchText] = useState('')
  const insets = useSafeAreaInsets()
  const prevIndicatorY = useSharedValue(0)
  const nextIndicatorY = useSharedValue(0)
  const prevIndicatorOpacity = useSharedValue(0)
  const nextIndicatorOpacity = useSharedValue(0)
  const prevIndicatorScale = useSharedValue(0)
  const nextIndicatorScale = useSharedValue(0)
  const scale = useSharedValue(1)
  const savedScale = useSharedValue(1)
  const offset = useSharedValue(0)
  const saved = useSharedValue(0)

  const filteredChapters: Chapter[] = useMemo(() => {
    const nivBible = bible as Bible

    return nivBible.chapters.filter(
      (chapter: Chapter) => chapter.number !== 'intro'
    )
  }, [])

  const bookIndices = useMemo(() => {
    return [
      0,
      ...chapters.map((chapter, index) =>
        chapters
          .slice(0, index + 1)
          .reduce((a, b) => a + b.chapters.length + 1, 0)
      ),
    ]
  }, [])

  const chapterList = useMemo(() => {
    const chapterList = []

    for (const chapter of filteredChapters) {
      if (chapter.number === '1')
        chapterList.push(chapter.reference.split(' ').slice(0, -1).join(' '))

      chapterList.push(chapter)
    }

    return chapterList
  }, [filteredChapters])

  /**
   * Whether or not new search results should be calculated. We disable it as
   * the user is typing to prevent lag.
   */
  const [shouldSearch, setShouldSearch] = useState(true)

  /** A timer used to reset `shouldSearch` back to true when it's been disabled. */
  const timer = useRef<NodeJS.Timer>()

  /** An array of the results from a specific search. Starts off as undefined. */
  // const [searchResults, setSearchResults] = useState<
  //   Array<FuseResult<Chapter>>
  // >([])

  /** Used to store the fuse.js object. */
  const searchResults = useFuzzySearchList({
    list: chapterList,
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

  function focusSearch() {
    console.log('beep 2')
    searchRef.current?.focus()
  }

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale
    })
    .onEnd((e) => {
      if (e.scale <= zoomOutReq) {
        savedScale.value = zoomOutReq
        scale.value = withSpring(zoomOutReq)
        console.log('beep')
        runOnJS(focusSearch)()
      } else {
        savedScale.value = 1
        scale.value = withSpring(1)
      }
    })

  const drawerConfig = { mass: 1.2, damping: 20, stiffness: 160 }

  const drawer = Gesture.Pan()
    .onChange((event) => {
      if (scale.value !== 1) return

      offset.value = saved.value + event.translationX
    })
    .onFinalize((e) => {
      if (scale.value !== 1) return

      if (offset.value < -horizReq) {
        saved.value = -horizReq
        offset.value = withSpring(-horizReq, drawerConfig)
      } else if (offset.value > horizReq) {
        saved.value = horizReq
        offset.value = withSpring(horizReq, drawerConfig)
      } else {
        saved.value = 0
        offset.value = withSpring(0, drawerConfig)
      }
    })

  const composedGestures = Gesture.Simultaneous(pinch, drawer)

  useEffect(() => {
    if (activeChapter.going === 'forward') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    } else if (activeChapter.going === 'back') {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: false }),
        50
      )
    } else {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }

    chapterTransition.value = withDelay(
      50,
      withSpring(0, { damping: 20, stiffness: 120 })
    )
  }, [activeChapter])

  function handleDragEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const window = event.nativeEvent.layoutMeasurement.height
    const contentHeight = event.nativeEvent.contentSize.height

    if (offset <= -overScrollReq && activeChapter.index !== 0) goPrev.value = 1
    else if (
      offset + window > contentHeight + overScrollReq &&
      activeChapter.index !== filteredChapters.length - 1
    )
      goNext.value = 1
  }

  function goToNextChapter() {
    setActiveChapter((current) => ({
      going: 'forward',
      id: filteredChapters[current.index + 1].id,
      index: current.index + 1,
    }))
  }
  function goToPreviousChapter() {
    setActiveChapter((current) => ({
      going: 'back',
      id: filteredChapters[current.index - 1].id,
      index: current.index - 1,
    }))
  }

  useDerivedValue(() => {
    if (goPrev.value === 1) {
      chapterTransition.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 }, runOnJS(goToPreviousChapter))
      )

      goPrev.value = 0
    }
  }, [screenHeight])

  useDerivedValue(() => {
    if (goNext.value === 1) {
      chapterTransition.value = withSequence(
        withTiming(-screenHeight, {
          duration: chapterChangeDuration,
        }),
        withTiming(screenHeight, { duration: 0 }, runOnJS(goToNextChapter))
      )

      goNext.value = 0
    }
  }, [screenHeight])

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const contentHeight = event.nativeEvent.contentSize.height

    if (offset < 0) {
      prevIndicatorY.value = offset

      prevIndicatorOpacity.value = interpolate(
        offset,
        [-overScrollReq, 0],
        [1, 0],
        {
          extrapolateLeft: Extrapolation.CLAMP,
          extrapolateRight: Extrapolation.CLAMP,
        }
      )

      prevIndicatorScale.value = interpolate(
        offset,
        [-overScrollReq * 2, -overScrollReq, 0],
        [1.2, 1, 0.5]
      )
    } else if (offset > contentHeight - screenHeight) {
      const relativeValue = offset - contentHeight + screenHeight

      nextIndicatorY.value = relativeValue

      nextIndicatorOpacity.value = interpolate(
        relativeValue,
        [0, overScrollReq],
        [0, 1],
        {
          extrapolateLeft: Extrapolation.CLAMP,
          extrapolateRight: Extrapolation.CLAMP,
        }
      )

      nextIndicatorScale.value = interpolate(
        relativeValue,
        [0, overScrollReq, overScrollReq * 2],
        [0.5, 1, 1.2]
      )
    } else {
      prevIndicatorY.value = withTiming(0)
      prevIndicatorOpacity.value = withTiming(0)
      prevIndicatorScale.value = withTiming(0)
      nextIndicatorY.value = withTiming(0)
      nextIndicatorOpacity.value = withTiming(0)
      nextIndicatorScale.value = withTiming(0)
    }
  }

  useDerivedValue(() => {
    if (showPrevIndicator.value === 1 || showNextIndicator.value === 1) {
      runOnJS(impactAsync)()
    }
  }, [])

  const chapterAStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: chapterTransition.value },
        { translateX: offset.value },
        {
          scale: interpolate(scale.value, [0, 1], [0.9, 1], {
            extrapolateLeft: Extrapolation.CLAMP,
            extrapolateRight: Extrapolation.CLAMP,
          }),
        },
      ],
      opacity: scale.value,
    }
  })

  const showPrevAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor:
        prevIndicatorOpacity.value === 1 ? colors.p1 : colors.bg2,
      opacity: prevIndicatorOpacity.value,
      transform: [
        { translateY: -prevIndicatorY.value },
        { scale: prevIndicatorScale.value },
      ],
    }
  })

  const showNextAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor:
        nextIndicatorOpacity.value === 1 ? colors.p1 : colors.bg2,
      opacity: nextIndicatorOpacity.value,
      transform: [
        { translateY: -nextIndicatorY.value },
        { scale: nextIndicatorScale.value },
      ],
    }
  })

  const navigatorAnimatedStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scale.value, [zoomOutReq, 1], [1, 0]),
      zIndex: scale.value !== 1 ? 2 : -1,
    }
  })

  const historyAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    }
  })

  const extrasAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    }
  })

  function renderSearchItem({ item: { item } }: SearchItem) {
    const isBook = typeof item === 'string'
    const chapterIndex = isBook
      ? -1
      : filteredChapters.findIndex((chapter) => chapter.id === item.id)

    return (
      <TouchableOpacity
        disabled={isBook}
        style={{
          justifyContent: 'center',
          width: '100%',
          height: isBook ? 48 : 32,
          paddingHorizontal: gutterSize,
          borderBottomWidth: isBook ? 1 : 0,
          backgroundColor: colors.bg2,
          marginBottom: isBook ? 8 : 0,
          borderColor: colors.bg3,
        }}
        onPress={() => {
          setActiveChapter({
            going: 'forward',
            id: filteredChapters[chapterIndex].id,
            index: chapterIndex,
          })
          searchRef.current?.blur()
          scale.value = withSpring(1)
          savedScale.value = 1
        }}
      >
        <Text
          style={type(isBook ? 24 : 18, isBook ? 'b' : 'r', 'l', colors.fg1)}
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

  return (
    <GestureDetector gesture={composedGestures}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg1,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <Animated.View
          style={[{ flex: 1, backgroundColor: colors.bg1 }, chapterAStyles]}
        >
          <ScrollView
            style={{ paddingHorizontal: gutterSize, flex: 1 }}
            ref={scrollViewRef}
            onScrollEndDrag={handleDragEnd}
            onScroll={handleScroll}
            alwaysBounceVertical
            scrollEventThrottle={16}
          >
            <Spacer units={4} additional={insets.top + gutterSize} />
            <Text
              style={{
                ...type(32, 'b', 'c', colors.fg1),
                marginBottom: gutterSize,
              }}
            >
              {filteredChapters[activeChapter.index].reference}
            </Text>
            {filteredChapters[activeChapter.index].data.map((paragraph) =>
              renderFirstLevelText(20, paragraph)
            )}
            {/* <View style={styles.dotContainer}>
            <View style={styles.dot} />
          </View> */}
            <Spacer units={24} additional={insets.bottom} />
          </ScrollView>
        </Animated.View>
        <View
          style={{
            width: '100%',
            position: 'absolute',
            top: insets.top - 64,
            alignItems: 'center',
          }}
        >
          <Animated.View
            style={[
              {
                borderRadius: 9999,
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
              },
              showPrevAnimatedStyles,
            ]}
          >
            <Ionicons name="arrow-up" size={32} color={colors.fg1} />
          </Animated.View>
        </View>
        <View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: insets.bottom,
            alignItems: 'center',
          }}
        >
          <Animated.View
            style={[
              {
                borderRadius: 9999,
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
              },
              showNextAnimatedStyles,
            ]}
          >
            <Ionicons name="arrow-down" size={32} color={colors.fg1} />
          </Animated.View>
        </View>
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
                  scale.value = withSpring(1)
                  savedScale.value = 1
                  searchRef.current?.blur()
                }}
                style={{
                  paddingHorizontal: gutterSize,
                  paddingVertical: gutterSize / 2,
                  top: 0,
                  right: 0,
                  zIndex: 4,
                }}
              >
                <Ionicons name="close-circle" size={32} color={colors.fg1} />
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
                  ref={searchListRef}
                  keyboardShouldPersistTaps="always"
                  stickyHeaderIndices={
                    searchText === '' ? bookIndices : undefined
                  }
                  estimatedItemSize={25}
                  renderItem={renderSearchItem}
                  data={searchResults}
                />
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              scale.value = withSpring(1)
              savedScale.value = 1
              searchRef.current?.blur()
            }}
            style={{ flex: 1, width: '100%' }}
          />
        </Animated.View>
        <Animated.View
          style={[
            {
              width: Dimensions.get('window').width * 2,
              height: Dimensions.get('window').height,
              backgroundColor: colors.bg2,
              position: 'absolute',
              right: -Dimensions.get('window').width * 2,
              zIndex: 2,
              paddingTop: insets.top + gutterSize,
              paddingHorizontal: gutterSize,
              paddingRight: Dimensions.get('window').width * 1.4 + gutterSize,
            },
            historyAnimatedStyles,
          ]}
        >
          <Text style={type(24, 'b', 'l', colors.fg1)}>Recents</Text>
        </Animated.View>
        <Animated.View
          style={[
            {
              width: Dimensions.get('window').width * 2,
              height: Dimensions.get('window').height,
              backgroundColor: colors.bg2,
              position: 'absolute',
              left: -Dimensions.get('window').width * 2,
              zIndex: 2,
              paddingTop: insets.top + gutterSize,
              paddingHorizontal: gutterSize,
              paddingLeft: Dimensions.get('window').width * 1.4 + gutterSize,
            },
            extrasAnimatedStyles,
          ]}
        >
          <Text style={type(24, 'b', 'l', colors.fg1)}>Settings</Text>
        </Animated.View>
      </View>
    </GestureDetector>
  )
}
