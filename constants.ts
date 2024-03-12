import { Dimensions } from 'react-native'

export const colors = {
  bg1: '#1b1b1b',
  bg2: '#282828',
  bg3: '#393939',
  fg1: '#efefef',
  fg2: '#d8d8d8',
  fg3: '#9b9b9b',
  p1: '#283618',
}

export const gutterSize = 16

export const screenWidth = Dimensions.get('window').width
export const screenHeight = Dimensions.get('window').height

export const largeButtonSize = 80
export const smallButtonSize = 48

export const chapterChangeDuration = 300
export const overScrollReq = 100
export const zoomOutReq = 0.6
export const horizTransReq = Dimensions.get('window').width * 0.8
export const horizVelocReq = 600

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
    fontWeight: weight === 'r' ? '400' : '600',
  }
}
