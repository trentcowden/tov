import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { Appearance, useColorScheme } from 'react-native'
import tinycolor from 'tinycolor2'
import { useAppSelector } from '../redux/hooks'

const hue = 27
const bg = `hsl(${hue}, 23, 11)`
const fg = `hsl(${hue}, 10, 95)`
const p = `hsl(${hue}, 49, 65)`

const bgLight = `hsl(${hue}, 35, 80)`
const fgLight = `hsl(${hue}, 10, 5)`
const pLight = `hsl(${hue}, 60, 35`

const darkModeColors = {
  bg1: tinycolor(bg).toHexString(),
  bg2: tinycolor(bg).saturate(4).brighten(3).toHexString(),
  bg3: tinycolor(bg).saturate(8).brighten(6).toHexString(),
  bg4: tinycolor(bg).saturate(12).brighten(9).toHexString(),
  fg1: tinycolor(fg).toHexString(),
  fg2: tinycolor(fg).darken(12).toHexString(),
  fg3: tinycolor(fg).darken(24).toHexString(),
  p1: tinycolor(p).toHexString(),
  p2: tinycolor(p).desaturate(8).darken(12).toHexString(),
  ph: tinycolor(p).setAlpha(0.3).toHslString(),
  bd: '#00000044',
}

const lightModeColors = {
  bg1: tinycolor(bgLight).toHexString(),
  bg2: tinycolor(bgLight).darken(3).toHexString(),
  bg3: tinycolor(bgLight).darken(6).toHexString(),
  bg4: tinycolor(bgLight).darken(9).toHexString(),
  fg2: tinycolor(fgLight).darken(12).toHexString(),
  fg1: tinycolor(fgLight).toHexString(),
  fg3: tinycolor(fgLight).darken(24).toHexString(),
  p1: tinycolor(pLight).toHexString(),
  p2: tinycolor(pLight).desaturate(8).darken(12).toHexString(),
  ph: tinycolor(pLight).setAlpha(0.3).toHslString(),
  bd: '#00000044',
}

console.log(darkModeColors)

export default function useColors() {
  const theme = useAppSelector((state) => state.settings.theme)
  const systemColorScheme = useColorScheme()
  const currentTheme = theme === 'auto' ? systemColorScheme : theme
  useEffect(() => {
    // if (currentTheme === 'light') {
    //   SystemUI.setBackgroundColorAsync(tinycolor(bgLight).toHexString())
    //   Appearance.setColorScheme('light')
    // } else {
    SystemUI.setBackgroundColorAsync(tinycolor(bg).toHexString())
    Appearance.setColorScheme('dark')
    // }
  }, [])

  if (currentTheme === 'light') {
    return lightModeColors
  } else {
    return darkModeColors
  }
}
