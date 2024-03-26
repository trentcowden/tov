import { BlurView } from '@react-native-community/blur'
import { StatusBar } from 'expo-status-bar'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, type } from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'

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
  overlayOpacity,
  pastOverlayOffset,
  navigatorTransition,
  textTranslateY,
  setIsStatusBarHidden,
  textTranslateX,
}: Props) {
  const insets = useSafeAreaInsets()
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const [chapterChanging, setChapterChanging] = useState(false)

  useDerivedValue(() => {
    if (navigatorTransition.value === 1) runOnJS(setNavigatorOpen)(false)
    else runOnJS(setNavigatorOpen)(true)
  })
  useDerivedValue(() => {
    if (textTranslateY.value === 0) runOnJS(setChapterChanging)(false)
    else runOnJS(setChapterChanging)(true)
  })
  useDerivedValue(() => {
    if (textTranslateX.value > 25) runOnJS(setIsStatusBarHidden)(false)
    else runOnJS(setIsStatusBarHidden)(true)
  })

  useEffect(() => {
    if (chapterChanging) overlayOpacity.value = withTiming(0)
    else if (navigatorOpen) overlayOpacity.value = withTiming(0)
    else if (!isStatusBarHidden || !pastOverlayOffset)
      overlayOpacity.value = withTiming(0)
    else if (isStatusBarHidden && pastOverlayOffset)
      overlayOpacity.value = withTiming(1)
  }, [isStatusBarHidden, pastOverlayOffset, navigatorOpen])

  const overlayAnimatedStyles = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          // borderRadius: 99,
          zIndex: 5,
        },
        overlayAnimatedStyles,
      ]}
    >
      <BlurView blurType="dark" style={[]}>
        <View
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: gutterSize * 2,
              width: Dimensions.get('window').width,
              height: insets.top,
            },
          ]}
        >
          {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <Ionicons name="settings-outline" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            style={{
              ...type(11, 'i', 'l', colors.fg2),
            }}
          >
            {activeBook.name}
          </Text>
          <View style={{ flex: 1 }} />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            style={{
              ...type(11, 'i', 'l', colors.fg2),
              textAlign: 'right',
            }}
          >
            Chapter {activeChapter.chapterId.split('.')[1]}
          </Text>
          {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <FontAwesome5 name="history" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
        </View>
      </BlurView>
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
