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
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  colors,
  gutterSize,
  screenHeight,
  shadow,
  sizes,
  typography,
} from '../constants'
import { useAppSelector } from '../redux/hooks'

interface Props {
  verseOffsets: number[] | undefined
  scrollBarActivate: SharedValue<number>
  scrollViewRef: RefObject<ScrollView>
  textTranslateX: SharedValue<number>
  textTranslateY: SharedValue<number>
  scrollBarPosition: SharedValue<number>
  overScrollAmount: SharedValue<number>
  openNavigator: SharedValue<number>
}

const verseHeight = 24

export default function ScrollBar({
  verseOffsets,
  scrollBarActivate,
  scrollViewRef,
  textTranslateX,
  textTranslateY,
  overScrollAmount,
  scrollBarPosition,
  openNavigator,
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

      scrollBarActivate.value = withTiming(1, { duration: 150 })
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

      scrollBarActivate.value = withTiming(0, { duration: 150 })
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
        translateX: interpolate(scrollBarActivate.value, [0, 1], [6, 0]),
      },
    ],
  }))

  const scrollBarAreaStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: scrollBarPosition.value,
      },
    ],
  }))

  const scrollBarStyles = useAnimatedStyle(() => ({
    opacity:
      openNavigator.value !== 0
        ? interpolate(openNavigator.value, [0, 1], [1, 0.5])
        : interpolate(scrollBarActivate.value, [-1, 0], [0, 1]),
    backgroundColor: interpolateColor(
      scrollBarActivate.value,
      [0, 1],
      [colors.p1 + '88', colors.p1]
    ),
    width: interpolate(
      scrollBarActivate.value,
      [0, 1],
      [gutterSize * 0.25, gutterSize * 3],
      'clamp'
    ),
    transform: [
      // { scaleX: interpolate(scrollBarActivate.value, [0, 1], [1, 6]) },
      {
        translateX: textTranslateX.value,
      },
    ],
  }))

  const scrollIconStyles = useAnimatedStyle(() => ({
    opacity: scrollBarActivate.value,
    // transform: [
    //   {
    //     translateX: interpolate(
    //       scrollBarActivate.value,
    //       [0, 1],
    //       [-gutterSize, -gutterSize - 6]
    //     ),
    //   },
    // ],
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
              justifyContent: 'center',
            },
            scrollBarAreaStyles,
          ]}
        >
          <Animated.View
            style={[
              {
                // width: gutterSize,
                width: gutterSize / 2,
                borderRadius: 99,
                height: scrollBarHeight,
                zIndex: 5,
                alignItems: 'center',
                justifyContent: 'center',
                display:
                  verseOffsets &&
                  verseOffsets[verseOffsets.length - 1] < screenHeight
                    ? 'none'
                    : 'flex',
                ...shadow,
              },
              scrollBarStyles,
            ]}
          >
            <Animated.View
              pointerEvents={'none'}
              style={[
                {
                  // alignSelf: 'center',
                  // position: 'absolute',
                  // width: '100%',
                  // alignItems: 'center',
                  // justifyContent: 'center',
                },
                scrollIconStyles,
              ]}
            >
              {/* <TovIcon name="scroll" size={64} color={colors.fg3} /> */}
            </Animated.View>
            {/* <TovIcon name="scroll" size={64} color={colors.fg3} /> */}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      {/* <Animated.View
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
      </Animated.View> */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            right: verseColumnWidth * 2,
            // top: insets.top,
            top: insets.top,
            height: screenHeight - insets.bottom - insets.top - gutterSize / 2,
            // height: screenHeight,
            zIndex: 5,
            // width: activeScrollBarWidth,
            width: verseColumnWidth,
            // backgroundColor: colors.bg2,
            // paddingTop: insets.top,
            // paddingBottom: insets.bottom,
            // alignItems: 'center',
            ...shadow,
          },
          verseNumberStyles,
        ]}
        pointerEvents={'none'}
      >
        <View
          style={{
            position: 'absolute',
            backgroundColor: colors.bg2,
            // top: gutterSize / 2,
            width: verseColumnWidth,
            borderRadius: 99,
            height: screenHeight - insets.bottom - insets.top,
          }}
        />
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
                    ...typography(sizes.tiny, 'uib', 'c', colors.p1),
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
