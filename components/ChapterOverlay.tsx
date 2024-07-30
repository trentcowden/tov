import { trackEvent } from '@aptabase/react-native'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import React, { useEffect, useMemo } from 'react'
import { Pressable, useWindowDimensions } from 'react-native'
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  gutterSize,
  overlayHeight,
  overlayWidth,
  panActivateConfig,
  shadow,
  sizes,
  typography,
} from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getEdges } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { toggleFavorite } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { sp } from '../styles'
import TovIcon from './SVG'

const heartSize = 12
interface Props {
  activeChapter: Chapters[number]
  activeBook: Books[number]
  openNavigator: SharedValue<number>
  focusSearch: () => void
  textTranslateX: SharedValue<number>
  savedTextTranslateX: SharedValue<number>
  overlayOpacity: SharedValue<number>
  scrollValue: SharedValue<number>
  jumpToChapter: JumpToChapter
  openReferences: SharedValue<number>
  setReferenceState: React.Dispatch<React.SetStateAction<string | undefined>>
  textFadeOut: SharedValue<number>
}

export default function ChapterOverlay({
  activeChapter,
  activeBook,
  openNavigator,
  focusSearch,
  textTranslateX,
  savedTextTranslateX,
  overlayOpacity,
  scrollValue,
  jumpToChapter,
  openReferences,
  setReferenceState,
  textFadeOut,
}: Props) {
  const dispatch = useAppDispatch()
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { top, bottom } = getEdges(insets)
  const { width } = useWindowDimensions()
  const pressed = useSharedValue(0)
  const [text, setText] = React.useState(
    `${activeBook.name.replace(/ /g, '').slice(0, 3)} ${activeChapter.chapterId.split('.')[1]}`
  )

  const history = useAppSelector((state) => state.history)

  const itemTranslateX = useSharedValue(0)

  const textOpacity = useSharedValue(1)
  const overlayAnimatedStyles = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,

      transform: [
        { translateX: textTranslateX.value },
        { scale: interpolate(pressed.value, [0, 1], [1, 0.95]) },
      ],
      backgroundColor: interpolateColor(
        pressed.value,
        [0, 1],
        [colors.bg3, colors.bg3]
      ),
    }
  })

  function changeChapter() {
    // setText(`${activeBook.name} ${activeChapter.chapterId.split('.')[1]}`)
    setText(
      `${activeBook.name.replace(/ /g, '').slice(0, 3)} ${activeChapter.chapterId.split('.')[1]}`
    )
  }

  useEffect(() => {
    textOpacity.value = withTiming(0, { duration: 150 }, () =>
      runOnJS(changeChapter)()
    )
    // textOpacity.value = withTiming(1, { duration: 200 })
  }, [activeChapter])

  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 150 })
  }, [text])

  const historyItem = useMemo(() => {
    return history.find((item) => item.chapterId === activeChapter.chapterId)
  }, [history, activeChapter])

  useEffect(() => {
    if (historyItem?.isFavorite) {
      itemTranslateX.value = withSpring(heartSize, panActivateConfig)
    } else {
      itemTranslateX.value = withSpring(0, panActivateConfig)
    }
  }, [historyItem?.isFavorite])
  // const dimensions = {
  //   width: 80,
  //   height: 32,
  // }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: bottom * 1.5,
          // left: gutterSize,
          // top: gutterSize / 2,
          // left: gutterSize / 2,
          // bottom: bottom + gutterSize / 2,
          // right: gutterSize / 2,
          // left: -gutterSize,
          // backgroundColor: colors.p1 + '22',
          // width: width,
          justifyContent: 'center',
          zIndex: 1,
          alignItems: 'center',
          flexDirection: 'row',
          gap: gutterSize / 2,
          borderRadius: 999,
          ...shadow,
        },
        overlayAnimatedStyles,
      ]}
    >
      {/* <ReferenceBackButton
        jumpToChapter={jumpToChapter}
        openReferences={openReferences}
        setReferenceState={setReferenceState}
      /> */}
      {/* <View
        style={{
          position: 'absolute',
          top: 0,
          ...dimensions,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <BlurView
          reducedTransparencyFallbackColor={colors.bg2}
          blurType={settings.theme === 'light' ? 'light' : 'extraDark'}
          style={{
            ...dimensions,
            // left: gutterSize,
            // borderRadius: 99,
            // position: 'absolute',
            // top: 0,
            // height: top + gutterSize,
          }}
          blurAmount={4}
        />
      </View> */}
      {/* <View
        style={{
          ...dimensions,
          borderRadius: 999,
          position: 'absolute',
          top: 0,
          backgroundColor: colors.bg3,
        }}
      /> */}
      <Pressable
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 75 })
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, panActivateConfig)
        }}
        delayLongPress={250}
        onLongPress={() => {
          pressed.value = withSequence(
            withTiming(-2, { duration: 75 }),
            withSpring(0, panActivateConfig)
          )
          impactAsync(ImpactFeedbackStyle.Heavy)

          dispatch(toggleFavorite(activeChapter.chapterId))
        }}
        hitSlop={gutterSize / 2}
        // onPressIn={() => {
        //   if (overlayOpacity.value === 0) return
        //   pressed.value = withTiming(1, { duration: 75 })
        // }}
        // onPressOut={() => {
        //   if (overlayOpacity.value === 0) return
        //   pressed.value = withSpring(0, panActivateConfig)
        // }}
        onPress={() => {
          if (overlayOpacity.value === 0) return
          textTranslateX.value = withSpring(0, panActivateConfig)
          savedTextTranslateX.value = 0
          openNavigator.value = withSpring(1, panActivateConfig)
          focusSearch()
          impactAsync(ImpactFeedbackStyle.Heavy)
          trackEvent('Open navigator', { method: 'chapter overlay' })
        }}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          // aspectRatio: 1,
          // ...dimensions,
          // paddingHorizontal: gutterSize * 2,
          // paddingVertical: gutterSize / 2,
          // paddingTop: gutterSize,
          gap: sp.xs,
          width: overlayWidth,
          height: overlayHeight,
          paddingHorizontal: gutterSize / 1.5,
          flexDirection: 'row',
        }}
      >
        {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <Ionicons name="settings-outline" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            width: 100,
          }}
        > */}
        {/* <TovIcon name={icon} size={14} /> */}
        {/* {historyItem?.isFavorite ? (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut.duration(125)}
            style={{ position: 'absolute', left: sp.sm }}
          >
            <TovIcon name="bookmarkFilled" size={heartSize} color={colors.p1} />
          </Animated.View>
        ) : null} */}
        {historyItem?.isFavorite ? (
          <Animated.View entering={FadeIn} exiting={FadeOut.duration(125)}>
            <TovIcon name="bookmarkFilled" size={heartSize} color={colors.p1} />
          </Animated.View>
        ) : null}
        <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1}
          style={[
            typography(
              sizes.tiny - 2,
              'uil',
              'l',
              colors.id === 'light' ? colors.fg3 : colors.fg3
            ),
            // textStyles,
            {
              fontFamily: 'iAWriterMonoS-Bold',
            },
            // textContainerStyles,
          ]}
        >
          {text.toUpperCase()}
          {/* `${activeBook.name.replace(' ', '').slice(0, 3)}.`} */}
        </Animated.Text>
        {/* <Animated.Text
          style={{
            ...typography(sizes.subtitle, 'uis', 'l', colors.p1),
          }}
          entering={FadeIn}
        >
          {activeChapter.chapterId.split('.')[1]}
        </Animated.Text> */}
        {/* <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1}
            style={{
              ...typography(11, 'uib', 'l', colors.fg2),
              flex: 1,
            }}
          >
            {activeBook.name}
          </Text> */}
        {/* </View> */}

        {/* <TouchableOpacity style={{ paddingHorizontal: gutterSize }}>
        <FontAwesome5 name="history" size={20} color={colors.fg3} />
      </TouchableOpacity> */}
      </Pressable>
    </Animated.View>
  )
}
