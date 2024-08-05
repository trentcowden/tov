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
import BookmarkFilled from '../assets/icons/solid/bookmark.svg'
import { overlayHeight, overlayWidth, panActivateConfig } from '../constants'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getEdges } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { toggleFavorite } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { br, ic, shadows, sp, tx, typography } from '../styles'

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
    setText(
      `${activeBook.name.replace(/ /g, '').slice(0, 3)} ${activeChapter.chapterId.split('.')[1]}`
    )
  }

  useEffect(() => {
    textOpacity.value = withTiming(0, { duration: 150 }, () =>
      runOnJS(changeChapter)()
    )
  }, [activeChapter])

  useEffect(() => {
    textOpacity.value = withTiming(1, { duration: 150 })
  }, [text])

  const historyItem = useMemo(() => {
    return history.find((item) => item.chapterId === activeChapter.chapterId)
  }, [history, activeChapter])

  useEffect(() => {
    if (historyItem?.isFavorite) {
      itemTranslateX.value = withSpring(ic.xs.width, panActivateConfig)
    } else {
      itemTranslateX.value = withSpring(0, panActivateConfig)
    }
  }, [historyItem?.isFavorite])

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[
        {
          position: 'absolute',
          bottom: bottom * 1.5,
          justifyContent: 'center',
          zIndex: 1,
          alignItems: 'center',
          flexDirection: 'row',
          gap: sp.md,
          borderRadius: br.fu,
          ...shadows[1],
        },
        overlayAnimatedStyles,
      ]}
    >
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
        hitSlop={sp.md}
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
          gap: sp.xs,
          width: overlayWidth,
          height: overlayHeight,
          flexDirection: 'row',
        }}
      >
        {historyItem?.isFavorite ? (
          <Animated.View entering={FadeIn} exiting={FadeOut.duration(125)}>
            <BookmarkFilled {...ic.xs} color={colors.p1} />
          </Animated.View>
        ) : null}
        <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1}
          style={[
            typography(
              tx.tiny - 2,
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
        </Animated.Text>
      </Pressable>
    </Animated.View>
  )
}
