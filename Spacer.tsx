import React, { useState } from 'react'
import { View } from 'react-native'
import { gutterSize } from './constants'

interface Props {
  units?: number
  additional?: number
}

export default function Spacer({ units, additional }: Props) {
  const [unit] = useState(gutterSize / 4)
  return (
    <View
      style={{
        width: (additional || 0) + (units || 0) * unit,
        height: (additional || 0) + (units || 0) * unit,
      }}
    />
  )
}
