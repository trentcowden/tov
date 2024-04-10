import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useRef } from 'react'
import { Pressable, Text } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, typography } from '../constants'
import chapters from '../data/chapters.json'
import { Chapters } from '../data/types/chapters'
import { getVerseReference } from '../functions/bible'
import { HistoryItem, removeFromHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'

interface Props {
  item: HistoryItem
  index: number
  closeHistory: () => void
  goToChapter: (
    chapterId: Chapters[number]['chapterId'],
    verseNumber?: number
  ) => void
}

const swipeReq = 75

export default function HistoryListItem({
  closeHistory,
  index,
  item,
  goToChapter,
}: Props) {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const itemTranslateX = useSharedValue(0)
  const alreadyHaptic = useRef(false)
  const pressed = useSharedValue(0)
  const chapterIndex = (chapters as Chapters).findIndex(
    (chapter) => chapter.chapterId === item.chapterId
  )

  function removeHistoryItem() {
    setTimeout(() => dispatch(removeFromHistory(item.chapterId)), 100)
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX(10)
    .onChange((event) => {
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
      console.log(event.translationX)
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

  const textStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(itemTranslateX.value, [0, swipeReq], [1, 0.5]),
      textDecorationLine:
        itemTranslateX.value > swipeReq ? 'line-through' : 'none',
      // transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.5]) }],
    }
  })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={historyItemStyles}
        exiting={FadeOut.duration(100).delay(index * 25)}
      >
        <Pressable
          onPress={() => {
            // pressed.value = withSequence(
            //   withTiming(1, { duration: 100 }),
            //   withTiming(0, {
            //     duration: 100,
            //   })
            // )
            goToChapter(item.chapterId, item.verseIndex)

            closeHistory()
          }}
          style={{
            borderColor: colors.bg3,
            paddingVertical: 12,
            backgroundColor:
              chapterIndex === activeChapterIndex.index
                ? colors.bg3
                : undefined,
            // alignItems: 'center',
            // flexDirection: 'row',
            alignItems: 'flex-start',
            paddingHorizontal:
              chapterIndex === activeChapterIndex.index
                ? gutterSize / 2
                : gutterSize / 2,
            gap: gutterSize / 2,
          }}
        >
          <Animated.Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[typography(18, 'uir', 'l', colors.fg2), textStyles]}
          >
            {getVerseReference(`${item.chapterId}.${item.verseIndex + 1}`)}
          </Animated.Text>
          {chapterIndex === activeChapterIndex.index ? (
            <Text style={typography(12, 'uir', 'c', colors.fg3)}>Current</Text>
          ) : null}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  )
}
