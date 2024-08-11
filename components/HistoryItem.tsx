import { trackEvent } from '@aptabase/react-native'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useEffect, useRef, useState } from 'react'
import { Pressable, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import BookmarkFilled from '../assets/icons/solid/bookmark.svg'
import { defaultOnPressScale, panActivateConfig } from '../constants'
import { Chapters } from '../data/types/chapters'
import { getBook } from '../functions/bible'
import { getHorizTransReq } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import {
  HistoryItem,
  removeFromHistory,
  toggleFavorite,
} from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { dismissPopup } from '../redux/popups'
import { br, ic, sans, sp, tx } from '../styles'

interface Props {
  item: HistoryItem
  index: number
  closeHistory: () => void
  jumpToChapter: JumpToChapter
  activeChapter: Chapters[number]
  textTranslateX: Animated.SharedValue<number>
}

const swipeReq = 75

export default function HistoryListItem({
  closeHistory,
  index,
  item,
  jumpToChapter,
  activeChapter,
  textTranslateX,
}: Props) {
  const colors = useColors()
  const { width } = useWindowDimensions()
  const dispatch = useAppDispatch()
  const itemTranslateX = useSharedValue(0)
  const historyItemTextTranslateX = useSharedValue(0)
  const alreadyHaptic = useRef(false)
  const pressed = useSharedValue(0)
  const popups = useAppSelector((state) => state.popups)
  const horizTransReq = getHorizTransReq(width)

  const popup = 'historyItemWiggle'
  const [wiggleTime, setWiggleTime] = useState(false)

  useDerivedValue(() => {
    if (
      !popups.dismissed.includes(popup) &&
      index > 1 &&
      item.chapterId === 'TUT.1' &&
      textTranslateX.value > horizTransReq - 25
    )
      runOnJS(setWiggleTime)(true)
    else runOnJS(setWiggleTime)(false)
  })

  useEffect(() => {
    if (wiggleTime) {
      dispatch(dismissPopup(popup))
      itemTranslateX.value = withSequence(
        withSpring(sp.xx, panActivateConfig),
        withSpring(0, panActivateConfig)
      )
    }
  }, [dispatch, itemTranslateX, wiggleTime])

  function removeHistoryItem() {
    setTimeout(() => dispatch(removeFromHistory(item.chapterId)), 100)
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX(10)
    .onChange((event) => {
      // if (item.chapterId === activeChapter.chapterId) return

      itemTranslateX.value = event.translationX

      if (item.chapterId === activeChapter.chapterId || item.isFavorite) return

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
      if (item.chapterId === activeChapter.chapterId || item.isFavorite) {
        itemTranslateX.value = withSpring(0, panActivateConfig)
        return
      }

      if (event.translationX > swipeReq) {
        itemTranslateX.value = withSpring(swipeReq * 4, panActivateConfig)
        runOnJS(removeHistoryItem)()
      } else {
        itemTranslateX.value = withSpring(0, panActivateConfig)
      }
    })

  useEffect(() => {
    if (item.isFavorite)
      historyItemTextTranslateX.value = withSpring(
        ic.sm.width + sp.sm,
        panActivateConfig
      )
    else historyItemTextTranslateX.value = withSpring(0, panActivateConfig)
  }, [historyItemTextTranslateX, item.isFavorite])

  const historyItemStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: itemTranslateX.value }],
    }
  })

  const textContainerStyles = useAnimatedStyle(() => {
    return {
      opacity:
        item.chapterId === activeChapter.chapterId || item.isFavorite
          ? 1
          : interpolate(itemTranslateX.value, [0, swipeReq], [1, 0.5]),
      transform: [
        { scale: interpolate(pressed.value, [0, 1], [1, defaultOnPressScale]) },
      ],
    }
  })

  const textStyles = useAnimatedStyle(() => {
    return {
      textDecorationLine:
        item.chapterId === activeChapter.chapterId || item.isFavorite
          ? 'none'
          : itemTranslateX.value > swipeReq
            ? 'line-through'
            : 'none',
      transform: [{ translateX: historyItemTextTranslateX.value }],
    }
  })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={historyItemStyles}
        entering={FadeIn}
        exiting={FadeOut}
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
              jumpToChapter({
                chapterId: item.chapterId,
                comingFrom: 'history',
                verseNumber: item.verseIndex,
              })

            closeHistory()
          }}
          onLongPress={() => {
            if (Math.abs(itemTranslateX.value) > 0) return

            pressed.value = withSequence(
              withTiming(-2, { duration: 75 }),
              withSpring(0, panActivateConfig)
            )
            impactAsync(ImpactFeedbackStyle.Heavy)

            dispatch(toggleFavorite(item.chapterId))

            trackEvent('Toggle favorite', {
              value: !item.isFavorite,
              chapter: item.chapterId,
            })
          }}
          style={{
            borderColor: colors.bg3,
            paddingVertical: sp.sm,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: sp.md,
            gap: sp.md,
            flexDirection: 'row',
            borderRadius: br.md,
            backgroundColor:
              item.chapterId === activeChapter.chapterId
                ? colors.bg3
                : undefined,
          }}
        >
          <Animated.View
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
              },
              textContainerStyles,
            ]}
          >
            <Animated.Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                sans(tx.body, item.isFavorite ? 'b' : 'r', 'l', colors.fg1),
                textStyles,
              ]}
            >
              {item.chapterId === 'TUT.1'
                ? 'Tutorial'
                : `${getBook(item.chapterId).name} ${item.chapterId.split('.')[1]}`}
              {item.chapterId === activeChapter.chapterId ? ' ' : ''}
            </Animated.Text>
            {item.isFavorite ? (
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut.duration(125)}
                style={{ position: 'absolute', left: 0 }}
              >
                <BookmarkFilled {...ic.sm} color={colors.p1} />
              </Animated.View>
            ) : null}
          </Animated.View>

          {/* {item.chapterId === activeChapter.chapterId ? (
            <View style={{ flexDirection: 'row' }}>
              <Text style={typography(sizes.tiny, 'r', 'l', colors.fg3)}>
                Current
              </Text>
            </View>
          ) : null} */}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  )
}
