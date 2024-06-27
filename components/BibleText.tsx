import { shift, useFloating } from '@floating-ui/react-native'
import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import LottieView from 'lottie-react-native'
import React, { useMemo } from 'react'
import {
  NativeSyntheticEvent,
  Text,
  TextLayoutEventData,
  View,
} from 'react-native'
import ParsedText, { ParsedTextProps } from 'react-native-parsed-text'
import { SharedValue, withSpring } from 'react-native-reanimated'
import {
  gutterSize,
  panActivateConfig,
  screenWidth,
  typography,
} from '../constants'
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

  const { refs, floatingStyles } = useFloating({
    middleware: [shift()],
  })

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

  const textStyle = {
    ...typography(settings.fontSize, 'r', 'l', colors.fg1),
    lineHeight: settings.lineHeight,
  }

  const parse: ParsedTextProps['parse'] = [
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
  ]

  return activeChapter.chapterId === 'TUT.1' ? (
    <Text
      style={{
        width: screenWidth - gutterSize * 2,
      }}
    >
      <ParsedText parse={parse} style={[textStyle]}>
        Inspired by the Hebrew word for "good," **tov** is a delightfully simple
        yet powerful Bible app designed to help you enjoy and study Scripture.
        {/* <View /> */}
      </ParsedText>
      {'\n\n'}
      <View
        style={{
          width: screenWidth - gutterSize * 2,
          alignItems: 'center',
          padding: gutterSize,
          borderRadius: 12,
          backgroundColor: colors.bg2,
        }}
      >
        <LottieView
          autoPlay
          // ref={animation}
          style={{
            width: 120,
            height: 120,
            alignSelf: 'center',
            backgroundColor: 'transparent',
          }}
          colorFilters={[
            {
              keypath: 'hand',
              color: colors.fg3,
            },
            {
              keypath: 'tap 1',
              color: colors.p1,
            },
            {
              keypath: 'tap 2',
              color: colors.p1,
            },
          ]}
          // Find more Lottie files at https://lottiefiles.com/featured
          source={require('../assets/lotties/double_tap.json')}
        />
        <ParsedText
          parse={parse}
          style={textStyle}
        >{`[1] Double tap anywhere to **view the books** of the Bible.`}</ParsedText>
      </View>
      {'\n\n'}
      <View
        style={{
          width: screenWidth - gutterSize * 2,
          alignItems: 'center',
          padding: gutterSize,
          borderRadius: 12,
          backgroundColor: colors.bg2,
        }}
      >
        <LottieView
          autoPlay
          // ref={animation}
          style={{
            width: 120,
            height: 120,
            alignSelf: 'center',
            backgroundColor: 'transparent',
          }}
          colorFilters={[
            {
              keypath: 'hand',
              color: colors.fg3,
            },
            {
              keypath: 'Rectangle 3',
              color: colors.p1,
            },
          ]}
          // Find more Lottie files at https://lottiefiles.com/featured
          source={require('../assets/lotties/swipe_right.json')}
        />
        <ParsedText parse={parse} style={textStyle}>
          {`[2] Swipe right to open your **reading history**.`}
        </ParsedText>
      </View>
      {'\n\n'}
      <View
        style={{
          width: screenWidth - gutterSize * 2,
          alignItems: 'center',
          padding: gutterSize,
          borderRadius: 12,
          backgroundColor: colors.bg2,
        }}
      >
        <LottieView
          autoPlay
          // ref={animation}
          style={{
            width: 120,
            height: 120,
            alignSelf: 'center',
            backgroundColor: 'transparent',
          }}
          colorFilters={[
            {
              keypath: 'hand',
              color: colors.fg3,
            },
            {
              keypath: 'Rectangle 3',
              color: colors.p1,
            },
          ]}
          // Find more Lottie files at https://lottiefiles.com/featured
          source={require('../assets/lotties/scroll_down.json')}
        />
        <ParsedText
          parse={parse}
          style={textStyle}
        >{`[3] Keep scrolling downwards to go to the **next chapter**. Happy reading!`}</ParsedText>
      </View>
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
