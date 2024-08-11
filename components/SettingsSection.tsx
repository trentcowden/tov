import React, { ReactNode } from 'react'
import { Text } from 'react-native'
import useColors from '../hooks/useColors'
import { sans, sp, tx } from '../styles'

interface Props {
  children: ReactNode
  disableTopMargin?: boolean
}

export default function SettingsSection({ children, disableTopMargin }: Props) {
  const colors = useColors()

  return (
    <Text
      style={[
        sans(tx.caption, 'l', 'l', colors.fg3),
        {
          paddingHorizontal: sp.xl,
          marginTop: disableTopMargin ? 0 : sp.xl,
        },
      ]}
    >
      {children}
    </Text>
  )
}
