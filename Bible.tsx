import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { impactAsync } from 'expo-haptics'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native'
import {
  Gesture,
  GestureDetector,
  TextInput,
} from 'react-native-gesture-handler'
import Animated, {
  Extrapolation,
  interpolate,
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
import Spacer from './Spacer'
import bible from './bible.json'
import { Bible, Chapter } from './bibleTypes'
import ChapterOverlay from './components/ChapterOverlay'
import History from './components/History'
import Navigator from './components/Navigator'
import {
  chapterChangeDuration,
  colors,
  gutterSize,
  horizTransReq,
  horizVelocReq,
  overScrollReq,
  screenHeight,
  type,
  zoomOutReq,
} from './constants'
import { renderFirstLevelText } from './functions/renderBible'

export interface NavigatorChapterItem {
  item: { item: string | Chapter }
}

export default function BibleView() {
  const [activeChapter, setActiveChapter] = useState<{
    going: 'forward' | 'back'
    index: number
    id: string
  }>({ index: 0, going: 'forward', id: 'GEN.1' })
  const insets = useSafeAreaInsets()
  /**
   * Component refs.
   */
  const searchRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const searchListRef = useRef<FlashList<NavigatorChapterItem>>(null)

  const textTranslateY = useSharedValue(0)
  const textTranslateX = useSharedValue(0)
  const savedTextTranslateX = useSharedValue(0)

  const textPinch = useSharedValue(1)
  const savedTextPinch = useSharedValue(1)
  const textPinchHaptic = useSharedValue(0)

  const goPrev = useSharedValue(0)
  const goNext = useSharedValue(0)

  const [searchText, setSearchText] = useState('')

  const prevIndicatorY = useSharedValue(0)
  const nextIndicatorY = useSharedValue(0)
  const prevIndicatorOpacity = useSharedValue(0)
  const nextIndicatorOpacity = useSharedValue(0)
  const prevIndicatorScale = useSharedValue(0)
  const nextIndicatorScale = useSharedValue(0)
  const [isStatusBarHidden, setIsStatusBarHidden] = useState(false)

  const chapters: Chapter[] = useMemo(() => {
    const nivBible = bible as Bible

    return nivBible.chapters.filter(
      (chapter: Chapter) => chapter.number !== 'intro'
    )
  }, [])

  function focusSearch() {
    searchRef.current?.focus()
  }

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      if (textPinch.value === zoomOutReq) return

      textPinch.value = savedTextPinch.value * e.scale

      if (textPinch.value < zoomOutReq) {
        if (textPinchHaptic.value === 0) {
          textPinchHaptic.value = 1
          runOnJS(impactAsync)()
        }
      } else {
        textPinchHaptic.value = 0
      }
    })
    .onEnd((e) => {
      if (textPinch.value === zoomOutReq) return

      if (e.scale <= zoomOutReq) {
        savedTextPinch.value = zoomOutReq
        textPinch.value = withSpring(zoomOutReq)
        runOnJS(focusSearch)()
      } else {
        savedTextPinch.value = 1
        textPinch.value = withSpring(1)
      }
    })

  const panActivateConfig = { mass: 0.5, damping: 20, stiffness: 140 }

  function showStatusBar() {
    setIsStatusBarHidden(false)
  }
  function hideStatusBar() {
    setIsStatusBarHidden(true)
  }

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (textPinch.value !== 1) return

      textTranslateX.value = savedTextTranslateX.value + event.translationX
    })
    .onFinalize((e) => {
      if (textPinch.value !== 1) return

      const comingFrom =
        savedTextTranslateX.value === 0
          ? 'center'
          : savedTextTranslateX.value > 0
            ? 'left'
            : 'right'

      switch (comingFrom) {
        case 'center':
          if (
            textTranslateX.value < -horizTransReq / 2 ||
            e.velocityX < -horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(showStatusBar)()
            savedTextTranslateX.value = -horizTransReq
            textTranslateX.value = withSpring(-horizTransReq, panActivateConfig)
          } else if (
            textTranslateX.value > horizTransReq / 2 ||
            e.velocityX > horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(showStatusBar)()
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          } else {
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          }
          break
        case 'right':
          if (
            textTranslateX.value > -horizTransReq / 2 ||
            e.velocityX > horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(hideStatusBar)()
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          } else {
            savedTextTranslateX.value = -horizTransReq
            textTranslateX.value = withSpring(-horizTransReq, panActivateConfig)
          }
          break
        case 'left':
          if (
            textTranslateX.value < horizTransReq / 2 ||
            e.velocityX < -horizVelocReq
          ) {
            runOnJS(impactAsync)()
            runOnJS(hideStatusBar)()
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          } else {
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          }
      }
    })

  const composedGestures = Gesture.Simultaneous(pinchGesture, panGesture)

  useEffect(() => {
    if (activeChapter.going === 'forward') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    } else if (activeChapter.going === 'back') {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: false }),
        50
      )
    } else {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false })
    }

    textTranslateY.value = withDelay(
      75,
      withSpring(0, { damping: 20, stiffness: 120 })
    )
  }, [activeChapter])

  function goToNextChapter() {
    setActiveChapter((current) => ({
      going: 'forward',
      id: chapters[current.index + 1].id,
      index: current.index + 1,
    }))
  }
  function goToPreviousChapter() {
    setActiveChapter((current) => ({
      going: 'back',
      id: chapters[current.index - 1].id,
      index: current.index - 1,
    }))
  }

  useDerivedValue(() => {
    if (goPrev.value === 1) {
      textTranslateY.value = withSequence(
        withTiming(screenHeight, { duration: chapterChangeDuration }),
        withTiming(-screenHeight, { duration: 0 }, runOnJS(goToPreviousChapter))
      )

      goPrev.value = 0
    }
  }, [screenHeight])

  useDerivedValue(() => {
    if (goNext.value === 1) {
      textTranslateY.value = withSequence(
        withTiming(-screenHeight, {
          duration: chapterChangeDuration,
        }),
        withTiming(screenHeight, { duration: 0 }, runOnJS(goToNextChapter))
      )

      goNext.value = 0
    }
  }, [screenHeight])

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const contentHeight = event.nativeEvent.contentSize.height

    if (offset < 0) {
      prevIndicatorY.value = offset

      prevIndicatorOpacity.value = interpolate(
        offset,
        [-overScrollReq, 0],
        [1, 0],
        {
          extrapolateLeft: Extrapolation.CLAMP,
          extrapolateRight: Extrapolation.CLAMP,
        }
      )

      prevIndicatorScale.value = interpolate(
        offset,
        [-overScrollReq * 2, -overScrollReq, 0],
        [1.2, 1, 0.5]
      )
    } else if (offset > contentHeight - screenHeight) {
      const relativeValue = offset - contentHeight + screenHeight

      nextIndicatorY.value = relativeValue

      nextIndicatorOpacity.value = interpolate(
        relativeValue,
        [0, overScrollReq],
        [0, 1],
        {
          extrapolateLeft: Extrapolation.CLAMP,
          extrapolateRight: Extrapolation.CLAMP,
        }
      )

      nextIndicatorScale.value = interpolate(
        relativeValue,
        [0, overScrollReq, overScrollReq * 2],
        [0.5, 1, 1.2]
      )
    } else {
      prevIndicatorY.value = withTiming(0)
      prevIndicatorOpacity.value = withTiming(0)
      prevIndicatorScale.value = withTiming(0)
      nextIndicatorY.value = withTiming(0)
      nextIndicatorOpacity.value = withTiming(0)
      nextIndicatorScale.value = withTiming(0)
    }
  }

  function handleDragEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const window = event.nativeEvent.layoutMeasurement.height
    const contentHeight = event.nativeEvent.contentSize.height

    if (offset <= -overScrollReq && activeChapter.index !== 0) goPrev.value = 1
    else if (
      offset + window > contentHeight + overScrollReq &&
      activeChapter.index !== chapters.length - 1
    )
      goNext.value = 1
  }

  useDerivedValue(() => {
    if (prevIndicatorOpacity.value === 1 || nextIndicatorOpacity.value === 1) {
      runOnJS(impactAsync)()
    }
  }, [])

  const chapterAStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: textTranslateY.value },
        { translateX: textTranslateX.value },
        {
          scale: interpolate(textPinch.value, [0, 1], [0.8, 1], {
            extrapolateLeft: Extrapolation.CLAMP,
            extrapolateRight: Extrapolation.CLAMP,
          }),
        },
      ],

      opacity:
        textPinch.value !== 1
          ? textPinch.value
          : interpolate(
              textTranslateX.value,
              [-horizTransReq, 0, horizTransReq],
              [0.5, 1, 0.5]
            ),
    }
  })

  const showPrevAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor:
        prevIndicatorOpacity.value === 1 ? colors.fg2 : colors.bg2,
      opacity: prevIndicatorOpacity.value,
      transform: [
        {
          translateY: interpolate(
            -prevIndicatorY.value,
            [0, overScrollReq, overScrollReq * 2],
            [0, overScrollReq, overScrollReq * 1.4]
          ),
        },
        { scale: prevIndicatorScale.value },
      ],
    }
  })

  const showNextAnimatedStyles = useAnimatedStyle(() => {
    return {
      backgroundColor:
        nextIndicatorOpacity.value === 1 ? colors.fg2 : colors.bg2,
      opacity: nextIndicatorOpacity.value,
      transform: [
        {
          translateY: interpolate(
            -nextIndicatorY.value,
            [-overScrollReq * 2, -overScrollReq, 0],
            [-overScrollReq * 1.4, -overScrollReq, 0]
          ),
        },
        { scale: nextIndicatorScale.value },
      ],
    }
  })

  const extrasAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslateX.value }],
    }
  })

  return (
    <GestureDetector gesture={composedGestures}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg1,
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <Animated.View
          style={[{ flex: 1, backgroundColor: colors.bg1 }, chapterAStyles]}
        >
          <ScrollView
            style={{ paddingHorizontal: gutterSize, flex: 1 }}
            ref={scrollViewRef}
            onScrollEndDrag={handleDragEnd}
            onScroll={handleScroll}
            alwaysBounceVertical
            scrollEventThrottle={16}
          >
            <Spacer units={4} additional={insets.top + gutterSize} />
            <Text
              style={{
                ...type(32, 'b', 'c', colors.fg1),
                marginBottom: gutterSize,
              }}
            >
              {chapters[activeChapter.index].reference}
            </Text>
            {chapters[activeChapter.index].data.map((paragraph) =>
              renderFirstLevelText(20, paragraph)
            )}
            {/* <View style={styles.dotContainer}>
            <View style={styles.dot} />
          </View> */}
            <Spacer units={24} additional={insets.bottom} />
          </ScrollView>
        </Animated.View>
        <ChapterOverlay
          activeChapter={activeChapter}
          chapters={chapters}
          isStatusBarHidden={isStatusBarHidden}
        />
        <View
          style={{
            width: '100%',
            position: 'absolute',
            top: insets.top - 64,
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
        <Navigator
          chapterListRef={searchListRef}
          chapters={chapters}
          textPinch={textPinch}
          savedTextPinch={savedTextPinch}
          searchRef={searchRef}
          searchText={searchText}
          setSearchText={setSearchText}
          setActiveChapter={setActiveChapter}
        />
        <History textTranslationX={textTranslateX} />
        <Animated.View
          style={[
            {
              width: Dimensions.get('window').width * 2,
              height: Dimensions.get('window').height,
              backgroundColor: colors.bg2,
              position: 'absolute',
              left: -Dimensions.get('window').width * 2,
              zIndex: 2,
              paddingTop: insets.top + gutterSize,
              paddingHorizontal: gutterSize,
              paddingLeft: Dimensions.get('window').width * 1.2 + gutterSize,
            },
            extrasAnimatedStyles,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="settings-outline" size={20} color={colors.fg2} />
            <Text style={type(24, 'b', 'l', colors.fg1)}>Settings</Text>
          </View>
        </Animated.View>
        <StatusBar
          hidden={isStatusBarHidden}
          backgroundColor={colors.bg2}
          translucent={false}
          animated
          style="light"
        />
      </View>
    </GestureDetector>
  )
}
