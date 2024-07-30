import { trackEvent } from '@aptabase/react-native'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'
import { SharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { gutterSize, panActivateConfig, sizes, typography } from '../constants'
import bibles from '../data/bibles'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br } from '../styles'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  item: string | [string] | [string, string]
  index: number
  activeReferences: ([string] | [string, string])[]
  referenceVerse: string | undefined
  openReferences: SharedValue<number>
  openReferencesNested: SharedValue<number>
  jumpToChapter: JumpToChapter
}

export default function ReferenceItem({
  item,
  index,
  openReferences,
  openReferencesNested,
  referenceVerse,
  jumpToChapter,
  activeReferences,
}: Props) {
  const colors = useColors()
  const settings = useAppSelector((state) => state.settings)
  if (!referenceVerse) return <View />

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
      // trackEvent('Verse not found', { verseId })
      return ''
    }
    return verse.replace(']', '').replace(verseNumber, '').replace(/\*/g, '')
    // return verses[parseInt(verseNumber)].replace(']', '')
  }, [item])

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
      {/* {index === 0 && !isAfter ? (
        <Text
          style={[
            typography(sizes.caption, 'uil', 'l', colors.fg3),
            {
              paddingHorizontal: gutterSize / 2,
              marginBottom: gutterSize / 2,
            },
          ]}
        >
          Earlier in the Bible
        </Text>
      ) : isAfter && !prevIsAfter ? (
        <View
          style={{
            width: '100%',
            paddingHorizontal: gutterSize / 2,
            marginTop: index !== 0 ? gutterSize : 0,
          }}
        >
          {index !== 0 ? (
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: colors.bg3,
              }}
            />
          ) : null}
          <Text
            style={[
              typography(sizes.caption, 'uil', 'l', colors.fg3),
              {
                marginBottom: gutterSize / 2,
                marginTop: index !== 0 ? gutterSize : 0,
                // textAlign: 'right',
              },
            ]}
          >
            Later in the Bible
          </Text>
        </View>
      ) : null} */}
      {isAfter && !prevIsAfter && index !== 0 ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            alignSelf: 'center',
            backgroundColor: colors.ph,
            marginVertical: gutterSize,
          }}
        />
      ) : null}
      <TovPressable
        style={{
          paddingHorizontal: gutterSize / 2,
          paddingVertical: gutterSize * 0.66,
          borderRadius: br.lg,
          gap: 8,
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
          openReferencesNested.value = withTiming(0)
          openReferences.value = withSpring(0, panActivateConfig)
        }}
      >
        <View
          style={{
            alignItems: 'center',
            gap: 8,
            flexDirection: 'row',
          }}
        >
          {isAfter ? null : (
            <TovIcon name={'arrowLeft'} size={18} color={colors.p1} />
          )}
          <Text style={[typography(sizes.body, 'uir', 'l', colors.fg1)]}>
            {passageString}
          </Text>
          {isAfter ? (
            <TovIcon name={'arrowRight'} size={18} color={colors.p1} />
          ) : null}
        </View>
        <Text
          style={[typography(sizes.tiny, 'uil', 'l', colors.fg3)]}
          numberOfLines={2}
        >
          {verse.trim()}
        </Text>
      </TovPressable>
    </>
  )
}
