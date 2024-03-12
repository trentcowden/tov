import { BlurView } from '@react-native-community/blur'
import React, { useEffect } from 'react'
import { Dimensions, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActiveChapter, Chapter } from '../bibleTypes'
import { colors, gutterSize, type } from '../constants'

interface Props {
  chapters: Chapter[]
  activeChapter: ActiveChapter
  isStatusBarHidden: boolean
}

export default function ChapterOverlay({
  activeChapter,
  chapters,
  isStatusBarHidden,
}: Props) {
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (isStatusBarHidden) overlayOpacity.value = withTiming(1)
    else overlayOpacity.value = withTiming(0)
  }, [isStatusBarHidden])

  const overlayOpacity = useSharedValue(1)

  const overlayAnimatedStyles = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  return (
    <BlurView
      blurType="dark"
      style={[
        {
          position: 'absolute',
          top: 0,
          // borderRadius: 99,
          zIndex: 2,
        },
      ]}
    >
      <Animated.View
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
          overlayAnimatedStyles,
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
            ...type(11, 'r', 'l', colors.fg2),
            fontStyle: 'italic',
          }}
        >
          {chapters[activeChapter.index].reference
            .split(' ')
            .slice(0, -1)
            .join(' ')}
        </Text>
        <View style={{ flex: 1 }} />
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1}
          style={{
            ...type(11, 'r', 'l', colors.fg2),
            fontStyle: 'italic',
            textAlign: 'right',
          }}
        >
          Chapter {chapters[activeChapter.index].number}
        </Text>
        {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <FontAwesome5 name="history" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
      </Animated.View>
    </BlurView>
  )
}
