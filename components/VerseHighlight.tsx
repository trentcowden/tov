import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { useMemo, useRef, useState } from 'react'
import { Text } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { Path, Svg } from 'react-native-svg'
import {
  gutterSize,
  panActivateConfig,
  screenWidth,
  sizes,
  typography,
} from '../constants'
import { Chapters } from '../data/types/chapters'
import { getChapterReference } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'

interface Props {
  verseOffsets: number[] | undefined
  highlightVerseNumber: SharedValue<number>
  activeChapter: Chapters[number]
  jumpToChapter: JumpToChapter
}

const swipeReq = 75

export default function VerseHighlight({
  verseOffsets,
  highlightVerseNumber,
  activeChapter,
  jumpToChapter,
}: Props) {
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const settings = useAppSelector((state) => state.settings)
  const referenceTree = useAppSelector((state) => state.referenceTree)
  const dispatch = useAppDispatch()
  const history = useAppSelector((state) => state.history)
  const alreadyHaptic = useRef(false)
  const itemTranslateX = useSharedValue(0)

  const cameFromChapter = useMemo(() => {
    const thisReferenceIndex = referenceTree.indexOf(activeChapter.chapterId)
    if (thisReferenceIndex <= 0) return undefined

    const referenceBeforeThisOne =
      referenceTree[referenceTree.indexOf(activeChapter.chapterId) - 1]
    const historyItem = history.find(
      (item) => item.chapterId === referenceBeforeThisOne
    )
    return historyItem
  }, [history])

  const backText = cameFromChapter
    ? `Back to ${getChapterReference(cameFromChapter.chapterId)}${
        typeof cameFromChapter.verseIndex === 'number'
          ? `:${cameFromChapter.verseIndex + 1}`
          : ''
      }`
    : ''

  // const cameFromChapter = useMemo(() => {
  //   const thisIndex = referenceTree.findIndex(
  //     (chapter) => chapter === activeChapter.chapterId
  //   )
  //   if (thisIndex < 0) return null
  //   return referenceTree[thisIndex - 1]
  // }, [referenceTree, activeChapter])

  const [config, setConfig] = useState({
    text: backText,
    iconPath: 'M19 12H5m0 0l7 7m-7-7l7-7',
  })

  useDerivedValue(() => {
    if (itemTranslateX.value < 0) {
      runOnJS(setConfig)({
        iconPath: 'M19 12H5m0 0l7 7m-7-7l7-7',
        text: cameFromChapter ? backText : 'Already at start',
      })
    } else if (itemTranslateX.value > 0) {
      runOnJS(setConfig)({
        iconPath: 'M18 6L6 18M6 6l12 12',
        text: 'Dismiss highlight',
      })
    }
  })

  const verseHighlightStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: itemTranslateX.value }],
      // opacity: interpolate(
      //   itemTranslateX.value,
      //   [-swipeReq, 0, swipeReq],
      //   [0.5, 1, 0.5]
      // ),
      zIndex: highlightVerseNumber.value !== 0 ? 3 : -2,
      backgroundColor:
        itemTranslateX.value !== 0
          ? interpolateColor(
              itemTranslateX.value,
              [-swipeReq, -20, 0, 20, swipeReq],
              [colors.p1, colors.ph, colors.ph, colors.ph, colors.p1]
            )
          : interpolateColor(
              highlightVerseNumber.value,
              [0, 1],
              [colors.p1 + '00', colors.ph]
            ),
    }
  })

  const extrasStyle = useAnimatedStyle(() => {
    return {
      opacity: highlightVerseNumber.value,
    }
  })

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onChange((event) => {
      itemTranslateX.value = event.translationX

      if (event.translationX > swipeReq && !alreadyHaptic.current) {
        runOnJS(impactAsync)(ImpactFeedbackStyle.Heavy)
        alreadyHaptic.current = true
      } else if (
        event.translationX > 0 &&
        event.translationX < swipeReq &&
        alreadyHaptic.current === true
      ) {
        runOnJS(impactAsync)(ImpactFeedbackStyle.Light)
        alreadyHaptic.current = false
      }
    })
    .onFinalize((event) => {
      if (event.translationX > swipeReq) {
        console.log('dismiss')
        itemTranslateX.value = withSpring(
          screenWidth,
          panActivateConfig,
          () => (itemTranslateX.value = 0)
        )
        highlightVerseNumber.value = withSpring(0)
      } else if (event.translationX < -swipeReq) {
        if (cameFromChapter) {
          highlightVerseNumber.value = withSpring(0)
          runOnJS(jumpToChapter)({
            chapterId: cameFromChapter.chapterId,
            verseNumber: cameFromChapter.verseIndex,
            comingFrom: 'reference',
          })
          itemTranslateX.value = withSpring(
            -screenWidth,
            panActivateConfig,
            () => (itemTranslateX.value = 0)
          )
        } else itemTranslateX.value = withSpring(0, panActivateConfig)
      } else itemTranslateX.value = withSpring(0, panActivateConfig)
    })

  const textStyles = useAnimatedStyle(() => {
    return {
      // transform: [{ translateX: itemTranslateX.value }],
      alignItems: itemTranslateX.value < 0 ? 'flex-end' : 'flex-start',
      // right: itemTranslateX.value > 0 ? 0 : undefined,
      opacity: interpolate(
        itemTranslateX.value,
        [-swipeReq, 0, swipeReq],
        [1, 0, 1]
      ),
    }
  })

  return (
    <>
      {verseOffsets ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                alignSelf: 'center',
                position: 'absolute',
                paddingLeft: gutterSize / 2,
                paddingTop: gutterSize / 4,
                // height: settings.lineHeight,
                borderRadius: 12,
                padding: gutterSize,
                height:
                  typeof activeChapterIndex.verseIndex === 'number'
                    ? verseOffsets[
                        activeChapterIndex.verseIndex +
                          (activeChapterIndex.numVersesToHighlight
                            ? activeChapterIndex.numVersesToHighlight + 1
                            : 1)
                      ] -
                      verseOffsets[activeChapterIndex.verseIndex] +
                      settings.lineHeight
                    : 0,
                top:
                  typeof activeChapterIndex.verseIndex === 'number'
                    ? verseOffsets[activeChapterIndex.verseIndex]
                    : 0,
                width: screenWidth - gutterSize,
              },
              verseHighlightStyle,
            ]}
          >
            <Animated.View
              style={[
                {
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  gap: 4,
                },
                textStyles,
              ]}
            >
              <Text style={[typography(sizes.body, 'uib', 'l', colors.bg1)]}>
                {config.text}
              </Text>
              <Svg viewBox="0 0 24 24" fill="none" width={32} height={32}>
                <Path
                  stroke={colors.bg1}
                  d={config.iconPath}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      ) : null}
      {verseOffsets ? (
        <Animated.View
          style={[
            {
              alignSelf: 'center',
              width: screenWidth - gutterSize,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
              // height: gutterSize / 2,
              flexDirection: 'row',
              position: 'absolute',
              alignItems: 'flex-end',
              zIndex: 3,
              // backgroundColor: colors.p1,
              top:
                typeof activeChapterIndex.verseIndex === 'number'
                  ? verseOffsets[activeChapterIndex.verseIndex]
                  : 0,
            },
            extrasStyle,
          ]}
        >
          {/* <TovPressable
            disableAnimation={!cameFromChapter}
            onPress={() => {
              if (!cameFromChapter) return

              jumpToChapter({
                chapterId: cameFromChapter.chapterId,
                verseNumber: cameFromChapter.verseIndex,
                comingFrom: 'reference',
              })
            }}
            outerOuterStyle={{
              position: 'absolute',
              left: 0,
            }}
            style={{
              // flexDirection: 'row',
              // alignItems: 'center',
              // gap: 4,
              // paddingHorizontal: gutterSize / 2,
              // height: gutterSize * 2,
              width: gutterSize,
              height: gutterSize,
              borderTopLeftRadius: 99,
              borderTopRightRadius: 99,
              backgroundColor: colors.bg3,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
            }}
          >
            {cameFromChapter ? (
              <TovIcon name="arrowLeft" size={20} color={colors.fg2} />
            ) : null}
          </TovPressable>
          <TovPressable
            onPress={() => (highlightVerseNumber.value = withTiming(0))}
            outerOuterStyle={{
              position: 'absolute',
              right: 0,
            }}
            style={{
              borderTopLeftRadius: 99,
              borderTopRightRadius: 99,
              width: gutterSize,
              height: gutterSize,
              backgroundColor: colors.ph,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
            }}
          >
            <TovIcon name="close" size={20} color={colors.p1} />
          </TovPressable> */}
          {/* <Text style={[typography(sizes.tiny, 'uil', 'l', colors.bg1)]}>
              {cameFromChapter
                ? ` Back to ${getChapterReference(cameFromChapter.chapterId)}${
                    typeof cameFromChapter.verseIndex === 'number'
                      ? `:${cameFromChapter.verseIndex + 1}`
                      : ''
                  }`
                : 'Starting point'}
            </Text> */}
        </Animated.View>
      ) : null}
    </>
  )
}
