import React, { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { colors, gutterSize, typography } from '../constants'
import TovIcon, { IconName } from './SVG'
import TovPressable from './TovPressable'

interface Props {
  children: ReactNode
  rightSection?: ReactNode
  rightIcon?: IconName
  rightText?: string
  description?: string
  onPress: () => void
}

export default function SettingsItem({
  children,
  rightSection,
  description,
  rightText,
  rightIcon,
  onPress,
}: Props) {
  return (
    <TovPressable
      onPress={onPress}
      style={{
        // paddingVertical: 8,
        paddingHorizontal: gutterSize,
      }}
    >
      <View
        style={{
          backgroundColor: colors.bg3,
          borderRadius: 16,
          paddingVertical: gutterSize / 2,
          paddingHorizontal: gutterSize / 2,
          gap: gutterSize / 2,
        }}
      >
        <View
          style={{
            width: '100%',

            alignItems: 'center',
            flexDirection: 'row',

            gap: 8,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[typography(16, 'uim', 'l', colors.fg2), { flex: 1 }]}
          >
            {children}
          </Text>
          {rightSection}
          {rightText ? (
            <Text style={typography(14, 'uis', 'c', colors.p1)}>
              {rightText}
            </Text>
          ) : null}
          {rightIcon ? (
            <TovIcon name={rightIcon} size={16} color={colors.p2} />
          ) : null}
        </View>
        <Text style={typography(12, 'uil', 'l', colors.fg3)}>
          {description}
        </Text>
      </View>
    </TovPressable>
  )
}
