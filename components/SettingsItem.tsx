import React, { ReactNode } from 'react'
import { Text, View } from 'react-native'
import useColors from '../hooks/useColors'
import { br, sp, tx, typography } from '../styles'
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
          gap: sp.md,
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
          {rightIcon}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[typography(tx.body, 'uim', 'l', colors.fg2)]}
          >
            {children}
          </Text>
          {rightSection}
          {rightText ? (
            <Text style={typography(tx.caption, 'uis', 'c', colors.p1)}>
              {rightText}
            </Text>
          ) : null}
        </View>
        {description ? (
          <Text style={typography(tx.tiny, 'uil', 'l', colors.fg3)}>
            {description}
          </Text>
        ) : null}
      </View>
    </TovPressable>
  )
}
