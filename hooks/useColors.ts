import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { Appearance, useColorScheme } from 'react-native'
import tinycolor from 'tinycolor2'
import { useAppSelector } from '../redux/hooks'

const hue = 27
const bg = `hsl(${hue}, 23, 11)`
const fg = `hsl(${hue}, 10, 95)`
const p = `hsl(${hue}, 49, 65)`

const bgLight = `hsl(${hue}, 23, 80)`
const fgLight = `hsl(${hue}, 10, 5)`
const pLight = `hsl(${hue}, 60, 35`

const darkModeColors = {
  bg1: tinycolor(bg).toHexString(),
  bg2: tinycolor(bg).saturate(4).brighten(3).toHexString(),
  bg3: tinycolor(bg).saturate(8).brighten(6).toHexString(),
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
  bg2: tinycolor(bgLight).saturate(-4).darken(3).toHexString(),
  bg3: tinycolor(bgLight).saturate(-8).darken(6).toHexString(),
  fg2: tinycolor(fgLight).darken(12).toHexString(),
  fg1: tinycolor(fgLight).toHexString(),
  fg3: tinycolor(fgLight).darken(24).toHexString(),
  p1: tinycolor(pLight).toHexString(),
  p2: tinycolor(pLight).desaturate(8).darken(12).toHexString(),
  ph: tinycolor(pLight).setAlpha(0.3).toHslString(),
  bd: '#00000044',
}

export default function useColors() {
  const theme = useAppSelector((state) => state.settings.theme)
  const systemColorScheme = useColorScheme()
  console.log(systemColorScheme)

  useEffect(() => {
    if (theme === 'auto') {
      SystemUI.setBackgroundColorAsync(
        tinycolor(systemColorScheme === 'dark' ? bg : bgLight).toHexString()
      )
      Appearance.setColorScheme(systemColorScheme)
    } else if (theme === 'dark') {
      SystemUI.setBackgroundColorAsync(tinycolor(bg).toHexString())
      Appearance.setColorScheme('dark')
    } else {
      SystemUI.setBackgroundColorAsync(tinycolor(bgLight).toHexString())
      Appearance.setColorScheme('light')
    }
  }, [theme, systemColorScheme])

  if (theme === 'auto') {
    return systemColorScheme === 'dark' ? darkModeColors : lightModeColors
  } else if (theme === 'dark') {
    return darkModeColors
  } else {
    return lightModeColors
  }
}
