import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { ReactNode } from 'react'
import { Pressable, ViewStyle } from 'react-native'
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import tinycolor from 'tinycolor2'
import { defaultOnPressScale, panActivateConfig } from '../constants'

interface Props {
  children?: ReactNode
  style?: ViewStyle
  onPress: () => void
  entering?: any | undefined
  exiting?: any | undefined
  outerStyle?: ViewStyle
  outerOuterStyle?: ViewStyle
  onPressColor?: string
  disableAnimation?: boolean
  bgColor: string
  hitSlop?: number
}

export default function TovPressable({
  children,
  style,
  outerStyle,
  onPress,
  onPressColor,
  entering,
  exiting,
  disableAnimation,
  outerOuterStyle,
  bgColor,
  hitSlop,
}: Props) {
  const pressed = useSharedValue(0)

  const color = onPressColor
    ? tinycolor(onPressColor).setAlpha(0.7).toString()
    : undefined

  const itemStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(pressed.value, [0, 1], [1, defaultOnPressScale]),
        },
      ],
      backgroundColor:
        // style?.backgroundColor ??
        // outerStyle?.backgroundColor ??
        interpolateColor(pressed.value, [0, 1], [bgColor, color ?? bgColor]),
    }
  })

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={outerOuterStyle}
    >
      <Pressable
        onPressIn={() => {
          if (disableAnimation) return

          pressed.value = withTiming(1, { duration: 75 })
        }}
        onPressOut={() => {
          if (disableAnimation) return
          pressed.value = withSpring(0, panActivateConfig)
        }}
        onPress={() => {
          impactAsync(ImpactFeedbackStyle.Light)
          onPress()
        }}
        hitSlop={hitSlop}
        style={outerStyle}
      >
        <Animated.View style={[style, itemStyles]}>{children}</Animated.View>
      </Pressable>
    </Animated.View>
  )
}
