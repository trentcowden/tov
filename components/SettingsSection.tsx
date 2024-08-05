import React, { ReactNode } from 'react'
import { Text } from 'react-native'
import useColors from '../hooks/useColors'
import { sp, tx, typography } from '../styles'

interface Props {
  children: ReactNode
  disableTopMargin?: boolean
}

export default function SettingsSection({ children, disableTopMargin }: Props) {
  const colors = useColors()

  return (
    <Text
      style={[
        typography(tx.caption, 'uil', 'l', colors.fg3),
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
