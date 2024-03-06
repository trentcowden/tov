import { Dimensions } from 'react-native'

export const colors = {
  bg1: '#363636',
  bg2: '#4D4D4D',
  bg3: '#616161',
  bg4: '#737373',
  fg1: '#F1F2EB',
  fg2: '#D7D9CD',
  fg3: '#AFB0A4',
  p1: '#4A543E',
  p2: '#5F6B4F',
  p3: '#859571',
  s: '#88A5AB',
  e: '#B56363',
}

export const gutterSize = 16

export const screenWidth = Dimensions.get('window').width
export const screenHeight = Dimensions.get('window').height

export const largeButtonSize = 80
export const smallButtonSize = 48

import { TextStyle } from 'react-native'

/**
 * Takes in some text style settings and returns a filled out text style object. This is used simply to save space in components and simplify things overall. Used within the style prop of a text component.
 */
export const type = (
  size: number,
  weight: 'r' | 'b' | 'i' | 'bi',
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

  // Return the completed style object.
  return {
    fontSize: size,
    textAlign: alignments[align],
    color: color,
  }
}
