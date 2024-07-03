import { trackEvent } from '@aptabase/react-native'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { TextInput } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  runOnJS,
  SharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { panActivateConfig } from '../constants'

interface Props {
  openNavigator: SharedValue<number>
  textTranslateX: SharedValue<number>
  openReferences: SharedValue<number>
  searchRef: React.RefObject<TextInput>
  overlayOpacity: SharedValue<number>
}

export default function useNavigatorOpen({
  openNavigator,
  openReferences,
  textTranslateX,
  searchRef,
  overlayOpacity,
}: Props) {
  function focusSearch() {
    searchRef.current?.focus()
  }

  const logEvent = () => {
    trackEvent('Open navigator', { method: 'double tap' })
  }

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      // If we are viewing history/verse info, ignore taps.
      if (Math.abs(textTranslateX.value) > 10) return
      // If the navigator is already open, ignore taps.
      else if (openNavigator.value !== 0) return
      else if (openReferences.value !== 0) return

      overlayOpacity.value = withTiming(1)
      openNavigator.value = withSpring(1, panActivateConfig)

      runOnJS(focusSearch)()
      runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
      runOnJS(logEvent)()
    })

  return {
    tapGesture,
    focusSearch,
  }
}
