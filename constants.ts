import { Dimensions, TextStyle, ViewStyle } from 'react-native'
import { EdgeInsets } from 'react-native-safe-area-context'
import tinycolor from 'tinycolor2'

const hue = 27
const bg = `hsl(${hue}, 23, 11)`
const fg = `hsl(${hue}, 10, 95)`
const p = `hsl(${hue}, 49, 65)`

const bgLight = `hsl(${hue}, 23, 80)`
const fgLight = `hsl(${hue}, 10, 5)`
const pLight = `hsl(${hue}, 49, 35`

export const colors = {
  bg1: tinycolor(bg).toHexString(),
  bg2: tinycolor(bg).saturate(4).brighten(3).toHexString(),
  bg3: tinycolor(bg).saturate(8).brighten(6).toHexString(),
  fg1: tinycolor(fg).toHexString(),
  fg2: tinycolor(fg).darken(12).toHexString(),
  fg3: tinycolor(fg).darken(24).toHexString(),
  p1: tinycolor(p).toHexString(),
  p2: tinycolor(p).desaturate(8).darken(12).toHexString(),
}

export const colorsLight = {
  bg1: tinycolor(bgLight).toHexString(),
  bg2: tinycolor(bgLight).saturate(-4).darken(3).toHexString(),
  bg3: tinycolor(bgLight).saturate(-8).darken(6).toHexString(),
  fg2: tinycolor(fgLight).darken(12).toHexString(),
  fg1: tinycolor(fgLight).toHexString(),
  fg3: tinycolor(fgLight).darken(24).toHexString(),
  p1: tinycolor(pLight).toHexString(),
  p2: tinycolor(pLight).desaturate(8).darken(12).toHexString(),
}

export const sizes = {
  title: 23,
  subtitle: 19,
  body: 17,
  caption: 14,
  tiny: 12,
}

export const headerHeight = 48

export const shadow: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.4,
  shadowRadius: 10,
}
// export const colors = {
//   bg1: '#252322',
//   bg2: '#292725',
//   bg3: '#302e2a',
//   bg4: '#393632',
//   fg1: '#efefef',
//   fg2: '#d8d8d8',
//   fg3: '#9b9b9b',
//   b: 'rgba(134, 126, 118, 0.15)',
//   p1: '#d8c2b0',
//   p2: '#beaca0',
// }

export const backdropColor = '#00000055'
export const gutterSize = 24

export const screenWidth = Dimensions.get('screen').width
export const screenHeight = Dimensions.get('screen').height
export const currentVerseReq = screenHeight / 2

export const iconSize = 24
export const modalWidth = Dimensions.get('screen').width - gutterSize * 2

export const chapterChangeDuration = 250
export const overScrollReq = 75
export const overScrollVelocityReq = 1
export const zoomOutReq = 0.3
export const horizTransReq = Dimensions.get('window').width * 0.7
export const horizVelocReq = 500

/**
 * Takes in some text style settings and returns a filled out text style object. This is used simply to save space in components and simplify things overall. Used within the style prop of a text component.
 */
export const typography = (
  size: number,
  weight: 'r' | 'b' | 'uir' | 'uib' | 'uim' | 'uis' | 'uil',
  align: 'l' | 'c',
  color: string
): TextStyle => {
  // A font size modifier that makes all Arabic script a point smaller and increases the font size on tablets.
  var fontSizeModifier = 0

  // The options for font alignments.
  const alignments: {
    l: 'left' | 'right'
    c: 'center'
  } = {
    // left: languageInfo.isRTL ? 'right' : 'left',
    l: 'left',
    c: 'center',
  }

  const weights = {
    r: 'Regular',
    b: 'Bold',
    uil: 'UILight',
    uir: 'UIRegular',
    uib: 'UIBold',
    uim: 'UIMedium',
    uis: 'UISemibold',
  }

  // Return the completed style object.
  return {
    fontSize: size,
    textAlign: alignments[align],
    color: color,
    fontWeight: weight === 'r' ? '400' : '600',
    fontFamily: weights[weight],
  }
}

export const panActivateConfig = { mass: 0.5, damping: 20, stiffness: 140 }

export function getUsableHeight(insets: EdgeInsets) {
  return screenHeight - insets.top * 1 - insets.bottom * 2
}
