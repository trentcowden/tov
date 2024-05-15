import { FlashList } from '@shopify/flash-list'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { useKeepAwake } from 'expo-keep-awake'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextLayoutEventData,
  View,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
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
import BibleText from './components/BibleText'
import CircularProgress from './components/CircularProgress'
import History from './components/History'
import Navigator from './components/Navigator'
import ReferencesModal from './components/ReferencesModal'
import ScrollBar from './components/ScrollBar'
import Settings from './components/Settings'
import {
  chapterChangeDuration,
  colors,
  gutterSize,
  horizTransReq,
  horizVelocReq,
  overScrollReq,
  panActivateConfig,
  screenHeight,
  screenWidth,
  sizes,
  typography,
} from './constants'
import bibles from './data/bibles'
import { Chapters } from './data/types/chapters'
import { getBook, getChapterReference } from './functions/bible'
import {
  goToNextChapter,
  goToPreviousChapter,
  setActiveChapterIndex,
} from './redux/activeChapterIndex'
import { addToHistory } from './redux/history'
import { useAppDispatch, useAppSelector } from './redux/hooks'

interface GoToChapterParams {
  chapterId: Chapters[number]['chapterId']
  verseNumber?: number | 'bottom'
  highlightVerse?: boolean
  cameFromReference?: boolean
}

