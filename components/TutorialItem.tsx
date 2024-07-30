import LottieView from 'lottie-react-native'
import React from 'react'
import { TextStyle, useWindowDimensions, View } from 'react-native'
import ParsedText, { ParsedTextProps } from 'react-native-parsed-text'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gutterSize } from '../constants'
import useColors from '../hooks/useColors'
import Spacer from '../Spacer'
import { br } from '../styles'

interface Props {
  style: TextStyle
  parse: ParsedTextProps['parse']
  text: string
  source: string
}

export default function TutorialItem({ parse, style, text, source }: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { height, width } = useWindowDimensions()

  return (
    <View
      style={{
        width: width - gutterSize * 2,
        alignItems: 'center',
        justifyContent: 'center',
        // padding: gutterSize,
        flexDirection: 'row',
        // paddingVertical: gutterSize,
        // backgroundColor: colors.bg2,
        // height: height * 0.6,
      }}
    >
      <View
        style={{
          backgroundColor: colors.bg2,
          padding: gutterSize / 2,
          borderRadius: br.lg,
        }}
      >
        <LottieView
          autoPlay
          style={{
            width: 80,
            height: 80,
            alignSelf: 'center',
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
      </View>
      <Spacer units={3} />
      <ParsedText parse={parse} style={[style, { flex: 1 }]}>
        {text}
      </ParsedText>
    </View>
  )
}
