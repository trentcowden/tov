import React, { useMemo, useRef, useState } from 'react'
import { Pressable, Text } from 'react-native'
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import {
  gutterSize,
  panActivateConfig,
  screenWidth,
  sizes,
  typography,
} from '../constants'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'

interface Props {
  verseOffsets: number[] | undefined
  highlightVerseNumber: SharedValue<number>
  activeChapter: Chapters[number]
  jumpToChapter: JumpToChapter
}

const swipeReq = 75

export default function VerseHighlight({
  verseOffsets,
  highlightVerseNumber,
  activeChapter,
  jumpToChapter,
}: Props) {
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
      zIndex: highlightVerseNumber.value !== 0 ? 3 : -2,
      opacity: interpolate(
        highlightVerseNumber.value,
        [0, 0.5],
        [0, 0.3],
        Extrapolation.CLAMP
      ),
    }
  })

  const textStyles = useAnimatedStyle(() => {
    return {
      // transform: [{ translateX: itemTranslateX.value }],
      // alignItems: itemTranslateX.value < 0 ? 'flex-end' : 'flex-start',
      // right: itemTranslateX.value > 0 ? 0 : undefined,
      zIndex: highlightVerseNumber.value > 0.5 ? 4 : -3,
      opacity: interpolate(highlightVerseNumber.value, [0.5, 1], [0, 1]),
    }
  })

  const height = verseOffsets
    ? typeof activeChapterIndex.verseIndex === 'number'
      ? verseOffsets[
          activeChapterIndex.verseIndex +
            (activeChapterIndex.numVersesToHighlight
              ? activeChapterIndex.numVersesToHighlight + 1
              : 1)
        ] -
        verseOffsets[activeChapterIndex.verseIndex] +
        settings.lineHeight
      : 0
    : 0
  const top = verseOffsets
    ? typeof activeChapterIndex.verseIndex === 'number'
      ? verseOffsets[activeChapterIndex.verseIndex]
      : 0
    : 0

  return verseOffsets ? (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            height,
            top,
            width: screenWidth - gutterSize,
            alignSelf: 'center',
          },
          verseHighlightStyle,
        ]}
      >
        <Pressable
          onPress={() => {
            highlightVerseNumber.value = withSpring(1, panActivateConfig)
            console.log('beep')
          }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.p1,
            borderRadius: 12,
          }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            height,
            top,
            width: screenWidth - gutterSize,
            alignSelf: 'center',
            flexDirection: 'row',
            backgroundColor: colors.p1,
            borderRadius: 12,
          },
          textStyles,
        ]}
      >
        <Pressable
          onPress={() => {
            highlightVerseNumber.value = withSpring(0, panActivateConfig)
          }}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: gutterSize,
            borderRightWidth: 1,
            borderColor: colors.bg3,
          }}
        >
          <Text style={[typography(sizes.body, 'uib', 'l', colors.bg1)]}>
            {backText}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (!cameFromChapter) return

            jumpToChapter({
              chapterId: activeChapter.chapterId,
              verseNumber: activeChapterIndex.verseIndex,
              comingFrom: 'reference',
            })
            highlightVerseNumber.value = withSpring(0, panActivateConfig)
          }}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: gutterSize,
          }}
        >
          <Text style={[typography(sizes.body, 'uib', 'l', colors.bg1)]}>
            Dismiss
          </Text>
        </Pressable>
      </Animated.View>
    </>
  ) : null
}
