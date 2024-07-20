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
import Svg, { Path, Rect } from 'react-native-svg'
import {
  overScrollReq,
  panActivateConfig,
  sizes,
  typography,
} from '../constants'
import bibles from '../data/bibles'
import { getChapterReference } from '../functions/bible'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'

interface Props {
  place: 'top' | 'bottom'
  progress: SharedValue<number>
  textTranslateY: SharedValue<number>
  releaseToChange: SharedValue<number>
}

const AnimatedRect = Animated.createAnimatedComponent(Rect)
const AnimatedPath = Animated.createAnimatedComponent(Path)
export const chapterChangeFeedbackWidth = 200
export const chapterChangeFeedbackHeight = 50
const strokeWidth = 1

export default function ChapterChangeFeedback2({
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
    [chapterChangeFeedbackHeight, strokeWidth]
  )
  const circumference = useMemo(() => radius * 2 * Math.PI, [radius])
  const pop = useSharedValue(0)

  const prevChapter = useMemo(() => {
    if (activeChapterIndex.index === 0) return null

    return getChapterReference(
      bibles[translation][activeChapterIndex.index - 1].chapterId
    )
  }, [activeChapterIndex.index])

  const nextChapter = useMemo(() => {
    if (activeChapterIndex.index === bibles[translation].length - 1) return null

    return getChapterReference(
      bibles[translation][activeChapterIndex.index + 1].chapterId
    )
  }, [activeChapterIndex.index])

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

  const perimeter =
    chapterChangeFeedbackHeight * 2 + chapterChangeFeedbackWidth * 2

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: Math.max(
      0,
      perimeter * (1 - Math.abs(progressNormalized.value))
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

  const textStyles = useAnimatedStyle(() => ({
    color: interpolateColor(
      releaseToChange.value,
      [0, 1],
      [colors.p1, colors.bg3]
    ),
  }))

  return (
    <Animated.View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          // paddingHorizontal: gutterSize,
          flexDirection: 'row',
          // gap: gutterSize * 0.66,
        },
        viewAnimatedStyles,
      ]}
    >
      <Animated.View
        style={[
          {
            justifyContent: 'center',
            alignItems: 'center',
            width: chapterChangeFeedbackWidth,
            height: chapterChangeFeedbackHeight,
            borderRadius: chapterChangeFeedbackHeight / 2,
          },
          progressBg,
        ]}
      >
        <Svg
          fill="none"
          width={chapterChangeFeedbackWidth}
          height={chapterChangeFeedbackHeight}
        >
          <AnimatedRect
            x={2}
            y={2}
            rx={chapterChangeFeedbackHeight / 2}
            ry={chapterChangeFeedbackHeight / 2}
            width={chapterChangeFeedbackWidth - 4}
            height={chapterChangeFeedbackHeight - 4}
            // cx={chapterChangeFeedbackHeight / 2}
            // cy={chapterChangeFeedbackHeight / 2}
            // r={radius}
            stroke={colors.p1}
            strokeWidth={1}
            strokeDasharray={`${perimeter} ${perimeter}`}
            animatedProps={animatedProps}
            strokeLinecap={'round'}
          />
        </Svg>
      </Animated.View>
      <View
        style={{
          position: 'absolute',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <Svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
          <AnimatedPath
            d={config.iconPath}
            animatedProps={pathAnimatedProps}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        {config.text ? (
          <Animated.Text
            style={[
              typography(sizes.caption, 'uib', 'c', colors.fg2),
              textStyles,
            ]}
          >
            {config.text}
          </Animated.Text>
        ) : null}
      </View>
    </Animated.View>
  )
}
