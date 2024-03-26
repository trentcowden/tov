import { Octicons } from '@expo/vector-icons'
import React from 'react'
import { Dimensions, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize } from '../constants'

interface Props {
  textTranslationX: SharedValue<number>
  textPinch: SharedValue<number>
  openHistory: () => void
  openNavigator: () => void
}

export default function FloatingButtons({
  textTranslationX,
  openHistory,
  textPinch,
  openNavigator,
}: Props) {
  const insets = useSafeAreaInsets()

  const floatingButtonsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: textTranslationX.value }],
  }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: insets.bottom,
          // borderRadius: 99,
          zIndex: 1,
        },
        floatingButtonsAnimatedStyle,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          width: Dimensions.get('window').width - gutterSize * 2,
          borderRadius: 12,
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          style={{
            width: Dimensions.get('window').width * 0.25 - gutterSize * 2,
            aspectRatio: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg3,
            borderRadius: 999,
          }}
          onPress={openHistory}
        >
          <Octicons name="history" size={24} color={colors.fg2} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: Dimensions.get('window').width * 0.25 - gutterSize * 2,
            aspectRatio: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.bg3,
            borderRadius: 999,
          }}
          onPress={openNavigator}
        >
          <Octicons name="search" size={24} color={colors.fg2} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
}
