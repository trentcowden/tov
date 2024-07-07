import React from 'react'
import { Text, useWindowDimensions, View } from 'react-native'
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, panActivateConfig, sizes, typography } from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { dismissPopup } from '../redux/popups'
import TovIcon, { IconName } from './SVG'
import TovPressable from './TovPressable'

interface Props {
  popup: string
  title: string
  body: string
  icon: IconName
}

export default function ListBanner({ body, icon, title, popup }: Props) {
  const { width } = useWindowDimensions()
  const colors = useColors()
  const dismissed = useAppSelector((state) => state.popups.dismissed)
  const dispatch = useAppDispatch()
  const dismiss = useSharedValue(0)

  const styles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(dismiss.value, [0, 1], [1, 0]),
      // height: interpolate(dismiss.value, [0, 1], [undefined, 0]),
    }
  })

  const hide = () => dispatch(dismissPopup(popup))

  useDerivedValue(() => {
    if (dismiss.value === 1 && !dismissed.includes(popup)) runOnJS(hide)()
  })

  return !dismissed.includes(popup) ? (
    <Animated.View
      style={[
        {
          marginHorizontal: gutterSize / 2,
          marginTop: gutterSize / 2,
          backgroundColor: colors.ph,
          padding: gutterSize / 2,
          borderRadius: 12,
          marginBottom: gutterSize,
        },
        styles,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TovIcon name={icon} size={16} color={colors.p1} />
        <Spacer units={1} />
        <Text
          style={[typography(sizes.body, 'uib', 'l', colors.fg1), { flex: 1 }]}
        >
          {title}
        </Text>
        <Spacer units={0} additional={16 + gutterSize / 2} />
      </View>
      <Spacer units={1} />
      <Text style={typography(sizes.caption, 'uir', 'l', colors.fg1)}>
        {body}
      </Text>
      <TovPressable
        outerOuterStyle={{
          position: 'absolute',
          right: 0,
          top: 0,
        }}
        bgColor={colors.p1 + '00'}
        style={{ borderRadius: 12, padding: gutterSize / 2 }}
        onPressColor={colors.p1}
        onPress={() => (dismiss.value = withSpring(1, panActivateConfig))}
      >
        <TovIcon name="close" size={16} color={colors.fg3} />
      </TovPressable>
    </Animated.View>
  ) : (
    <Spacer units={2} />
  )
}
