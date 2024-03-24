import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'

interface Props {
  color: string
  place: 'top' | 'bottom'
}

// A simple component that renders a horizontal line. Used to separate list items, text, or whatever else.
export default function Fade(props: Props) {
  return (
    <LinearGradient
      colors={[props.color, props.color + '00']}
      start={[1, props.place === 'top' ? 0 : 1]}
      end={[1, props.place === 'top' ? 1 : 0]}
      style={{
        position: 'absolute',
        bottom: props.place === 'top' ? undefined : 0,
        top: props.place === 'top' ? 0 : undefined,
        height: 16,
        width: '100%',
      }}
    />
  )
}
