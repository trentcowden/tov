import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { useWindowDimensions } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  runOnJS,
  SharedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { horizVelocReq, panActivateConfig } from '../constants'
import { getHorizTransReq } from '../functions/utils'

interface Props {
  navigatorTransition: SharedValue<number>
  textFadeOut: SharedValue<number>
  scrollOffset: SharedValue<number>
  overlayOpacity: SharedValue<number>
}

export default function useHistoryOpen({
  navigatorTransition,
  textFadeOut,
  overlayOpacity,
  scrollOffset,
}: Props) {
  const { width } = useWindowDimensions()
  const horizTransReq = getHorizTransReq(width)
  const textTranslateX = useSharedValue(0)
  const savedTextTranslateX = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (navigatorTransition.value !== 0 || textFadeOut.value !== 0) return

      // if (textTranslateX.value > gutterSize) {
      //   overlayOpacity.value = withTiming(0)
      // }
      // // else if (scrollOffset.value > showOverlayOffset)
      // else overlayOpacity.value = withTiming(1)

      const value = savedTextTranslateX.value + event.translationX
      if (value < horizTransReq && value > 0) {
        textTranslateX.value = value
      }
    })
    .onFinalize((e) => {
      if (navigatorTransition.value !== 0 || textFadeOut.value !== 0) return

      const comingFrom =
        savedTextTranslateX.value === 0
          ? 'center'
          : savedTextTranslateX.value > 0
            ? 'left'
            : 'right'

      switch (comingFrom) {
        case 'center':
          if (
            textTranslateX.value > horizTransReq / 2 ||
            e.velocityX > horizVelocReq
          ) {
            // overlayOpacity.value = withTiming(0)
            runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          } else {
            // if (scrollOffset.value > showOverlayOffset)
            // overlayOpacity.value = withTiming(1)
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          }
          break
        case 'right':
          if (
            textTranslateX.value > -horizTransReq / 2 ||
            e.velocityX > horizVelocReq
          ) {
            runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          } else {
            savedTextTranslateX.value = -horizTransReq
            textTranslateX.value = withSpring(-horizTransReq, panActivateConfig)
          }
          break
        case 'left':
          if (
            textTranslateX.value < horizTransReq / 2 ||
            e.velocityX < -horizVelocReq
          ) {
            // if (scrollOffset.value > showOverlayOffset)
            // overlayOpacity.value = withTiming(1)
            runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          } else {
            // if (scrollOffset.value < showOverlayOffset)
            // overlayOpacity.value = withTiming(0)
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          }
      }
    })

  return {
    panGesture,
    textTranslateX,
    savedTextTranslateX,
  }
}
