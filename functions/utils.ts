import { DeviceType, deviceType } from 'expo-device'
import { EdgeInsets } from 'react-native-safe-area-context'
import { sp } from '../styles'

export const getCurrentVerseReq = (height: number) => height / 3

export const getScrollBarMargin = (insets: EdgeInsets) => {
  const top = insets.top !== 0 ? insets.top : 0
  const bottom = insets.bottom !== 0 ? insets.bottom * 1.5 : 0

  return {
    top,
    bottom,
  }
}

export const getModalHeight = (height: number, insets: EdgeInsets) =>
  height - getEdges(insets).top - getEdges(insets).bottom - sp.xl * 4

export const getEdges = (insets: EdgeInsets) => {
  const top = insets.top !== 0 ? insets.top : sp.xl
  const bottom = insets.bottom !== 0 ? insets.bottom : sp.xl

  return {
    top,
    bottom,
  }
}

export const getModalWidth = (width: number) => width - sp.xl * 2
export const getHorizTransReq = (width: number) => {
  if (DeviceType.TABLET === deviceType) return width * 0.3
  else return width * 0.7
}
