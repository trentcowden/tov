import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useMemo } from 'react'
import { NativeSyntheticEvent, Text, TextLayoutEventData } from 'react-native'
import ParsedText from 'react-native-parsed-text'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { panActivateConfig, typography } from '../constants'
import bibles from '../data/bibles'
import references from '../data/references.json'
import { References } from '../data/types/references'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'

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
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const activeChapter = useMemo(() => {
    return bibles[settings.translation][activeChapterIndex.index]
  }, [activeChapterIndex.index])

  function renderVerseNumber(text: string) {
    const verseNumber = text.replace('[', '').replace(']', '')
    const verseId = `${activeChapter.chapterId}.${verseNumber}`
    return (
      <Text
        style={{
          textDecorationLine:
            verseId in (references as References) ? 'underline' : 'none',
          fontFamily: 'UIBold',
          color: colors.p1,
          fontSize: settings.fontSize - 2,
        }}
        onPress={
          verseId in (references as References)
            ? () => {
                impactAsync(ImpactFeedbackStyle.Heavy)
                if (setReferenceState) setReferenceState(verseId)
                if (openReferences !== undefined)
                  openReferences.value = withSpring(1, panActivateConfig)
              }
            : undefined
        }
      >
        {' ' + verseNumber + ' '}
        {/* {verseNumber + ' '} */}
      </Text>
    )
  }

  function renderBoltAndItalicText(text: string) {
    return text.replace(/\*/g, '')
  }

  function renderSectionHeader(text: string) {
    // return text.replace(/## /g, '')
    return ''
  }

  return (
    <ParsedText
      parse={[
        {
          pattern: /\[([0-9]{1,3})\]/,
          renderText: renderVerseNumber,
        },
        // {
        //   pattern: /tov/,
        //   style: {
        //     fontFamily: 'UIBold',
        //     fontSize: sizes.body + 2,
        //     color: colors.p1,
        //   },
        // },
        {
          pattern: /\*\*.+\*\*/,
          style: {
            fontFamily: 'SemiBold',
          },
          renderText: renderBoltAndItalicText,
        },
        {
          pattern: /\*.+\*/,
          style: {
            fontFamily: 'Regular-Italic',
          },
          renderText: renderBoltAndItalicText,
        },
        {
          pattern: /##.*/,
          style: {
            fontFamily: 'SemiBold',
            fontSize: settings.fontSize + 3,
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
      ]}
      style={{
        ...typography(settings.fontSize, 'r', 'l', colors.fg1),
        lineHeight: settings.lineHeight,
      }}
      onTextLayout={onTextLayout}
    >
      {children}
    </ParsedText>
  )
}
