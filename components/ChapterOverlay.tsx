import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  gutterSize,
  panActivateConfig,
  shadow,
  sizes,
  typography,
} from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import useColors from '../hooks/useColors'

interface Props {
  activeChapter: Chapters[number]
  activeBook: Books[number]
  openNavigator: SharedValue<number>
  focusSearch: () => void
  textTranslateX: SharedValue<number>
  savedTextTranslateX: SharedValue<number>
  overlayOpacity: SharedValue<number>
}

export default function ChapterOverlay({
  activeChapter,
  activeBook,
  openNavigator,
  focusSearch,
  textTranslateX,
  savedTextTranslateX,
  overlayOpacity,
}: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const pressed = useSharedValue(0)

  const overlayAnimatedStyles = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    backgroundColor: interpolateColor(
      pressed.value,
      [0, 2],
      [colors.bg2, colors.bg3]
    ),
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.95]) }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -gutterSize,
          width: '100%',
          // left: gutterSize,
          // borderRadius: 99,
          zIndex: 4,
          borderBottomRightRadius: 32,
          borderBottomLeftRadius: 32,
          paddingTop: gutterSize,
          ...shadow,
        },
        overlayAnimatedStyles,
      ]}
    >
      {/* <BlurView blurType="dark" style={[]}> */}
      <Pressable
        onPressIn={() => {
          if (overlayOpacity.value === 0) return
          pressed.value = withTiming(1, { duration: 75 })
        }}
        onPressOut={() => {
          if (overlayOpacity.value === 0) return
          pressed.value = withSpring(0, panActivateConfig)
        }}
        onPress={() => {
          if (overlayOpacity.value === 0) return
          textTranslateX.value = withSpring(0, panActivateConfig)
          savedTextTranslateX.value = 0
          openNavigator.value = withSpring(1, panActivateConfig)
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
            paddingHorizontal: gutterSize,
            // paddingVertical: gutterSize / 2,
            height: insets.top,
            // backgroundColor: colors.bg2,
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
              ...typography(sizes.caption, 'uis', 'l', colors.fg3),
            }}
          >
            {activeChapter.chapterId === 'tutorial'
              ? 'Tutorial'
              : `${activeBook.name.replace(' ', '').slice(0, 3)}. ${activeChapter.chapterId.split('.')[1]}`}
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

        {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <FontAwesome5 name="history" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
      </Pressable>
      {/* </BlurView> */}
    </Animated.View>
  )
}
