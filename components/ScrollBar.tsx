import React, { RefObject, useEffect, useMemo } from 'react'
import { Text, View } from 'react-native'
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, screenHeight, type } from '../constants'
import { useAppSelector } from '../redux/hooks'

interface Props {
  verseOffsets: number[] | undefined
  scrollBarActivate: SharedValue<number>
  scrollViewRef: RefObject<ScrollView>
  textTranslateX: SharedValue<number>
  textTranslateY: SharedValue<number>
  scrollBarPosition: SharedValue<number>
}

export default function ScrollBar({
  verseOffsets,
  scrollBarActivate,
  scrollViewRef,
  textTranslateX,
  textTranslateY,
  scrollBarPosition,
}: Props) {
  const insets = useSafeAreaInsets()
  const startingOffset = useSharedValue(0)
  const going = useAppSelector((state) => state.activeChapterIndex.going)
  const usableHeight = screenHeight - insets.top - insets.bottom

  const relativeVerseOffsets = useMemo<number[] | undefined>(() => {
    if (!verseOffsets) return undefined

    const textHeight = verseOffsets[verseOffsets.length - 1]

    return verseOffsets.map(
      (verseOffset) => (verseOffset / textHeight) * usableHeight
    )
  }, [verseOffsets])

  const scrollBarHeight = useMemo(() => {
    if (!verseOffsets) return 0
    const usableHeight = screenHeight - insets.top - insets.bottom
    const textHeight = verseOffsets[verseOffsets.length - 1]

    return usableHeight * (usableHeight / textHeight)
  }, [verseOffsets])

  const verseNumberColumns = verseOffsets
    ? Math.ceil(verseOffsets.length / 25)
    : 0
  const verseColumnWidth = 24

  const scrollPanGesture = Gesture.Pan()
    .onBegin((event) => {
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return

      scrollBarActivate.value = withTiming(1)
      startingOffset.value = event.y
      scrollBarPosition.value = event.absoluteY - startingOffset.value
    })
    .onChange((event) => {
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return

      if (event.absoluteY - startingOffset.value < insets.top)
        scrollBarPosition.value = insets.top
      else if (
        event.absoluteY - startingOffset.value >
        screenHeight - scrollBarHeight - insets.bottom
      )
        scrollBarPosition.value = screenHeight - scrollBarHeight - insets.bottom
      else scrollBarPosition.value = event.absoluteY - startingOffset.value
    })
    .onFinalize((event) => {
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return

      scrollBarActivate.value = withTiming(0)
    })

  function scrollTo(offset: number) {
    scrollViewRef.current?.scrollTo({ y: offset, animated: false })
  }

  useDerivedValue(() => {
    if (scrollBarActivate.value > 0 && verseOffsets) {
      // This shit is crazy. Thanks chat gpt.
      const normalizedFingerPos =
        (scrollBarPosition.value - insets.top) /
        (usableHeight - scrollBarHeight)

      const textHeight = verseOffsets[verseOffsets.length - 1]

      runOnJS(scrollTo)(normalizedFingerPos * (textHeight - screenHeight))
    }
  })

  const verseNumberStyles = useAnimatedStyle(() => ({
    opacity: scrollBarActivate.value,
    transform: [
      {
        translateX: interpolate(
          scrollBarActivate.value,
          [0, 1],
          [0, -gutterSize * 4]
        ),
      },
    ],
  }))

  const scrollBarStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: scrollBarPosition.value,
      },
    ],
    opacity: interpolate(scrollBarActivate.value, [-1, 0, 1], [0, 0.25, 0]),
  }))

  const scrollBarActiveStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scrollBarPosition.value,
        },
        {
          translateX: interpolate(
            scrollBarActivate.value,
            [0, 1],
            [gutterSize * 4, 0]
          ),
        },
      ],
      opacity: scrollBarActivate.value,
    }
  })

  useEffect(() => {
    if (!going)
      scrollBarActivate.value = withDelay(200, withTiming(0, { duration: 500 }))
  }, [going])

  return (
    <>
      <GestureDetector gesture={scrollPanGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 0,
              width: gutterSize * 1.5,
              alignItems: 'flex-end',
              borderColor: 'green',
            },
            scrollBarStyles,
          ]}
        >
          <View
            style={[
              {
                // width: gutterSize,
                width: 4,
                borderRadius: 2,
                height: scrollBarHeight,
                backgroundColor: colors.fg1,
                zIndex: 5,
                display:
                  verseOffsets &&
                  verseOffsets[verseOffsets.length - 1] < screenHeight
                    ? 'none'
                    : 'flex',
              },
            ]}
          />
        </Animated.View>
      </GestureDetector>
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            width: gutterSize * 4,
            height: scrollBarHeight,
            zIndex: 20,
            backgroundColor: colors.fg1,
            borderRadius: gutterSize,
          },
          scrollBarActiveStyles,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: 0,
            top: insets.top,
            height: screenHeight - insets.top - insets.bottom,
            zIndex: 10,
            width: verseColumnWidth * verseNumberColumns,
            borderRadius: 16,
            backgroundColor: colors.bg2,
            // alignItems: 'center',
          },
          verseNumberStyles,
        ]}
        pointerEvents={'none'}
      >
        {relativeVerseOffsets?.slice(0, -1).map((offset, index) => {
          return (
            <View
              key={offset}
              style={{
                width: verseColumnWidth,
                position: 'absolute',
                top: offset,
                left: (index % verseNumberColumns) * verseColumnWidth,
                // justifyContent: 'center',
                // alignItems: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  ...type(12, 'uib', 'c', colors.fg2),
                  // width: verseColumnWidth,
                }}
              >
                {index + 1}
              </Text>
              {/* <View
                style={{
                  position: 'absolute',
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.bg3,
                }}
              /> */}
            </View>
          )
        })}
        {/* <View
          style={{
            position: 'absolute',
            height: screenHeight,
            width: 2,
            left: verseNumbersWidth / 2 - 1,
            backgroundColor: colors.bg3,
          }}
        /> */}
      </Animated.View>
    </>
  )
}
