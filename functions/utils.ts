import { EdgeInsets } from 'react-native-safe-area-context'
import { gutterSize } from '../constants'

export const getCurrentVerseReq = (height: number) => height / 3

export const getModalHeight = (height: number, insets: EdgeInsets) =>
  height - getEdges(insets).top - getEdges(insets).bottom - gutterSize * 4

export const getEdges = (insets: EdgeInsets) => {
  const top = insets.top !== 0 ? insets.top : 48
  const bottom = insets.bottom !== 0 ? insets.bottom : 48

  return {
    top,
    bottom,
  }
}

export const getModalWidth = (width: number) => width - gutterSize * 4
export const getHorizTransReq = (width: number) => width * 0.7
