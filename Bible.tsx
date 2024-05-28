import { FlashList } from '@shopify/flash-list'
import { impactAsync } from 'expo-haptics'
import { useKeepAwake } from 'expo-keep-awake'
import React, { useMemo, useRef, useState } from 'react'
import {
  Dimensions,
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
} from 'react-native-gesture-handler'
import Animated, {
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from './Spacer'
import BibleText from './components/BibleText'
import ChapterOverlay from './components/ChapterOverlay'
import ChapterTitle from './components/ChapterTitle'
import CircularProgress from './components/CircularProgress'
import History from './components/History'
import Navigator from './components/Navigator'
import ReferencesModal from './components/ReferencesModal'
import ScrollBar from './components/ScrollBar'
import Settings from './components/Settings'
import {
  colors,
  gutterSize,
  horizTransReq,
  panActivateConfig,
  screenWidth,
} from './constants'
import bibles from './data/bibles'
import { Chapters } from './data/types/chapters'
import { getBook } from './functions/bible'
import useChapterChange from './hooks/useChapterChange'
import useHighlightVerse from './hooks/useHighlightVerse'
import useHistoryOpen from './hooks/useHistoryOpen'
import useNavigatorOpen from './hooks/useNavigatorOpen'
import useScrollUpdate from './hooks/useScrollUpdate'
import { useAppDispatch, useAppSelector } from './redux/hooks'

export default function BibleView() {
  const dispatch = useAppDispatch()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const insets = useSafeAreaInsets()
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])
  // const referenceTree = useAppSelector((state) => state.referenceTree)

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )
  const overlayOpacity = useSharedValue(0)
  const highlightVerseNumber = useSharedValue(0)
  const referenceTree = useAppSelector((state) => state.referenceTree)
  console.log(referenceTree)
  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<Chapters[number]>>(null)

  const overScrollAmount = useSharedValue(0)
  const [referenceVerse, setReferenceState] = useState<string>()
  // Animating the main text area.

  const [verseOffsets, setVerseOffsets] = useState<number[]>()
  const spaceBeforeTextStarts = insets.top + gutterSize * 5
  const currentVerseIndex = useSharedValue<number | 'bottom' | 'top'>(0)
  const fingerDown = useRef(false)

  const navigatorTransition = useSharedValue(0)
  const savedNavigatorTransition = useSharedValue(0)

  const openSettings = useSharedValue(0)
  const openSettingsNested = useSharedValue(0)

  const openReferences = useSharedValue(0)
  const openReferencesNested = useSharedValue(0)

  const scrollBarActivate = useSharedValue(-1)
  const scrollOffset = useSharedValue(0)

  const {
    alreadyHaptic,
    handleDragEnd,
    releaseToChange,
    textTranslateY,
    textFadeOut,
    jumpToChapter,
  } = useChapterChange({
    activeChapter,
    currentVerseIndex,
    scrollBarActivate,
    scrollViewRef,
    verseOffsets,
    fingerDown,
    overScrollAmount,
    setVerseOffsets,
    overlayOpacity,
    scrollOffset,
    highlightVerseNumber,
  })

  const { onScroll, scrollBarPosition } = useScrollUpdate({
    currentVerseIndex,
    fingerDown,
    overScrollAmount,
    releaseToChange,
    scrollBarActivate,
    textTranslateY,
    verseOffsets,
    alreadyHaptic,
    overlayOpacity,
    scrollOffset,
  })

  const { panGesture, savedTextTranslateX, textTranslateX } = useHistoryOpen({
    navigatorTransition,
    textFadeOut,
    overlayOpacity,
    scrollOffset,
  })

  const { tapGesture, focusSearch } = useNavigatorOpen({
    navigatorTransition,
    savedNavigatorTransition,
    textTranslateX,
    openReferences,
    searchRef,
    overlayOpacity,
  })

  useHighlightVerse({ verseOffsets, highlightVerseNumber })

  const composedGestures = Gesture.Simultaneous(panGesture, tapGesture)

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
                [0.7, 1, 0.7]
              )
            : scrollBarActivate.value > 0
              ? interpolate(scrollBarActivate.value, [0, 1], [1, 0.3])
              : 1,
    }
  })

  function onTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const spaceAfterTextEnds = insets.bottom * 2 + gutterSize * 2
    const localVerseOffsets: number[] = []

    event.nativeEvent.lines.forEach((line) => {
      // if (/\[[0-9]{1,3}\]/.test(line.text)) {
      // const matches = /[0-9]{1,3} /g.exec(line.text)
      const matches = line.text.match(/[0-9]{1,3} /g)

      matches?.forEach(() => {
        localVerseOffsets.push(spaceBeforeTextStarts + line.y)
      })
      // if (/[0-9]{1,3} /.test(line.text)) {
      //   // Set the offset relative to the very top of the scrollview.

      // }
    })

    const lastLine = event.nativeEvent.lines[event.nativeEvent.lines.length - 1]

    // Add the very bottom as the last offset.
    localVerseOffsets.push(
      spaceBeforeTextStarts + lastLine.y + lastLine.height + spaceAfterTextEnds
    )
    if (!verseOffsets || !arraysEqual(localVerseOffsets, verseOffsets))
      setVerseOffsets(localVerseOffsets)
  }

  const verseNumberStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        highlightVerseNumber.value,
        [0, 1],
        [colors.p1 + '00', colors.ph]
      ),
    }
  })

  useKeepAwake()

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
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
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
            {verseOffsets ? (
              <Animated.View
                style={[
                  {
                    alignSelf: 'center',
                    position: 'absolute',
                    // height: settings.lineHeight,
                    borderRadius: 12,
                    height:
                      typeof activeChapterIndex.verseIndex === 'number'
                        ? verseOffsets[
                            activeChapterIndex.verseIndex +
                              (activeChapterIndex.numVersesToHighlight
                                ? activeChapterIndex.numVersesToHighlight + 1
                                : 1)
                          ] - verseOffsets[activeChapterIndex.verseIndex]
                        : // + settings.lineHeight
                          0,
                    top:
                      typeof activeChapterIndex.verseIndex === 'number'
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
            <View
              style={{
                width: '100%',
                height: spaceBeforeTextStarts,
              }}
            >
              <Spacer additional={insets.top ?? gutterSize} />
              <CircularProgress
                place="top"
                progress={overScrollAmount}
                textTranslateY={textTranslateY}
                releaseToChange={releaseToChange}
              />
              <Spacer units={2} />
              <ChapterTitle
                scrollOffset={scrollOffset}
                focusSearch={focusSearch}
                navigatorTransition={navigatorTransition}
                savedNavigatorTransition={savedNavigatorTransition}
                savedTextTranslateX={savedTextTranslateX}
                textTranslateX={textTranslateX}
                overlayOpacity={overlayOpacity}
              />
            </View>
            <View style={{ paddingHorizontal: gutterSize }}>
              <Text onTextLayout={onTextLayout}>
                <BibleText
                  openReferences={openReferences}
                  setReferenceState={setReferenceState}
                  onTextLayout={onTextLayout}
                >
                  {activeChapter.md}
                </BibleText>
              </Text>
            </View>
            <Spacer units={6} />
            <CircularProgress
              place="bottom"
              progress={overScrollAmount}
              textTranslateY={textTranslateY}
              releaseToChange={releaseToChange}
            />
            <Spacer additional={insets.bottom ?? gutterSize} />
          </ScrollView>
        </Animated.View>
        <Navigator
          searchResultsRef={searchListRef}
          textPinch={navigatorTransition}
          savedTextPinch={savedNavigatorTransition}
          searchRef={searchRef}
          jumpToChapter={jumpToChapter}
          overlayOpacity={overlayOpacity}
          scrollOffset={scrollOffset}
        />
        <History
          textTranslationX={textTranslateX}
          activeChapter={activeChapter}
          closeHistory={() => {
            runOnJS(impactAsync)()
            textTranslateX.value = withSpring(0, panActivateConfig)
            savedTextTranslateX.value = 0
          }}
          jumpToChapter={jumpToChapter}
          openSettings={openSettings}
          savedTextTranslationX={savedTextTranslateX}
        />
        <ScrollBar
          scrollBarActivate={scrollBarActivate}
          scrollViewRef={scrollViewRef}
          textTranslateY={textTranslateY}
          verseOffsets={verseOffsets}
          scrollBarPosition={scrollBarPosition}
          overScrollAmount={overScrollAmount}
          openNavigator={navigatorTransition}
          currentVerseIndex={currentVerseIndex}
          textTranslateX={textTranslateX}
        />
        <Settings
          openSettings={openSettings}
          openSettingsNested={openSettingsNested}
          activeChapter={activeChapter}
          overlayOpacity={overlayOpacity}
          scrollOffset={scrollOffset}
        />
        <ReferencesModal
          jumpToChapter={jumpToChapter}
          openReferences={openReferences}
          openReferencesNested={openReferencesNested}
          referenceVerse={referenceVerse}
          currentVerseIndex={currentVerseIndex}
          overlayOpacity={overlayOpacity}
          scrollOffset={scrollOffset}
        />
        <ChapterOverlay
          activeBook={activeBook}
          activeChapter={activeChapter}
          textTranslateX={textTranslateX}
          navigatorTransition={navigatorTransition}
          savedNavigatorTransition={savedNavigatorTransition}
          savedTextTranslateX={savedTextTranslateX}
          focusSearch={focusSearch}
          isStatusBarHidden={false}
          textFade={textFadeOut}
          textTranslateY={textTranslateY}
          overlayOpacity={overlayOpacity}
        />
        {/* <ReferenceBackButton
          jumpToChapter={jumpToChapter}
          openReferences={openReferences}
          setReferenceState={setReferenceState}
        /> */}
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

function arraysEqual(a: any[], b: any[]) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}
