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
  openHelp: SharedValue<number>
}

export default function BibleText({
  children,
  setReferenceState,
  openReferences,
  onTextLayout,
  openHelp,
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

  function renderBold(text: string) {
    return text
    return text.replace(/__/g, '')
  }

  function renderSectionHeader(text: string) {
    return text.replace(/## /g, '')
    // return ''
  }

  function renderAdvancedFeatures(text: string) {
    return (
      <Text
        style={{ textDecorationLine: 'underline', color: colors.p1 }}
        onPress={() => {
          openHelp.value = withSpring(1, panActivateConfig)
        }}
      >
        advanced features
      </Text>
    )
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
    // {
    //   pattern: /tov/,
    //   style: {
    //     fontFamily: 'UIBold',
    //     fontSize: sizes.body + 2,
    //     color: colors.p1,
    //   },
    // },
    // {
    //   pattern: /__.+?__/,
    //   style: {
    //     fontFamily: 'Literata18pt-SemiBold',
    //   },
    //   renderText: renderBold,
    // },
    {
      pattern: /advanced features/,
      renderText: renderAdvancedFeatures,
    },
    {
      pattern: /\*.+?\*/,
      style: {
        fontFamily: 'Bookerly-Italic',
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
        // backgroundColor: 1000,
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
