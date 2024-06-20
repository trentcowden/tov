import React, { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { gutterSize, sizes, typography } from '../constants'
import { useAppSelector } from '../redux/hooks'
import { themes } from '../styles'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  theme: (typeof themes)[number]
  children: ReactNode
  description?: string
  onPress: () => void
}

export default function ThemeItem({
  theme,
  children,
  description,
  onPress,
}: Props) {
  const settings = useAppSelector((state) => state.settings)

  return (
    <TovPressable
      bgColor={theme.bg3}
      onPress={onPress}
      style={{
        // paddingVertical: 8,
        marginHorizontal: gutterSize,
        borderRadius: 12,
        borderColor: settings.theme === theme.id ? theme.p1 : 'transparent',
        borderWidth: 1,
      }}
      onPressColor={theme.bg3}
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
            style={[typography(sizes.body, 'uim', 'l', theme.fg2), { flex: 1 }]}
          >
            {children}
          </Text>
          {settings.theme === theme.id ? (
            <TovIcon name={'checkmarkCircle'} size={20} color={theme.p1} />
          ) : null}
        </View>
        <Text style={typography(sizes.tiny, 'uil', 'l', theme.fg3)}>
          {description}
        </Text>
      </View>
    </TovPressable>
  )
}
