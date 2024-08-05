import { ReactNode } from 'react'
import { Text, View } from 'react-native'
import Close from '../assets/icons/duotone/x-close.svg'
import { gutterSize, sizes, typography } from '../constants'
import useColors from '../hooks/useColors'
import { br, ic } from '../styles'
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
        paddingLeft: gutterSize / 2,
        paddingRight: gutterSize / 2,
        marginRight: gutterSize / 2,
        marginLeft: gutterSize / 4,
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
        paddingLeft: paddingLeft ?? gutterSize,
      }}
    >
      {icon}
      {/* <Spacer units={icon ? 2 : 0} /> */}
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
            style={[typography(sizes.title, 'uib', 'l', colors.fg2)]}
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
