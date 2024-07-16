import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { RefObject, useEffect, useMemo, useState } from 'react'
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gutterSize, panActivateConfig, sizes, typography } from '../constants'
import { getEdges } from '../functions/utils'
import useColors from '../hooks/useColors'

interface Props {
  verseOffsets: number[] | undefined
  scrollBarActivate: SharedValue<number>
  scrollViewRef: RefObject<ScrollView>
  textTranslateX: SharedValue<number>
  scrollBarPosition: SharedValue<number>
  currentVerseIndex: SharedValue<number | 'bottom' | 'top'>
}

const scrollBarWidth = gutterSize / 3

export default function ScrollBar({
  verseOffsets,
  scrollBarActivate,
  scrollViewRef,
  textTranslateX,
  scrollBarPosition,
  currentVerseIndex,
}: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()
  const currentVerseReq = height / 3
  const { top, bottom } = getEdges(insets)

  const usableHeight = height - top - bottom * 2
  const textHeight = verseOffsets
    ? verseOffsets[verseOffsets.length - 1]
    : height
  const [verseText, setVerseText] = React.useState<string>('')
  const pop = useSharedValue(0)

  const [scrollBarHeight, setScrollBarHeight] = useState(
    usableHeight * (usableHeight / textHeight)
  )

  useEffect(() => {
    if (verseOffsets)
      setScrollBarHeight(usableHeight * (usableHeight / textHeight))
  }, [verseOffsets])

  const relativeVerseOffsets = useMemo<number[] | undefined>(() => {
    if (!verseOffsets) return

    return verseOffsets.map(
      (verseOffset) => (verseOffset / textHeight) * usableHeight
    )
  }, [verseOffsets])

  useDerivedValue(() => {
    if (scrollBarActivate.value === 1)
      runOnJS(impactAsync)(ImpactFeedbackStyle.Light)

    if (verseOffsets?.length === 1) runOnJS(setVerseText)('')
    else
      runOnJS(setVerseText)(
        currentVerseIndex.value === 'bottom'
          ? 'End'
          : currentVerseIndex.value === 'top'
            ? 'Beginning'
            : `Verse ${(currentVerseIndex.value + 1).toString()}`
      )
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
        height - scrollBarHeight - bottom * 2
      )
        scrollBarPosition.value = height - scrollBarHeight - bottom * 2
      else scrollBarPosition.value = event.absoluteY - scrollBarHeight / 2
    })
    .onChange((event) => {
      if (textHeight < height) return

      if (event.absoluteY - scrollBarHeight / 2 < top)
        scrollBarPosition.value = top
      else if (
        event.absoluteY - scrollBarHeight / 2 >
        height - scrollBarHeight - bottom * 2
      )
        scrollBarPosition.value = height - scrollBarHeight - bottom * 2
      else scrollBarPosition.value = event.absoluteY - scrollBarHeight / 2
    })
    .onFinalize((event) => {
      if (textHeight < height) return

      runOnJS(impactAsync)(ImpactFeedbackStyle.Light)

      scrollBarActivate.value = withTiming(0, { duration: 250 })
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

  const scrollBarStyles = useAnimatedStyle(() => ({
    height: scrollBarHeight,
    opacity: interpolate(scrollBarActivate.value, [-1, 0], [0, 1]),
    backgroundColor: interpolateColor(
      scrollBarActivate.value,
      [0, 1],
      [colors.ph, colors.p1]
    ),
    transform: [
      // {
      //   scale: interpolate(scrollBarActivate.value, [0, 1], [1, 0.9]),
      // },
      { translateY: scrollBarPosition.value },
    ],
  }))

  const verseNumStyles = useAnimatedStyle(() => {
    return {
      opacity: scrollBarActivate.value,
    }
  })

  // useEffect(() => {
  //   if (!going)
  //     scrollBarActivate.value = withDelay(200, withTiming(0, { duration: 500 }))
  // }, [going])

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
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            top: top,
            height: usableHeight,
            zIndex: 1,
            width: scrollBarWidth,
          },
          verseNumberStyles,
        ]}
        pointerEvents={'none'}
      >
        <View style={{ height: '100%' }}>
          {relativeVerseOffsets?.slice(0, -1).map((offset, index) => {
            return (
              <View
                key={offset * index}
                style={{
                  width: scrollBarWidth,
                  // height: verseHeight,
                  position: 'absolute',
                  top: offset,
                }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    ...typography(7, 'uil', 'c', colors.fg3),
                    // width: verseColumnWidth,
                  }}
                >
                  {index + 1}
                </Text>
              </View>
            )
          })}
        </View>
      </Animated.View>
      <GestureDetector gesture={scrollPanGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              // right: -scrollBarWidth * 3,
              right: 0,
              top: 0,
              height: height,
              width: scrollBarWidth * 3,
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
            style={[typography(sizes.massive, 'uib', 'c', colors.p1)]}
          >
            {verseText}
          </Text>
        </Animated.View>
      </View>
    </>
  )
}
