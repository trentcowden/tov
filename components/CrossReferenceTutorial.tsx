import React, { useRef } from 'react'
import Animated, { SharedValue, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Chapters } from '../data/types/chapters'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'

interface Props {
  verseOffsets: number[] | undefined
  highlightVerseNumber: SharedValue<number>
  activeChapter: Chapters[number]
  jumpToChapter: JumpToChapter
  verseNewlines: boolean[] | undefined
}

const swipeReq = 75

export default function CrossReferenceTutorial({ verseOffsets }: Props) {
  const insets = useSafeAreaInsets()
  const dismissed = useAppSelector((state) => state.popups.dismissed)
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const referenceTree = useAppSelector((state) => state.referenceTree)
  const dispatch = useAppDispatch()
  const history = useAppSelector((state) => state.history)
  const alreadyHaptic = useRef(false)
  const itemTranslateX = useSharedValue(0)
  // const active = useSharedValue(0)

  const top = verseOffsets
    ? typeof activeChapterIndex.verseIndex === 'number'
      ? verseOffsets[activeChapterIndex.verseIndex]
      : 0
    : 0

  return verseOffsets && !dismissed.includes('highlightCrossReference') ? (
    <Animated.View
      style={[
        {
          position: 'absolute',
          height: 40,
          width: 40,
          top: verseOffsets[0],
          alignSelf: 'center',
          backgroundColor: colors.p1,
          borderRadius: 12,
          zIndex: -10,
        },
      ]}
    />
  ) : null
}
