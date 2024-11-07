import { trackEvent } from '@aptabase/react-native'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import ArrowLeft from '../assets/icons/duotone/arrow-narrow-left.svg'
import ArrowRight from '../assets/icons/duotone/arrow-narrow-right.svg'
import { panActivateConfig } from '../constants'
import bibles from '../data/bibles'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, ic, sans, sp, tx } from '../styles'
import TovPressable from './TovPressable'

interface Props {
  item: string | [string] | [string, string]
  index: number
  activeReferences: ([string] | [string, string])[]
  referenceVerse: string | undefined
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

  const verse = useMemo(() => {
    const verseId = typeof item === 'string' ? item : item[0]
    const [bookId, chapterNumber, verseNumber] = verseId.split('.')

    const chapterIndex = bibles[settings.translation].findIndex(
      (chapter) => chapter.chapterId === `${bookId}.${chapterNumber}`
    )

    const chapter = bibles[settings.translation][chapterIndex]
    const verses = chapter.md.split('[')
    if (parseInt(verseNumber) >= verses.length) {
      console.log('Verse number out of range:', verseId)
      trackEvent('Verse number out of range', { verseId })
      return ''
    }
    const verse = verses.find((verse) => verse.startsWith(verseNumber))
    if (!verse) {
      console.log('Verse not found:', verseId)
      return ''
    }
    return verse.replace(']', '').replace(verseNumber, '').replace(/\*/g, '')
    // return verses[parseInt(verseNumber)].replace(']', '')
  }, [item, settings.translation])

  if (!referenceVerse) return <View />

  const start = typeof item === 'string' ? item : item[0]
  const isAfter = isPassageAfter(referenceVerse, start) < 0
  const prevReference = index > 0 ? activeReferences[index - 1] : null
  const prevStart = prevReference
    ? typeof prevReference === 'string'
      ? prevReference
      : prevReference[0]
    : null
  const prevIsAfter =
    prevStart !== null ? isPassageAfter(referenceVerse, prevStart) < 0 : null

  let passageString = referenceVerse.includes('tutorial')
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
  return verse === '' ? null : (
    <>
      {isAfter && !prevIsAfter && index !== 0 ? (
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
      ) : null}
      <TovPressable
        style={{
          paddingHorizontal: sp.md,
          paddingVertical: sp.md,
          borderRadius: br.lg,
          gap: sp.sm,
          // justifyContent: isAfter ? 'flex-end' : 'flex-start',
        }}
        bgColor={colors.bg2}
        onPressColor={colors.bg3}
        onPress={() => {
          jumpToChapter({
            chapterId: start.split('.').slice(0, 2).join('.'),
            verseNumber: startingVerse - 1,
            comingFrom: 'reference',
            currentVerse: parseInt(referenceVerse.split('.')[2]) - 1,
            numVersesToHighlight:
              endingVerse !== 0 ? endingVerse - startingVerse : undefined,
          })
          openReferences.value = withSpring(0, panActivateConfig)
        }}
      >
        <View
          style={{
            alignItems: 'center',
            gap: sp.sm,
            flexDirection: 'row',
          }}
        >
          {isAfter ? null : <ArrowLeft {...ic.md} color={colors.p1} />}
          <Text style={[sans(tx.body, 'r', 'l', colors.fg1)]}>
            {passageString}
          </Text>
          {isAfter ? <ArrowRight {...ic.md} color={colors.p1} /> : null}
        </View>
        <Text style={[sans(tx.tiny, 'l', 'l', colors.fg3)]} numberOfLines={3}>
          {verse.replace(/[\r\n]+/g, ' ').trim()}
        </Text>
      </TovPressable>
    </>
  )
}
