import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { useEffect, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { horizVelocReq, panActivateConfig } from '../constants'
import { getHorizTransReq } from '../functions/utils'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { dismissPopup } from '../redux/popups'
import { sp } from '../styles'

interface Props {
  openNavigator: SharedValue<number>
  textFadeOut: SharedValue<number>
  scale: SharedValue<number>
  textTranslateY: SharedValue<number>
}

export default function useHistoryOpen({
  openNavigator,
  textFadeOut,
  scale,
  textTranslateY,
}: Props) {
  const { width } = useWindowDimensions()
  const horizTransReq = getHorizTransReq(width)
  const textTranslateX = useSharedValue(0)
  const savedTextTranslateX = useSharedValue(0)
  const dispatch = useAppDispatch()
  const [wiggleTime, setWiggleTime] = useState(false)
  const popups = useAppSelector((state) => state.popups)
  const popup = 'historyWiggle'
  const history = useAppSelector((state) => state.history)

  useDerivedValue(() => {
    if (
      !popups.dismissed.includes(popup) &&
      history.length === 2 &&
      textTranslateY.value === 0
    )
      runOnJS(setWiggleTime)(true)
    else runOnJS(setWiggleTime)(false)
  })

  useEffect(() => {
    if (wiggleTime) {
      dispatch(dismissPopup(popup))
      textTranslateX.value = withSequence(
        withTiming(sp.xx, { duration: 150 }),
        withSpring(1, panActivateConfig)
      )
    }
  }, [dispatch, textTranslateX, wiggleTime])

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (
        openNavigator.value !== 0 ||
        textFadeOut.value !== 0 ||
        scale.value !== 0
      )
        return

      const value = savedTextTranslateX.value + event.translationX
      if (value < horizTransReq && value > 0) {
        textTranslateX.value = value
      }
    })
    .onFinalize((e) => {
      if (
        openNavigator.value !== 0 ||
        textFadeOut.value !== 0 ||
        scale.value !== 0
      )
        return

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
