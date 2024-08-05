import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import tinycolor from 'tinycolor2'
import { sp } from '../styles'

interface Props {
  color: string
  place: 'top' | 'bottom'
}

// A simple component that renders a horizontal line. Used to separate list items, text, or whatever else.
export default function Fade(props: Props) {
  return (
    <LinearGradient
      colors={[props.color, tinycolor(props.color).setAlpha(0).toHslString()]}
      start={{ x: 1, y: props.place === 'top' ? 0 : 1 }}
      end={{ x: 1, y: props.place === 'top' ? 1 : 0 }}
      style={{
        position: 'absolute',
        bottom: props.place === 'top' ? undefined : 0,
        top: props.place === 'top' ? 0 : undefined,
        height: sp.md,
        width: '100%',
        // borderWidth: 1,
      }}
    />
  )
}
