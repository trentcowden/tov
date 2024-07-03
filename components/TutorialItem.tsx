import LottieView from 'lottie-react-native'
import React from 'react'
import { TextStyle, View } from 'react-native'
import ParsedText, { ParsedTextProps } from 'react-native-parsed-text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import { gutterSize, screenHeight, screenWidth } from '../constants'
import useColors from '../hooks/useColors'

interface Props {
  style: TextStyle
  parse: ParsedTextProps['parse']
  text: string
  source: string
}

export default function TutorialItem({ parse, style, text, source }: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        width: screenWidth - gutterSize * 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: gutterSize,
        // paddingVertical: gutterSize,
        borderRadius: 12,
        backgroundColor: colors.bg2,
        height: screenHeight * 0.6,
      }}
    >
      <LottieView
        autoPlay
        style={{
          width: 160,
          height: 160,
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
      <Spacer units={6} />
      <ParsedText parse={parse} style={[style, { width: '100%' }]}>
        {text}
      </ParsedText>
    </View>
  )
}
