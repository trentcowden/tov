import React, { useMemo } from 'react'
import { Pressable, Text } from 'react-native'
import { SharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, shadow, sizes, typography } from '../constants'
import bibles from '../data/bibles'
import { JumpToChapter } from '../hooks/useChapterChange'
import { useAppSelector } from '../redux/hooks'

interface Props {
  jumpToChapter: JumpToChapter
  setReferenceState: React.Dispatch<React.SetStateAction<string | undefined>>
  openReferences: SharedValue<number>
}

export default function ReferenceBackButton({
  jumpToChapter,
  setReferenceState,
  openReferences,
}: Props) {
  const insets = useSafeAreaInsets()
  const referenceTree = useAppSelector((state) => state.referenceTree)
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const history = useAppSelector((state) => state.history)

  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])

  // const canGoBack =
  //   referenceTree.indexOf(activeChapter.chapterId) > 0 && history.length >= 2

  const recentChapter = useMemo(() => {
    const thisReferenceIndex = referenceTree.indexOf(activeChapter.chapterId)
    if (thisReferenceIndex <= 0) return undefined

    const referenceBeforeThisOne =
      referenceTree[referenceTree.indexOf(activeChapter.chapterId) - 1]
    const historyItem = history.find(
      (item) => item.chapterId === referenceBeforeThisOne
    )
    return historyItem
  }, [history])

  console.log(recentChapter)

  return recentChapter ? (
    <Pressable
      style={{
        position: 'absolute',
        // top: gutterSize / 2,
        top: 0,
        left: gutterSize,
        // width: '100%',
        // left: gutterSize,
        // borderRadius: 99,
        zIndex: 1,
        borderRadius: 999,
        width: 80,
        // paddingTop: gutterSize,
        height: insets.top ?? gutterSize * 2,
        paddingHorizontal: gutterSize / 8,
        justifyContent: 'center',
        alignItems: 'center',
        // paddingVertical: gutterSize / 2,
        //
        backgroundColor: colors.bg2,
        borderBottomRightRadius: 999,
        borderBottomLeftRadius: 999,
        ...shadow,
      }}
      onPress={() => {
        jumpToChapter({
          chapterId: recentChapter.chapterId,
          verseNumber: recentChapter.verseIndex,
        })

        if (typeof recentChapter.verseIndex !== 'number') return

        const verseId = `${recentChapter.chapterId}.${recentChapter.verseIndex + 1}`
        setReferenceState(verseId)
        openReferences.value = withTiming(1)
      }}
    >
      {/* <TovIcon name={icon} size={14} /> */}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1}
        style={{
          ...typography(sizes.caption, 'uis', 'l', colors.fg3),
        }}
      >
        Back
      </Text>
    </Pressable>
  ) : null
}
