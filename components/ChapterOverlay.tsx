import { format } from 'date-fns'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, panActivateConfig, typography } from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { IconName } from './SVG'

interface Props {
  activeChapter: Chapters[number]
  activeBook: Books[number]
  isStatusBarHidden: boolean
  navigatorTransition: SharedValue<number>
  savedNavigatorTransition: SharedValue<number>
  focusSearch: () => void
  textTranslateX: SharedValue<number>
  savedTextTranslateX: SharedValue<number>
}

export default function ChapterOverlay({
  activeChapter,
  activeBook,
  isStatusBarHidden,
  navigatorTransition,
  savedNavigatorTransition,
  focusSearch,
  textTranslateX,
  savedTextTranslateX,
}: Props) {
  const insets = useSafeAreaInsets()
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const [chapterChanging, setChapterChanging] = useState(false)
  const overlayOpacity = useSharedValue(0)
  const pressed = useSharedValue(0)
  const [icon, setIcon] = useState<IconName>('book')
  const [time, setTime] = useState(new Date().getTime())

  // useDerivedValue(() => {
  //   if (navigatorTransition.value > 0.1) {
  //     runOnJS(setIcon)('bookOpen')
  //   } else {
  //     runOnJS(setIcon)('book')
  //   }
  // })
  // useDerivedValue(() => {
  //   if (navigatorTransition.value === 1) runOnJS(setNavigatorOpen)(false)
  //   else runOnJS(setNavigatorOpen)(true)
  // })
  // useDerivedValue(() => {
  //   if (Math.abs(textTranslateY.value) < 10) runOnJS(setChapterChanging)(false)
  //   else runOnJS(setChapterChanging)(true)
  // })
  // useDerivedValue(() => {
  //   if (textTranslateX.value > 25) runOnJS(setIsStatusBarHidden)(false)
  //   else runOnJS(setIsStatusBarHidden)(true)
  // })

  useEffect(() => {
    overlayOpacity.value = withTiming(1)
    setInterval(() => setTime(new Date().getTime()), 5000)
  }, [])

  // useEffect(() => {
  //   if (chapterChanging) overlayOpacity.value = withTiming(0)
  //   else if (navigatorOpen) overlayOpacity.value = withTiming(0)
  //   else if (!isStatusBarHidden || !pastOverlayOffset)
  //     overlayOpacity.value = withTiming(0)
  //   else if (isStatusBarHidden && pastOverlayOffset)
  //     overlayOpacity.value = withTiming(1)
  // }, [isStatusBarHidden, pastOverlayOffset, navigatorOpen, chapterChanging])

  const overlayAnimatedStyles = useAnimatedStyle(() => ({
    // opacity: overlayOpacity.value,
    opacity: overlayOpacity.value,
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 1.05]) }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          width: '100%',
          // left: gutterSize,
          // borderRadius: 99,
          zIndex: 5,
        },
        overlayAnimatedStyles,
      ]}
    >
      {/* <BlurView blurType="dark" style={[]}> */}
      <Pressable
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 75 })
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, panActivateConfig)
        }}
        onPress={() => {
          textTranslateX.value = withSpring(0, panActivateConfig)
          savedTextTranslateX.value = 0
          savedNavigatorTransition.value = 1
          navigatorTransition.value = withTiming(1)
          focusSearch()
          impactAsync(ImpactFeedbackStyle.Heavy)
        }}
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: 6,
            // borderRadius: 16,
            borderRadius: 99,
            paddingHorizontal: gutterSize,
            // paddingVertical: gutterSize / 2,
            height: insets.top,
            backgroundColor: colors.bg3,
          },
        ]}
      >
        {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <Ionicons name="settings-outline" size={20} color={colors.fg3} />
      </TouchableOpacity> */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            width: 100,
          }}
        >
          {/* <TovIcon name={icon} size={14} /> */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            style={{
              ...typography(14, 'uim', 'l', colors.fg3),
            }}
          >
            {activeBook.name.replace(' ', '').slice(0, 3)}
            {'. '}
            {activeChapter.chapterId.split('.')[1]}
          </Text>
          {/* <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            style={{
              ...typography(11, 'uib', 'l', colors.fg2),
              flex: 1,
            }}
          >
            {activeBook.name}
          </Text> */}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            width: 100,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            style={{
              ...typography(14, 'uim', 'l', colors.fg3),
              textAlign: 'right',
              flex: 1,
            }}
          >
            {format(time, 'HH:mm')}
          </Text>
        </View>
        {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <FontAwesome5 name="history" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
      </Pressable>
      {/* </BlurView> */}
      <StatusBar
        hidden={isStatusBarHidden}
        backgroundColor={colors.bg2}
        translucent={false}
        animated
        style="light"
      />
    </Animated.View>
  )
}
