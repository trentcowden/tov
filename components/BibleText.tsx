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
import { gutterSize, panActivateConfig, typography } from '../constants'
import bibles from '../data/bibles'
import references from '../data/references.json'
import { References } from '../data/types/references'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import TutorialItem from './TutorialItem'

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
    const verseNumber = text.replace('[', '').replace(']', '')
    const verseId = `${activeChapter.chapterId}.${verseNumber}`
    return (
      <Text
        style={{
          textDecorationLine:
            verseId in (references as References) ? 'underline' : 'none',
          fontFamily: 'Figtree-Bold',
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
                trackEvent('Open cross references', { verseId })
              }
            : undefined
        }
      >
        {' ' + verseNumber + ' '}
        {/* {verseNumber + ' '} */}
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

  const textStyle: TextStyle = {
    ...typography(settings.fontSize, 'r', 'l', colors.fg1),
    lineHeight: settings.lineHeight,
  }

  const parse: ParsedTextProps['parse'] = [
    {
      pattern: /\[([0-9]{1,3})\]/,
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
      pattern: /\*.+?\*/,
      style: {
        fontFamily: 'Literata18pt-Italic',
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

  return activeChapter.chapterId === 'TUT.1' ? (
    <Text
      style={{
        width: width - gutterSize * 2,
      }}
    >
      <ParsedText parse={parse} style={[textStyle]}>
        Inspired by the Hebrew word for "good," **tov** is a delightfully simple
        yet powerful Bible app designed to help you enjoy and study Scripture.
      </ParsedText>
      {'\n\n'}
      <TutorialItem
        source={require('../assets/lotties/double_tap.json')}
        parse={parse}
        style={textStyle}
        text={`[1] Double tap anywhere to **view the books of the Bible**.`}
      />
      {'\n\n'}
      <TutorialItem
        source={require('../assets/lotties/swipe_right.json')}
        parse={parse}
        style={textStyle}
        text={`[2] Swipe right to open your **reading history** and **view your bookmarks**.`}
      />
      {'\n\n'}
      <TutorialItem
        source={require('../assets/lotties/scroll_down.json')}
        text={`[3] Keep scrolling downwards to go to the **next chapter**.`}
        parse={parse}
        style={textStyle}
      />
      {'\n\n'}
      <ParsedText parse={parse} style={[textStyle]}>
        **Happy reading!**
      </ParsedText>
    </Text>
  ) : (
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
