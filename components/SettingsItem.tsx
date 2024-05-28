import React, { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { gutterSize, sizes, typography } from '../constants'
import useColors from '../hooks/useColors'
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
  const colors = useColors()

  return (
    <TovPressable
      onPress={onPress}
      style={{
        // paddingVertical: 8,
        marginHorizontal: gutterSize,
        backgroundColor: colors.bg3,
        borderRadius: 12,
      }}
      onPressColor={colors.bg3}
      onPressScale={0.96}
    >
      <View
        style={{
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
            style={[
              typography(sizes.body, 'uim', 'l', colors.fg2),
              { flex: 1 },
            ]}
          >
            {children}
          </Text>
          {rightSection}
          {rightText ? (
            <Text style={typography(sizes.caption, 'uis', 'c', colors.p1)}>
              {rightText}
            </Text>
          ) : null}
          {rightIcon ? (
            <TovIcon name={rightIcon} size={16} color={colors.p1} />
          ) : null}
        </View>
        <Text style={typography(sizes.tiny, 'uil', 'l', colors.fg3)}>
          {description}
        </Text>
      </View>
    </TovPressable>
  )
}
