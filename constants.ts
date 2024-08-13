import { DeviceType, deviceType } from 'expo-device'
import { sp } from './styles'

export const headerHeight = 48

export const chapterRow = deviceType === DeviceType.TABLET ? 10 : 5
export const scrollBarWidth = sp.lg
export const scrollBarHeight = sp.xl
export const overlayWidth = sp.xl * 3
export const overlayHeight = sp.xl

export const defaultOnPressScale =
  deviceType === DeviceType.TABLET ? 0.98 : 0.95

export const chapterChangeDuration = 200
export const overScrollReq = 75
export const overScrollVelocityReq = 1
export const zoomOutReq = 0.3
export const horizVelocReq = 500

export const panActivateConfig = { mass: 0.5, damping: 20, stiffness: 140 }

export const textSizeNames = {
  12: 'Miniscule',
  14: 'Small',
  16: 'Standard',
  18: 'Pretty Big',
  21: 'Huge',
  25: 'Massive',
}
