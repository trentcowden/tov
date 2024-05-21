import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import {
  SharedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  currentVerseReq,
  getUsableHeight,
  gutterSize,
  overScrollReq,
  screenHeight,
} from '../constants'

interface Props {
  fingerDown: React.MutableRefObject<boolean>
  alreadyHaptic: React.MutableRefObject<boolean>
  textTranslateY: SharedValue<number>
  verseOffsets: number[] | undefined
  releaseToChange: SharedValue<number>
  scrollBarActivate: SharedValue<number>
  currentVerseIndex: SharedValue<number | 'top' | 'bottom'>
  overScrollAmount: SharedValue<number>
  showOverlay: SharedValue<number>
}

export default function useScrollUpdate({
  fingerDown,
  alreadyHaptic,
  textTranslateY,
  verseOffsets,
  releaseToChange,
  currentVerseIndex,
  overScrollAmount,
  scrollBarActivate,
  showOverlay,
}: Props) {
  const insets = useSafeAreaInsets()
  const usableHeight = getUsableHeight(insets)
  const scrollBarPosition = useSharedValue(insets.top * 1)
  const scrollOffset = useSharedValue(0)

  function handleScrollHaptics(offset: number, contentHeight: number) {
    if (!fingerDown.current) return

    // If we meet the requirements for going to the next or previous chapter while we
    // are still scrolling, give some haptic feedback to indicate to the user that if
    // they release their finger, they will go to the next/previous chapter.
    if (offset < -overScrollReq && !alreadyHaptic.current) {
      impactAsync(ImpactFeedbackStyle.Heavy)
      alreadyHaptic.current = true
    } else if (
      offset > contentHeight - screenHeight + overScrollReq &&
      !alreadyHaptic.current
    ) {
      impactAsync(ImpactFeedbackStyle.Heavy)
      alreadyHaptic.current = true
      // If we were previously eligible to go to the next/previous chapter but aren't
      // anymore, give a lighter haptic feedback to indicate that the chapter won't
      // change on release.
    } else if (
      textTranslateY.value === 0 &&
      offset < 0 &&
      offset > -overScrollReq &&
      alreadyHaptic.current === true
    ) {
      impactAsync(ImpactFeedbackStyle.Light)
      alreadyHaptic.current = false
    } else if (
      textTranslateY.value === 0 &&
      offset > contentHeight - screenHeight &&
      offset < contentHeight - screenHeight + overScrollReq &&
      alreadyHaptic.current === true
    ) {
      impactAsync(ImpactFeedbackStyle.Light)
      alreadyHaptic.current = false
    }
  }

  function handleReleaseToChange(offset: number, contentHeight: number) {
    if (!fingerDown.current) return

    // If we meet the requirements for going to the next or previous chapter while we
    // are still scrolling, give some haptic feedback to indicate to the user that if
    // they release their finger, they will go to the next/previous chapter.
    if (offset < -overScrollReq && releaseToChange.value === 0) {
      releaseToChange.value = withTiming(1)
    } else if (
      offset > contentHeight - screenHeight + overScrollReq &&
      releaseToChange.value === 0
    ) {
      releaseToChange.value = withTiming(1)
      // If we were previously eligible to go to the next/previous chapter but aren't
      // anymore, give a lighter haptic feedback to indicate that the chapter won't
      // change on release.
    } else if (
      textTranslateY.value === 0 &&
      offset < 0 &&
      offset > -overScrollReq &&
      releaseToChange.value !== 0
    ) {
      releaseToChange.value = withTiming(0)
    } else if (
      textTranslateY.value === 0 &&
      offset > contentHeight - screenHeight &&
      offset < contentHeight - screenHeight + overScrollReq &&
      releaseToChange.value !== 0
    ) {
      releaseToChange.value = withTiming(0)
    }
  }

  function getVerseIndex(offset: number) {
    if (!verseOffsets) return -1

    if (offset + 50 > verseOffsets[verseOffsets.length - 1] - screenHeight) {
      return 'bottom'
    } else if (offset < 50) return 'top'

    let low = 0
    let high = verseOffsets.length - 1
    let result = -1
    const target = offset + currentVerseReq

    while (low <= high) {
      let mid = Math.floor((low + high) / 2)
      if (verseOffsets[mid] <= target) {
        result = mid // Found a new boundary
        low = mid + 1 // Try to find a higher value still <= target
      } else {
        high = mid - 1
      }
    }
    return result
  }

  function handleScrollBarUpdate(offset: number) {
    if (!verseOffsets || scrollBarActivate.value > 0) return

    const textHeight = verseOffsets[verseOffsets.length - 1]

    // This shit is crazy. Thanks chat gpt.
    const scrollBarHeight = usableHeight * (usableHeight / textHeight)
    const scrollRatio = offset / (textHeight - screenHeight)
    const maxTopPos = screenHeight - insets.bottom * 2 - scrollBarHeight

    scrollBarPosition.value =
      insets.top * 1 + scrollRatio * (maxTopPos - insets.top * 1)
  }

  function handleScrollVersePosition(offset: number) {
    const result = getVerseIndex(offset)

    if (result === 'bottom' || result === 'top' || result >= 0) {
      currentVerseIndex.value = result
    }
  }

  function handleOverScrollAmount(offset: number, contentHeight: number) {
    if (offset < 0) overScrollAmount.value = offset
    else if (offset > contentHeight - screenHeight)
      overScrollAmount.value = Math.abs(contentHeight - screenHeight - offset)
    else overScrollAmount.value = 0
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const offset = event.nativeEvent.contentOffset.y
    const contentHeight = event.nativeEvent.contentSize.height
    scrollOffset.value = offset
    if (offset > gutterSize * 4) showOverlay.value = withTiming(1)
    else showOverlay.value = withTiming(0)
    handleScrollBarUpdate(offset)
    handleScrollHaptics(offset, contentHeight)
    handleScrollVersePosition(offset)
    handleReleaseToChange(offset, contentHeight)
    handleOverScrollAmount(offset, contentHeight)
  }

  return { onScroll, scrollBarPosition, scrollOffset }
}
