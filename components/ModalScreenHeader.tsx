import { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { gutterSize, iconSize, sizes, typography } from '../constants'
import useColors from '../hooks/useColors'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  children: ReactNode
  close?: () => void
  icon?: ReactNode
  paddingLeft?: number
}

export default function ModalScreenHeader({
  children,
  close,
  icon,
  paddingLeft,
}: Props) {
  const colors = useColors()
  const closeButton = close ? (
    <TovPressable
      onPress={close}
      style={{
        paddingLeft: gutterSize / 2,
        paddingRight: gutterSize / 2,
        marginRight: gutterSize / 2,
        marginLeft: gutterSize / 4,
        borderRadius: 99,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        top: 0,
        right: 0,
        zIndex: 4,
      }}
      onPressColor={colors.bg3}
    >
      <TovIcon name="close" size={iconSize} color={colors.fg3} />
      {/* <Text style={typography(15, 'uir', 'c', colors.fg3)}>Close</Text> */}
    </TovPressable>
  ) : null

  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        height: 50,
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
