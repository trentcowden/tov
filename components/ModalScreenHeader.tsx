import { ReactNode } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Spacer from '../Spacer'
import { colors, gutterSize, iconSize, typography } from '../constants'
import TovIcon from './SVG'

interface Props {
  children: ReactNode
  close: () => void
  icon?: ReactNode
  paddingLeft?: number
}

export default function ModalScreenHeader({
  children,
  close,
  icon,
  paddingLeft,
}: Props) {
  const closeButton = (
    <TouchableOpacity
      onPress={close}
      style={{
        paddingLeft: gutterSize,
        paddingRight: gutterSize,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        top: 0,
        right: 0,
        zIndex: 4,
      }}
    >
      {/* <Text style={typography(13, 'uir', 'c', colors.fg3)}>Close</Text> */}
      <TovIcon name="close" size={iconSize} />
    </TouchableOpacity>
  )

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
      <Spacer units={icon ? 2 : 0} />
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
            style={[typography(22, 'uib', 'l', colors.fg1)]}
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
