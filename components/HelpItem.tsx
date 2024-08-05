import React from 'react'
import { Text, View } from 'react-native'
import useColors from '../hooks/useColors'
import { sp, tx, typography } from '../styles'
interface Props {
  title: string
  body: string
}

export default function HelpItem({ body, title }: Props) {
  const colors = useColors()

  return (
    <View
      style={{
        marginHorizontal: sp.xl,
        gap: sp.md,
      }}
    >
      <Text
        adjustsFontSizeToFit
        style={[typography(tx.subtitle, 'uib', 'l', colors.fg2)]}
      >
        {/* <HelpIcon {...ic.sm} color={colors.p1} /> */}
        {title}
      </Text>
      <Text
        adjustsFontSizeToFit
        style={[typography(tx.body, 'uir', 'l', colors.fg2)]}
      >
        {body}
      </Text>
    </View>
  )
}
