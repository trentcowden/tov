import { Ionicons } from '@expo/vector-icons'
import { BlurView } from '@react-native-community/blur'
import { impactAsync } from 'expo-haptics'
import React, { useRef, useState } from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Markdown from 'react-native-markdown-display'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import bible from './bible.json'
import { colors, gutterSize, screenHeight, screenWidth } from './constants'

const overScrollReq = 100
const chapterChangeDuration = 2000
const indicatorSize = 64

export default function Bible() {
  const [activeChapter, setActiveChapter] = useState(0)
  const [topSectionHeight, setTopSectionHeight] = useState<number>(0)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const scroll = useSharedValue(0)
  const prevIndicatorY = useSharedValue(0)
  const nextIndicatorY = useSharedValue(0)
  const abovePrevThreshold = useSharedValue(0)
  const belowNextThreshold = useSharedValue(0)
  const goPrev = useSharedValue(0)
  const goNext = useSharedValue(0)
  const insets = useSafeAreaInsets()
  const bookButtonPos = useSharedValue(0)
  const isDragging = useRef(false)

  const androidShouldGoPrev = useRef(false)
  const androidShouldGoNext = useRef(false)

  const pan = Gesture.Pan()
    .onFinalize((e) => {
      prevIndicatorY.value = withTiming(0)
      nextIndicatorY.value = withTiming(0)

      abovePrevThreshold.value = 0
      belowNextThreshold.value = 0

      const posRelativeToTop = scroll.value
      const posRelativeToBottom = scroll.value + contentHeight - screenHeight

      if (posRelativeToTop < overScrollReq && posRelativeToTop > 0) {
        scroll.value = withSpring(0)
      } else if (
        posRelativeToBottom > -overScrollReq &&
        posRelativeToBottom < 0
      ) {
        scroll.value = withSpring(-contentHeight + screenHeight)
      } else if (Math.abs(e.velocityY) > 100) {
        scroll.value = withDecay({
          velocity: e.velocityY,
          // rubberBandEffect: true,
          // rubberBandFactor: 1,
          deceleration: 0.9993,
          velocityFactor: 0.7,
          // clamp: [-contentHeight + screenHeight, 0],
        })
      }

      if (scroll.value > overScrollReq) goPrev.value = 1
      else if (scroll.value + contentHeight - screenHeight < -overScrollReq)
        goNext.value = 1
    })
    .onChange((e) => {
      scroll.value += e.changeY
      if (scroll.value > 0) {
        prevIndicatorY.value = scroll.value
        if (scroll.value < overScrollReq) abovePrevThreshold.value = 0
        else if (
          scroll.value > overScrollReq &&
          abovePrevThreshold.value === 0
        ) {
          abovePrevThreshold.value = 1
          abovePrevThreshold.value = withSequence(
            withTiming(1.3, {
              duration: 100,
            }),
            withSpring(1, { overshootClamping: false, damping: 3, mass: 0.5 })
          )
        }
      } else if (scroll.value < -contentHeight + screenHeight) {
        const relativeValue = scroll.value + contentHeight - screenHeight

        nextIndicatorY.value = relativeValue

        if (relativeValue > -overScrollReq) belowNextThreshold.value = 0
        else if (
          relativeValue < -overScrollReq &&
          belowNextThreshold.value === 0
        ) {
          belowNextThreshold.value = 1
          belowNextThreshold.value = withSequence(
            withTiming(1.3, {
              duration: 100,
            }),
            withSpring(1, { overshootClamping: false, damping: 3, mass: 0.5 })
          )
        }
      }
    })

  // Transform styles for the chapter.
  const chapterAStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scroll.value }],
    }
  })

  const showPrevAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: abovePrevThreshold.value !== 0 ? colors.p1 : colors.p3,
      opacity:
        abovePrevThreshold.value !== 0
          ? 1
          : interpolate(prevIndicatorY.value, [0, overScrollReq], [0, 0.7]),
      transform: [
        {
          translateY: Math.min(prevIndicatorY.value, overScrollReq),
        },
        {
          scale:
            abovePrevThreshold.value !== 0
              ? abovePrevThreshold.value
              : interpolate(
                  prevIndicatorY.value,
                  [0, overScrollReq],
                  [0.8, 1],
                  'clamp'
                ),
        },
      ],
    }
  })

  const showNextAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: belowNextThreshold.value !== 0 ? colors.p1 : colors.p3,
      opacity:
        belowNextThreshold.value !== 0
          ? 1
          : interpolate(nextIndicatorY.value, [-overScrollReq, 0], [0.7, 0]),
      transform: [
        {
          translateY: Math.max(-overScrollReq, nextIndicatorY.value),
        },
        {
          scale:
            belowNextThreshold.value !== 0
              ? belowNextThreshold.value
              : interpolate(
                  nextIndicatorY.value,
                  [-overScrollReq, 0],
                  [1, 0.8],
                  'clamp'
                ),
        },
      ],
    }
  })

  useDerivedValue(() => {
    if (belowNextThreshold.value === 1 || abovePrevThreshold.value === 1) {
      runOnJS(impactAsync)()
    }
  }, [])

  function goToPreviousChapter() {
    setActiveChapter((current) => current - 1)
  }

  function goToNextChapter() {
    setActiveChapter((current) => current + 1)
  }

  useDerivedValue(() => {
    if (goPrev.value === 1) {
      scroll.value = withSequence(
        withTiming(screenHeight, { duration: 2000 }),
        withTiming(
          -contentHeight,
          { duration: 0 },
          runOnJS(goToPreviousChapter)
        ),
        withTiming(-contentHeight + screenHeight, { duration: 2000 })
      )

      goPrev.value = 0
    }
  }, [screenHeight, contentHeight])

  // useDerivedValue(
  //   () => console.log(scroll.value, contentHeight, screenHeight),
  //   [contentHeight, screenHeight]
  // )

  useDerivedValue(() => {
    if (goNext.value === 1) {
      scroll.value = withSequence(
        withTiming(-contentHeight, {
          duration: 200,
        }),
        withTiming(screenHeight, { duration: 0 }, runOnJS(goToNextChapter)),
        withTiming(0, { duration: 200 })
      )

      goNext.value = 0
    }
  }, [screenHeight, contentHeight])

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg1 }}>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[{ flex: 1, paddingHorizontal: gutterSize }, chapterAStyles]}
        >
          <View onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}>
            <View
              style={{
                height: insets.top + indicatorSize + 16,
              }}
            />
            <Markdown
              style={{
                body: {
                  fontFamily: 'iAWriter',
                  color: colors.fg1,
                  fontSize: 18,
                  lineHeight: 28,
                },
                heading2: {
                  fontSize: 24,
                  marginTop: 16,
                },
                code_inline: {
                  fontSize: 20,
                  backgroundColor: undefined,
                  color: colors.s,
                },
              }}
            >
              {bible[activeChapter].markdown}
            </Markdown>
            <View style={{ height: insets.bottom + indicatorSize + 16 }} />
          </View>
        </Animated.View>
      </GestureDetector>
      <View
        style={{
          width: '100%',
          position: 'absolute',
          top: insets.top,
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              borderRadius: 9999,
              width: 64,
              height: 64,
              alignItems: 'center',
              justifyContent: 'center',
            },
            showPrevAnimatedStyles,
          ]}
        >
          <Ionicons name="arrow-up" size={32} color={colors.fg1} />
        </Animated.View>
      </View>
      <View
        style={{
          width: '100%',
          position: 'absolute',
          bottom: insets.bottom,
          alignItems: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              borderRadius: 9999,
              width: 64,
              height: 64,
              alignItems: 'center',
              justifyContent: 'center',
            },
            showNextAnimatedStyles,
          ]}
        >
          <Ionicons name="arrow-down" size={32} color={colors.fg1} />
        </Animated.View>
      </View>

      <BlurView
        blurType={Platform.OS === 'android' ? 'light' : 'regular'}
        style={{
          width: screenWidth - gutterSize * 2,
          alignSelf: 'center',
          position: 'absolute',
          top: gutterSize + insets.top,
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: topSectionHeight / 2,
        }}
        onLayout={(event) => {
          setTopSectionHeight(event.nativeEvent.layout.height)
        }}
      >
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            // paddingVertical: gutterSize / 2,
            borderRadius: 999,
            // backgroundColor: props.screen === 'bible' ? colors.bg3 : colors.p1,
            paddingHorizontal: gutterSize,
            paddingVertical: gutterSize / 1.5,
            flex: 1,
            height: '100%',
          }}
          onPress={() => {
            // setModalBook(activeChapter.id.split('.')[0] as BookId)
            // setShowChapterSelectModal(true)
          }}
        >
          <Text
            style={{
              textDecorationLine: 'underline',
            }}
          >
            {bible[activeChapter].chapter_id}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {}}
          style={{
            position: 'absolute',
            right: gutterSize / 2,
            height: '100%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="settings" size={20} color={colors.fg3} />
        </TouchableOpacity>
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg3,
  },
  dotContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
})
