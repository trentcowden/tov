import { ReactNode } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Spacer from '../Spacer'
import { colors, gutterSize, type } from '../constants'

interface Props {
  children: ReactNode
  close: () => void
  icon: ReactNode
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
      <Text style={type(15, 'uir', 'c', colors.fg2)}>Close</Text>
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
      <Spacer units={2} />
      <View
        style={{
          flex: 1,
          height: '100%',
          justifyContent: 'center',
        }}
      >
        {typeof children === 'string' || typeof children === 'object' ? (
          <Text
            adjustsFontSizeToFit
            numberOfLines={2}
            style={[type(22, 'uib', 'l', colors.fg2)]}
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
