import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { RefObject, useEffect, useState } from 'react'
import { Text, View, useWindowDimensions } from 'react-native'
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler'
import Animated, {
  FadeIn,
  FadeOut,
  SharedValue,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  panActivateConfig,
  scrollBarHeight,
  scrollBarWidth,
} from '../constants'
import { getScrollBarMargin } from '../functions/utils'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { dismissPopup } from '../redux/popups'
import { br, sans, shadow, sp, tx } from '../styles'

interface Props {
  verseOffsets: number[] | undefined
  scrollBarActivate: SharedValue<number>
  scrollViewRef: RefObject<ScrollView>
  textTranslateX: SharedValue<number>
  scrollBarPosition: SharedValue<number>
  currentVerseIndexNum: SharedValue<number>
  textTranslateY: SharedValue<number>
}

export default function ScrollBar({
  verseOffsets,
  scrollBarActivate,
  scrollViewRef,
  textTranslateX,
  scrollBarPosition,
  currentVerseIndexNum,
  textTranslateY,
}: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const { height } = useWindowDimensions()
  const currentVerseReq = height / 3
  const scrollBarMargin = getScrollBarMargin(insets)
  const scale = useSharedValue(1)
  const popups = useAppSelector((state) => state.popups)
  const dispatch = useAppDispatch()
  const history = useAppSelector((state) => state.history)

  const popup = 'scrollWiggle'
  const [wiggleTime, setWiggleTime] = useState(false)

  useDerivedValue(() => {
    if (
      !popups.dismissed.includes(popup) &&
      activeChapterIndex.index !== 0 &&
      history.length === 3 &&
      textTranslateY.value === 0
    )
      runOnJS(setWiggleTime)(true)
    else runOnJS(setWiggleTime)(false)
  })

  useEffect(() => {
    if (wiggleTime) {
      dispatch(dismissPopup(popup))
      scale.value = withSequence(
        withTiming(2, { duration: 400 }),
        withSpring(1, panActivateConfig)
      )
    }
  }, [dispatch, scale, wiggleTime])

  const usableHeight = height - scrollBarMargin.top - scrollBarMargin.bottom
  const textHeight = verseOffsets
    ? verseOffsets[verseOffsets.length - 1]
    : height
  const [verseText, setVerseText] = React.useState<string>('')
  const pop = useSharedValue(0)

  useDerivedValue(() => {
    if (scrollBarActivate.value === 1)
      runOnJS(impactAsync)(ImpactFeedbackStyle.Light)

    if (verseOffsets?.length === 1) runOnJS(setVerseText)('')
    else runOnJS(setVerseText)(`${(currentVerseIndexNum.value + 1).toString()}`)
  })

  const scrollPanGesture = Gesture.Pan()
    .onBegin((event) => {
      if (textHeight < height) return
      runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
      pop.value = withSequence(
        withTiming(1, { duration: 75 }),
        withSpring(0, panActivateConfig)
      )

      scrollBarActivate.value = withTiming(1, { duration: 250 })
      // startingOffset.value = event.y
      // scrollBarPosition.value = event.absoluteY - startingOffset.value
      if (event.absoluteY - scrollBarHeight / 2 < scrollBarMargin.top)
        scrollBarPosition.value = scrollBarMargin.top
      else if (
        event.absoluteY - scrollBarHeight / 2 >
        height - scrollBarHeight - scrollBarMargin.bottom
      )
        scrollBarPosition.value =
          height - scrollBarHeight - scrollBarMargin.bottom
      else
        scrollBarPosition.value = withTiming(
          event.absoluteY - scrollBarHeight / 2,
          { duration: 150 }
        )
    })
    .onChange((event) => {
      if (textHeight < height) return

      if (event.absoluteY - scrollBarHeight / 2 < scrollBarMargin.top)
        scrollBarPosition.value = scrollBarMargin.top
      else if (
        event.absoluteY - scrollBarHeight / 2 >
        height - scrollBarHeight - scrollBarMargin.bottom
      )
        scrollBarPosition.value =
          height - scrollBarHeight - scrollBarMargin.bottom
      else scrollBarPosition.value = event.absoluteY - scrollBarHeight / 2
    })
    .onFinalize((event) => {
      if (textHeight < height) return

      // Fling!
      if (Math.abs(event.velocityY) > 700) {
        scrollBarPosition.value = withDecay(
          {
            deceleration: 0.98,
            velocity: event.velocityY,
            clamp: [
              scrollBarMargin.top,
              height - scrollBarHeight - scrollBarMargin.bottom,
            ],
          }
          // () => {
          //   scrollBarActivate.value = withTiming(0, { duration: 250 })
          // }
        )
        scrollBarActivate.value = withDelay(
          100,
          withTiming(0, { duration: 250 })
        )
      } else {
        scrollBarActivate.value = withTiming(0, { duration: 250 })
      }

      runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
    })

  function scrollTo(offset: number) {
    scrollViewRef.current?.scrollTo({ y: offset, animated: false })
  }

  useDerivedValue(() => {
    if (scrollBarActivate.value > 0 && verseOffsets) {
      // This shit is crazy. Thanks chat gpt.
      const normalizedFingerPos =
        (scrollBarPosition.value - scrollBarMargin.top) /
        (usableHeight - scrollBarHeight)

      runOnJS(scrollTo)(normalizedFingerPos * (textHeight - height))
    }
  })

  const scrollBarAreaStyles = useAnimatedStyle(() => ({
    transform: [
      // { translateY: scrollBarPosition.value },
      { translateX: textTranslateX.value },
    ],
  }))

  const restColor = colors.id === 'dark' ? colors.bg3 : colors.p3

  const scrollBarStyles = useAnimatedStyle(() => {
    return {
      height: scrollBarHeight,
      opacity:
        activeChapterIndex.index === 0
          ? 0
          : interpolate(scrollBarActivate.value, [-1, 0], [0, 1]),
      backgroundColor:
        scale.value !== 1
          ? interpolateColor(scale.value, [1, 2], [restColor, colors.p1])
          : interpolateColor(
              scrollBarActivate.value,
              [0, 1],
              [restColor, colors.p1]
            ),
      transform: [
        {
          translateY: interpolate(
            scrollBarPosition.value,
            [0, height - scrollBarHeight],
            [0, height - scrollBarHeight],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          ),
        },
        {
          scale: scale.value,
        },
      ],
    }
  })

  const verseNumStyles = useAnimatedStyle(() => {
    return {
      opacity: scrollBarActivate.value,
    }
  })

  return (
    <>
      <GestureDetector gesture={scrollPanGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 0,
              top: 0,
              height: height,
              width: scrollBarWidth * 1.5,
              zIndex: 3,
              alignItems: 'flex-end',
            },
            scrollBarAreaStyles,
          ]}
        >
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[
              {
                width: scrollBarWidth,
                borderRadius: br.fu,
                zIndex: 5,
                alignItems: 'center',
                justifyContent: 'center',
                display: textHeight < height ? 'none' : 'flex',
                ...shadow,
              },
              scrollBarStyles,
            ]}
          />
        </Animated.View>
      </GestureDetector>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          position: 'absolute',
          top: currentVerseReq - 32,
        }}
        pointerEvents="none"
      >
        <Animated.View
          style={[
            verseNumStyles,
            {
              alignItems: 'center',
              justifyContent: 'center',
              gap: sp.xs,
            },
          ]}
        >
          {verseOffsets?.length !== 1 ? (
            <Text
              style={[
                sans(tx.tiny, 'b', 'c', colors.p2),
                // { fontFamily: 'iAWriterMonoS-Bold' },
              ]}
            >
              Verse
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: sp.sm,
            }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                sans(tx.massive, 'b', 'c', colors.p1),
                { fontFamily: 'iAWriterMonoS-Bold' },
              ]}
            >
              {verseText}
            </Text>
          </View>
        </Animated.View>
      </View>
    </>
  )
}
