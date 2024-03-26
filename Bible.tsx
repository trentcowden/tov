import { FlashList } from '@shopify/flash-list'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
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
  TouchableOpacity,
} from 'react-native-gesture-handler'
import Markdown from 'react-native-markdown-display'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
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
import { goToNextChapter, goToPreviousChapter } from './redux/activeChapter'
import { useAppDispatch, useAppSelector } from './redux/hooks'

export interface NavigatorChapterItem {
  item:
    | { item: Chapters[number] }
    | Books[number]
    | { sectionName: Books[number]['englishDivision'] }
  index: number
}

export default function BibleView() {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)

  const activeChapter = useMemo(() => {
    return (chaptersJson as Chapters)[activeChapterIndex.index]
  }, [activeChapterIndex])

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )

  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  const overlayOpacity = useSharedValue(0)

  /**
   * Component refs.
   */
  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<NavigatorChapterItem>>(null)

  // Animating the main text area.
  const textTranslateY = useSharedValue(0)
  const textTranslateX = useSharedValue(0)
  const savedTextTranslateX = useSharedValue(0)

  const navigatorTransition = useSharedValue(1)
  const savedNavigatorTransition = useSharedValue(1)

  const fingerDown = useRef(false)
  const [searchText, setSearchText] = useState('')

  const [isStatusBarHidden, setIsStatusBarHidden] = useState(true)
  const [pastOverlayOffset, setPastOverlayOffset] = useState(false)

  const alreadyHaptic = useRef(false)

  function focusSearch() {
    searchRef.current?.focus()
  }

  function showStatusBar() {
    setIsStatusBarHidden(false)
  }
  function hideStatusBar() {
    setIsStatusBarHidden(true)
  }

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (navigatorTransition.value !== 1) return

      textTranslateX.value = savedTextTranslateX.value + event.translationX
    })
    .onFinalize((e) => {
      if (navigatorTransition.value !== 1) return

      const comingFrom =
        savedTextTranslateX.value === 0
          ? 'center'
          : savedTextTranslateX.value > 0
            ? 'left'
            : 'right'

      switch (comingFrom) {
        case 'center':
          // if (
          //   textTranslateX.value < -horizTransReq / 2 ||
          //   e.velocityX < -horizVelocReq
          // ) {
          //   runOnJS(impactAsync)()
          //   runOnJS(showStatusBar)()
          //   savedTextTranslateX.value = -horizTransReq
          //   textTranslateX.value = withSpring(-horizTransReq, panActivateConfig)
          // } else
          if (
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
      // If we are viewing history/verse info, ignore taps.
      if (Math.abs(textTranslateX.value) > 10) return
      // If the navigator is already open, ignore taps.
      else if (navigatorTransition.value !== 1) return

      savedNavigatorTransition.value = zoomOutReq
      navigatorTransition.value = withSpring(zoomOutReq)

      runOnJS(focusSearch)()
      runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
    })

  const composedGestures = Gesture.Simultaneous(panGesture, tapGesture)

  useEffect(() => {
    if (activeChapterIndex.going === 'forward') {
      setPastOverlayOffset(false)
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    } else if (activeChapterIndex.going === 'back') {
      setPastOverlayOffset(true)
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

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const contentHeight = event.nativeEvent.contentSize.height

    if (textTranslateY.value === 0) {
      if (offset > 80) setPastOverlayOffset(true)
      else setPastOverlayOffset(false)
    }

    if (!fingerDown.current) return

    // If we meet the requirements for going to the next or previous chapter while we
    // are still scrolling, give some haptic feedback to indicate to the user that if
    // they release their finger, they will go to the next/previous chapter.
    if (offset < -overScrollReq && !alreadyHaptic.current) {
      impactAsync(ImpactFeedbackStyle.Heavy)
      alreadyHaptic.current = true
    } else if (
      offset > contentHeight - screenHeight + overScrollReq &&
      !alreadyHaptic.current
    ) {
      impactAsync(ImpactFeedbackStyle.Heavy)
      alreadyHaptic.current = true
      // If we were previously eligible to go to the next/previous chapter but aren't
      // anymore, give a lighter haptic feedback to indicate that the chapter won't
      // change on release.
    } else if (
      textTranslateY.value === 0 &&
      offset < 0 &&
      offset > -overScrollReq &&
      alreadyHaptic.current === true
    ) {
      impactAsync(ImpactFeedbackStyle.Light)
      alreadyHaptic.current = false
    } else if (
      textTranslateY.value === 0 &&
      offset > contentHeight - screenHeight &&
      offset < contentHeight - screenHeight + overScrollReq &&
      alreadyHaptic.current === true
    ) {
      impactAsync(ImpactFeedbackStyle.Light)
      alreadyHaptic.current = false
    }
  }

  function handleDragEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    fingerDown.current = false

    const offset = event.nativeEvent.contentOffset.y
    const screenHeight = event.nativeEvent.layoutMeasurement.height
    const contentHeight = event.nativeEvent.contentSize.height
    const velocity = event.nativeEvent.velocity
    const y = velocity?.y ?? 0

    /**
     * Whether or not this drag meets the requirements to begin considering going to the previous chapter.
     */
    const goingPrev = y < 0 && offset < 0 && activeChapterIndex.index !== 0

    /**
     * Whether or not this drag meets the requirements to begin considering going to the next chapter.
     */
    const goingNext =
      y > 0 &&
      offset > contentHeight - screenHeight &&
      activeChapterIndex.index !== (chaptersJson as Chapters).length - 1

    if (goingPrev && (offset <= -overScrollReq || y < -1)) {
      if (!alreadyHaptic.current) impactAsync(ImpactFeedbackStyle.Heavy)
      textTranslateY.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 })
      )
      setTimeout(() => dispatch(goToPreviousChapter()), chapterChangeDuration)
    } else if (
      goingNext &&
      (offset > contentHeight - screenHeight + overScrollReq || y > 1)
    ) {
      if (!alreadyHaptic.current) impactAsync(ImpactFeedbackStyle.Heavy)
      textTranslateY.value = withSequence(
        withTiming(-screenHeight, {
          duration: chapterChangeDuration,
        }),
        withTiming(screenHeight, { duration: 0 })
      )
      setTimeout(() => dispatch(goToNextChapter()), chapterChangeDuration)
    } else if (alreadyHaptic.current) impactAsync(ImpactFeedbackStyle.Light)
  }

  const chapterAStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: textTranslateY.value },
        { translateX: textTranslateX.value },
      ],
      opacity:
        navigatorTransition.value !== 1
          ? navigatorTransition.value
          : interpolate(
              textTranslateX.value,
              [-horizTransReq, 0, horizTransReq],
              [0.3, 1, 0.3]
            ),
    }
  })

  const tapToReturnAnimatedStyles = useAnimatedStyle(() => ({
    zIndex: Math.abs(textTranslateX.value) < 10 ? -1 : 1,
  }))

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
            showsVerticalScrollIndicator={false}
            style={{ paddingHorizontal: gutterSize, flex: 1 }}
            ref={scrollViewRef}
            onScrollEndDrag={handleDragEnd}
            onScroll={handleScroll}
            alwaysBounceVertical
            scrollEventThrottle={100}
            onScrollBeginDrag={() => {
              alreadyHaptic.current = false
              fingerDown.current = true
            }}
          >
            <Spacer units={8} additional={insets.top} />
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
              // rules={rules}
            >
              {activeChapter.md}
            </Markdown>
            <Spacer units={8} additional={insets.bottom} />
          </ScrollView>
        </Animated.View>
        <ChapterOverlay
          overlayOpacity={overlayOpacity}
          activeChapter={activeChapter}
          activeBook={activeBook}
          isStatusBarHidden={isStatusBarHidden}
          pastOverlayOffset={pastOverlayOffset}
          textTranslationY={textTranslateY}
        />
        <Navigator
          chapterListRef={searchListRef}
          textPinch={navigatorTransition}
          savedTextPinch={savedNavigatorTransition}
          searchRef={searchRef}
          searchText={searchText}
          setSearchText={setSearchText}
          activeChapter={activeChapter}
        />
        {/* <VerseInfo textTranslationX={textTranslateX} /> */}
        <History
          savedTextTranslateX={savedTextTranslateX}
          textTranslationX={textTranslateX}
          openHistory={() => {}}
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
        {/* <FloatingButtons
          textTranslationX={textTranslateX}
          openHistory={() => {
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
            runOnJS(impactAsync)()
            runOnJS(showStatusBar)()
          }}
          textPinch={textPinch}
          openNavigator={() => {
            if (Math.abs(textTranslateX.value) > 10) return

            savedTextPinch.value = zoomOutReq
            textPinch.value = withSpring(zoomOutReq)
            runOnJS(focusSearch)()
            runOnJS(impactAsync)()
            runOnJS(showStatusBar)()
          }}
        /> */}
        <Animated.View
          style={[
            {
              ...Dimensions.get('window'),
              position: 'absolute',
            },
            tapToReturnAnimatedStyles,
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              savedTextTranslateX.value = 0
              textTranslateX.value = withSpring(0, panActivateConfig)
            }}
            style={{
              ...Dimensions.get('window'),
            }}
          />
        </Animated.View>
      </View>
    </GestureDetector>
  )
}
