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
      "Light text on a dark background for ease on the eyes and maximum coziness. Developer's choice!",
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
    bd: '#00000044',
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
    bd: '#00000044',
  },
  {
    id: 'black',
    name: 'Black',
    emoji: '🪐',
    description:
      'Light text on a black background for maximum contrast and total minimalism.',
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
    bd: '#00000044',
  },
]

export const fontSizes = [
  {
    name: 'Tiny',
    emoji: '🐞',
    fontSize: 15,
    lineHeight: 32,
    paragraphSpacing: 14,
  },
  {
    name: 'Default',
    emoji: '🐱',
    fontSize: 17,
    lineHeight: 38,
    paragraphSpacing: 18,
  },
  {
    name: 'Quite Big',
    emoji: '🐴',
    fontSize: 19,
    lineHeight: 42,
    paragraphSpacing: 22,
  },
  {
    name: 'Very Large',
    emoji: '🦖',
    fontSize: 21,
    lineHeight: 46,
    paragraphSpacing: 26,
  },
]