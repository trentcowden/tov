import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useEffect, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gutterSize, panActivateConfig, sizes, typography } from '../constants'
import bibles from '../data/bibles'
import { getChapterReference } from '../functions/bible'
import useColors from '../hooks/useColors'
import { toggleFavorite } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import TovIcon from './SVG'

interface Props {
  scrollOffset: SharedValue<number>
  textTranslateX: SharedValue<number>
  savedTextTranslateX: SharedValue<number>
  openNavigator: SharedValue<number>
  focusSearch: () => void
  overlayOpacity: SharedValue<number>
}

const heartSize = 16

export default function ChapterTitle({
  scrollOffset,
  openNavigator,
  savedTextTranslateX,
  textTranslateX,
  focusSearch,
  overlayOpacity,
}: Props) {
  const dispatch = useAppDispatch()
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])
  const width = useSharedValue(0)
  const pressed = useSharedValue(0)
  const insets = useSafeAreaInsets()
  const history = useAppSelector((state) => state.history)
  const itemTranslateX = useSharedValue(0)

  const itemStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, 0.98]),
        },
      ],
      backgroundColor:
        // style?.backgroundColor ??
        // outerStyle?.backgroundColor ??
        interpolateColor(
          pressed.value,
          [0, 1],
          [colors.bg3 + '00', colors.bg3]
        ),
    }
  })

  const textContainerStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: itemTranslateX.value,
        },
      ],
    }
  })

  const historyItem = useMemo(() => {
    return history.find((item) => item.chapterId === activeChapter.chapterId)
  }, [history, activeChapter])

  useEffect(() => {
    if (historyItem?.isFavorite) {
      itemTranslateX.value = withSpring(heartSize + 8, panActivateConfig)
    } else {
      itemTranslateX.value = withSpring(0, panActivateConfig)
    }
  }, [historyItem?.isFavorite])

  return (
    <Animated.View
      style={[
        {
          marginHorizontal: gutterSize / 2,
          paddingHorizontal: gutterSize / 2,
          justifyContent: 'flex-start',
          borderRadius: 12,
        },
        itemStyles,
      ]}
    >
      <Pressable
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 75 })
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, panActivateConfig)
        }}
        delayLongPress={250}
        onLongPress={() => {
          pressed.value = withSequence(
            withTiming(-2, { duration: 75 }),
            withSpring(0, panActivateConfig)
          )
          impactAsync(ImpactFeedbackStyle.Heavy)

          dispatch(toggleFavorite(activeChapter.chapterId))
        }}
        onPress={() => {
          textTranslateX.value = withSpring(0, panActivateConfig)
          overlayOpacity.value = withTiming(1)
          savedTextTranslateX.value = 0
          openNavigator.value = withSpring(1, panActivateConfig)
          focusSearch()
          impactAsync(ImpactFeedbackStyle.Heavy)
        }}
        style={{
          paddingVertical: gutterSize / 2,
          borderRadius: 12,
        }}
      >
        {activeChapter.chapterId === 'TUT.1' ? null : (
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
            <Animated.Text
              numberOfLines={1}
              onLayout={(e) => {
                width.value = e.nativeEvent.layout.width
              }}
              adjustsFontSizeToFit
              style={[
                typography(sizes.title, 'uib', 'l', colors.p1),
                textContainerStyles,
              ]}
            >
              {getChapterReference(activeChapter.chapterId)}
            </Animated.Text>
            {historyItem?.isFavorite ? (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut.duration(125)}
                style={{ position: 'absolute', left: 0 }}
              >
                <TovIcon
                  name="heartFilled"
                  size={heartSize}
                  color={colors.p1}
                />
              </Animated.View>
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}
