import { trackEvent } from '@aptabase/react-native'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useMemo } from 'react'
import {
  NativeSyntheticEvent,
  Text,
  TextLayoutEventData,
  TextStyle,
  useWindowDimensions,
} from 'react-native'
import ParsedText, { ParsedTextProps } from 'react-native-parsed-text'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { panActivateConfig } from '../constants'
import bibles from '../data/bibles'
import references from '../data/references.json'
import { References } from '../data/types/references'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { typography } from '../styles'

interface Props {
  setReferenceState?: React.Dispatch<React.SetStateAction<string | undefined>>
  openReferences?: SharedValue<number>
  onTextLayout?:
    | ((event: NativeSyntheticEvent<TextLayoutEventData>) => void)
    | undefined
  children: React.ReactNode
}

export default function BibleText({
  children,
  setReferenceState,
  openReferences,
  onTextLayout,
}: Props) {
  const { height, width } = useWindowDimensions()
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])

  function renderVerseNumber(text: string) {
    const verseNumber = text.replace('[', '').replace(']', '').trim()
    const verseId = `${activeChapter.chapterId}.${verseNumber}`

    return (
      <Text>
        <Text
          style={{
            textDecorationLine:
              verseId in (references as References) ? 'underline' : 'none',
            ...typography(settings.fontSize - 4, 'uil', 'l', colors.p2),
          }}
          onPress={
            verseId in (references as References)
              ? () => {
                  impactAsync(ImpactFeedbackStyle.Heavy)
                  if (setReferenceState) setReferenceState(verseId)
                  if (openReferences !== undefined)
                    openReferences.value = withSpring(1, panActivateConfig)
                  trackEvent('Open cross references', { verseId })
                }
              : undefined
          }
        >
          {verseId in references ? ' ' : ''}
          {verseNumber + ' '}
          {/* {verseNumber + ' '} */}
        </Text>
        {' '}
      </Text>
    )
  }

  function renderItalic(text: string) {
    // return text
    return text.replace(/\*/g, '')
  }

  function renderSectionHeader(text: string) {
    return text.replace(/## /g, '')
    // return ''
  }

  const textStyle: TextStyle = {
    ...typography(settings.fontSize, 'r', 'l', colors.fg1),
    lineHeight: settings.lineHeight,
  }

  const parse: ParsedTextProps['parse'] = [
    {
      pattern: /\[([0-9]{1,3})\] /,
      renderText: renderVerseNumber as any,
    },
    {
      pattern: /tov/,
      style: {
        fontFamily: 'Bookerly-Bold',
        color: colors.p1,
      },
    },
    {
      pattern: /\*.+?\*/,
      style: {
        fontFamily: 'Bookerly-Bold',
      },
      renderText: renderItalic,
    },
    {
      pattern: /##.*/,
      style: {
        fontFamily: 'Figtree-Bold',
        fontSize: settings.fontSize,
        color: colors.fg3,
      },
      renderText: renderSectionHeader,
    },
    {
      pattern: /(?<=\n)\n/,
      style: {
        lineHeight: settings.paragraphSpacing,
      },
    },
  ]

  return (
    <ParsedText
      parse={parse}
      style={{
        ...textStyle,
      }}
      onTextLayout={onTextLayout}
    >
      {children}
    </ParsedText>
  )
}
