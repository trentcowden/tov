import { trackEvent } from '@aptabase/react-native'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import React, { useMemo } from 'react'
import {
  NativeSyntheticEvent,
  Text,
  TextLayoutEventData,
  TextStyle,
} from 'react-native'
import ParsedText from 'react-native-parsed-text'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { panActivateConfig } from '../constants'
import bibles from '../data/bibles'
import { Chapters } from '../data/types/chapters'
import { verseToSuperscript } from '../functions/bible'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'

interface Props {
  setReferenceState?: React.Dispatch<
    React.SetStateAction<
      | {
          verseId: string
          text: string
        }
      | undefined
    >
  >
  openReferences?: SharedValue<number>
  onTextLayout?:
    | ((event: NativeSyntheticEvent<TextLayoutEventData>) => void)
    | undefined
  verses: Chapters[number]['verses']
}

function ParagraphBreak({ height }: { height: number }) {
  return (
    <Text key={Math.random()}>
      {'\n'}
      <Text style={{ lineHeight: height }}>{'\n'}</Text>
    </Text>
  )
}

export default function BibleText({
  verses,
  setReferenceState,
  openReferences,
  onTextLayout,
}: Props) {
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)

  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index, settings.translation])

  const textStyle: TextStyle = {
    fontSize: settings.fontSize,
    fontFamily: 'Bookerly-Regular',
    textAlign: 'left',
    color: colors.fg1,
    lineHeight: settings.lineHeight,
  }

  return (
    <Text
      style={{
        ...textStyle,
        lineHeight: settings.lineHeight,
      }}
      onTextLayout={onTextLayout}
    >
      {verses.map((verse, index) => {
        if (typeof verse === 'string')
          return <ParagraphBreak height={settings.paragraphSpacing} />

        // const verseId = `${activeChapter.chapterId}.${verse.number}`
        const previousVerse = index !== 0 ? verses[index - 1] : undefined

        return (
          <Text
            suppressHighlighting
            key={verse.verseId}
            onPress={() => {
              impactAsync(ImpactFeedbackStyle.Heavy)
              if (setReferenceState) setReferenceState(verse)
              if (openReferences !== undefined)
                openReferences.value = withSpring(1, panActivateConfig)
              trackEvent('Open cross references', { verseId: verse.verseId })
            }}
          >
            <Text
              style={{
                fontSize: settings.fontSize - 2,
                fontFamily: 'Figtree-Light',
                color: colors.v,
                textAlign: 'left',
              }}
            >
              {previousVerse === undefined ||
              index === 0 ||
              previousVerse.text.endsWith('\n')
                ? ''
                : '  '}
              {verseToSuperscript(parseInt(verse.verseId.split('.')[2]))}
            </Text>
            {' '}
            <ParsedText
              parse={[
                {
                  pattern: /\n{2}/,
                  // @ts-expect-error - ParsedText types are incorrect
                  renderText: () => (
                    <ParagraphBreak height={settings.paragraphSpacing} />
                  ),
                },
              ]}
            >
              {verse.text}
            </ParsedText>
          </Text>
        )
      })}
    </Text>
  )
}
