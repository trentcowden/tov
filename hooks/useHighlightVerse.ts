import { useEffect } from 'react'
import {
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useAppSelector } from '../redux/hooks'

interface Props {
  textRendered: boolean
}

export default function useHighlightVerse({ textRendered }: Props) {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const highlightVerseNumber = useSharedValue(0)

  useEffect(() => {
    if (
      activeChapterIndex.verseIndex !== undefined &&
      activeChapterIndex.verseIndex !== 'bottom' &&
      textRendered &&
      activeChapterIndex.highlightVerse
    ) {
      highlightVerseNumber.value = withSequence(
        withTiming(1),
        withDelay(2000, withTiming(0))
      )
    }
  }, [activeChapterIndex, textRendered])
}
