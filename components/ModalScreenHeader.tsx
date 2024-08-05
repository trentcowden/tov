import { ReactNode } from 'react'
import { Text, View } from 'react-native'
import Close from '../assets/icons/duotone/x-close.svg'
import useColors from '../hooks/useColors'
import { br, ic, sp, tx, typography } from '../styles'
import TovPressable from './TovPressable'

interface Props {
  children: ReactNode
  close?: () => void
  icon?: ReactNode
  paddingLeft?: number
  height?: number
}

export default function ModalScreenHeader({
  children,
  close,
  icon,
  paddingLeft,
  height,
}: Props) {
  const colors = useColors()
  const closeButton = close ? (
    <TovPressable
      bgColor={colors.bg2}
      onPress={close}
      style={{
        paddingLeft: sp.md,
        paddingRight: sp.md,
        marginRight: sp.md,
        marginLeft: sp.sm,
        borderRadius: br.lg,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        top: 0,
        right: 0,
        zIndex: 4,
      }}
      onPressColor={colors.bg3}
    >
      <Close {...ic.lg} color={colors.fg3} />
    </TovPressable>
  ) : null

  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        height: height ?? 50,
        alignItems: 'center',
        zIndex: 5,
        paddingLeft: paddingLeft ?? sp.xl,
      }}
    >
      {icon}
      <View
        style={{
          flex: 1,
          height: '100%',
          justifyContent: 'center',
        }}
      >
        {typeof children === 'string' ? (
          <Text
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[typography(tx.title, 'uib', 'l', colors.fg2)]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
      {closeButton}
    </View>
  )
}
