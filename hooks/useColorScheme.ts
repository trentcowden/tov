import React from 'react'
import { Appearance } from 'react-native'

export default function useColorScheme(delay = 250) {
  const [colorScheme, setColorScheme] = React.useState(
    Appearance.getColorScheme()
  )

  React.useEffect(() => {
    console.log(Appearance.getColorScheme())
    Appearance.addChangeListener((colorScheme) => {
      console.log('system theme', colorScheme.colorScheme)
    })
  }, [])

  return colorScheme
}
