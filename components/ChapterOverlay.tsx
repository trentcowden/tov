import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useState } from 'react'
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
import {
  colors,
  gutterSize,
  horizTransReq,
  panActivateConfig,
  screenWidth,
  shadow,
  sizes,
  typography,
} from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { IconName } from './SVG'

interface Props {
  activeChapter: Chapters[number]
  activeBook: Books[number]
  textTranslateX: SharedValue<number>
  savedTextTranslateX: SharedValue<number>
  savedNavigatorTransition: SharedValue<number>
  navigatorTransition: SharedValue<number>
  focusSearch: () => void
}

export default function ChapterOverlay({
  activeChapter,
  activeBook,
  textTranslateX,
  focusSearch,
  navigatorTransition,
  savedNavigatorTransition,
  savedTextTranslateX,
}: Props) {
  const insets = useSafeAreaInsets()
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const [chapterChanging, setChapterChanging] = useState(false)
  const overlayOpacity = useSharedValue(0)
  const pressed = useSharedValue(0)
  const [icon, setIcon] = useState<IconName>('book')

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

  // useEffect(() => {
  //   if (chapterChanging) overlayOpacity.value = withTiming(0)
  //   else if (navigatorOpen) overlayOpacity.value = withTiming(0)
  //   else if (!isStatusBarHidden || !pastOverlayOffset)
  //     overlayOpacity.value = withTiming(0)
  //   else if (isStatusBarHidden && pastOverlayOffset)
  //     overlayOpacity.value = withTiming(1)
  // }, [isStatusBarHidden, pastOverlayOffset, navigatorOpen, chapterChanging])

  const overlayAnimatedStyles = useAnimatedStyle(() => ({
    // backgroundColor: interpolateColor(
    //   pressed.value,
    //   [0, 2],
    //   [colors.bg3, colors.bg1]
    // ),
    transform: [
      { scale: interpolate(pressed.value, [0, 1], [1, 0.95]) },
      // { translateX: textTranslateX.value },
    ],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          // top: gutterSize / 2,
          right: gutterSize,
          // width: '100%',
          // left: gutterSize,
          // borderRadius: 99,
          zIndex: 0,
          borderRadius: 999,
          // paddingTop: gutterSize,
          width: screenWidth - horizTransReq - gutterSize * 2,
          height: insets.top ?? gutterSize * 2,
          ...shadow,
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
            width: '100%',
            flex: 1,
            paddingHorizontal: gutterSize / 8,
            justifyContent: 'center',
            alignItems: 'center',
            // paddingVertical: gutterSize / 2,
            //
            backgroundColor: colors.bg2,
            borderBottomRightRadius: 999,
            borderBottomLeftRadius: 999,
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

            // width: 100,
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
              ? 'Tov'
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
