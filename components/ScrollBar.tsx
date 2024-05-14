import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { RefObject, useEffect, useMemo, useRef } from 'react'
import { View } from 'react-native'
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  colors,
  gutterSize,
  panActivateConfig,
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
  currentVerseIndex: SharedValue<number | 'bottom' | 'top'>
}

const verseHeight = 24
const scrollBarSmall = 8
export default function ScrollBar({
  verseOffsets,
  scrollBarActivate,
  scrollViewRef,
  textTranslateX,
  textTranslateY,
  overScrollAmount,
  scrollBarPosition,
  openNavigator,
  currentVerseIndex,
}: Props) {
  const insets = useSafeAreaInsets()
  const startingOffset = useSharedValue(0)
  const going = useAppSelector((state) => state.activeChapterIndex.transition)
  const usableHeight = screenHeight - insets.top * 1 - insets.bottom * 2
  const recentOffset = useRef<number>()
  const [verseText, setVerseText] = React.useState<string>('')
  const pop = useSharedValue(0)
  const relativeVerseOffsets = useMemo<number[] | undefined>(() => {
    if (!verseOffsets) return undefined

    const textHeight = verseOffsets[verseOffsets.length - 1]

    return verseOffsets.map(
      (verseOffset) => (verseOffset / textHeight) * usableHeight
    )
  }, [verseOffsets])

  const scrollBarHeight = useMemo(() => {
    if (!verseOffsets) return 0
    const usableHeight = screenHeight - insets.top * 1 - insets.bottom * 2
    const textHeight = verseOffsets[verseOffsets.length - 1]

    return usableHeight * (usableHeight / textHeight)
  }, [verseOffsets])

  useDerivedValue(() => {
    if (scrollBarActivate.value === 1)
      runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
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
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return

      runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
      pop.value = withSequence(
        withTiming(1, { duration: 75 }),
        withSpring(0, panActivateConfig)
      )

      scrollBarActivate.value = withTiming(1, { duration: 250 })
      startingOffset.value = event.y
      scrollBarPosition.value = event.absoluteY - startingOffset.value
    })
    .onChange((event) => {
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return

      if (event.absoluteY - startingOffset.value < insets.top * 1)
        scrollBarPosition.value = insets.top * 1
      else if (
        event.absoluteY - startingOffset.value >
        screenHeight - scrollBarHeight - insets.bottom * 2
      )
        scrollBarPosition.value =
          screenHeight - scrollBarHeight - insets.bottom * 2
      else scrollBarPosition.value = event.absoluteY - startingOffset.value
    })
    .onFinalize((event) => {
      if (verseOffsets && verseOffsets[verseOffsets.length - 1] < screenHeight)
        return
      runOnJS(impactAsync)(ImpactFeedbackStyle.Light)

      scrollBarActivate.value = withTiming(0, { duration: 250 })
    })

  function scrollTo(offset: number) {
    scrollViewRef.current?.scrollTo({ y: offset, animated: false })
  }

  // useDerivedValue(() => {
  //   if (scrollBarActivate.value <= 0 || !relativeVerseOffsets) return
  //   let closestOffset = offsets[0];
  //   let minDiff = Math.abs(scrollPosition - closestOffset);

  //   for (let i = 1; i < offsets.length; i++) {
  //       const diff = Math.abs(scrollPosition - offsets[i]);
  //       if (diff < minDiff) {
  //           minDiff = diff;
  //           closestOffset = offsets[i];
  //       }
  //   }
  //   // const posToUse = scrollBarPosition.value - insets.top
  //   // let closest = 0

  //   // let left = 0
  //   // let right = relativeVerseOffsets.length - 1

  //   // while (left <= right) {
  //   //   const mid = Math.floor((left + right) / 2)
  //   //   const offset = relativeVerseOffsets[mid]

  //   //   if (offset === posToUse) {
  //   //     closest = offset
  //   //   } else if (offset < posToUse) {
  //   //     left = mid + 1
  //   //   } else {
  //   //     right = mid - 1
  //   //   }
  //   // }

  //   // // At this point, `left` is the index of the smallest value greater than scrollbarPosition,
  //   // // and `right` is the index of the largest value smaller than scrollbarPosition.
  //   // // We need to compare which one is closer.

  //   // if (right < 0) {
  //   //   closest = relativeVerseOffsets[left]
  //   // } else if (left >= relativeVerseOffsets.length) {
  //   //   closest = relativeVerseOffsets[right]
  //   // } else {
  //   //   const diffLeft = Math.abs(posToUse - relativeVerseOffsets[left])
  //   //   const diffRight = Math.abs(posToUse - relativeVerseOffsets[right])
  //   //   closest =
  //   //     diffLeft <= diffRight
  //   //       ? relativeVerseOffsets[left]
  //   //       : relativeVerseOffsets[right]
  //   // }

  //   console.log('verse', relativeVerseOffsets.indexOf(closest))
  // })

  useDerivedValue(() => {
    if (scrollBarActivate.value > 0 && verseOffsets) {
      // This shit is crazy. Thanks chat gpt.
      const normalizedFingerPos =
        (scrollBarPosition.value - insets.top * 1) /
        (usableHeight - scrollBarHeight)

      const textHeight = verseOffsets[verseOffsets.length - 1]

      // let closestOffset = relativeVerseOffsets[0]
      // let minDiff = Math.abs(normalizedFingerPos - closestOffset)

      // for (let i = 1; i < relativeVerseOffsets.length; i++) {
      //   const diff = Math.abs(normalizedFingerPos - relativeVerseOffsets[i])
      //   if (diff < minDiff) {
      //     minDiff = diff
      //     closestOffset = relativeVerseOffsets[i]
      //   }
      // }

      // console.log(
      //   'Found closest offset:',
      //   closestOffset,
      //   'at index',
      //   relativeVerseOffsets.indexOf(closestOffset)
      // )

      runOnJS(scrollTo)(normalizedFingerPos * (textHeight - screenHeight))
      // runOnJS(scrollTo)(
      //   verseOffsets[relativeVerseOffsets.indexOf(closest)] - currentVerseReq
      // )
    }
  })

  const scrollBarAreaStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: scrollBarPosition.value,
      },
    ],
  }))

  const scrollBarStyles = useAnimatedStyle(() => ({
    height: scrollBarHeight,
    // scrollBarActivate.value === 0
    //   ? scrollBarHeight
    //   : interpolate(
    //       scrollBarActivate.value,
    //       [0, 1],
    //       [scrollBarHeight, scrollBarSmall]
    //     ),
    opacity:
      openNavigator.value !== 0
        ? interpolate(openNavigator.value, [0, 1], [1, 0.5])
        : interpolate(scrollBarActivate.value, [-1, 0], [0, 1]),
    backgroundColor: interpolateColor(
      scrollBarActivate.value,
      [0, 1],
      [colors.bg3, colors.p1]
    ),
    // width: interpolate(
    //   scrollBarActivate.value,
    //   [0, 1],
    //   [gutterSize * 0.25, gutterSize * 3],
    //   'clamp'
    // ),
    transform: [
      { translateX: textTranslateX.value },
      {
        scale: interpolate(scrollBarActivate.value, [0, 1], [1, 0.9]),
      },
      // {
      //   translateY: interpolate(
      //     scrollBarActivate.value,
      //     [0, 1],
      //     [0, scrollBarHeight / 2 - scrollBarSmall / 2]
      //   ),
      // },
    ],
  }))

  const verseNumStyles = useAnimatedStyle(() => {
    return {
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
              justifyContent: 'center',
            },
            scrollBarAreaStyles,
          ]}
        >
          <Animated.View
            style={[
              {
                // width: gutterSize,
                width: gutterSize,
                borderRadius: 99,

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
          />
        </Animated.View>
      </GestureDetector>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
        pointerEvents="none"
      >
        <Animated.Text
          style={[
            verseNumStyles,
            typography(sizes.title, 'uib', 'c', colors.p1),
          ]}
        >
          {verseText}
        </Animated.Text>
      </View>
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
    </>
  )
}
