import { useEffect } from 'react'
import {
  SharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useAppSelector } from '../redux/hooks'

interface Props {
  verseOffsets: number[] | undefined
  highlightVerseNumber: SharedValue<number>
}

export default function useHighlightVerse({
  verseOffsets,
  highlightVerseNumber,
}: Props) {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)

  useEffect(() => {
    if (
      typeof activeChapterIndex.verseIndex === 'number' &&
      verseOffsets !== undefined &&
      activeChapterIndex.highlightVerse
    ) {
      highlightVerseNumber.value = withSequence(
        withTiming(1),
        withDelay(2000, withTiming(0))
      )
    }
  }, [activeChapterIndex, verseOffsets])
}
