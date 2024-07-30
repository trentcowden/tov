import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { Gesture } from 'react-native-gesture-handler'
import { runOnJS, useSharedValue, withSpring } from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { panActivateConfig } from '../constants'
import { decreaseTextSize, increaseTextSize } from '../redux/settings'

export default function usePinch() {
  const dispatch = useDispatch()

  const scale = useSharedValue(0)
  const initialScale = useSharedValue(0)
  const goTo = useSharedValue(0)
  const recentHaptic = useSharedValue(0)

  const increase = async () => {
    // await impactAsync(ImpactFeedbackStyle.Heavy)
    dispatch(increaseTextSize())
  }
  const decrease = async () => {
    // await impactAsync(ImpactFeedbackStyle.Heavy)
    dispatch(decreaseTextSize())
  }

  const pinchGesture = Gesture.Pinch()
    .onStart((scale) => {
      initialScale.value = scale.scale
    })
    .onUpdate((e) => {
      if (goTo.value !== 0) return

      const rounded = Math.round(e.scale * 50)
      console.log(rounded)

      if (scale.value > 1 && goTo.value === 0) {
        goTo.value = 1
        runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
      } else if (scale.value < -0.5 && goTo.value === 0) {
        goTo.value = -1
        runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
      }

      // if (recentHaptic.value !== rounded) {
      //   recentHaptic.value = rounded
      //   runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
      // }

      scale.value = e.scale - initialScale.value
    })
    .onEnd(() => {
      if (goTo.value === 1) {
        runOnJS(increase)()
      } else if (goTo.value === -1) {
        runOnJS(decrease)()
      }

      recentHaptic.value = 0
      initialScale.value = 0
      scale.value = withSpring(0, panActivateConfig)
      goTo.value = 0
    })

  return {
    scale,
    pinchGesture,
  }
}
