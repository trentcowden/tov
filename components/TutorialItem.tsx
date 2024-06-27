import LottieView from 'lottie-react-native'
import React from 'react'
import { TextStyle, View } from 'react-native'
import ParsedText, { ParsedTextProps } from 'react-native-parsed-text'
import Spacer from '../Spacer'
import { gutterSize, screenWidth } from '../constants'
import useColors from '../hooks/useColors'

interface Props {
  style: TextStyle
  parse: ParsedTextProps['parse']
  text: string
  source: string
}

export default function TutorialItem({ parse, style, text, source }: Props) {
  const colors = useColors()

  return (
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
          {
            keypath: 'tap 1',
            color: colors.p1,
          },
          {
            keypath: 'tap 2',
            color: colors.p1,
          },
        ]}
        source={source}
      />
      <Spacer units={2} />
      <ParsedText parse={parse} style={[style, { width: '100%' }]}>
        {text}
      </ParsedText>
    </View>
  )
}
