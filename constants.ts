import { DeviceType, deviceType } from 'expo-device'
import { TextStyle, ViewStyle } from 'react-native'
import { sp } from './styles'

export const sizes = {
  massive: 32,
  title: 23,
  subtitle: 19,
  body: 16,
  caption: 14,
  tiny: 12,
}

export const headerHeight = 48

export const shadows: ViewStyle[] = [
  {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
  },
]

export const gutterSize = deviceType === DeviceType.TABLET ? 32 : 28
export const textGutterSize = deviceType === DeviceType.TABLET ? 38 : 34
export const chapterRow = deviceType === DeviceType.TABLET ? 10 : 5
export const scrollBarWidth = sp.lg
export const scrollBarHeight = sp.xl
export const overlayWidth = gutterSize * 3
export const overlayHeight = gutterSize

export const defaultOnPressScale =
  deviceType === DeviceType.TABLET ? 0.98 : 0.95
// export const showOverlayOffset = gutterSize * 4

export const iconSize = 24

export const chapterChangeDuration = 200
export const overScrollReq = 75
export const overScrollVelocityReq = 1
export const zoomOutReq = 0.3
export const horizVelocReq = 500

export const textBackdropOpacity = 0.5
/**
 * Takes in some text style settings and returns a filled out text style object. This is
 * used simply to save space in components and simplify things overall. Used within the
 * style prop of a text component.
 */
export const typography = (
  size: number,
  weight: 'ri' | 'r' | 'b' | 'uir' | 'uib' | 'uim' | 'uis' | 'uil',
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
    // ri: 'Literata18pt-RegularItalic',
    // r: 'Literata18pt-Regular',
    // b: 'Literata18pt-Bold',
    ri: 'Bookerly-Italic',
    r: 'Bookerly-Regular',
    b: 'Bookerly-Bold',
    uil: 'Figtree-Light',
    uir: 'Figtree-Regular',
    uim: 'Figtree-Medium',
    uis: 'Figtree-SemiBold',
    uib: 'Figtree-Bold',
  }

  // Return the completed style object.
  return {
    fontSize: size,
    textAlign: alignments[align],
    color: color,
    fontFamily: weights[weight],
  }
}

export const panActivateConfig = { mass: 0.5, damping: 20, stiffness: 140 }
