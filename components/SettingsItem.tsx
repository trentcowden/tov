import React, { ReactNode } from 'react'
import { Text, View } from 'react-native'
import useColors from '../hooks/useColors'
import { br, sans, sp, tx } from '../styles'
import TovPressable from './TovPressable'

interface Props {
  children: ReactNode
  rightSection?: ReactNode
  rightIcon?: React.ReactNode
  rightText?: string
  description?: string
  onPress?: () => void
}

export default function SettingsItem({
  children,
  rightSection,
  description,
  rightText,
  rightIcon,
  onPress,
}: Props) {
  const colors = useColors()

  return (
    <TovPressable
      bgColor={colors.bg3}
      onPress={onPress ? onPress : () => {}}
      disableAnimation={!onPress}
      style={{
        marginHorizontal: sp.xl,
        borderRadius: br.lg,
      }}
      onPressColor={colors.bg3}
    >
      <View
        style={{
          paddingVertical: sp.md,
          paddingHorizontal: sp.md,
          gap: sp.sm,
        }}
      >
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            gap: sp.sm,
          }}
        >
          {rightIcon}
          <Text style={[sans(tx.body, 'm', 'l', colors.fg2), { flex: 1 }]}>
            {children}
          </Text>
          {rightSection}
          {rightText ? (
            <Text style={sans(tx.tiny, 's', 'c', colors.p1)}>{rightText}</Text>
          ) : null}
        </View>
        {description ? (
          <Text style={sans(tx.tiny, 'l', 'l', colors.fg3)}>{description}</Text>
        ) : null}
      </View>
    </TovPressable>
  )
}
