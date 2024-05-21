import React, { useMemo } from 'react'
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  colors,
  gutterSize,
  screenWidth,
  sizes,
  typography,
} from '../constants'
import bibles from '../data/bibles'
import { getChapterReference } from '../functions/bible'
import { useAppSelector } from '../redux/hooks'

interface Props {
  scrollOffset: SharedValue<number>
}

const scale = sizes.caption / sizes.title

export default function ChapterTitle({ scrollOffset }: Props) {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])
  const width = useSharedValue(0)

  const insets = useSafeAreaInsets()

  const headerText = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollOffset.value,
      [gutterSize * 3, insets.top * 0.66 + gutterSize * 3],
      [1, 0]
    ),
    transform: [
      {
        scale: interpolate(
          scrollOffset.value,
          [0, gutterSize * 4 + insets.top],
          [1, scale],
          Extrapolation.CLAMP
        ),
      },
    ],
  }))

  return (
    <Animated.Text
      numberOfLines={1}
      onLayout={(e) => {
        width.value = e.nativeEvent.layout.width
      }}
      adjustsFontSizeToFit
      style={[
        typography(sizes.title, 'uib', 'l', colors.fg3),
        // headerText,
        {
          // position: 'absolute',
          // top: insets.top + gutterSize * 4,
          left: -screenWidth + gutterSize * 3,
          width: screenWidth * 2 - gutterSize * 4,
          paddingLeft: screenWidth - gutterSize * 2,
        },
      ]}
    >
      {getChapterReference(activeChapter.chapterId)}
    </Animated.Text>
  )
}
