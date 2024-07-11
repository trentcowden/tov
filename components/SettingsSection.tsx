import React, { ReactNode } from 'react'
import { Text } from 'react-native'
import { gutterSize, sizes, typography } from '../constants'
import useColors from '../hooks/useColors'

interface Props {
  children: ReactNode
  disableTopMargin?: boolean
}

export default function SettingsSection({ children, disableTopMargin }: Props) {
  const colors = useColors()

  return (
    <Text
      style={[
        typography(sizes.caption, 'uil', 'l', colors.fg3),
        {
          paddingHorizontal: gutterSize,
          marginTop: disableTopMargin ? 0 : gutterSize,
        },
      ]}
    >
      {children}
    </Text>
  )
}
