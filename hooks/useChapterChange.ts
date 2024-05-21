import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { useEffect, useRef } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  SharedValue,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import {
  chapterChangeDuration,
  currentVerseReq,
  overScrollReq,
  panActivateConfig,
} from '../constants'
import bibles from '../data/bibles'
import { Chapters } from '../data/types/chapters'
import {
  goToNextChapter,
  goToPreviousChapter,
  setActiveChapterIndex,
} from '../redux/activeChapterIndex'
import { addToHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import {
  addToReferenceTree,
  clearReferenceTree,
  removeAfterInReferenceTree,
} from '../redux/referenceTree'

interface Props {
  textRendered: boolean
  activeChapter: {
    chapterId: string
    md: string
  }
  scrollViewRef: React.RefObject<ScrollView>
  verseOffsets: number[] | undefined
  scrollBarActivate: SharedValue<number>
  currentVerseIndex: SharedValue<number | 'bottom' | 'top'>
  fingerDown: React.MutableRefObject<boolean>
  setTextRendered: React.Dispatch<React.SetStateAction<boolean>>
}

export default function useChapterChange({
  textRendered,
  activeChapter,
  scrollViewRef,
  verseOffsets,
  scrollBarActivate,
  currentVerseIndex,
  fingerDown,
  setTextRendered,
}: Props) {
  const dispatch = useAppDispatch()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const textTranslateY = useSharedValue(0)
  const referenceTree = useAppSelector((state) => state.referenceTree)
  const textFadeOut = useSharedValue(1)
  const releaseToChange = useSharedValue(0)
  const alreadyHaptic = useRef(false)
  const settings = useAppSelector((state) => state.settings)

  const leaving = useSharedValue(0)
  const entering = useSharedValue(0)

  /**
   * This useEffect handles transitioning the new chapter in after the old chapter has left.
   */
  useEffect(() => {
    if (!textRendered) return

    releaseToChange.value = 0
    alreadyHaptic.current = false
    leaving.value = 0
    entering.value = withSpring(
      1,
      panActivateConfig,
      () => (entering.value = 0)
    )

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
  }, [activeChapterIndex.index, textRendered])

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
      // Hide scroll bar.
      scrollBarActivate.value = withTiming(-1, { duration: 200 })
      dispatch(clearReferenceTree())
      leaving.value = withTiming(1, { duration: chapterChangeDuration })

      if (releaseToChange.value === 0) impactAsync(ImpactFeedbackStyle.Heavy)

      dispatch(
        addToHistory({
          chapterId: activeChapter.chapterId,
          verseIndex: currentVerseIndex.value,
        })
      )
    }

    if (shouldGoPrev) {
      textTranslateY.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 })
      )

      setTimeout(() => dispatch(goToPreviousChapter()), chapterChangeDuration)
    } else if (shouldGoNext) {
      textTranslateY.value = withSequence(
        withTiming(-screenHeight, {
          duration: chapterChangeDuration,
        }),
        withTiming(screenHeight, { duration: 0 })
      )

      setTimeout(() => dispatch(goToNextChapter()), chapterChangeDuration)
    } else if (releaseToChange.value) impactAsync(ImpactFeedbackStyle.Light)
  }

  const jumpToChapter: JumpToChapter = ({
    chapterId,
    verseNumber,
    cameFromReference,
  }) => {
    if (chapterId === activeChapter.chapterId) {
      if (verseNumber === 'top' || verseNumber === undefined || !verseOffsets)
        scrollViewRef.current?.scrollTo({ y: 0, animated: true })
      else if (verseNumber === 'bottom')
        scrollViewRef.current?.scrollToEnd({ animated: true })
      else {
        scrollViewRef.current?.scrollTo({
          y: verseOffsets[verseNumber] - currentVerseReq,
          animated: true,
        })
      }
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

    if (cameFromReference) {
      if (referenceTree.indexOf(activeChapter.chapterId) === -1) {
        dispatch(addToReferenceTree(activeChapter.chapterId))
      }
      dispatch(addToReferenceTree(chapterId))
    }
    // If this isn't from a cross reference and the chapter is not in the reference tree, clear the reference tree.
    else if (referenceTree.indexOf(chapterId) === -1) {
      console.log('beep')
      dispatch(clearReferenceTree())
    }
    // If the chapter is not the last in the reference tree, remove all chapters after it.
    else if (
      referenceTree.length !== 0 &&
      referenceTree.indexOf(chapterId) != -1 &&
      referenceTree.indexOf(chapterId) != referenceTree.length - 1
    ) {
      dispatch(removeAfterInReferenceTree(chapterId))
    }

    setTimeout(
      () =>
        dispatch(
          setActiveChapterIndex({
            transition: 'fade',
            index: chapterIndex,
            verseIndex: verseNumber,
            highlightVerse: cameFromReference ?? chapterId in referenceTree,
          })
        ),
      chapterChangeDuration
    )
  }

  return {
    handleDragEnd,
    textTranslateY,
    releaseToChange,
    alreadyHaptic,
    leaving,
    entering,
    textFadeOut,
    jumpToChapter,
  }
}

export interface JumpToChapterParams {
  chapterId: Chapters[number]['chapterId']
  verseNumber?: number | 'bottom' | 'top'
  cameFromReference?: boolean
}

export type JumpToChapter = (params: JumpToChapterParams) => void
