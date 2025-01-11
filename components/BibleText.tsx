import React, { useMemo } from 'react'
import {
  NativeSyntheticEvent,
  Text,
  TextLayoutEventData,
  TextStyle,
} from 'react-native'
import ParsedText, { ParsedTextProps } from 'react-native-parsed-text'
import { SharedValue } from 'react-native-reanimated'
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
  }, [activeChapterIndex.index, settings.translation])

  function renderVerseNumber(text: string) {
    const verseNumber = text.replace('[', '').replace(']', '').trim()
    const verseId = `${activeChapter.chapterId}.${verseNumber}`

    return (
      <Text>
        <Text
          suppressHighlighting
          style={{
            textDecorationLine:
              verseId in (references as References) ? 'underline' : 'none',
            // fontSize: settings.fontSize - 4,
            // fontFamily: 'Figtree-Light',
            // color: colors.p2,
            // textAlign: 'left',
            lineHeight: settings.lineHeight,
          }}
          onPress={
            // verseId in (references as References)
            //   ? () => {
            //       impactAsync(ImpactFeedbackStyle.Heavy)
            //       if (setReferenceState) setReferenceState(verseId)
            //       if (openReferences !== undefined)
            //         openReferences.value = withSpring(1, panActivateConfig)
            //       trackEvent('Open cross references', { verseId })
            //     }
            //   : undefined
            () => {
              console.log(text)
            }
          }
        >
          {/* {verseId in references ? ' ' : ''} */}
          {verseNumber + ' '}
          {/* {verseNumber + ' '} */}
        </Text>
        {' '}
      </Text>
    )
  }

  function renderItalic(text: string) {
    return text.replace(/\*/g, '')
  }

  const textStyle: TextStyle = {
    fontSize: settings.fontSize,
    fontFamily: 'Bookerly-Regular',
    textAlign: 'left',
    color: colors.fg1,
    lineHeight: settings.lineHeight,
  }

  const parse: ParsedTextProps['parse'] = [
    {
      // pattern: /\[([0-9]{1,3})\] /,
      pattern: /([0-9]{1,3})\].*?\[/,
      renderText: renderVerseNumber as any,
    },
    // {
    //   pattern: / tov /,
    //   style: {
    //     fontFamily: 'Bookerly-Bold',
    //     color: colors.p1,
    //   },
    // },
    // {
    //   pattern: /\*.+?\*/,
    //   // style: {
    //   //   fontFamily: 'Bookerly-Bold',
    //   // },
    //   renderText: renderItalic,
    // },
    // {
    //   pattern: /(?<=\n)\n/,
    //   style: {
    //     lineHeight: settings.paragraphSpacing,
    //   },
    // },
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
