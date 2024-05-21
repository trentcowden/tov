import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { Gesture } from 'react-native-gesture-handler'
import {
  runOnJS,
  SharedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { horizTransReq, horizVelocReq, panActivateConfig } from '../constants'

interface Props {
  navigatorTransition: SharedValue<number>
  textFadeOut: SharedValue<number>
  showOverlay: SharedValue<number>
}

export default function useHistoryOpen({
  navigatorTransition,
  textFadeOut,
  showOverlay,
}: Props) {
  const textTranslateX = useSharedValue(0)
  const savedTextTranslateX = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (navigatorTransition.value !== 0 || textFadeOut.value !== 0) return

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
            runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
            savedTextTranslateX.value = horizTransReq
            textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          } else {
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
            runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
            savedTextTranslateX.value = 0
            textTranslateX.value = withSpring(0, panActivateConfig)
          } else {
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
