import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, type } from '../constants'
import { useAppDispatch, useAppSelector } from '../redux/hooks'

interface Props {
  textTranslationX: SharedValue<number>
}

export default function VerseInfo({ textTranslationX }: Props) {
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const [historyOpen, setHistoryOpen] = useState(false)
  const extrasAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslationX.value }],
    }
  })

  useDerivedValue(() => {
    if (textTranslationX.value > -10) runOnJS(setHistoryOpen)(false)
    else runOnJS(setHistoryOpen)(true)
  })

  return (
    <Animated.View
      style={[
        {
          width: Dimensions.get('window').width * 2,
          height: Dimensions.get('window').height,
          backgroundColor: colors.bg2,
          position: 'absolute',
          right: -Dimensions.get('window').width * 2,
          zIndex: 2,
          paddingTop: insets.top + gutterSize,
          paddingRight: Dimensions.get('window').width * 1.2 + gutterSize,
        },
        extrasAnimatedStyles,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="settings-outline" size={20} color={colors.fg2} />
        <Text style={type(24, 'b', 'l', colors.fg1)}>Settings</Text>
      </View>
    </Animated.View>
  )
}
