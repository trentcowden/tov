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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from './Spacer'
import BibleText from './components/BibleText'
import ChapterChangeFeedback, {
  chapterChangeFeedbackHeight,
} from './components/ChapterChangeFeedback'
import ChapterOverlay from './components/ChapterOverlay'
import ChapterTitle from './components/ChapterTitle'
import History from './components/History'
import Navigator from './components/Navigator'
import ReferencesModal from './components/ReferencesModal'
import ScrollBar from './components/ScrollBar'
import Settings from './components/Settings'
import TutorialHeader from './components/TutorialHeader'
import VerseHighlight from './components/VerseHighlight'
import {
  gutterSize,
  horizTransReq,
  panActivateConfig,
  screenHeight,
  screenWidth,
} from './constants'
import bibles from './data/bibles'
import { Chapters } from './data/types/chapters'
import { getBook } from './functions/bible'
import useChapterChange from './hooks/useChapterChange'
import useColors from './hooks/useColors'
import useHighlightVerse from './hooks/useHighlightVerse'
import useHistoryOpen from './hooks/useHistoryOpen'
import useNavigatorOpen from './hooks/useNavigatorOpen'
import useScrollUpdate from './hooks/useScrollUpdate'
import { useAppDispatch, useAppSelector } from './redux/hooks'
import { setTranslation } from './redux/settings'

export default function Bible() {
  const colors = useColors()
  const dispatch = useAppDispatch()
  dispatch(setTranslation('net'))

  // dispatch(
  //   setActiveChapterIndex({
  //     index: 0,
  //     highlightVerse: false,
  //     transition: 'fade',
  //     verseIndex: 0,
  //   })
  // )
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const insets = useSafeAreaInsets()
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )
  const overlayOpacity = useSharedValue(0)
  const highlightVerseNumber = useSharedValue(0)
  const referenceTree = useAppSelector((state) => state.referenceTree)

  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<Chapters[number]>>(null)

  const overScrollAmount = useSharedValue(0)
  const [referenceVerse, setReferenceState] = useState<string>()
  // Animating the main text area.

  const [verseOffsets, setVerseOffsets] = useState<number[]>()
  const [verseNewlines, setVerseNewlines] = useState<boolean[]>()
  const spaceBeforeTextStarts =
    activeChapter.chapterId === 'TUT.1'
      ? screenHeight
      : insets.top + gutterSize * 5
  const currentVerseIndex = useSharedValue<number | 'bottom' | 'top'>(0)
  const fingerDown = useRef(false)

  const openNavigator = useSharedValue(0)

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
    setVerseNewlines,
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
    openSettings,
  })

  const { panGesture, savedTextTranslateX, textTranslateX } = useHistoryOpen({
    navigatorTransition: openNavigator,
    textFadeOut,
    overlayOpacity,
    scrollOffset,
  })

  const { tapGesture, focusSearch } = useNavigatorOpen({
    openNavigator,
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
          : scrollBarActivate.value > 0
            ? interpolate(scrollBarActivate.value, [0, 1], [1, 0.3])
            : textTranslateX.value !== 0
              ? interpolate(
                  textTranslateX.value,
                  [-horizTransReq, 0, horizTransReq],
                  [0.7, 1, 0.7]
                )
              : 1,
    }
  })

  function onTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const spaceAfterTextEnds =
      gutterSize * 1.5 + chapterChangeFeedbackHeight + insets.bottom
    const localVerseOffsets: number[] = []
    const localVerseNewlines: boolean[] = []
    event.nativeEvent.lines.forEach((line, index) => {
      // if (/\[[0-9]{1,3}\]/.test(line.text)) {
      // const matches = /[0-9]{1,3} /g.exec(line.text)
      const matches = line.text.match(/[0-9]{1,3} /g)

      matches?.forEach(() => {
        if (index === 0) localVerseNewlines.push(true)
        else if (event.nativeEvent.lines[index - 1].text.endsWith('\n'))
          localVerseNewlines.push(true)
        else localVerseNewlines.push(false)

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
    if (!verseOffsets || !arraysEqual(localVerseOffsets, verseOffsets)) {
      setVerseOffsets(localVerseOffsets)
      setVerseNewlines(localVerseNewlines)
    }
  }

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
            <VerseHighlight
              verseOffsets={verseOffsets}
              activeChapter={activeChapter}
              highlightVerseNumber={highlightVerseNumber}
              jumpToChapter={jumpToChapter}
              verseNewlines={verseNewlines}
            />
            <View
              style={{
                width: '100%',
                height: spaceBeforeTextStarts,
              }}
            >
              {activeChapter.chapterId === 'TUT.1' ? null : (
                <Spacer additional={insets.top ?? gutterSize} />
              )}
              {activeChapter.chapterId === 'TUT.1' ? null : (
                <ChapterChangeFeedback
                  place="top"
                  progress={overScrollAmount}
                  textTranslateY={textTranslateY}
                  releaseToChange={releaseToChange}
                />
              )}
              {activeChapter.chapterId === 'TUT.1' ? (
                <TutorialHeader
                  scrollViewRef={scrollViewRef}
                  spaceBeforeTextStarts={spaceBeforeTextStarts}
                />
              ) : null}
              {activeChapter.chapterId !== 'TUT.1' ? (
                <Spacer units={2} />
              ) : null}
              <ChapterTitle
                scrollOffset={scrollOffset}
                focusSearch={focusSearch}
                openNavigator={openNavigator}
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
            <ChapterChangeFeedback
              place="bottom"
              progress={overScrollAmount}
              textTranslateY={textTranslateY}
              releaseToChange={releaseToChange}
            />
            <Spacer additional={insets.bottom} />
          </ScrollView>
        </Animated.View>
        <Navigator
          searchResultsRef={searchListRef}
          openNavigator={openNavigator}
          searchRef={searchRef}
          jumpToChapter={jumpToChapter}
          overlayOpacity={overlayOpacity}
          scrollOffset={scrollOffset}
          activeBook={activeBook}
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
          verseOffsets={verseOffsets}
          scrollBarPosition={scrollBarPosition}
          currentVerseIndex={currentVerseIndex}
          textTranslateX={textTranslateX}
        />
        <Settings
          openSettings={openSettings}
          openSettingsNested={openSettingsNested}
          activeChapter={activeChapter}
          overlayOpacity={overlayOpacity}
          scrollOffset={scrollOffset}
          textTranslateX={textTranslateX}
          jumpToChapter={jumpToChapter}
          currentVerseIndex={currentVerseIndex}
        />
        <ReferencesModal
          jumpToChapter={jumpToChapter}
          openReferences={openReferences}
          openReferencesNested={openReferencesNested}
          referenceVerse={referenceVerse}
          overlayOpacity={overlayOpacity}
          scrollOffset={scrollOffset}
        />
        <ChapterOverlay
          activeBook={activeBook}
          activeChapter={activeChapter}
          textTranslateX={textTranslateX}
          openNavigator={openNavigator}
          savedTextTranslateX={savedTextTranslateX}
          focusSearch={focusSearch}
          overlayOpacity={overlayOpacity}
        />
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
