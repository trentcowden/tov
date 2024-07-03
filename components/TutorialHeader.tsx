import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import { gutterSize, screenWidth, sizes, typography } from '../constants'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  spaceBeforeTextStarts: number
  scrollViewRef: React.RefObject<ScrollView>
}

export default function TutorialHeader({
  spaceBeforeTextStarts,
  scrollViewRef,
}: Props) {
  const insets = useSafeAreaInsets()
  const colors = useColors()
  const fadeIn = useSharedValue(0)
  const settings = useAppSelector((state) => state.settings)

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1000 })
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
            height: spaceBeforeTextStarts,
            paddingTop: insets.top + gutterSize,
            paddingBottom: insets.bottom + gutterSize,
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
            <TovIcon name="tov" size={100} color={colors.p1} />
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
              y: spaceBeforeTextStarts - insets.top - gutterSize,
            })
          }
          bgColor={colors.bg2}
          onPressColor={colors.bg2}
          style={{
            paddingVertical: gutterSize / 2,
            borderRadius: 12,
            width: screenWidth - gutterSize * 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TovIcon name="chevronDown" size={48} color={colors.fg3} />
        </TovPressable>
      </Animated.View>
    </View>
  )
}
