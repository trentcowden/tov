import { trackEvent } from '@aptabase/react-native'
import { useEffect, useState } from 'react'
import { Text, useWindowDimensions, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import ArrowDown from '../assets/icons/duotone/arrow-narrow-down.svg'
import Tov from '../assets/icons/tov.svg'
import { gutterSize, sizes, typography } from '../constants'
import { getEdges } from '../functions/utils'
import useColors from '../hooks/useColors'
import { br, ic, sp } from '../styles'
import TovPressable from './TovPressable'

interface Props {
  scrollViewRef: React.RefObject<ScrollView>
}

export default function TutorialHeader({ scrollViewRef }: Props) {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const { top, bottom } = getEdges(insets)
  const colors = useColors()
  const fadeIn = useSharedValue(0)
  const [tutorialStart] = useState(Date.now())

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1000 })

    return () => {
      const tutorialEnd = Date.now()
      const tutorialDuration = tutorialEnd - tutorialStart
      console.log('Tutorial duration:', tutorialDuration)
      trackEvent('Tutorial', { duration: tutorialDuration })
    }
  }, [])

  const styles = useAnimatedStyle(() => {
    return {
      opacity: fadeIn.value,
    }
  })

  return (
    <View
      style={{
        width: '100%',
      }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            padding: gutterSize,
            height,
            paddingTop: top + gutterSize,
            paddingBottom: bottom + gutterSize,
          },
          styles,
        ]}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* <ReadingGraphic /> */}
          {/* <Spacer units={12} /> */}
          <View
            style={{
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            {/* <Spacer units={4} /> */}
            <Text style={typography(sizes.subtitle, 'uir', 'c', colors.fg3)}>
              Welcome to
            </Text>
            <Spacer units={6} />
            <Tov width={100} height={100} color={colors.p1} />
            <Spacer units={1} />
            <Text style={typography(36, 'uis', 'c', colors.p2)}>tov</Text>
            <Spacer units={4} />
            <Text style={typography(sizes.tiny, 'uil', 'c', colors.fg3)}>
              {'(a '}
              <Text style={{ color: colors.p2, fontFamily: 'Figtree-Medium' }}>
                good
              </Text>
              {' Bible app)'}
            </Text>
            {/* <Text style={typography(sizes.caption, 'uib', 'c', colors.fg3)}>
              Scroll down
            </Text> */}
          </View>
        </View>
        <TovPressable
          onPress={() =>
            scrollViewRef.current?.scrollTo({
              y: height - top - gutterSize,
            })
          }
          bgColor={colors.bg2}
          onPressColor={colors.bg2}
          style={{
            paddingVertical: sp.lg,
            borderRadius: br.lg,
            width: width - gutterSize * 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ArrowDown {...ic.lg} color={colors.fg3} />
        </TovPressable>
      </Animated.View>
    </View>
  )
}
