import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  FadeInUp,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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
import { Chapters } from '../data/types/chapters'
import { getBook } from '../functions/bible'
import {
  HistoryItem,
  removeFromHistory,
  toggleFavorite,
} from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import TovIcon from './SVG'

interface Props {
  item: HistoryItem
  index: number
  closeHistory: () => void
  goToChapter: (
    chapterId: Chapters[number]['chapterId'],
    verseNumber?: number | 'bottom'
  ) => void
  activeChapter: Chapters[number]
  showFavorites: boolean
}

const swipeReq = 75

export default function HistoryListItem({
  closeHistory,
  index,
  item,
  goToChapter,
  activeChapter,
  showFavorites,
}: Props) {
  const settings = useAppSelector((state) => state.settings)
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const itemTranslateX = useSharedValue(0)
  const alreadyHaptic = useRef(false)
  const pressed = useSharedValue(0)
  const chapterIndex = bibles[settings.translation].findIndex(
    (chapter) => chapter.chapterId === item.chapterId
  )

  function removeHistoryItem() {
    setTimeout(() => dispatch(removeFromHistory(item.chapterId)), 100)
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX(10)
    .onChange((event) => {
      if (item.chapterId === activeChapter.chapterId) return

      itemTranslateX.value = event.translationX

      if (event.translationX > swipeReq && !alreadyHaptic.current) {
        runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
        alreadyHaptic.current = true
      } else if (
        event.translationX > 0 &&
        event.translationX < swipeReq &&
        alreadyHaptic.current === true
      ) {
        runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
        alreadyHaptic.current = false
      }
    })
    .onFinalize((event) => {
      if (item.chapterId === activeChapter.chapterId) return

      if (event.translationX > swipeReq) {
        itemTranslateX.value = withSpring(swipeReq * 4)
        runOnJS(removeHistoryItem)()
      } else {
        itemTranslateX.value = withSpring(0)
      }
    })

  const historyItemStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: itemTranslateX.value }],
    }
  })

  const textContainerStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(itemTranslateX.value, [0, swipeReq], [1, 0.5]),
      textDecorationLine:
        itemTranslateX.value > swipeReq ? 'line-through' : 'none',
      transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.95]) }],
    }
  })

  const textStyles = useAnimatedStyle(() => {
    return {
      textDecorationLine:
        itemTranslateX.value > swipeReq ? 'line-through' : 'none',
    }
  })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={historyItemStyles}
        entering={FadeInUp.duration(100)}
        exiting={FadeOut.duration(100)}
      >
        <Pressable
          onPressIn={() => {
            pressed.value = withTiming(1, { duration: 75 })
          }}
          onPressOut={() => {
            pressed.value = withSpring(0, panActivateConfig)
          }}
          delayLongPress={250}
          onPress={() => {
            if (item.chapterId !== activeChapter.chapterId)
              goToChapter(item.chapterId, item.verseIndex)

            closeHistory()
          }}
          onLongPress={() => {
            if (Math.abs(itemTranslateX.value) > 5) return

            pressed.value = withSequence(
              withTiming(-2, { duration: 75 }),
              withSpring(0, panActivateConfig)
            )
            impactAsync(ImpactFeedbackStyle.Heavy)

            dispatch(toggleFavorite(item.chapterId))
          }}
          style={{
            borderColor: colors.bg3,
            paddingVertical: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: gutterSize / 2,
            gap: gutterSize / 2,
            flexDirection: 'row',
            borderRadius: 8,
            backgroundColor:
              item.chapterId === activeChapter.chapterId
                ? colors.bg3
                : undefined,
          }}
        >
          <Animated.View
            style={[
              { flexDirection: 'row', alignItems: 'center', gap: 4 },
              textContainerStyles,
            ]}
          >
            {item.isFavorite ? (
              <TovIcon name="heart" size={12} color={colors.p1} />
            ) : null}
            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                typography(
                  sizes.body,
                  item.isFavorite ? 'uib' : 'uir',
                  'l',
                  colors.fg2
                ),
                textStyles,
              ]}
            >
              {getBook(item.chapterId).name} {item.chapterId.split('.')[1]}
              {/* <Text style={[typography(14, 'uil', 'l', colors.fg4)]}>
              {`:${item.verseIndex + 1}`}
            </Text> */}
            </Animated.Text>
          </Animated.View>

          {item.chapterId === activeChapter.chapterId ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={typography(sizes.caption, 'uir', 'l', colors.fg3)}>
                Current
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  )
}
