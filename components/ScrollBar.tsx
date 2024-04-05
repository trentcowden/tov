import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { RefObject, useEffect, useMemo, useRef } from 'react'
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
  overScrollAmount: SharedValue<number>
}

const activeScrollBarWidth = gutterSize * 5
const verseHeight = 24

export default function ScrollBar({
  verseOffsets,
  scrollBarActivate,
  scrollViewRef,
  textTranslateX,
  textTranslateY,
  overScrollAmount,
  scrollBarPosition,
}: Props) {
  const insets = useSafeAreaInsets()
  const startingOffset = useSharedValue(0)
  const going = useAppSelector((state) => state.activeChapterIndex.transition)
  const usableHeight = screenHeight - insets.top - insets.bottom
  const recentOffset = useRef<number>()

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

  // useEffect(() => {
  //   recentOffset.current = undefined
  // }, [relativeVerseOffsets])

  const verseNumberColumns = verseOffsets
    ? Math.ceil(verseOffsets.length / 25)
    : 0
  // const verseColumnWidth = activeScrollBarWidth / 4
  const verseColumnWidth = gutterSize * 1.5

  const scrollPanGesture = Gesture.Pan()
    .onBegin((event) => {
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return

      runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)

      scrollBarActivate.value = withTiming(1)
      startingOffset.value = event.y
      scrollBarPosition.value = event.absoluteY - startingOffset.value
    })
    .onChange((event) => {
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return

      // runOnJS(selectionAsync)()

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
      runOnJS(impactAsync)(ImpactFeedbackStyle.Light)

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
    // transform: [
    //   {
    //     translateX: interpolate(
    //       scrollBarActivate.value,
    //       [0, 1],
    //       [verseColumnWidth, 0]
    //     ),
    //   },
    // ],
  }))

  const scrollBarStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: scrollBarPosition.value,
      },
      {
        translateX: textTranslateX.value,
      },
    ],
    opacity: interpolate(scrollBarActivate.value, [-1, 0, 1], [0, 1, 0]),
    // backgroundColor: interpolateColor(
    //   overScrollAmount.value,
    //   [-overScrollReq, -overScrollReq + 1, 0, overScrollReq - 1, overScrollReq],
    //   [colors.v, colors.bg2, colors.bg3, colors.bg2, colors.v]
    // ),
  }))

  const scrollBarActiveStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scrollBarPosition.value,
        },
        // {
        //   translateX: interpolate(
        //     scrollBarActivate.value,
        //     [0, 1],
        //     [activeScrollBarWidth / 2, 0]
        //   ),
        // },
      ],
      opacity: interpolate(scrollBarActivate.value, [0, 1], [0, 1]),
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
                width: gutterSize / 2,
                borderRadius: 99,
                height: scrollBarHeight,
                backgroundColor: colors.bg3,
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
            width: verseColumnWidth * 2,
            height: scrollBarHeight,
            zIndex: 20,
            backgroundColor: colors.fg3,
            borderRadius: 99,
            justifyContent: 'center',
            paddingLeft: 4,
          },
          scrollBarActiveStyles,
        ]}
        pointerEvents={'none'}
      >
        {/* <FontAwesome5 name="long-arrow-alt-left" size={16} color={colors.bg3} /> */}
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: verseColumnWidth * 2,
            // top: insets.top,
            top: 0,
            // height: screenHeight - insets.top - insets.bottom,
            height: screenHeight,
            zIndex: 2,
            // width: activeScrollBarWidth,
            width: verseColumnWidth,
            // borderRadius: 8,
            backgroundColor: colors.bg2,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            // alignItems: 'center',
          },
          verseNumberStyles,
        ]}
        pointerEvents={'none'}
      >
        <View style={{ height: '100%' }}>
          {relativeVerseOffsets?.slice(0, -1).map((offset, index) => {
            if (index === 0) {
              recentOffset.current = undefined
            }

            if (
              recentOffset.current &&
              offset - recentOffset.current < verseHeight
            ) {
              return null
            }

            recentOffset.current = offset

            return (
              <View
                key={offset}
                style={{
                  width: verseColumnWidth,
                  height: verseHeight,
                  position: 'absolute',
                  top: offset,
                  // borderTopWidth: 1,
                  // left: (index % 2) * verseColumnWidth,
                  // justifyContent: 'center',
                  // alignItems: 'center',
                }}
              >
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    ...type(12, 'uib', 'c', colors.fg3),
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
        </View>
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
