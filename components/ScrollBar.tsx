import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { RefObject } from 'react'
import { Text, View, useWindowDimensions } from 'react-native'
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler'
import Animated, {
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
  shadow,
  sizes,
  typography,
} from '../constants'
import { getEdges } from '../functions/utils'
import useColors from '../hooks/useColors'

interface Props {
  verseOffsets: number[] | undefined
  scrollBarActivate: SharedValue<number>
  scrollViewRef: RefObject<ScrollView>
  textTranslateX: SharedValue<number>
  scrollBarPosition: SharedValue<number>
  currentVerseIndex: SharedValue<number | 'bottom' | 'top'>
  currentVerseIndexNum: SharedValue<number>
}

export default function ScrollBar({
  verseOffsets,
  scrollBarActivate,
  scrollViewRef,
  textTranslateX,
  scrollBarPosition,
  currentVerseIndex,
  currentVerseIndexNum,
}: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const currentVerseReq = height / 3
  const { top, bottom } = getEdges(insets)

  const usableHeight = height - top - bottom * 1.5
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
      if (event.absoluteY - scrollBarHeight / 2 < top)
        scrollBarPosition.value = top
      else if (
        event.absoluteY - scrollBarHeight / 2 >
        height - scrollBarHeight - bottom * 1.5
      )
        scrollBarPosition.value = height - scrollBarHeight - bottom * 1.5
      else
        scrollBarPosition.value = withTiming(
          event.absoluteY - scrollBarHeight / 2,
          { duration: 150 }
        )
    })
    .onChange((event) => {
      if (textHeight < height) return

      if (event.absoluteY - scrollBarHeight / 2 < top)
        scrollBarPosition.value = top
      else if (
        event.absoluteY - scrollBarHeight / 2 >
        height - scrollBarHeight - bottom * 1.5
      )
        scrollBarPosition.value = height - scrollBarHeight - bottom * 1.5
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
            clamp: [top, height - scrollBarHeight - bottom * 1.5],
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
        (scrollBarPosition.value - top) / (usableHeight - scrollBarHeight)

      runOnJS(scrollTo)(normalizedFingerPos * (textHeight - height))
    }
  })

  const scrollBarAreaStyles = useAnimatedStyle(() => ({
    transform: [
      // { translateY: scrollBarPosition.value },
      { translateX: textTranslateX.value },
    ],
  }))

  const scrollBarStyles = useAnimatedStyle(() => {
    return {
      height: scrollBarHeight,
      opacity: interpolate(scrollBarActivate.value, [-1, 0], [0, 1]),
      backgroundColor: interpolateColor(
        scrollBarActivate.value,
        [0, 1],
        [colors.bg3, colors.p1]
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
      ],
    }
  })

  const verseNumStyles = useAnimatedStyle(() => {
    return {
      opacity: scrollBarActivate.value,
    }
  })

  const verseNumberStyles = useAnimatedStyle(() => ({
    opacity: scrollBarActivate.value,
    transform: [
      {
        translateX: interpolate(scrollBarActivate.value, [0, 1], [6, 0]),
      },
    ],
  }))

  return (
    <>
      <GestureDetector gesture={scrollPanGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              // right: -scrollBarWidth * 3,
              right: 0,
              top: 0,
              height: height,
              width: scrollBarWidth * 1.5,
              // alignItems: 'flex-end',
              // justifyContent: 'center',
              zIndex: 3,
              alignItems: 'flex-end',
            },
            scrollBarAreaStyles,
          ]}
        >
          <Animated.View
            style={[
              {
                // width: gutterSize,
                width: scrollBarWidth,
                borderRadius: 999,
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
          top: currentVerseReq,
        }}
        pointerEvents="none"
      >
        <Animated.View
          style={[
            verseNumStyles,
            {
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              typography(sizes.massive, 'uib', 'c', colors.p1),
              { fontFamily: 'iAWriterMonoS-Bold' },
            ]}
          >
            {verseText}
          </Text>
        </Animated.View>
      </View>
    </>
  )
}
