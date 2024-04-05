import { Dimensions } from 'react-native'

export const colors = {
  bg1: '#292521',
  bg2: '#332E28',
  bg3: '#403931',
  fg1: '#efefef',
  fg2: '#d8d8d8',
  fg3: '#9b9b9b',
  p1: '#2d2118',
  b: 'rgba(164, 152, 142, 0.15)',
  v: '#cca98f',
}

export const gutterSize = 24

export const screenWidth = Dimensions.get('screen').width
export const screenHeight = Dimensions.get('screen').height

export const largeButtonSize = 80
export const smallButtonSize = 48

export const chapterChangeDuration = 250
export const overScrollReq = 75
export const zoomOutReq = 0.3
export const horizTransReq = Dimensions.get('window').width * 0.75
export const horizVelocReq = 600

import { TextStyle } from 'react-native'

/**
 * Takes in some text style settings and returns a filled out text style object. This is used simply to save space in components and simplify things overall. Used within the style prop of a text component.
 */
export const type = (
  size: number,
  weight: 'r' | 'b' | 'i' | 'bi' | 'uir' | 'uib',
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
    fontFamily:
      weight === 'uir'
        ? 'UIRegular'
        : weight === 'uib'
          ? 'UIBold'
          : weight === 'r'
            ? 'Regular'
            : weight === 'i'
              ? 'Regular-Italic'
              : weight === 'b'
                ? 'Bold'
                : 'Bold-Italic',
  }
}

export const panActivateConfig = { mass: 0.5, damping: 20, stiffness: 140 }
