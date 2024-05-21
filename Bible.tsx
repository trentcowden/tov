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
import ChapterOverlay from './components/ChapterOverlay'
import ChapterTitle from './components/ChapterTitle'
import CircularProgress from './components/CircularProgress'
import History from './components/History'
import Navigator from './components/Navigator'
import ReferenceBackButton from './components/ReferenceBackButton'
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
  const referenceTree = useAppSelector((state) => state.referenceTree)

  const activeBook = useMemo(
    () => getBook(activeChapter.chapterId),
    [activeChapter]
  )

  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<Chapters[number]>>(null)

  const overScrollAmount = useSharedValue(0)
  const [referenceVerse, setReferenceState] = useState<string>()
  // Animating the main text area.

  const [verseOffsets, setVerseOffsets] = useState<number[]>()
  const spaceBeforeTextStarts = insets.top + gutterSize * 6
  const currentVerseIndex = useSharedValue<number | 'bottom' | 'top'>(0)
  const fingerDown = useRef(false)

  const navigatorTransition = useSharedValue(0)
  const savedNavigatorTransition = useSharedValue(0)

  const openSettings = useSharedValue(0)
  const openSettingsNested = useSharedValue(0)

  const openReferences = useSharedValue(0)
  const openReferencesNested = useSharedValue(0)

  const scrollBarActivate = useSharedValue(-1)

  const showOverlay = useSharedValue(0)

  const [textRendered, setTextRendered] = useState(false)

  const {
    alreadyHaptic,
    entering,
    handleDragEnd,
    leaving,
    releaseToChange,
    textTranslateY,
    textFadeOut,
    jumpToChapter: jumpToChapter,
  } = useChapterChange({
    activeChapter,
    currentVerseIndex,
    scrollBarActivate,
    scrollViewRef,
    textRendered,
    verseOffsets,
    fingerDown,
    setTextRendered,
  })

  const { panGesture, savedTextTranslateX, textTranslateX } = useHistoryOpen({
    navigatorTransition,
    textFadeOut,
    showOverlay,
  })

  const { onScroll, scrollBarPosition, scrollOffset } = useScrollUpdate({
    currentVerseIndex,
    fingerDown,
    overScrollAmount,
    releaseToChange,
    scrollBarActivate,
    textTranslateY,
    verseOffsets,
    alreadyHaptic,
    showOverlay,
  })

  const { tapGesture } = useNavigatorOpen({
    navigatorTransition,
    savedNavigatorTransition,
    textTranslateX,
    openReferences,
    searchRef,
  })

  useHighlightVerse({ textRendered })

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
                [0.5, 1, 0.5]
              )
            : scrollBarActivate.value > 0
              ? interpolate(scrollBarActivate.value, [0, 1], [1, 0.2])
              : 1,
    }
  })

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

  const header = useAnimatedStyle(() => ({
    opacity: scrollBarActivate.value,
  }))

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
            <View
              style={{
                width: '100%',
                height: spaceBeforeTextStarts,
              }}
            >
              <Spacer additional={insets.top ?? gutterSize} />
              <CircularProgress
                progress={overScrollAmount}
                textTranslateY={textTranslateY}
                releaseToChange={releaseToChange}
              />
              <Spacer units={6} />
              <ChapterTitle scrollOffset={scrollOffset} />
            </View>
            <View style={{ paddingHorizontal: gutterSize }}>
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
            </View>
            <Spacer units={6} />
            <CircularProgress
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
        />
        <ReferencesModal
          jumpToChapter={jumpToChapter}
          openReferences={openReferences}
          openReferencesNested={openReferencesNested}
          referenceVerse={referenceVerse}
          currentVerseIndex={currentVerseIndex}
        />
        <ChapterOverlay
          activeBook={activeBook}
          activeChapter={activeChapter}
          textTranslateX={textTranslateX}
          focusSearch={() => {}}
          navigatorTransition={navigatorTransition}
          savedNavigatorTransition={savedNavigatorTransition}
          savedTextTranslateX={savedTextTranslateX}
        />
        <ReferenceBackButton
          jumpToChapter={jumpToChapter}
          openReferences={openReferences}
          setReferenceState={setReferenceState}
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
