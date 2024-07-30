import React, { useMemo, useRef, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gutterSize, shadow } from '../constants'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import { getEdges } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { sp } from '../styles'

interface Props {
  verseOffsets: number[] | undefined
  highlightVerseNumber: SharedValue<number>
  activeChapter: Chapters[number]
  jumpToChapter: JumpToChapter
  verseNewlines: boolean[] | undefined
  paragraphs: boolean[] | undefined
  spaceAfterTextEnds: number
}

export default function VerseHighlight({
  verseOffsets,
  highlightVerseNumber,
  activeChapter,
  jumpToChapter,
  verseNewlines,
  paragraphs,
  spaceAfterTextEnds,
}: Props) {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { bottom } = getEdges(insets)
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const referenceTree = useAppSelector((state) => state.referenceTree)
  const dispatch = useAppDispatch()
  const history = useAppSelector((state) => state.history)
  const alreadyHaptic = useRef(false)
  const itemTranslateX = useSharedValue(0)
  // const active = useSharedValue(0)

  const cameFromChapter = useMemo(() => {
    const thisReferenceIndex = referenceTree.indexOf(activeChapter.chapterId)
    if (thisReferenceIndex <= 0) return undefined

    const referenceBeforeThisOne =
      referenceTree[referenceTree.indexOf(activeChapter.chapterId) - 1]
    const historyItem = history.find(
      (item) => item.chapterId === referenceBeforeThisOne
    )
    return historyItem
  }, [history])

  const backText = cameFromChapter
    ? `Back to ${getChapterReference(cameFromChapter.chapterId)}${
        typeof cameFromChapter.verseIndex === 'number'
          ? `:${cameFromChapter.verseIndex + 1}`
          : ''
      }`
    : ''

  // const cameFromChapter = useMemo(() => {
  //   const thisIndex = referenceTree.findIndex(
  //     (chapter) => chapter === activeChapter.chapterId
  //   )
  //   if (thisIndex < 0) return null
  //   return referenceTree[thisIndex - 1]
  // }, [referenceTree, activeChapter])

  const [config, setConfig] = useState({
    text: backText,
    iconPath: 'M19 12H5m0 0l7 7m-7-7l7-7',
  })

  useDerivedValue(() => {
    if (itemTranslateX.value < 0) {
      runOnJS(setConfig)({
        iconPath: 'M19 12H5m0 0l7 7m-7-7l7-7',
        text: cameFromChapter ? backText : 'Already at start',
      })
    } else if (itemTranslateX.value > 0) {
      runOnJS(setConfig)({
        iconPath: 'M18 6L6 18M6 6l12 12',
        text: 'Dismiss highlight',
      })
    }
  })

  const verseHighlightStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        highlightVerseNumber.value,
        [0, 1],
        [0, 0.3],
        Extrapolation.CLAMP
      ),
    }
  })

  const height = useMemo(() => {
    if (!verseOffsets) return 0
    else if (typeof activeChapterIndex.verseIndex !== 'number') return 0

    const start = verseOffsets[activeChapterIndex.verseIndex]
    let endOffset =
      activeChapterIndex.verseIndex +
      (activeChapterIndex.numVersesToHighlight
        ? activeChapterIndex.numVersesToHighlight + 1
        : 1)

    let height = verseOffsets[endOffset] - start + settings.lineHeight + 3

    // The last offset extends past the last verse, so we need to adjust the height so
    // it doesn't go past the bottom of the screen.
    if (endOffset === verseOffsets.length - 1) {
      height -= settings.lineHeight
      height -= spaceAfterTextEnds
      // If the last verse is a newline, we need to adjust the height so that it doesn't
      // extend into the next verse.
    } else if (paragraphs && paragraphs[endOffset]) {
      console.log('paragraph')
      height -= settings.lineHeight * 1.3
    } else if (verseNewlines && verseNewlines[endOffset]) {
      height -= settings.lineHeight
    }

    return height
  }, [verseOffsets, activeChapterIndex])

  const top = verseOffsets
    ? typeof activeChapterIndex.verseIndex === 'number'
      ? verseOffsets[activeChapterIndex.verseIndex]
      : 0
    : 0

  return verseOffsets ? (
    <Animated.View
      style={[
        {
          position: 'absolute',
          height,
          top,
          width: width - sp.xx * 2 + gutterSize,
          alignSelf: 'center',
          backgroundColor: colors.p1,
          borderRadius: 12,
          zIndex: -10,
          ...shadow,
        },
        verseHighlightStyle,
      ]}
    />
  ) : null
}
