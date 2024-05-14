import React, { ReactNode, useMemo, useState } from 'react'
import { View } from 'react-native'
import Animated, {
  SharedValue,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Circle, Path } from 'react-native-svg'
import {
  colors,
  gutterSize,
  overScrollReq,
  panActivateConfig,
  screenHeight,
  typography,
} from '../constants'
import bibles from '../data/bibles'
import { getChapterReference } from '../functions/bible'
import { useAppSelector } from '../redux/hooks'

interface Props {
  progress: SharedValue<number>
  textTranslateY: SharedValue<number>
  children?: ReactNode
  childSize?: number
  alreadyHaptic: SharedValue<number>
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)
const size = 50
const strokeWidth = 2
export default function CircularProgress({
  progress,
  textTranslateY,
  alreadyHaptic,
}: Props) {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const translation = useAppSelector((state) => state.settings.translation)
  const insets = useSafeAreaInsets()
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth])
  const circumference = useMemo(() => radius * 2 * Math.PI, [radius])
  const pop = useSharedValue(0)
  const going = useAppSelector((state) => state.activeChapterIndex.transition)

  const prevChapter = useMemo(() => {
    if (activeChapterIndex.index === 0) return null

    return getChapterReference(
      bibles[translation][activeChapterIndex.index - 1].chapterId
    )
  }, [activeChapterIndex.index])

  const nextChapter = useMemo(() => {
    if (activeChapterIndex.index === bibles[translation].length) return null

    return getChapterReference(
      bibles[translation][activeChapterIndex.index + 1].chapterId
    )
  }, [activeChapterIndex.index])

  const progressNormalized = useDerivedValue(() =>
    Math.abs(textTranslateY.value) < 50 ? progress.value / overScrollReq : 0
  )

  const [config, setConfig] = useState({
    direction: 'column',
    iconPath: 'M12 20V4m0 0l-6 6m6-6l6 6',
    text: prevChapter,
  })

  // log progress
  // useDerivedValue(() => {
  //   console.log(progress.value)
  // })
  useDerivedValue(() => {
    if (progress.value < 0) {
      runOnJS(setConfig)({
        direction: 'column',
        iconPath: 'M12 20V4m0 0l-6 6m6-6l6 6',
        text: prevChapter,
      })
    } else if (progress.value > 0) {
      runOnJS(setConfig)({
        direction: 'column-reverse',
        iconPath: 'M12 4V20M12 20L18 14M12 20L6 14',
        text: nextChapter,
      })
    }
  })

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: Math.max(
      0,
      circumference * (1 - Math.abs(progressNormalized.value))
    ),
    stroke: interpolateColor(
      alreadyHaptic.value,
      [0, 1],
      [colors.fg3 + '44', colors.p1]
    ),
  }))

  const pathAnimatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(
      alreadyHaptic.value,
      [0, 1],
      [colors.p1, colors.bg3]
    ),
  }))

  const topStartPos = -screenHeight / 2 + insets.top
  const bottomStartPos = screenHeight / 2 - insets.bottom

  // useEffect(() => {
  //   if (going) progress.value = withDelay(200, withTiming(0, { duration: 500 }))
  // }, [going])

  const viewAnimatedStyles = useAnimatedStyle(() => ({
    opacity: interpolate(progressNormalized.value, [-1, 0, 1], [1, 0, 1]),
    transform: [
      {
        translateY: interpolate(
          progressNormalized.value,
          [-1, -0.001, 0, 0.001, 1],
          [
            topStartPos + overScrollReq * 0.7,
            topStartPos,
            0,
            bottomStartPos,
            bottomStartPos - overScrollReq * 0.7,
          ]
        ),
      },
      // { scale: pop.value !== 0 ? interpolate(pop.value, [0, 1], [1, 1.1]) : 1 },
      { scale: interpolate(pop.value, [0, 1], [1, 1.1]) },
    ],
  }))

  useAnimatedReaction(
    () => {
      return alreadyHaptic.value
    },
    (currentValue, previousValue) => {
      if (currentValue !== 0 && previousValue === 0) {
        pop.value = withSequence(
          withTiming(1, { duration: 75 }),
          withSpring(0, panActivateConfig)
        )
      }
    }
  )

  // useDerivedValue(() => {
  //   if (alreadyHaptic.value) {
  //     console.log('beep')
  //     pop.value = withSequence(
  //       withTiming(1, { duration: 75 }),
  //       withSpring(0, panActivateConfig)
  //     )
  //   }
  // })

  const progressBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      alreadyHaptic.value,
      [0, 1],
      [colors.bg1, colors.p1]
    ),
  }))

  const textStyles = useAnimatedStyle(() => ({
    color: interpolateColor(
      alreadyHaptic.value,
      [0, 1],
      [colors.fg3, colors.p1]
    ),
    transform: [
      {
        translateY: interpolate(
          progressNormalized.value,
          [-1, 0, 1],
          [12, 0, -12]
        ),
      },
    ],
  }))

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: config.direction,
          borderRadius: 999,
          gap: gutterSize / 6,
        },
        viewAnimatedStyles,
      ]}
    >
      <Animated.View
        style={[
          {
            justifyContent: 'center',
            alignItems: 'center',
            width: size,
            height: size,
            borderRadius: 999,
          },
          progressBg,
        ]}
      >
        <Svg fill="none">
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            // stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap={'round'}
          />
        </Svg>
        <View style={{ position: 'absolute' }}>
          <Svg viewBox="0 0 24 24" fill="none" width={24} height={24}>
            <AnimatedPath
              d={config.iconPath}
              animatedProps={pathAnimatedProps}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </Animated.View>
      {config.text ? (
        <Animated.Text
          style={[typography(14, 'uim', 'c', colors.fg3), textStyles]}
        >
          {/* {`${text.split(' ').slice(0, -1).join('').slice(0, 3)}. ${text.split(' ').slice(-1)[0]}`} */}
          {config.text}
        </Animated.Text>
      ) : null}
    </Animated.View>
  )
}
