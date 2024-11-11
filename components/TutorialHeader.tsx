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
import TovFull from '../assets/icons/tov_full.svg'
import { getEdges } from '../functions/utils'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { sans, sp, tx } from '../styles'
import Spacer from './Spacer'

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
  }, [height, history, scrollViewRef, top])

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
            // height: height * 0.75,
            paddingTop: top + sp.xl * 3,
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
            <Text style={sans(tx.body, 'r', 'c', colors.fg3)}>Welcome to</Text>
            <Spacer s={sp.xl} />
            <TovFull width={width * 0.5} height={100} color={colors.p1} />
            {/* <Spacer s={sp.sm} />
            <Text style={sans(36, 's', 'c', colors.p2)}>tov</Text> */}
            <Spacer s={sp.md} />
            <Text style={sans(tx.tiny, 'r', 'c', colors.fg3)}>
              (a better Bible app)
            </Text>
          </View>
        </View>
        {/* <TovPressable
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
            flexDirection: 'row',
            gap: sp.sm,
          }}
        >
          <Text style={sans(tx.body, 'r', 'c', colors.fg3)}>Scroll Down</Text>
          <ArrowDown {...ic.lg} color={colors.fg3} />
        </TovPressable> */}
      </Animated.View>
    </View>
  )
}
