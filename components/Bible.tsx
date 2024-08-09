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
  useWindowDimensions,
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
import { panActivateConfig } from '../constants'
import bibles from '../data/bibles'
import { Chapters } from '../data/types/chapters'
import { getBook } from '../functions/bible'
import { getEdges, getHorizTransReq } from '../functions/utils'
import useChapterChange from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import useHighlightVerse from '../hooks/useHighlightVerse'
import useHistoryOpen from '../hooks/useHistoryOpen'
import useNavigatorOpen from '../hooks/useNavigatorOpen'
import usePinch from '../hooks/usePinch'
import useScrollUpdate from '../hooks/useScrollUpdate'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { sp } from '../styles'
import BibleText from './BibleText'
import ChapterChangeFeedback, {
  chapterChangeFeedbackHeight,
} from './ChapterChangeFeedback'
import ChapterOverlay from './ChapterOverlay'
import History from './History'
import Navigator from './Navigator'
import ReferencesModal from './ReferencesModal'
import ScrollBar from './ScrollBar'
import Settings from './Settings'
import Spacer from './Spacer'
import TutorialHeader from './TutorialHeader'
import VerseHighlight from './VerseHighlight'

export default function Bible() {
  const dispatch = useAppDispatch()
  const colors = useColors()
  const { height, width } = useWindowDimensions()
  const horizTransReq = getHorizTransReq(width)
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  // useEffect(() => {
  //   dispatch(createFakeHistory())
  // }, [])
  console.log(colors.bg1)
  const insets = useSafeAreaInsets()
  const { top, bottom } = getEdges(insets)
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )
  const overlayOpacity = useSharedValue(1)
  const highlightVerseNumber = useSharedValue(0)

  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<Chapters[number]>>(null)

  const overScrollAmount = useSharedValue(0)
  const [referenceVerse, setReferenceState] = useState<string>()
  // Animating the main text area.

  const [verseOffsets, setVerseOffsets] = useState<number[]>()
  const [verseNewlines, setVerseNewlines] = useState<boolean[]>()
  const [paragraphs, setParagraphs] = useState<boolean[]>()
  const spaceBeforeTextStarts =
    top - sp.xl + chapterChangeFeedbackHeight + sp.lg
  const spaceAfterTextEnds = sp.lg + chapterChangeFeedbackHeight + bottom
  const currentVerseIndex = useSharedValue<number | 'bottom' | 'top'>(0)
  const currentVerseIndexNum = useSharedValue<number>(0)
  const fingerDown = useRef(false)

  const openNavigator = useSharedValue(0)

  const openSettings = useSharedValue(0)
  const openSettingsNested = useSharedValue(0)

  const openReferences = useSharedValue(0)
  const openReferencesNested = useSharedValue(0)

  const scrollBarActivate = useSharedValue(-1)
  const scrollOffset = useSharedValue(0)

  const { scale, pinchGesture } = usePinch()

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
    currentVerseIndexNum,
  })

  const { panGesture, savedTextTranslateX, textTranslateX } = useHistoryOpen({
    navigatorTransition: openNavigator,
    textFadeOut,
    scale,
    textTranslateY,
  })

  const { tapGesture, focusSearch } = useNavigatorOpen({
    openNavigator,
    textTranslateX,
    openReferences,
    searchRef,
    overlayOpacity,
    scale,
  })

  useHighlightVerse({ verseOffsets, highlightVerseNumber })

  const composedGestures = Gesture.Simultaneous(
    panGesture,
    tapGesture,
    pinchGesture
  )

  const textStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: textTranslateY.value },
        { translateX: textTranslateX.value },
        { scale: 1 + scale.value / 10 },
      ],
      opacity:
        scale.value !== 0
          ? interpolate(scale.value, [-0.5, 0, 1], [0.7, 1, 0.7])
          : textFadeOut.value !== 0
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

  /**
   * Used to calculate the verse offsets and newlines.
   */
  function onTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    const localVerseOffsets: number[] = []
    const localVerseNewlines: boolean[] = []
    const localParagraphs: boolean[] = []

    if (event.nativeEvent.lines.length === 0) return

    event.nativeEvent.lines.forEach((line, index) => {
      const matches = line.text.match(/[0-9]{1,3} /g)

      matches?.forEach(() => {
        if (index === 0) localVerseNewlines.push(true)
        else if (event.nativeEvent.lines[index - 1].text.endsWith('\n'))
          localVerseNewlines.push(true)
        else localVerseNewlines.push(false)

        if (index === 0) localParagraphs.push(true)
        else if (event.nativeEvent.lines[index - 1].text === '\n')
          localParagraphs.push(true)
        else localParagraphs.push(false)

        localVerseOffsets.push(spaceBeforeTextStarts + line.y)
      })
    })

    const lastLine = event.nativeEvent.lines[event.nativeEvent.lines.length - 1]

    // Add the very bottom as the last offset.
    localVerseOffsets.push(
      spaceBeforeTextStarts + lastLine.y + lastLine.height + spaceAfterTextEnds
    )
    if (!verseOffsets || !arraysEqual(localVerseOffsets, verseOffsets)) {
      setVerseOffsets(localVerseOffsets)
      setVerseNewlines(localVerseNewlines)
      setParagraphs(localParagraphs)
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
          style={[{ flex: 1, backgroundColor: colors.bg1, width }, textStyles]}
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
            {/* {verseOffsets?.map((offset, index) => {
              const isDuplicate =
                index !== 0 && offset === verseOffsets[index - 1]
              return (
                <View
                  key={offset * index}
                  style={{
                    position: 'absolute',
                    top: offset,
                    // left: isDuplicate ? 10 : 4,
                    left: textGutterSize / 2 - 8,
                    width: '50%',
                    borderTopWidth: 1,
                    borderColor: 'green',
                  }}
                >
                  <Text
                    style={[
                      typography(sizes.tiny, 'uil', 'l', colors.p3),
                      { fontFamily: 'iAWriterMonoS-Bold' },
                    ]}
                  >
                    {isDuplicate ? '\n,' : ''}
                    {index + 1}
                  </Text>
                </View>
              )
            })} */}
            <VerseHighlight
              verseOffsets={verseOffsets}
              activeChapter={activeChapter}
              highlightVerseNumber={highlightVerseNumber}
              jumpToChapter={jumpToChapter}
              verseNewlines={verseNewlines}
              paragraphs={paragraphs}
              spaceAfterTextEnds={spaceAfterTextEnds}
            />
            <View style={{ width: '100%' }}>
              {activeChapter.chapterId === 'TUT.1' ? null : (
                <Spacer s={top - sp.xl} />
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
                <TutorialHeader scrollViewRef={scrollViewRef} />
              ) : null}
              {activeChapter.chapterId !== 'TUT.1' ? (
                <Spacer s={sp.lg} />
              ) : null}
            </View>
            <View style={{ paddingHorizontal: sp.xx }}>
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
            <Spacer s={sp.lg} />
            <ChapterChangeFeedback
              place="bottom"
              progress={overScrollAmount}
              textTranslateY={textTranslateY}
              releaseToChange={releaseToChange}
            />
            <Spacer s={bottom} />
          </ScrollView>
        </Animated.View>
        <Navigator
          searchResultsRef={searchListRef}
          openNavigator={openNavigator}
          searchRef={searchRef}
          jumpToChapter={jumpToChapter}
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
          spaceBeforeTextStarts={spaceBeforeTextStarts}
        />
        <ScrollBar
          scrollBarActivate={scrollBarActivate}
          scrollViewRef={scrollViewRef}
          verseOffsets={verseOffsets}
          scrollBarPosition={scrollBarPosition}
          textTranslateX={textTranslateX}
          currentVerseIndexNum={currentVerseIndexNum}
          textTranslateY={textTranslateY}
        />
        <Settings
          openSettings={openSettings}
          openSettingsNested={openSettingsNested}
          activeChapter={activeChapter}
          textTranslateX={textTranslateX}
          jumpToChapter={jumpToChapter}
        />
        <ReferencesModal
          jumpToChapter={jumpToChapter}
          openReferences={openReferences}
          openReferencesNested={openReferencesNested}
          referenceVerse={referenceVerse}
        />
        {activeChapter.chapterId !== 'TUT.1' ? (
          <ChapterOverlay
            activeBook={activeBook}
            activeChapter={activeChapter}
            textTranslateX={textTranslateX}
            openNavigator={openNavigator}
            savedTextTranslateX={savedTextTranslateX}
            focusSearch={focusSearch}
            overlayOpacity={overlayOpacity}
            scrollValue={scrollOffset}
            setReferenceState={setReferenceState}
            jumpToChapter={jumpToChapter}
            openReferences={openReferences}
            textFadeOut={textFadeOut}
          />
        ) : null}
        {/* <View
          style={{
            position: 'absolute',
            bottom: bottom * 2 - 1,
            width: '100%',
            height: 1,
            backgroundColor: 'purple',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: top - 1,
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
