import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated'
import ArrowRight from '../assets/icons/duotone/arrow-narrow-right.svg'
import ChevronDown from '../assets/icons/duotone/chevron-down.svg'
import ChevronUp from '../assets/icons/duotone/chevron-up.svg'
import { panActivateConfig } from '../constants'
import bibles from '../data/bibles'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, ic, sans, sp, tx } from '../styles'
import TovPressable from './TovPressable'

interface Props {
  item: [string] | [string, string]
  index: number
  activeReferences: ([string] | [string, string])[]
  referenceVerse:
    | {
        verseId: string
        text: string
      }
    | undefined
  openReferences: SharedValue<number>
  jumpToChapter: JumpToChapter
}

export default function ReferenceItem({
  item,
  index,
  openReferences,
  referenceVerse,
  jumpToChapter,
  activeReferences,
}: Props) {
  const colors = useColors()
  const settings = useAppSelector((state) => state.settings)

  const [expanded, setExpanded] = React.useState(false)

  useDerivedValue(() => {
    if (openReferences.value === 0) {
      runOnJS(setExpanded)(false)
    }
  })

  const referenceText = useMemo(() => {
    // return `reference text for ${item}`
    const startVerseId = item[0]
    const endVerseId = item.length === 2 ? item[1] : item[0]

    const [startBookId, startChapterNumber, startVerseNumber] =
      startVerseId.split('.')
    const [endBookId, endChapterNumber, endVerseNumber] = endVerseId.split('.')

    if (startBookId !== endBookId) return ''
    else if (startChapterNumber !== endChapterNumber) return ''

    const chapterIndex = bibles[settings.translation].findIndex(
      (chapter) => chapter.chapterId === `${startBookId}.${startChapterNumber}`
    )

    const chapter = bibles[settings.translation][chapterIndex]

    // if (parseInt(startVerseNumber) >= chapter.verses.length) {
    //   console.log('Verse number out of range:', startVerseId)
    //   trackEvent('Verse number out of range', { verseId: startVerseId })
    //   return ''
    // }

    const startIndex = chapter.verses.findIndex(
      (verse) => verse.verseId === startVerseId
    )
    const endIndex = chapter.verses.findIndex(
      (verse) => verse.verseId === endVerseId
    )

    if (startIndex === -1 || endIndex === -1) {
      console.log('Verse not found:', startVerseId, endVerseId)
      return ''
    }

    const referenceText = chapter.verses
      .slice(startIndex, endIndex + 1)
      .map((verse) => verse.text)
      .join(' ')

    console.log(referenceText)

    return referenceText
      .replace(/\*/g, '')
      .replace(/[\r\n]+/g, ' ')
      .trim()
  }, [item, settings.translation])

  if (!referenceVerse || referenceText === '') return <View />

  const start = typeof item === 'string' ? item : item[0]
  const isAfter = isPassageAfter(referenceVerse.verseId, start) < 0
  const prevReference = index > 0 ? activeReferences[index - 1] : null
  const prevStart = prevReference
    ? typeof prevReference === 'string'
      ? prevReference
      : prevReference[0]
    : null
  const prevIsAfter =
    prevStart !== null
      ? isPassageAfter(referenceVerse.verseId, prevStart) < 0
      : null

  let passageString = referenceVerse.verseId.includes('tutorial')
    ? 'Welcome 1'
    : getVerseReference(start)

  let startingVerse = parseInt(start.split('.')[2])
  let endingVerse = 0

  if (typeof item !== 'string' && item.length === 2) {
    passageString += '-'

    endingVerse = parseInt(
      getVerseReference(item[1]).split(':').slice(-1).join(' ')
    )

    passageString += endingVerse.toString()
  }
  return referenceText === '' ? null : (
    <>
      {/* {isAfter && !prevIsAfter && index !== 0 ? (
        <View
          style={{
            width: sp.sm,
            height: sp.sm,
            borderRadius: br.fu,
            alignSelf: 'center',
            backgroundColor: colors.ph,
            marginVertical: sp.xl,
          }}
        />
      ) : null} */}
      <TovPressable
        outerOuterStyle={{
          flex: 1,
        }}
        style={{
          paddingVertical: sp.md,
          borderRadius: br.lg,
          gap: sp.sm,
          paddingHorizontal: sp.md,
          borderWidth: expanded ? 1 : 0,
          borderColor: colors.bg3,
          // justifyContent: isAfter ? 'flex-end' : 'flex-start',
        }}
        bgColor={colors.bg2}
        onPressColor={colors.bg3}
        onPress={() => {
          setExpanded((current) => !current)
          // jumpToChapter({
          //   chapterId: start.split('.').slice(0, 2).join('.'),
          //   verseNumber: startingVerse - 1,
          //   comingFrom: 'reference',
          //   currentVerse: parseInt(referenceVerse.split('.')[2]) - 1,
          //   numVersesToHighlight:
          //     endingVerse !== 0 ? endingVerse - startingVerse : undefined,
          // })
          // openReferences.value = withSpring(0, panActivateConfig)
        }}
      >
        <View
          style={{
            alignItems: 'center',
            gap: sp.sm,
            flexDirection: 'row',
          }}
        >
          {/* {isAfter ? null : <ArrowLeft {...ic.md} color={colors.p1} />} */}
          <Text style={[sans(tx.body, 'r', 'l', colors.fg1), { flex: 1 }]}>
            {passageString}
          </Text>
          {/* {isAfter ? <ArrowRight {...ic.md} color={colors.p1} /> : null} */}
          {expanded ? (
            <ChevronDown {...ic.md} color={colors.p1} />
          ) : (
            <ChevronUp {...ic.md} color={colors.p1} />
          )}
        </View>
        <Text
          style={[
            sans(tx.tiny, 'l', 'l', colors.fg3),
            { fontFamily: 'Bookerly-Regular' },
          ]}
          numberOfLines={expanded ? undefined : 1}
        >
          {referenceText}
        </Text>
        {expanded ? (
          <TovPressable
            onPress={() => {
              jumpToChapter({
                chapterId: start.split('.').slice(0, 2).join('.'),
                verseNumber: startingVerse - 1,
                comingFrom: 'reference',
                currentVerse:
                  parseInt(referenceVerse.verseId.split('.')[2]) - 1,
                numVersesToHighlight:
                  endingVerse !== 0 ? endingVerse - startingVerse : undefined,
              })
              openReferences.value = withSpring(0, panActivateConfig)
            }}
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: sp.xs,
              borderRadius: br.lg,
              paddingHorizontal: sp.md,
              paddingVertical: sp.xs,
              marginTop: sp.sm,
            }}
            bgColor={colors.bg3}
          >
            <Text
              style={[
                sans(tx.tiny, 'b', 'l', colors.p1),
                // { textDecorationLine: 'underline' },
              ]}
            >
              Go to chapter
            </Text>
            <ArrowRight {...ic.sm} color={colors.p1} />
          </TovPressable>
        ) : null}
        <View style={{ position: 'absolute', right: 0 }}></View>
      </TovPressable>
    </>
  )
}
