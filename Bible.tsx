import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { impactAsync } from 'expo-haptics'
import { StatusBar } from 'expo-status-bar'
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TextInput,
  View,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler'
import Markdown, { ASTNode } from 'react-native-markdown-display'
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
import ChapterOverlay from './components/ChapterOverlay'
import History from './components/History'
import Navigator from './components/Navigator'
import VerseInfo from './components/VerseInfo'
import {
  chapterChangeDuration,
  colors,
  gutterSize,
  horizTransReq,
  horizVelocReq,
  overScrollReq,
  panActivateConfig,
  screenHeight,
  type,
  zoomOutReq,
} from './constants'
import chaptersJson from './data/chapters.json'
import { Books } from './data/types/books'
import { Chapters } from './data/types/chapters'
import { getBook, getReference } from './functions/bible'
import { ActiveChapterIndex } from './types/bible'

export interface NavigatorChapterItem {
  item:
    | { item: Chapters[number] }
    | Books[number]
    | { sectionName: Books[number]['englishDivision'] }
  index: number
}

export default function BibleView() {
  const [activeChapterIndex, setActiveChapterIndex] =
    useState<ActiveChapterIndex>({ index: 0, going: 'forward' })

  const activeChapter = useMemo(() => {
    return (chaptersJson as Chapters)[activeChapterIndex.index]
  }, [activeChapterIndex])

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )

  const insets = useSafeAreaInsets()

  const overlayOpacity = useSharedValue(0)

  /**
   * Component refs.
   */
  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<NavigatorChapterItem>>(null)

  const textTranslateY = useSharedValue(0)
  const textTranslateX = useSharedValue(0)
  const savedTextTranslateX = useSharedValue(0)

  const textPinch = useSharedValue(1)
  const savedTextPinch = useSharedValue(1)
  const textPinchHaptic = useSharedValue(0)

  const goPrev = useSharedValue(0)
  const goNext = useSharedValue(0)

  const [searchText, setSearchText] = useState('')

  const prevIndicatorY = useSharedValue(0)
  const nextIndicatorY = useSharedValue(0)
  const prevIndicatorOpacity = useSharedValue(0)
  const nextIndicatorOpacity = useSharedValue(0)
  const prevIndicatorScale = useSharedValue(0)
  const nextIndicatorScale = useSharedValue(0)
  const [isStatusBarHidden, setIsStatusBarHidden] = useState(true)
  const [pastOverlayOffset, setPastOverlayOffset] = useState(false)

  function focusSearch() {
    searchRef.current?.focus()
  }

  const onLinkPress = (url: string) => {
    console.log(url)
    // some custom logic
    return false
  }

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      if (textPinch.value === zoomOutReq) return

      textPinch.value = savedTextPinch.value * e.scale

      if (textPinch.value < zoomOutReq) {
        if (textPinchHaptic.value === 0) {
          textPinchHaptic.value = 1
          runOnJS(impactAsync)()
        }
      } else {
        textPinchHaptic.value = 0
      }
    })
    .onEnd((e) => {
      if (textPinch.value === zoomOutReq) return

      if (e.scale <= zoomOutReq) {
        savedTextPinch.value = zoomOutReq
        textPinch.value = withSpring(zoomOutReq)
        runOnJS(focusSearch)()
        runOnJS(showStatusBar)()
      } else {
        savedTextPinch.value = 1
        textPinch.value = withSpring(1)
      }
    })

  function showStatusBar() {
    setIsStatusBarHidden(false)
  }
  function hideStatusBar() {
    setIsStatusBarHidden(true)
  }

  function openHistory() {}

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (textPinch.value !== 1) return

      textTranslateX.value = savedTextTranslateX.value + event.translationX
    })
    .onFinalize((e) => {
      if (textPinch.value !== 1) return

      const comingFrom =
        savedTextTranslateX.value === 0
          ? 'center'
          : savedTextTranslateX.value > 0
            ? 'left'
            : 'right'

      switch (comingFrom) {
        case 'center':
          if (
            textTranslateX.value < -horizTransReq / 2 ||
            e.velocityX < -horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(showStatusBar)()
            savedTextTranslateX.value = -horizTransReq
            textTranslateX.value = withSpring(-horizTransReq, panActivateConfig)
          } else if (
            textTranslateX.value > horizTransReq / 2 ||
            e.velocityX > horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(showStatusBar)()
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          } else {
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          }
          break
        case 'right':
          if (
            textTranslateX.value > -horizTransReq / 2 ||
            e.velocityX > horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(hideStatusBar)()
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          } else {
            savedTextTranslateX.value = -horizTransReq
            textTranslateX.value = withSpring(-horizTransReq, panActivateConfig)
          }
          break
        case 'left':
          if (
            textTranslateX.value < horizTransReq / 2 ||
            e.velocityX < -horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(hideStatusBar)()
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          } else {
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          }
      }
    })

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      savedTextPinch.value = zoomOutReq
      textPinch.value = withSpring(zoomOutReq)
      runOnJS(focusSearch)()
      runOnJS(showStatusBar)()
    })

  const composedGestures = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    tapGesture
  )

  useEffect(() => {
    if (activeChapterIndex.going === 'forward') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    } else if (activeChapterIndex.going === 'back') {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: false }),
        50
      )
    } else {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }

    textTranslateY.value = withDelay(
      75,
      withSpring(0, { damping: 20, stiffness: 120 })
    )
  }, [activeChapterIndex])

  function goToNextChapter() {
    setActiveChapterIndex((current) => ({
      going: 'forward',
      index: current.index + 1,
    }))
  }
  function goToPreviousChapter() {
    setActiveChapterIndex((current) => ({
      going: 'back',
      index: current.index - 1,
    }))
  }

  useDerivedValue(() => {
    if (goPrev.value === 1) {
      textTranslateY.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 }, runOnJS(goToPreviousChapter))
      )

      goPrev.value = 0
    }
  }, [screenHeight])

  useDerivedValue(() => {
    if (goNext.value === 1) {
      textTranslateY.value = withSequence(
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

    // Fade in and out the chapter overlay.
    if (offset > 80) {
      setPastOverlayOffset(true)
    } else {
      setPastOverlayOffset(false)
    }

    // Animate the prev/next chapter arrows.
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

  function handleDragEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const window = event.nativeEvent.layoutMeasurement.height
    const contentHeight = event.nativeEvent.contentSize.height

    if (offset <= -overScrollReq && activeChapterIndex.index !== 0)
      goPrev.value = 1
    else if (
      offset + window > contentHeight + overScrollReq &&
      activeChapterIndex.index !== (chaptersJson as Chapters).length - 1
    )
      goNext.value = 1
  }

  useDerivedValue(() => {
    if (prevIndicatorOpacity.value === 1 || nextIndicatorOpacity.value === 1) {
      runOnJS(impactAsync)()
    }
  }, [])

  const chapterAStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: textTranslateY.value },
        { translateX: textTranslateX.value },
        {
          scale: interpolate(textPinch.value, [0, 1], [0.8, 1], {
            extrapolateLeft: Extrapolation.CLAMP,
            extrapolateRight: Extrapolation.CLAMP,
          }),
        },
      ],

      opacity:
        textPinch.value !== 1
          ? textPinch.value
          : interpolate(
              textTranslateX.value,
              [-horizTransReq, 0, horizTransReq],
              [0.5, 1, 0.5]
            ),
    }
  })

  const showPrevAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor:
        prevIndicatorOpacity.value === 1 ? colors.fg2 : colors.bg2,
      opacity: prevIndicatorOpacity.value,
      transform: [
        {
          translateY: interpolate(
            -prevIndicatorY.value,
            [0, overScrollReq, overScrollReq * 2],
            [0, overScrollReq, overScrollReq * 1.4]
          ),
        },
        { scale: prevIndicatorScale.value },
      ],
    }
  })

  const showNextAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor:
        nextIndicatorOpacity.value === 1 ? colors.fg2 : colors.bg2,
      opacity: nextIndicatorOpacity.value,
      transform: [
        {
          translateY: interpolate(
            -nextIndicatorY.value,
            [-overScrollReq * 2, -overScrollReq, 0],
            [-overScrollReq * 1.4, -overScrollReq, 0]
          ),
        },
        { scale: nextIndicatorScale.value },
      ],
    }
  })

  const linkAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslateX.value }],
    }
  })

  const rules = {
    link: (node: ASTNode, children: ReactNode) => {
      return (
        <Text
          style={{
            // backgroundColor: colors.bg2,
            textDecorationLine: 'underline',
            lineHeight: 34,
          }}
          onPress={() => onLinkPress(node.attributes.href)}
        >
          <Text style={{ color: colors.fg3 }}>{' '}</Text>
          {children}
          <Text style={{ color: colors.fg3 }}>{' '}</Text>
        </Text>
      )
    },
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
              {getReference(activeChapter.chapterId)}
            </Text>
            <Markdown
              mergeStyle={false}
              style={{
                body: {
                  ...type(18, 'r', 'l', colors.fg1),
                  lineHeight: 36,
                  textAlignVertical: 'center',
                },
                link: {
                  color: colors.fg3,
                  fontSize: 18,
                  fontFamily: 'Bold',
                },
                em: {
                  fontFamily: 'Regular-Italic',
                },
                strong: {
                  fontFamily: 'Bold',
                },
              }}
              rules={rules}
            >
              {activeChapter.md}
            </Markdown>
            {/* <View style={styles.dotContainer}>
            <View style={styles.dot} />
          </View> */}
            <Spacer units={24} additional={insets.bottom} />
          </ScrollView>
        </Animated.View>
        <ChapterOverlay
          overlayOpacity={overlayOpacity}
          activeChapter={activeChapter}
          activeBook={activeBook}
          isStatusBarHidden={isStatusBarHidden}
          pastOverlayOffset={pastOverlayOffset}
        />
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
        <Navigator
          chapterListRef={searchListRef}
          textPinch={textPinch}
          savedTextPinch={savedTextPinch}
          searchRef={searchRef}
          searchText={searchText}
          setSearchText={setSearchText}
          setActiveChapterIndex={setActiveChapterIndex}
          activeChapter={activeChapter}
          setIsStatusBarHidden={setIsStatusBarHidden}
        />
        <VerseInfo textTranslationX={textTranslateX} />
        <History
          activeChapterIndex={activeChapterIndex}
          savedTextTranslateX={savedTextTranslateX}
          textTranslationX={textTranslateX}
          setActiveChapterIndex={setActiveChapterIndex}
          openHistory={() => {
            runOnJS(impactAsync)()
            runOnJS(showStatusBar)()
            savedTextTranslateX.value = -horizTransReq
            textTranslateX.value = withSpring(-horizTransReq, panActivateConfig)
          }}
          activeChapter={activeChapter}
          closeHistory={() => {
            textTranslateX.value = withSpring(0, panActivateConfig)
            savedTextTranslateX.value = 0
          }}
        />
        <StatusBar
          hidden={isStatusBarHidden}
          backgroundColor={colors.bg2}
          translucent={false}
          animated
          style="light"
        />
      </View>
    </GestureDetector>
  )
}
