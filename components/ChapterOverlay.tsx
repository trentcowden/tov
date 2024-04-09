import { StatusBar } from 'expo-status-bar'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, typography } from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import TovIcon from './SVG'

interface Props {
  activeChapter: Chapters[number]
  activeBook: Books[number]
  setIsStatusBarHidden: Dispatch<SetStateAction<boolean>>
  isStatusBarHidden: boolean
  overlayOpacity: SharedValue<number>
  pastOverlayOffset: boolean
  navigatorTransition: SharedValue<number>
  textTranslateY: SharedValue<number>
  textTranslateX: SharedValue<number>
}

export default function ChapterOverlay({
  activeChapter,
  activeBook,
  isStatusBarHidden,
  pastOverlayOffset,
  navigatorTransition,
  textTranslateY,
  setIsStatusBarHidden,
  textTranslateX,
}: Props) {
  const insets = useSafeAreaInsets()
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const [chapterChanging, setChapterChanging] = useState(false)
  const overlayOpacity = useSharedValue(0)

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
      <View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: 8,
            // borderRadius: 16,
            borderRadius: 99,
            paddingHorizontal: gutterSize * 1.5,
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
            gap: 8,
            width: 100,
          }}
        >
          <TovIcon name="book" size={14} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            style={{
              ...typography(14, 'uib', 'l', colors.fg2),
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
        {/* <View
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
              ...typography(10, 'uib', 'l', colors.fg2),
              textAlign: 'right',
              flex: 1,
            }}
          >
            Ch. {activeChapter.chapterId.split('.')[1]}
          </Text>
        </View> */}
        {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <FontAwesome5 name="history" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
      </View>
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
