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
import Close from '../assets/icons/duotone/x-close.svg'
import { panActivateConfig } from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { dismissPopup } from '../redux/popups'
import { br, ic, sp, tx, typography } from '../styles'
import Spacer from './Spacer'
import TovPressable from './TovPressable'

interface Props {
  popup: string
  title: string
  body: string
  icon: React.ReactNode
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
          marginHorizontal: sp.md,
          marginTop: sp.md,
          backgroundColor: colors.ph,
          padding: sp.md,
          borderRadius: br.lg,
          marginBottom: sp.xl,
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
        {icon}
        <Spacer s={sp.sm} />
        <Text
          style={[typography(tx.body, 'uib', 'l', colors.fg1), { flex: 1 }]}
        >
          {title}
        </Text>
        <Spacer s={16 + sp.md} />
      </View>
      <Spacer s={sp.sm} />
      <Text style={typography(tx.caption, 'uir', 'l', colors.fg1)}>{body}</Text>
      <TovPressable
        outerOuterStyle={{
          position: 'absolute',
          right: 0,
          top: 0,
        }}
        bgColor={colors.p1 + '00'}
        style={{ borderRadius: br.lg, padding: sp.md }}
        onPressColor={colors.p1}
        onPress={() => (dismiss.value = withSpring(1, panActivateConfig))}
      >
        <Close {...ic.md} color={colors.fg3} />
      </TovPressable>
    </Animated.View>
  ) : (
    <Spacer s={sp.md} />
  )
}