export type GoToChapter = (params: GoToChapterParams) => void
export default function BibleView() {
  const dispatch = useAppDispatch()
  // useEffect(() => {
  //   dispatch(setTranslation('web'))
  // }, [])
  // return

  // return

  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )
  const insets = useSafeAreaInsets()
  // const dispatch = useAppDispatch()
  const usableHeight = screenHeight - insets.top * 1 - insets.bottom * 2

  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<Chapters[number]>>(null)

  const overScrollAmount = useSharedValue(0)
  const [referenceVerse, setReferenceState] = useState<string>()
  // Animating the main text area.
  const textTranslateY = useSharedValue(0)
  const textTranslateX = useSharedValue(0)
  const savedTextTranslateX = useSharedValue(0)
  const textFadeOut = useSharedValue(1)

  const [verseOffsets, setVerseOffsets] = useState<number[]>()
  const currentVerseReq = screenHeight / 2
  const spaceBeforeTextStarts = insets.top + gutterSize * 6
  const currentVerseIndex = useSharedValue<number | 'bottom' | 'top'>(0)

  const navigatorTransition = useSharedValue(0)
  const savedNavigatorTransition = useSharedValue(0)

  const openSettings = useSharedValue(0)
  const openSettingsNested = useSharedValue(0)

  const openReferences = useSharedValue(0)
  const openReferencesNested = useSharedValue(0)

  const scrollBarActivate = useSharedValue(-1)

  const [textRendered, setTextRendered] = useState(false)

  const fingerDown = useRef(false)
  const [searchText, setSearchText] = useState('')

  const [isStatusBarHidden, setIsStatusBarHidden] = useState(true)
  const [pastOverlayOffset, setPastOverlayOffset] = useState(false)

  const releaseToChange = useSharedValue(0)
  const alreadyHaptic = useRef(false)
  const scrollBarPosition = useSharedValue(insets.top * 1)
  const scrollOffset = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (navigatorTransition.value !== 0 || textFadeOut.value !== 0) return

      const value = savedTextTranslateX.value + event.translationX
      if (value < horizTransReq && value > 0) {
        textTranslateX.value = value
      }
    })
    .onFinalize((e) => {
      if (navigatorTransition.value !== 0 || textFadeOut.value !== 0) return

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
            runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
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
            runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
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
            runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
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
      else if (navigatorTransition.value !== 0) return
      else if (openReferences.value !== 0) return

      savedNavigatorTransition.value = 1
      navigatorTransition.value = withTiming(1)

      runOnJS(focusSearch)()
      runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
    })

  function focusSearch() {
    searchRef.current?.focus()
  }

  const composedGestures = Gesture.Simultaneous(panGesture, tapGesture)

  useEffect(() => {
    if (!textRendered) return

    releaseToChange.value = 0
    alreadyHaptic.current = false

    // dispatch(removeFromHistory(activeChapter.chapterId))

    if (activeChapterIndex.transition === 'forward') {
      dispatch(
        addToHistory({
          chapterId: activeChapter.chapterId,
          verseIndex: 0,
        })
      )
      setPastOverlayOffset(false)
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
      textTranslateY.value = withSpring(0, { damping: 20, stiffness: 120 })
    } else if (activeChapterIndex.transition === 'back') {
      dispatch(
        addToHistory({
          chapterId: activeChapter.chapterId,
          verseIndex: 'bottom',
        })
      )
      scrollViewRef.current?.scrollToEnd({ animated: false })
      textTranslateY.value = withSpring(0, { damping: 20, stiffness: 120 })
    } else if (activeChapterIndex.transition === 'fade') {
      if (
        activeChapterIndex.verseIndex !== undefined &&
        activeChapterIndex.verseIndex !== 0
      ) {
        dispatch(
          addToHistory({
            chapterId: activeChapter.chapterId,
            verseIndex: activeChapterIndex.verseIndex,
          })
        )
        scrollViewRef.current?.scrollTo({
          y:
            activeChapterIndex.verseIndex === 'bottom'
              ? 9999
              : verseOffsets
                ? verseOffsets[activeChapterIndex.verseIndex] - currentVerseReq
                : 0,
          animated: false,
        })
        // textFadeOut.value = withTiming(0, { duration: 250 })
      } else {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: false,
        })
        dispatch(
          addToHistory({
            chapterId: activeChapter.chapterId,
            verseIndex: 0,
          })
        )
      }
      textFadeOut.value = withSpring(0, { damping: 20, stiffness: 120 })
    }
    scrollBarActivate.value = withDelay(
      activeChapterIndex.transition === 'fade' ? 0 : chapterChangeDuration,
      withTiming(0)
    )
  }, [activeChapterIndex.index, textRendered])

  const goToChapter: GoToChapter = ({
    chapterId,
    verseNumber,
    highlightVerse,
    cameFromReference,
  }) => {
    if (chapterId === activeChapter.chapterId) {
      return
    }

    scrollBarActivate.value = withTiming(-1, { duration: 200 })
    setTextRendered(false)
    const chapterIndex = bibles[settings.translation].findIndex(
      (chapter) => chapter.chapterId === chapterId
    )

    textFadeOut.value = 0.7
    textFadeOut.value = withTiming(1, { duration: chapterChangeDuration })

    dispatch(
      addToHistory({
        chapterId: activeChapter.chapterId,
        verseIndex: currentVerseIndex.value,
      })
    )

    setTimeout(
      () =>
        dispatch(
          setActiveChapterIndex({
            transition: 'fade',
            index: chapterIndex,
            verseIndex: verseNumber,
            highlightVerse:
              activeChapterIndex.cameFromReference === true ||
              highlightVerse === true,
            cameFromReference: cameFromReference ?? false,
          })
        ),
      chapterChangeDuration
    )
  }

  // useAnimatedReaction(
  //   () => releaseToChange.value,
  //   (currentValue, previousValue) => {
  //     if (textTranslateY.value !== 0) return

  //     if (previousValue === 0 && currentValue > 0)
  //       runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
  //     else if (previousValue === 1 && currentValue !== 1)
  //       runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
  //   }
  // )

  function handleScrollHaptics(offset: number, contentHeight: number) {
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

  function handleReleaseToChange(offset: number, contentHeight: number) {
    if (!fingerDown.current) return

    // If we meet the requirements for going to the next or previous chapter while we
    // are still scrolling, give some haptic feedback to indicate to the user that if
    // they release their finger, they will go to the next/previous chapter.
    if (offset < -overScrollReq && releaseToChange.value === 0) {
      releaseToChange.value = withTiming(1)
    } else if (
      offset > contentHeight - screenHeight + overScrollReq &&
      releaseToChange.value === 0
    ) {
      releaseToChange.value = withTiming(1)
      // If we were previously eligible to go to the next/previous chapter but aren't
      // anymore, give a lighter haptic feedback to indicate that the chapter won't
      // change on release.
    } else if (
      textTranslateY.value === 0 &&
      offset < 0 &&
      offset > -overScrollReq &&
      releaseToChange.value !== 0
    ) {
      releaseToChange.value = withTiming(0)
    } else if (
      textTranslateY.value === 0 &&
      offset > contentHeight - screenHeight &&
      offset < contentHeight - screenHeight + overScrollReq &&
      releaseToChange.value !== 0
    ) {
      releaseToChange.value = withTiming(0)
    }
  }

  function getVerseIndex(offset: number) {
    if (!verseOffsets) return -1

    if (offset + 50 > verseOffsets[verseOffsets.length - 1] - screenHeight) {
      return 'bottom'
    } else if (offset < 50) return 'top'

    let low = 0
    let high = verseOffsets.length - 1
    let result = -1
    const target = offset + currentVerseReq

    while (low <= high) {
      let mid = Math.floor((low + high) / 2)
      if (verseOffsets[mid] <= target) {
        result = mid // Found a new boundary
        low = mid + 1 // Try to find a higher value still <= target
      } else {
        high = mid - 1
      }
    }
    return result
  }

  function handleScrollBarUpdate(offset: number) {
    if (!verseOffsets || scrollBarActivate.value > 0) return

    const textHeight = verseOffsets[verseOffsets.length - 1]

    // This shit is crazy. Thanks chat gpt.
    const scrollBarHeight = usableHeight * (usableHeight / textHeight)
    const scrollRatio = offset / (textHeight - screenHeight)
    const maxTopPos = screenHeight - insets.bottom * 2 - scrollBarHeight

    scrollBarPosition.value =
      insets.top * 1 + scrollRatio * (maxTopPos - insets.top * 1)
  }

  function handleScrollVersePosition(offset: number) {
    const result = getVerseIndex(offset)

    if (result === 'bottom' || result === 'top' || result >= 0) {
      currentVerseIndex.value = result
    }
  }

  function handleOverScrollAmount(offset: number, contentHeight: number) {
    if (offset < 0) overScrollAmount.value = offset
    else if (offset > contentHeight - screenHeight)
      overScrollAmount.value = Math.abs(contentHeight - screenHeight - offset)
    else overScrollAmount.value = 0
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const contentHeight = event.nativeEvent.contentSize.height
    if (textTranslateY.value === 0) scrollOffset.value = offset
    handleScrollBarUpdate(offset)
    handleScrollHaptics(offset, contentHeight)
    handleScrollVersePosition(offset)
    handleReleaseToChange(offset, contentHeight)
    handleOverScrollAmount(offset, contentHeight)
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
      activeChapterIndex.index !== bibles[settings.translation].length - 1

    if (
      goingPrev &&
      offset <= -overScrollReq
      // || y < -overScrollVelocityReq
    ) {
      setTimeout(() => (scrollOffset.value = 1000), chapterChangeDuration)
      // setTextRendered(false)
      scrollBarActivate.value = withTiming(-1, { duration: 200 })

      textTranslateY.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 })
      )
      if (releaseToChange.value === 0) impactAsync(ImpactFeedbackStyle.Heavy)
      dispatch(
        addToHistory({
          chapterId: activeChapter.chapterId,
          verseIndex: currentVerseIndex.value,
        })
      )
      setTimeout(() => dispatch(goToPreviousChapter()), chapterChangeDuration)
    } else if (
      goingNext &&
      offset > contentHeight - screenHeight + overScrollReq
      // ||
      // y > overScrollVelocityReq
    ) {
      setTimeout(() => (scrollOffset.value = 0), chapterChangeDuration)
      // setTextRendered(false)
      scrollBarActivate.value = withTiming(-1, { duration: 200 })

      textTranslateY.value = withSequence(
        withTiming(-screenHeight, {
          duration: chapterChangeDuration,
        }),
        withTiming(screenHeight, { duration: 0 })
      )
      if (releaseToChange.value === 0) impactAsync(ImpactFeedbackStyle.Heavy)
      dispatch(
        addToHistory({
          chapterId: activeChapter.chapterId,
          verseIndex: currentVerseIndex.value,
        })
      )
      setTimeout(() => dispatch(goToNextChapter()), chapterChangeDuration)
    } else if (releaseToChange.value) impactAsync(ImpactFeedbackStyle.Light)
  }

  const textStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: textTranslateY.value },
        { translateX: textTranslateX.value },
      ],
      opacity:
        textFadeOut.value !== 0
          ? interpolate(textFadeOut.value, [0, 1], [1, 0])
          : textTranslateX.value !== 0
            ? interpolate(
                textTranslateX.value,
                [-horizTransReq, 0, horizTransReq],
                [0.5, 1, 0.5]
              )
            : scrollBarActivate.value > 0
              ? interpolate(scrollBarActivate.value, [0, 1], [1, 0.2])
              : 1,
    }
  })

  const returnTapStyles = useAnimatedStyle(() => ({
    zIndex: Math.abs(textTranslateX.value) < 10 ? -1 : 1,
  }))

  function onTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const spaceAfterTextEnds = insets.bottom * 2 + gutterSize * 2
    const verseOffsets: number[] = []

    event.nativeEvent.lines.forEach((line) => {
      // if (/\[[0-9]{1,3}\]/.test(line.text)) {
      // const matches = /[0-9]{1,3} /g.exec(line.text)
      const matches = line.text.match(/[0-9]{1,3} /g)

      matches?.forEach(() => {
        verseOffsets.push(spaceBeforeTextStarts + line.y)
      })
      // if (/[0-9]{1,3} /.test(line.text)) {
      //   // Set the offset relative to the very top of the scrollview.

      // }
    })

    const lastLine = event.nativeEvent.lines[event.nativeEvent.lines.length - 1]

    // Add the very bottom as the last offset.
    verseOffsets.push(
      spaceBeforeTextStarts + lastLine.y + lastLine.height + spaceAfterTextEnds
    )
    setVerseOffsets(verseOffsets)
  }

  useKeepAwake()

  const highlightVerseNumber = useSharedValue(0)

  useEffect(() => {
    if (
      activeChapterIndex.verseIndex !== undefined &&
      activeChapterIndex.verseIndex !== 'bottom' &&
      textRendered &&
      activeChapterIndex.highlightVerse
    ) {
      highlightVerseNumber.value = withSequence(
        withTiming(1),
        withDelay(2000, withTiming(0))
      )
    }
  }, [activeChapterIndex, textRendered])

  const verseNumberStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        highlightVerseNumber.value,
        [0, 1],
        [colors.p1 + '00', colors.p1 + '22']
      ),
    }
  })

  const headerText = useAnimatedStyle(() => ({
    // width: interpolate(
    //   scrollOffset.value,
    //   [0, insets.top + gutterSize],
    //   [screenWidth, 80],
    //   Extrapolation.CLAMP
    // ),
    opacity: interpolate(
      scrollOffset.value,
      [insets.top + gutterSize * 1.5, insets.top + gutterSize * 2],
      [1, 0]
    ),
    backgroundColor: interpolateColor(
      scrollOffset.value,
      [gutterSize * 1.5 + insets.top, insets.top + gutterSize * 2.5],
      [colors.bg1, colors.bg2 + 'EE']
    ),
    fontSize: interpolate(
      scrollOffset.value,
      [gutterSize, insets.top + gutterSize * 1.5],
      [sizes.title, sizes.caption],
      Extrapolation.CLAMP
    ),
  }))

  const header = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffset.value,
          [0, insets.top + gutterSize * 1.5],
          [insets.top + gutterSize * 1.5, 0],
          {
            extrapolateLeft: Extrapolation.EXTEND,
            extrapolateRight: Extrapolation.CLAMP,
          }
        ),
      },
    ],
    backgroundColor: interpolateColor(
      scrollOffset.value,
      [gutterSize * 1.5 + insets.top, spaceBeforeTextStarts],
      [colors.bg1, colors.bg2 + 'EE']
    ),
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
          style={[
            { flex: 1, backgroundColor: colors.bg1, width: screenWidth },
            textStyles,
          ]}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                zIndex: 2,
                justifyContent: 'center',
                top: 0,
                // borderRadius: 12,
                overflow: 'hidden',
                width: '100%',
                height: insets.top,
                paddingHorizontal: gutterSize,
              },
              header,
            ]}
          >
            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                typography(sizes.caption, 'uib', 'l', colors.fg3),
                {
                  position: 'absolute',
                  left: gutterSize,
                },
              ]}
            >
              {`${activeBook.name.replace(' ', '').slice(0, 3)}. ${activeChapter.chapterId.split('.')[1]}`}
            </Animated.Text>
            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                typography(sizes.title, 'b', 'l', colors.fg3),
                headerText,
              ]}
            >
              {getChapterReference(activeChapter.chapterId)}
            </Animated.Text>
          </Animated.View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ paddingHorizontal: gutterSize, flex: 1 }}
            ref={scrollViewRef}
            onScrollEndDrag={handleDragEnd}
            onScroll={onScroll}
            alwaysBounceVertical
            scrollEventThrottle={2}
            contentContainerStyle={{
              // Set this so that chapters that are shorter than the screen height don't
              // bug out.
              minHeight: Dimensions.get('window').height,
            }}
            onScrollBeginDrag={() => {
              releaseToChange.value = 0
              fingerDown.current = true
            }}
          >
            {/* {verseOffsets?.map((offset, index) => (
              <View
                key={offset}
                style={{
                  position: 'absolute',
                  top: offset,
                  width: '50%',
                  borderTopWidth: 1,
                  borderColor: 'green',
                }}
              >
                <Text style={{ color: 'green', fontSize: 20 }}>{index}</Text>
              </View>
            ))} */}
            {textRendered && verseOffsets ? (
              <Animated.View
                style={[
                  {
                    alignSelf: 'center',
                    position: 'absolute',
                    height: settings.lineHeight,
                    borderRadius: 12,
                    top:
                      activeChapterIndex.verseIndex !== undefined &&
                      activeChapterIndex.verseIndex !== 'bottom'
                        ? verseOffsets[activeChapterIndex.verseIndex]
                        : 0,
                    width: screenWidth - gutterSize,
                  },
                  verseNumberStyles,
                ]}
              >
                {/* <Text style={{ color: 'green', fontSize: 20 }}>{index}</Text> */}
              </Animated.View>
            ) : null}
            <Spacer additional={spaceBeforeTextStarts} />

            <Text
              onTextLayout={onTextLayout}
              onLayout={() => {
                setTextRendered(true)
              }}
            >
              <BibleText
                openReferences={openReferences}
                setReferenceState={setReferenceState}
                onTextLayout={onTextLayout}
              >
                {activeChapter.md}
              </BibleText>
            </Text>
            <Spacer units={10} additional={insets.bottom} />
          </ScrollView>
        </Animated.View>
        {/* <ChapterOverlay
          activeChapter={activeChapter}
          activeBook={activeBook}
          isStatusBarHidden={isStatusBarHidden}
          navigatorTransition={navigatorTransition}
          focusSearch={focusSearch}
          savedNavigatorTransition={savedNavigatorTransition}
          textTranslateX={textTranslateX}
          savedTextTranslateX={savedTextTranslateX}
          textTranslateY={textTranslateY}
          textFade={textFadeOut}
        /> */}
        <Navigator
          searchResultsRef={searchListRef}
          textPinch={navigatorTransition}
          savedTextPinch={savedNavigatorTransition}
          searchRef={searchRef}
          searchText={searchText}
          setSearchText={setSearchText}
          goToChapter={goToChapter}
        />
        {/* <VerseInfo textTranslationX={textTranslateX} /> */}
        <History
          textTranslationX={textTranslateX}
          activeChapter={activeChapter}
          closeHistory={() => {
            runOnJS(impactAsync)()
            textTranslateX.value = withSpring(0, panActivateConfig)
            savedTextTranslateX.value = 0
          }}
          goToChapter={goToChapter}
          openSettings={openSettings}
        />
        <Animated.View
          style={[
            {
              ...Dimensions.get('window'),
              position: 'absolute',
            },
            returnTapStyles,
          ]}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              runOnJS(impactAsync)()
              textTranslateX.value = withSpring(0, panActivateConfig)
              savedTextTranslateX.value = 0
            }}
            style={{
              ...Dimensions.get('window'),
            }}
          />
        </Animated.View>
        <ScrollBar
          scrollBarActivate={scrollBarActivate}
          scrollViewRef={scrollViewRef}
          textTranslateX={textTranslateX}
          textTranslateY={textTranslateY}
          verseOffsets={verseOffsets}
          scrollBarPosition={scrollBarPosition}
          overScrollAmount={overScrollAmount}
          openNavigator={navigatorTransition}
          currentVerseIndex={currentVerseIndex}
        />
        <Settings
          openSettings={openSettings}
          openSettingsNested={openSettingsNested}
          activeChapter={activeChapter}
        />
        <ReferencesModal
          goToChapter={goToChapter}
          openReferences={openReferences}
          openReferencesNested={openReferencesNested}
          referenceVerse={referenceVerse}
          currentVerseIndex={currentVerseIndex}
        />
        {/* Absolute view with overscroll progrses in circular progress */}
        <View
          style={{
            position: 'absolute',
            width: screenWidth,
            height: screenHeight,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          pointerEvents="none"
        >
          <CircularProgress
            progress={overScrollAmount}
            textTranslateY={textTranslateY}
            releaseToChange={releaseToChange}
          />
        </View>
        {/* <View
          style={{
            position: 'absolute',
            bottom: insets.bottom * 2 - 1,
            width: '100%',
            height: 1,
            backgroundColor: 'purple',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: insets.top - 1,
            width: '100%',
            height: 1,
            backgroundColor: 'yellow',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: currentVerseReq,
            width: '100%',
            height: 1,
            backgroundColor: 'blue',
          }}
        /> */}
      </View>
    </GestureDetector>
  )
}
