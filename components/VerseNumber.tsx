import React, { useEffect, useMemo } from 'react'
import { Text } from 'react-native'
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { colors } from '../constants'
import bibles from '../data/bibles'
import { useAppSelector } from '../redux/hooks'

interface Props {
  text: string
  setReferenceState?: React.Dispatch<React.SetStateAction<string | undefined>>
  openReferences?: SharedValue<number>
}

export default function VerseNumber({
  text,
  openReferences,
  setReferenceState,
}: Props) {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])

  const highlightVerseNumber = useSharedValue(0)
  const verseNumber = text.replace('[', '').replace(']', '')
  const verseId = `${activeChapter.chapterId}.${verseNumber}`

  useEffect(() => {
    if (activeChapterIndex.verseIndex === parseInt(verseNumber) - 1) {
      console.log('beep')
      highlightVerseNumber.value = withSequence(
        withTiming(1),
        withDelay(2000, withTiming(0))
      )
    }
  }, [activeChapterIndex.verseIndex])

  const verseNumberStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        highlightVerseNumber.value,
        [0, 1],
        [colors.p2 + '00', colors.p2]
      ),
    }
  })

  return (
    <Animated.View
      style={[
        {
          height: settings.fontSize,
          // height: settings.fontSize,
          // width: 40,
          // alignItems: 'center',
          // justifyContent: 'center',
          // alignSelf: 'center',
          borderWidth: 1,
          borderColor: colors.p1,
          borderRadius: 4,
          // paddingBottom: 4,
          // alignSelf: 'baseline',
          // textDecorationLine:
          //   verseId in (references as References) ? 'underline' : 'none',
          // backgroundColor:
          //   activeChapterIndex.verseIndex === parseInt(verseNumber) - 1
          //     ? colors.p1
          //     : undefined,
        },
        verseNumberStyles,
      ]}
      // onPress={
      //   verseId in (references as References)
      //     ? () => {
      //         impactAsync(ImpactFeedbackStyle.Heavy)
      //         if (setReferenceState) setReferenceState(verseId)
      //         if (openReferences !== undefined)
      //           openReferences.value = withTiming(1)
      //       }
      //     : undefined
      // }
    >
      <Text
        style={{
          fontFamily: 'Bold',
          color: colors.p1,
        }}
      >
        {' ' + verseNumber + ' '}
      </Text>
    </Animated.View>
  )
}
