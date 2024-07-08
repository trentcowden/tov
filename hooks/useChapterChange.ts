import { trackEvent } from '@aptabase/react-native'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  chapterChangeDuration,
  overScrollReq,
  panActivateConfig,
} from '../constants'
import bibles from '../data/bibles'
import { Chapters } from '../data/types/chapters'
import {
  goToNextChapter,
  goToPreviousChapter,
  setActiveChapterIndex,
  updateVerseIndex,
} from '../redux/activeChapterIndex'
import { addToHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import {
  addToReferenceTree,
  clearReferenceTree,
  removeAfterInReferenceTree,
} from '../redux/referenceTree'

interface Props {
  activeChapter: {
    chapterId: string
    md: string
  }
  scrollViewRef: React.RefObject<ScrollView>
  verseOffsets: number[] | undefined
  setVerseOffsets: Dispatch<SetStateAction<number[] | undefined>>
  scrollBarActivate: SharedValue<number>
  currentVerseIndex: SharedValue<number | 'bottom' | 'top'>
  fingerDown: React.MutableRefObject<boolean>
  overScrollAmount: SharedValue<number>
  overlayOpacity: SharedValue<number>
  scrollOffset: SharedValue<number>
  highlightVerseNumber: SharedValue<number>
  setVerseNewlines: Dispatch<SetStateAction<boolean[] | undefined>>
}

export default function useChapterChange({
  activeChapter,
  scrollViewRef,
  verseOffsets,
  scrollBarActivate,
  currentVerseIndex,
  fingerDown,
  overScrollAmount,
  setVerseOffsets,
  overlayOpacity,
  scrollOffset,
  highlightVerseNumber,
  setVerseNewlines,
}: Props) {
  const dispatch = useAppDispatch()
  const { height } = useWindowDimensions()
  const currentVerseReq = height / 3
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const textTranslateY = useSharedValue(0)
  const referenceTree = useAppSelector((state) => state.referenceTree)
  const textFadeOut = useSharedValue(1)
  const releaseToChange = useSharedValue(0)
  const alreadyHaptic = useRef(false)
  const goPrev = useSharedValue(0)
  const goNext = useSharedValue(0)

  const jumpToChapter: JumpToChapter = ({
    chapterId,
    verseNumber,
    comingFrom,
    currentVerse,
    numVersesToHighlight,
  }) => {
    // If the chapter is already active, scroll to the verse.
    if (chapterId === activeChapter.chapterId) {
      if (verseNumber === 'top' || verseNumber === undefined || !verseOffsets)
        scrollViewRef.current?.scrollTo({ y: 0, animated: true })
      else if (verseNumber === 'bottom')
        scrollViewRef.current?.scrollToEnd({ animated: true })
      else {
        // Determine numVersesToHighlight.
        // For testing: Psa 137:9 -> Isa 13:1-22 -> Isa 13:1 -> Isa 13:19
        dispatch(
          updateVerseIndex({
            verseIndex: verseNumber,
            numVersesToHighlight,
          })
        )
        scrollViewRef.current?.scrollTo({
          y: verseOffsets[verseNumber] - currentVerseReq,
          animated: true,
        })
      }
      return
    }

    trackEvent('Chapter change', {
      chapterId,
      comingFrom,
      verseNumber: verseNumber ?? '',
    })

    // Reset verse offsets.
    setVerseOffsets(undefined)
    setVerseNewlines(undefined)
    highlightVerseNumber.value = withTiming(0)
    overlayOpacity.value = withTiming(0)

    // Find the index of the chapter to go to.
    const chapterIndex = bibles[settings.translation].findIndex(
      (chapter) => chapter.chapterId === chapterId
    )

    // Match the starting text opacity when history is open.
    if (comingFrom === 'history') textFadeOut.value = 0.7

    // Fade out text.
    textFadeOut.value = withTiming(1, { duration: chapterChangeDuration })

    // Fade out scroll bar.
    scrollBarActivate.value = withTiming(-1, {
      duration: chapterChangeDuration,
    })

    // Add the current chapter to the history.
    dispatch(
      addToHistory({
        chapterId: activeChapter.chapterId,
        verseIndex:
          currentVerse !== undefined ? currentVerse : currentVerseIndex.value,
      })
    )

    // Handle reference tree stuff.
    if (comingFrom === 'reference') {
      if (referenceTree.indexOf(activeChapter.chapterId) === -1) {
        dispatch(addToReferenceTree(activeChapter.chapterId))
      }
      dispatch(addToReferenceTree(chapterId))
    }
    // If this isn't from a cross reference and the chapter is not in the reference
    // tree, clear the reference tree.
    else if (referenceTree.indexOf(chapterId) === -1) {
      dispatch(clearReferenceTree())
    }
    // If the chapter is not the last in the reference tree, remove all chapters after
    // it.
    else if (
      referenceTree.length !== 0 &&
      referenceTree.indexOf(chapterId) != -1 &&
      referenceTree.indexOf(chapterId) != referenceTree.length - 1
    ) {
      dispatch(removeAfterInReferenceTree(chapterId))
    }

    // After the fade out, go to the new chapter.
    setTimeout(
      () =>
        dispatch(
          setActiveChapterIndex({
            transition: 'fade',
            index: chapterIndex,
            verseIndex: verseNumber,
            highlightVerse:
              comingFrom === 'reference'
                ? true
                : referenceTree.indexOf(chapterId) !== -1
                  ? true
                  : false,
            numVersesToHighlight,
          })
        ),
      chapterChangeDuration
    )
  }

  function handleDragEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    fingerDown.current = false

    const offset = event.nativeEvent.contentOffset.y
    const screenHeight = event.nativeEvent.layoutMeasurement.height
    const contentHeight = event.nativeEvent.contentSize.height
    const velocity = event.nativeEvent.velocity
    const y = velocity?.y ?? 0

    /**
     * Whether or not this drag meets the requirements to begin considering going to the
     * previous chapter.
     */
    const goingPrev = y < 0 && offset < 0 && activeChapterIndex.index !== 0

    /**
     * Whether or not this drag meets the requirements to begin considering going to the
     * next chapter.
     */
    const goingNext =
      y > 0 &&
      offset > contentHeight - screenHeight &&
      activeChapterIndex.index !== bibles[settings.translation].length - 1

    /**  Whether or not this drag should go to the previous chapter upon release.*/
    const shouldGoPrev = goingPrev && offset <= -overScrollReq

    /**
     * Whether or not this drag should go to the next chapter upon release.
     */
    const shouldGoNext =
      goingNext && offset > contentHeight - screenHeight + overScrollReq

    /** A few things to do if the chapter is changing, whether prev or next. */
    if (shouldGoPrev || shouldGoNext) {
      overlayOpacity.value = withTiming(0)

      // Hide scroll bar.
      scrollBarActivate.value = withTiming(-1, {
        duration: chapterChangeDuration,
      })

      // Clear the reference tree if the chapter is changing via scrolling up/down.
      dispatch(clearReferenceTree())

      // Reset verse offsets.
      setVerseOffsets(undefined)
      setVerseNewlines(undefined)

      if (releaseToChange.value === 0) impactAsync(ImpactFeedbackStyle.Heavy)

      dispatch(
        addToHistory({
          chapterId: activeChapter.chapterId,
          verseIndex: currentVerseIndex.value,
        })
      )
      textFadeOut.value = withTiming(1, { duration: chapterChangeDuration })
    }

    if (shouldGoPrev) {
      textTranslateY.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 })
      )

      goPrev.value = withDelay(
        chapterChangeDuration,
        withTiming(1, { duration: 0 })
      )
    } else if (shouldGoNext) {
      textTranslateY.value = withSequence(
        withTiming(-screenHeight, {
          duration: chapterChangeDuration,
        }),
        withTiming(screenHeight, { duration: 0 })
      )
      goNext.value = withDelay(
        chapterChangeDuration,
        withTiming(1, { duration: 0 })
      )
    } else if (releaseToChange.value) impactAsync(ImpactFeedbackStyle.Light)
  }

  const prev = () => dispatch(goToPreviousChapter())
  const next = () => dispatch(goToNextChapter())

  useDerivedValue(() => {
    if (goPrev.value === 0 && goNext.value === 0) return

    if (goPrev.value === 1) {
      goPrev.value = 0
      runOnJS(prev)()
    } else if (goNext.value === 1) {
      goNext.value = 0
      runOnJS(next)()
    }
  })

  /**
   * This useEffect handles transitioning the new chapter in after the old chapter has left.
   */
  useEffect(() => {
    if (!verseOffsets) return

    if (
      activeChapterIndex.transition === 'back' ||
      activeChapterIndex.transition === 'forward'
    ) {
      trackEvent('Chapter change', {
        chapterId: activeChapter.chapterId,
        comingFrom: 'scroll',
      })
    }

    // Reset some values.
    releaseToChange.value = 0
    alreadyHaptic.current = false

    switch (activeChapterIndex.transition) {
      case 'forward':
        dispatch(
          addToHistory({
            chapterId: activeChapter.chapterId,
            verseIndex: 0,
          })
        )

        scrollViewRef.current?.scrollTo({ y: 0, animated: false })
        textTranslateY.value = withSpring(0, panActivateConfig)
        textFadeOut.value = withSpring(0, panActivateConfig)
        break
      case 'back':
        dispatch(
          addToHistory({
            chapterId: activeChapter.chapterId,
            verseIndex: 'bottom',
          })
        )
        scrollViewRef.current?.scrollToEnd({ animated: false })
        textTranslateY.value = withSpring(0, panActivateConfig)
        textFadeOut.value = withSpring(0, panActivateConfig)
        overlayOpacity.value = withTiming(1)
        break
      case 'fade':
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
                : activeChapterIndex.verseIndex === 'top'
                  ? 0
                  : verseOffsets
                    ? verseOffsets[activeChapterIndex.verseIndex] -
                      currentVerseReq
                    : 0,
            animated: false,
          })
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
        textFadeOut.value = withSpring(0, panActivateConfig)
        break
    }

    scrollBarActivate.value = withDelay(
      activeChapterIndex.transition === 'fade' ? 0 : chapterChangeDuration,
      withTiming(0)
    )
  }, [activeChapterIndex.index, verseOffsets])

  return {
    handleDragEnd,
    textTranslateY,
    releaseToChange,
    alreadyHaptic,
    textFadeOut,
    jumpToChapter,
  }
}

export interface JumpToChapterParams {
  chapterId: Chapters[number]['chapterId']
  comingFrom: 'history' | 'reference' | 'navigator' | 'search'
  verseNumber?: number | 'bottom' | 'top'
  currentVerse?: number
  numVersesToHighlight?: number
}

export type JumpToChapter = (params: JumpToChapterParams) => void
