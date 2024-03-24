import { BlurView } from '@react-native-community/blur'
import React, { useEffect } from 'react'
import { Dimensions, Text, View } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, type } from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'

interface Props {
  activeChapter: Chapters[number]
  activeBook: Books[number]
  isStatusBarHidden: boolean
  overlayOpacity: SharedValue<number>
  pastOverlayOffset: boolean
}

export default function ChapterOverlay({
  activeChapter,
  activeBook,
  isStatusBarHidden,
  overlayOpacity,
  pastOverlayOffset,
}: Props) {
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!isStatusBarHidden || !pastOverlayOffset)
      overlayOpacity.value = withTiming(0)
    else if (isStatusBarHidden && pastOverlayOffset)
      overlayOpacity.value = withTiming(1)
  }, [isStatusBarHidden, pastOverlayOffset])

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
          zIndex: 2,
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
    </Animated.View>
  )
}
