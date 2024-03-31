import { BlurView } from '@react-native-community/blur'
import { StatusBar } from 'expo-status-bar'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
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
    opacity: overlayOpacity.value,
    // opacity: 1,
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
      <BlurView blurType="dark" style={[]}>
        <View
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%',
              gap: 8,
              borderRadius: 99,
              paddingHorizontal: gutterSize * 2,
              // paddingVertical: gutterSize / 2,
              height: insets.top,
              // backgroundColor: colors.bg3,
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
              ...type(12, 'uib', 'l', colors.fg2),
            }}
          >
            {activeBook.name.replace(' ', '').slice(0, 3)}
            {'. '}
            {activeChapter.chapterId.split('.')[1]}
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
