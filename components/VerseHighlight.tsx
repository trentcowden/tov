import React, { useMemo } from 'react'
import { Pressable, useWindowDimensions } from 'react-native'
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { panActivateConfig } from '../constants'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, shadow, sp } from '../styles'

interface Props {
  verseOffsets: number[] | undefined
  highlightVerseNumber: SharedValue<number>
  verseNewlines: boolean[] | undefined
  paragraphs: boolean[] | undefined
  spaceAfterTextEnds: number
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export default function VerseHighlight({
  verseOffsets,
  highlightVerseNumber,
  verseNewlines,
  paragraphs,
  spaceAfterTextEnds,
}: Props) {
  const { width } = useWindowDimensions()
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const pressed = useSharedValue(0)

  const verseHighlightStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        highlightVerseNumber.value,
        [0, 1],
        [0, 0.2],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, 0.985]),
        },
      ],
      zIndex: highlightVerseNumber.value !== 0 ? 10 : -10,
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
  }, [
    verseOffsets,
    activeChapterIndex.verseIndex,
    activeChapterIndex.numVersesToHighlight,
    settings.lineHeight,
    paragraphs,
    verseNewlines,
    spaceAfterTextEnds,
  ])

  const top = verseOffsets
    ? typeof activeChapterIndex.verseIndex === 'number'
      ? verseOffsets[activeChapterIndex.verseIndex]
      : 0
    : 0

  return verseOffsets ? (
    <AnimatedPressable
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 75 })
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, panActivateConfig)
      }}
      onPress={() => {
        highlightVerseNumber.value = withSpring(0, panActivateConfig)
      }}
      style={[
        {
          position: 'absolute',
          height,
          top,
          width: width - sp.xx * 2 + sp.lg,
          alignSelf: 'center',
          backgroundColor: colors.p1,
          borderRadius: br.lg,
          zIndex: 10,
          ...shadow,
        },
        verseHighlightStyle,
      ]}
    />
  ) : null
}
