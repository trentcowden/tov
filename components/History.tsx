import { FontAwesome5 } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { Dimensions, Text, View } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, type } from '../constants'
import { HistoryItem } from '../redux/history'
import { useAppSelector } from '../redux/hooks'

interface Props {
  textTranslationX: SharedValue<number>
}

export default function History({ textTranslationX }: Props) {
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()

  const historyAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslationX.value }],
    }
  })
  function renderHistoryItem({ item }: { item: HistoryItem }) {
    return (
      <View>
        <Text>{item.chapterId}</Text>
      </View>
    )
  }
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
          paddingHorizontal: gutterSize,
          paddingRight: Dimensions.get('window').width * 1.2 + gutterSize,
        },
        historyAnimatedStyles,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <FontAwesome5 name="history" size={20} color={colors.fg2} />
        <Text style={type(24, 'b', 'l', colors.fg1)}>History</Text>
        <FlashList data={history} renderItem={renderHistoryItem} />
      </View>
    </Animated.View>
  )
}
