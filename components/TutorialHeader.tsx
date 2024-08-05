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
import { getEdges } from '../functions/utils'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, ic, sp, tx, typography } from '../styles'
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

  const history = useAppSelector((state) => state.history)

  useEffect(() => {
    if (history.length > 1)
      scrollViewRef.current?.scrollTo({ y: height - top - sp.xl })
  }, [history])

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
            padding: sp.xl,
            height,
            paddingTop: top + sp.xl,
            paddingBottom: bottom + sp.xl,
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
          <View
            style={{
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Text style={typography(tx.subtitle, 'uir', 'c', colors.fg3)}>
              Welcome to
            </Text>
            <Spacer s={sp.xx} />
            <Tov width={100} height={100} color={colors.p1} />
            <Spacer s={sp.sm} />
            <Text style={typography(36, 'uis', 'c', colors.p2)}>tov</Text>
            <Spacer s={sp.xl} />
            <Text style={typography(tx.tiny, 'uil', 'c', colors.fg3)}>
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
              y: height - top - sp.xl,
            })
          }
          bgColor={colors.bg2}
          onPressColor={colors.bg2}
          style={{
            paddingVertical: sp.lg,
            borderRadius: br.lg,
            width: width - sp.xl * 2,
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
