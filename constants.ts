import { Dimensions, TextStyle, ViewStyle } from 'react-native'
import { EdgeInsets } from 'react-native-safe-area-context'

export const sizes = {
  massive: 32,
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

// export const backdropColor = '#00000055'
export const gutterSize = 24
export const showOverlayOffset = gutterSize * 4
export const screenWidth = Dimensions.get('screen').width
export const screenHeight = Dimensions.get('screen').height
export const currentVerseReq = screenHeight / 3

export const iconSize = 24
export const modalWidth = Dimensions.get('screen').width - gutterSize * 2

export const chapterChangeDuration = 200
export const overScrollReq = 75
export const overScrollVelocityReq = 1
export const zoomOutReq = 0.3
export const horizTransReq = Dimensions.get('window').width * 0.7
export const horizVelocReq = 500

export const textBackdropOpacity = 0.5

/**
 * Takes in some text style settings and returns a filled out text style object. This is used simply to save space in components and simplify things overall. Used within the style prop of a text component.
 */
export const typography = (
  size: number,
  weight: 'l' | 'li' | 'ri' | 'r' | 'b' | 'uir' | 'uib' | 'uim' | 'uis' | 'uil',
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
    l: 'Light',
    li: 'LightItalic',
    ri: 'RegularItalic',
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
