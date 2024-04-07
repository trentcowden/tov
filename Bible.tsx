import { Octicons } from '@expo/vector-icons'
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
  TouchableOpacity,
  View,
} from 'react-native'
import {
  FlatList,
  Gesture,
  GestureDetector,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler'
import ParsedText from 'react-native-parsed-text'
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
import Fade from './components/Fade'
import History from './components/History'
import ModalScreen from './components/ModalScreen'
import ModalScreenHeader from './components/ModalScreenHeader'
import Navigator from './components/Navigator'
import ScrollBar from './components/ScrollBar'
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
} from './constants'
import {
  default as chapters,
  default as chaptersJson,
} from './data/chapters.json'
import references from './data/references.json'
import { Chapters } from './data/types/chapters'
import { References } from './data/types/references'
import { getBook, getVerseReference } from './functions/bible'
import {
  goToNextChapter,
  goToPreviousChapter,
  setActiveChapterIndex,
} from './redux/activeChapterIndex'
import { addToHistory, removeFromHistory } from './redux/history'
import { useAppDispatch, useAppSelector } from './redux/hooks'

const lineHeight = 36
const headerHeight = 0

export default function BibleView() {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)

  const activeChapter = useMemo(() => {
    return (chaptersJson as Chapters)[activeChapterIndex.index]
  }, [activeChapterIndex.index])

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const usableHeight = screenHeight - insets.top - insets.bottom

  const overlayOpacity = useSharedValue(0)

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
  const currentVerseReq = insets.top + gutterSize * 6 + headerHeight
  const currentVerseIndex = useRef(0)

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

  const alreadyHaptic = useRef(false)

  const scrollBarPosition = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (navigatorTransition.value !== 0) return

      textTranslateX.value = savedTextTranslateX.value + event.translationX
    })
    .onFinalize((e) => {
      if (navigatorTransition.value !== 0) return

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

    dispatch(removeFromHistory(activeChapter.chapterId))

    if (activeChapterIndex.transition === 'forward') {
      setPastOverlayOffset(false)
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
      textTranslateY.value = withSpring(0, { damping: 20, stiffness: 120 })
    } else if (activeChapterIndex.transition === 'back') {
      scrollViewRef.current?.scrollToEnd({ animated: false })
      textTranslateY.value = withSpring(0, { damping: 20, stiffness: 120 })
    } else if (activeChapterIndex.transition === 'fade') {
      if (
        activeChapterIndex.verseIndex !== undefined &&
        activeChapterIndex.verseIndex !== 0
      ) {
        scrollViewRef.current?.scrollTo({
          y: verseOffsets
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
      }
      textFadeOut.value = withSpring(0, { damping: 20, stiffness: 120 })
    }
    scrollBarActivate.value = withDelay(
      activeChapterIndex.transition === 'fade' ? 0 : chapterChangeDuration,
      withTiming(0)
    )
  }, [activeChapterIndex.index, textRendered])

  function goToChapter(
    chapterId: Chapters[number]['chapterId'],
    verseNumber?: number
  ) {
    scrollBarActivate.value = withTiming(-1, { duration: 200 })
    setTextRendered(false)
    const chapterIndex = (chapters as Chapters).findIndex(
      (chapter) => chapter.chapterId === chapterId
    )

    // textTranslateY.value = withSequence(
    //   withTiming(-screenHeight, { duration: chapterChangeDuration }),
    //   withTiming(screenHeight, { duration: 0 })
    // )
    textFadeOut.value = 0.7
    textFadeOut.value = withTiming(1, { duration: chapterChangeDuration })

    setTimeout(
      () =>
        dispatch(
          setActiveChapterIndex({
            transition: 'fade',
            index: chapterIndex,
            verseIndex: verseNumber,
          })
        ),
      chapterChangeDuration
    )

    dispatch(
      addToHistory({
        chapterId: activeChapter.chapterId,
        date: Date.now(),
        verseIndex: currentVerseIndex.current,
      })
    )
  }

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

  function handleScrollOverlayOffset(offset: number) {
    if (textTranslateY.value === 0) {
      if (offset > gutterSize * 2 + headerHeight)
        overlayOpacity.value = withTiming(1)
      else overlayOpacity.value = withTiming(0)
    }
  }

  function getVerseIndex(offset: number) {
    if (!verseOffsets) return -1

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
    const maxTopPos = screenHeight - insets.bottom - scrollBarHeight

    scrollBarPosition.value =
      insets.top + scrollRatio * (maxTopPos - insets.top)
  }

  function handleScrollVersePosition(offset: number) {
    const result = getVerseIndex(offset)

    if (result >= 0) currentVerseIndex.current = result
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

    handleScrollBarUpdate(offset)
    handleScrollOverlayOffset(offset)
    handleScrollVersePosition(offset)
    handleScrollHaptics(offset, contentHeight)
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
      activeChapterIndex.index !== (chaptersJson as Chapters).length - 1

    if (goingPrev && (offset <= -overScrollReq || y < -2)) {
      // setTextRendered(false)
      scrollBarActivate.value = withTiming(-1, { duration: 200 })

      textTranslateY.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 })
      )
      if (!alreadyHaptic.current) impactAsync(ImpactFeedbackStyle.Heavy)
      setTimeout(() => dispatch(goToPreviousChapter()), chapterChangeDuration)
    } else if (
      goingNext &&
      (offset > contentHeight - screenHeight + overScrollReq || y > 2)
    ) {
      // setTextRendered(false)
      scrollBarActivate.value = withTiming(-1, { duration: 200 })

      textTranslateY.value = withSequence(
        withTiming(-screenHeight, {
          duration: chapterChangeDuration,
        }),
        withTiming(screenHeight, { duration: 0 })
      )
      if (!alreadyHaptic.current) impactAsync(ImpactFeedbackStyle.Heavy)
      setTimeout(() => dispatch(goToNextChapter()), chapterChangeDuration)
    } else if (alreadyHaptic.current) impactAsync(ImpactFeedbackStyle.Light)
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
          : scrollBarActivate.value > 0
            ? interpolate(scrollBarActivate.value, [0, 1], [1, 0.3])
            : navigatorTransition.value !== 0
              ? interpolate(navigatorTransition.value, [0, 1], [1, 0.7])
              : interpolate(
                  textTranslateX.value,
                  [-horizTransReq, 0, horizTransReq],
                  [0.3, 1, 0.3]
                ),
    }
  })

  const returnTapStyles = useAnimatedStyle(() => ({
    zIndex: Math.abs(textTranslateX.value) < 10 ? -1 : 1,
  }))

  function onTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const spaceBeforeTextStarts = insets.top + gutterSize * 2 + headerHeight
    const spaceAfterTextEnds = insets.bottom + gutterSize * 2
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

  function renderVerseNumber(text: string) {
    const verseNumber = text.replace('[', '').replace(']', '')
    const verseId = `${activeChapter.chapterId}.${verseNumber}`
    return (
      <Text
        style={{
          textDecorationLine:
            verseId in (references as References) ? 'underline' : 'none',
        }}
        onPress={
          verseId in (references as References)
            ? () => {
                setReferenceState(verseId)
                openReferences.value = withTiming(1)
              }
            : undefined
        }
      >
        {' ' + verseNumber + ' '}
      </Text>
    )
  }

  function renderBoltAndItalicText(text: string) {
    return text.replace(/\*/g, '')
  }

  useKeepAwake()

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 2

  const closeButton = (
    <TouchableOpacity
      onPress={() => {}}
      style={{
        paddingLeft: gutterSize,
        paddingRight: gutterSize,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        top: 0,
        right: 0,
        zIndex: 4,
      }}
    >
      <Text style={type(15, 'uir', 'c', colors.fg2)}>Close</Text>
    </TouchableOpacity>
  )

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
          style={[{ flex: 1, backgroundColor: colors.bg1 }, textStyles]}
        >
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
              alreadyHaptic.current = false
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
            <Spacer units={8} additional={insets.top} />
            {/* <Text
              style={{
                ...type(32, 'b', 'c', colors.fg1),
                height: headerHeight,
                marginBottom: gutterSize,
              }}
            >
              {getReference(activeChapter.chapterId)}
            </Text> */}
            <Text
              onTextLayout={onTextLayout}
              onLayout={() => {
                setTextRendered(true)
              }}
            >
              <ParsedText
                parse={[
                  {
                    pattern: /\[([0-9]{1,3})\]/,
                    style: {
                      fontFamily: 'Bold',
                      color: colors.v,
                      fontSize: 16,
                      // backgroundColor: colors.bg2,
                    },
                    renderText: renderVerseNumber,
                  },
                  {
                    pattern: /\*\*.+\*\*/,
                    style: {
                      fontFamily: 'Bold',
                    },
                    renderText: renderBoltAndItalicText,
                  },
                  {
                    pattern: /\*.+\*/,
                    style: {
                      fontFamily: 'Regular-Italic',
                    },
                    renderText: renderBoltAndItalicText,
                  },
                ]}
                style={{
                  ...type(18, 'r', 'l', colors.fg1),
                  lineHeight: lineHeight,
                }}
                onTextLayout={onTextLayout}
              >
                {activeChapter.md}
              </ParsedText>
            </Text>
            <Spacer units={8} additional={insets.bottom} />
          </ScrollView>
        </Animated.View>
        <ChapterOverlay
          overlayOpacity={overlayOpacity}
          activeChapter={activeChapter}
          activeBook={activeBook}
          isStatusBarHidden={isStatusBarHidden}
          pastOverlayOffset={pastOverlayOffset}
          navigatorTransition={navigatorTransition}
          textTranslateY={textTranslateY}
          setIsStatusBarHidden={setIsStatusBarHidden}
          textTranslateX={textTranslateX}
        />
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
          // currentVerseIndex={currentVerseIndex}
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
        />
        <ModalScreen
          openModal={openSettings}
          openNested={openSettingsNested}
          close={() => {
            openSettings.value = withTiming(0)
          }}
          nestedScreen={<></>}
          onBack={() => {}}
        >
          <View
            style={{
              width: Dimensions.get('window').width - gutterSize * 2,
              height: navigatorHeight,
              backgroundColor: colors.bg3,
              borderRadius: 16,
            }}
          >
            <Text>Settings</Text>
          </View>
        </ModalScreen>
        <ModalScreen
          openModal={openReferences}
          openNested={openReferencesNested}
          close={() => {
            openReferences.value = withTiming(0)
          }}
          nestedScreen={<></>}
          onBack={() => {}}
        >
          <View
            style={{
              width: Dimensions.get('window').width - gutterSize * 2,
              height: navigatorHeight,
              backgroundColor: colors.bg2,
              borderRadius: 16,
              paddingTop: gutterSize,
            }}
          >
            <ModalScreenHeader
              close={() => {
                openReferences.value = withTiming(0)
              }}
              icon={
                <Octicons name="arrow-switch" size={20} color={colors.fg3} />
              }
            >
              Cross References for{' '}
              {referenceVerse ? getVerseReference(referenceVerse) : ''}
            </ModalScreenHeader>
            <View style={{ flex: 1 }}>
              <FlatList
                data={
                  referenceVerse
                    ? (references as References)[referenceVerse]
                    : []
                }
                ListHeaderComponent={<Spacer units={4} />}
                ListFooterComponent={<Spacer units={4} />}
                renderItem={(item) => (
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      paddingHorizontal: gutterSize,
                      paddingVertical: 12,
                    }}
                    onPress={() => goToChapter(item.item[0].split('.'))}
                  >
                    <Text style={type(18, 'uir', 'l', colors.fg2)}>
                      {getVerseReference(item.item[0])}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <Fade place="top" color={colors.bg2} />
            </View>
          </View>
        </ModalScreen>
        {/* <View
          style={{
            position: 'absolute',
            bottom: insets.bottom - 1,
            width: '100%',
            height: 1,
            backgroundColor: 'green',
          }}
        /> */}
        {/* <View
          style={{
            position: 'absolute',
            top: insets.top - 1,
            width: '100%',
            height: 1,
            backgroundColor: 'green',
          }}
        /> */}
        {/* <View
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
