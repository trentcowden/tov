import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  colors,
  gutterSize,
  panActivateConfig,
  sizes,
  typography,
} from '../constants'
import bibles from '../data/bibles'
import { getChapterReference } from '../functions/bible'
import { useAppSelector } from '../redux/hooks'
import TovPressable from './TovPressable'

interface Props {
  scrollOffset: SharedValue<number>
  textTranslateX: SharedValue<number>
  savedTextTranslateX: SharedValue<number>
  savedNavigatorTransition: SharedValue<number>
  navigatorTransition: SharedValue<number>
  focusSearch: () => void
}

const scale = sizes.caption / sizes.title

export default function ChapterTitle({
  scrollOffset,
  navigatorTransition,
  savedNavigatorTransition,
  savedTextTranslateX,
  textTranslateX,
  focusSearch,
}: Props) {
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
    <View
      style={{
        width: '100%',
        paddingHorizontal: gutterSize / 2,
        justifyContent: 'flex-start',
      }}
    >
      <TovPressable
        onPress={() => {
          textTranslateX.value = withSpring(0, panActivateConfig)
          savedTextTranslateX.value = 0
          savedNavigatorTransition.value = 1
          navigatorTransition.value = withTiming(1)
          focusSearch()
          impactAsync(ImpactFeedbackStyle.Heavy)
        }}
        onPressColor={colors.bg2}
        style={{
          paddingHorizontal: gutterSize / 2,
          paddingVertical: gutterSize / 2,
          borderRadius: 12,
        }}
      >
        <Text
          numberOfLines={1}
          onLayout={(e) => {
            width.value = e.nativeEvent.layout.width
          }}
          adjustsFontSizeToFit
          style={[typography(sizes.title, 'uib', 'l', colors.p1)]}
        >
          {getChapterReference(activeChapter.chapterId)}
        </Text>
      </TovPressable>
    </View>
  )
}