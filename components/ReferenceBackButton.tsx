import React, { useEffect, useMemo } from 'react'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gutterSize, overlayHeight, shadow } from '../constants'
import bibles from '../data/bibles'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

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
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const referenceTree = useAppSelector((state) => state.referenceTree)
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const history = useAppSelector((state) => state.history)
  const width = useSharedValue(0)
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

  useEffect(() => {
    if (recentChapter) {
      width.value = withTiming(64)
    } else {
      width.value = withTiming(0)
    }
  }, [recentChapter])

  const aStyles = useAnimatedStyle(() => {
    return {
      width: width.value,
    }
  })

  // console.log(recentChapter)

  return (
    <Animated.View style={[{ overflow: 'hidden' }, aStyles]}>
      <TovPressable
        bgColor={colors.p3}
        onPressColor={colors.p3}
        style={{
          // position: 'absolute',
          // top: gutterSize / 2,
          // top: 0,
          // left: gutterSize,
          // width: '100%',
          // left: gutterSize,
          // borderRadius: 99,
          zIndex: 1,
          borderRadius: 999,
          // width: 64,
          width: '100%',
          height: overlayHeight,
          // paddingTop: gutterSize,
          // height: insets.top ?? gutterSize * 2,
          paddingHorizontal: gutterSize / 8,
          justifyContent: 'center',
          alignItems: 'center',
          ...shadow,
        }}
        onPress={() => {
          if (!recentChapter) return

          jumpToChapter({
            chapterId: recentChapter.chapterId,
            verseNumber: recentChapter.verseIndex,
            comingFrom: 'reference',
          })

          // if (typeof recentChapter.verseIndex !== 'number') return

          // const verseId = `${recentChapter.chapterId}.${recentChapter.verseIndex + 1}`
          // setReferenceState(verseId)
          // openReferences.value = withTiming(1)
        }}
      >
        {/* <TovIcon name={icon} size={14} /> */}
        {/* <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1}
        style={{
          ...typography(sizes.caption, 'uis', 'l', colors.fg3),
        }}
      >
        Back
      </Text> */}
        <TovIcon name="arrowLeft" size={20} color={colors.fg3} />
      </TovPressable>
    </Animated.View>
  )
}