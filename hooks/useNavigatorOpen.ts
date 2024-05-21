import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { TextInput } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import { runOnJS, SharedValue, withTiming } from 'react-native-reanimated'

interface Props {
  navigatorTransition: SharedValue<number>
  savedNavigatorTransition: SharedValue<number>
  textTranslateX: SharedValue<number>
  openReferences: SharedValue<number>
  searchRef: React.RefObject<TextInput>
}

export default function useNavigatorOpen({
  navigatorTransition,
  savedNavigatorTransition,
  openReferences,
  textTranslateX,
  searchRef,
}: Props) {
  function focusSearch() {
    searchRef.current?.focus()
  }

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      // If we are viewing history/verse info, ignore taps.
      if (Math.abs(textTranslateX.value) > 10) return
      // If the navigator is already open, ignore taps.
      else if (navigatorTransition.value !== 0) return
      else if (openReferences.value !== 0) return

      savedNavigatorTransition.value = 1
      navigatorTransition.value = withTiming(1)

      runOnJS(focusSearch)()
      runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
    })

  return {
    tapGesture,
  }
}
