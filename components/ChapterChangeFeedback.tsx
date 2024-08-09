import React, { useMemo, useState } from 'react'
import { View } from 'react-native'
import Animated, {
  Extrapolation,
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
import Svg, { Circle, Path } from 'react-native-svg'
import { overScrollReq, panActivateConfig } from '../constants'
import bibles from '../data/bibles'
import { getChapterReference } from '../functions/bible'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, ic, sp } from '../styles'

interface Props {
  place: 'top' | 'bottom'
  progress: SharedValue<number>
  textTranslateY: SharedValue<number>
  releaseToChange: SharedValue<number>
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedPath = Animated.createAnimatedComponent(Path)
export const chapterChangeFeedbackHeight = 48
const strokeWidth = 1

export default function ChapterChangeFeedback({
  place,
  progress,
  textTranslateY,
  releaseToChange,
}: Props) {
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const translation = useAppSelector((state) => state.settings.translation)
  const radius = useMemo(
    () => (chapterChangeFeedbackHeight - strokeWidth) / 2,
    []
  )
  const circumference = useMemo(() => radius * 2 * Math.PI, [radius])
  const pop = useSharedValue(0)

  const prevChapter = useMemo(() => {
    if (activeChapterIndex.index === 0) return null

    return getChapterReference(
      bibles[translation][activeChapterIndex.index - 1].chapterId
    )
  }, [activeChapterIndex.index, translation])

  const nextChapter = useMemo(() => {
    if (activeChapterIndex.index === bibles[translation].length - 1) return null

    return getChapterReference(
      bibles[translation][activeChapterIndex.index + 1].chapterId
    )
  }, [activeChapterIndex.index, translation])

  const progressNormalized = useDerivedValue(() =>
    Math.abs(textTranslateY.value) < 50 ? progress.value / overScrollReq : 0
  )

  const [config, setConfig] = useState({
    // direction: 'column' as ViewStyle['flexDirection'],
    iconPath: 'M12 20V4m0 0l-6 6m6-6l6 6',
    text: prevChapter,
  })

  useDerivedValue(() => {
    if (progress.value < 0) {
      runOnJS(setConfig)({
        // direction: 'column-reverse',
        iconPath: 'M12 20V4m0 0l-6 6m6-6l6 6',
        text: prevChapter,
      })
    } else if (progress.value > 0) {
      runOnJS(setConfig)({
        // direction: 'column',
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
      releaseToChange.value,
      [0, 1],
      [colors.ph, colors.p1]
    ),
  }))

  const pathAnimatedProps = useAnimatedProps(() => ({
    stroke: interpolateColor(
      releaseToChange.value,
      [0, 1],
      [colors.p1, colors.bg3]
    ),
  }))

  const viewAnimatedStyles = useAnimatedStyle(() => ({
    opacity:
      place === 'top' && prevChapter
        ? interpolate(
            progressNormalized.value,
            [-0.5, 0],
            [1, 0],
            Extrapolation.CLAMP
          )
        : place === 'bottom' && nextChapter
          ? interpolate(
              progressNormalized.value,
              [0.5, 0],
              [1, 0],
              Extrapolation.CLAMP
            )
          : 0,
    transform: [{ scale: interpolate(pop.value, [0, 1], [1, 1.1]) }],
  }))

  useAnimatedReaction(
    () => {
      return releaseToChange.value
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

  const progressBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      releaseToChange.value,
      [0, 1],
      [colors.bg1, colors.p1]
    ),
  }))

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          alignSelf: 'flex-start',
          paddingHorizontal: sp.xx,
          flexDirection: 'row',
          gap: sp.md,
        },
        viewAnimatedStyles,
      ]}
    >
      <Animated.View
        style={[
          {
            justifyContent: 'center',
            alignItems: 'center',
            width: chapterChangeFeedbackHeight,
            height: chapterChangeFeedbackHeight,
            borderRadius: br.fu,
          },
          progressBg,
        ]}
      >
        <Svg fill="none">
          <AnimatedCircle
            cx={chapterChangeFeedbackHeight / 2}
            cy={chapterChangeFeedbackHeight / 2}
            r={radius}
            // stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap={'round'}
          />
        </Svg>
        <View style={{ position: 'absolute' }}>
          <Svg viewBox="0 0 24 24" fill="none" {...ic.lg}>
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
    </Animated.View>
  )
}
