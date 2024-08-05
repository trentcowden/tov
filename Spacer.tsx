import React from 'react'
import { View } from 'react-native'

interface Props {
  s: number
}

export default function Spacer({ s }: Props) {
  return (
    <View
      style={{
        width: s,
        height: s,
      }}
    />
  )
}
