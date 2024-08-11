import { TextStyle, ViewStyle } from 'react-native'
import tinycolor from 'tinycolor2'

const tovHue = 27

const bgDark = `hsl(${tovHue}, 23, 11)`
const bgBlack = `hsl(${tovHue}, 0, 0)`
const bgLight = `hsl(${tovHue}, 45, 80)`

const fgDark = `hsl(${tovHue}, 10, 95)`
const fgLight = `hsl(${tovHue}, 10, 5)`
const fgBlack = `hsl(${tovHue}, 10, 95)`

const pDark = `hsl(${tovHue}, 49, 65)`
const pLight = `hsl(${tovHue}, 58, 40`
const pBlack = `hsl(${tovHue}, 30, 50)`

export const themes = [
  {
    id: 'dark',
    name: 'Dark',
    emoji: '🌙',
    description:
      'Light text on a dark background for ease on the eyes and maximum coziness.',
    bg1: tinycolor(bgDark).toHexString(),
    bg2: tinycolor(bgDark).saturate(4).brighten(3).toHexString(),
    bg3: tinycolor(bgDark).saturate(8).brighten(6).toHexString(),
    bg4: tinycolor(bgDark).saturate(12).brighten(9).toHexString(),
    fg1: tinycolor(fgDark).toHexString(),
    fg2: tinycolor(fgDark).darken(12).toHexString(),
    fg3: tinycolor(fgDark).darken(24).toHexString(),
    p1: tinycolor(pDark).toHexString(),
    p2: tinycolor(pDark).desaturate(8).darken(12).toHexString(),
    ph: tinycolor(pDark).setAlpha(0.3).toHslString(),
    bd: '#00000055',
    p3: tinycolor(pDark).desaturate(25).darken(40).toHexString(),
  },
  {
    id: 'light',
    name: 'Light',
    emoji: '☀️',
    description:
      'Dark text on a light background for ideal visibility and readability.',
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
    bd: '#00000055',
    p3: tinycolor(pLight).desaturate(17).brighten(16).toHexString(),
  },
  {
    id: 'black',
    name: 'Black',
    emoji: '🪐',
    description:
      "Light text on a black background for maximum contrast, minimalism, and immersion. Developer's choice!",
    bg1: tinycolor(bgBlack).toHexString(),
    bg2: tinycolor(bgBlack).saturate(4).brighten(4).toHexString(),
    bg3: tinycolor(bgBlack).saturate(8).brighten(8).toHexString(),
    bg4: tinycolor(bgBlack).saturate(12).brighten(12).toHexString(),
    fg1: tinycolor(fgBlack).toHexString(),
    fg2: tinycolor(fgBlack).darken(12).toHexString(),
    fg3: tinycolor(fgBlack).darken(24).toHexString(),
    p1: tinycolor(pBlack).toHexString(),
    p2: tinycolor(pBlack).desaturate(8).darken(12).toHexString(),
    ph: tinycolor(pBlack).setAlpha(0.3).toHslString(),
    bd: '#00000055',
    p3: tinycolor(pBlack).desaturate(25).darken(40).toHexString(),
  },
]

export const fontSizes = [12, 14, 16, 18, 21, 25]

export const sp = {
  xs: 3.5,
  sm: 7,
  md: 14,
  lg: 21,
  xl: 28,
  xx: 32,
}

export const br = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  fu: 999,
}

export const ic = {
  xs: { width: 10, height: 10 },
  sm: { width: 14, height: 14 },
  md: { width: 18, height: 18 },
  lg: { width: 22, height: 22 },
}

export const tx = {
  massive: 32,
  title: 23,
  subtitle: 19,
  body: 16,
  caption: 14,
  tiny: 12,
}

/**
 * Takes in some text style settings and returns a filled out text style object. This is
 * used simply to save space in components and simplify things overall. Used within the
 * style prop of a text component.
 */
export const typography = (
  size: number,
  weight: 'uir' | 'uib' | 'uim' | 'uis' | 'uil',
  align: 'l' | 'c',
  color: string
): TextStyle => {
  // The options for font alignments.
  const alignments: {
    l: 'left' | 'right'
    c: 'center'
  } = {
    l: 'left',
    c: 'center',
  }

  const weights = {
    uil: 'Figtree-Light',
    uir: 'Figtree-Regular',
    uim: 'Figtree-Medium',
    uis: 'Figtree-SemiBold',
    uib: 'Figtree-Bold',
  }
  if (weight.includes('ui')) {
    console.log('weight', weight)
  }

  // Return the completed style object.
  return {
    fontSize: size,
    textAlign: alignments[align],
    color: color,
    fontFamily: weights[weight],
    lineHeight: size * 1.5,
  }
}

export const shadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.4,
  shadowRadius: 10,
}
