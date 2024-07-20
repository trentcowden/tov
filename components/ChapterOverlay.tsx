import { trackEvent } from '@aptabase/react-native'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import React, { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  gutterSize,
  overlayHeight,
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
import { useAppSelector } from '../redux/hooks'
import TovPressable from './TovPressable'

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
}: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { top, bottom } = getEdges(insets)
  const { width } = useWindowDimensions()
  const pressed = useSharedValue(0)
  const settings = useAppSelector((state) => state.settings)
  const [text, setText] = React.useState(
    `${activeBook.name} ${activeChapter.chapterId.split('.')[1]}`
  )
  const textOpacity = useSharedValue(1)
  const overlayAnimatedStyles = useAnimatedStyle(() => ({
    opacity: activeChapter.chapterId === 'TUT.1' ? 0 : overlayOpacity.value,
    // backgroundColor: interpolateColor(
    //   pressed.value,
    //   [0, 2],
    //   [settings.theme === 'black' ? colors.bg1 : colors.bg2, colors.bg3]
    // ),
    // transform: [
    //   {
    //     translateY: scrollValue.value < 0 ? -scrollValue.value : 0,
    //   },
    // ],
    zIndex: overlayOpacity.value === 0 ? -1 : 4,
  }))

  const textStyles = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }))

  function changeChapter() {
    setText(`${activeBook.name} ${activeChapter.chapterId.split('.')[1]}`)
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

  // const dimensions = {
  //   width: 80,
  //   height: 32,
  // }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top,
          // left: gutterSize,
          // top: gutterSize / 2,
          // left: gutterSize / 2,
          // bottom: bottom + gutterSize / 2,
          // right: gutterSize / 2,
          // left: -gutterSize,
          // backgroundColor: colors.p1 + '22',
          // width: width,
          justifyContent: 'center',
          zIndex: 4,
          alignItems: 'center',
          flexDirection: 'row',
          gap: gutterSize / 2,
          paddingRight: gutterSize / 2,
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
      <TovPressable
        // onPressIn={() => {
        //   if (overlayOpacity.value === 0) return
        //   pressed.value = withTiming(1, { duration: 75 })
        // }}
        // onPressOut={() => {
        //   if (overlayOpacity.value === 0) return
        //   pressed.value = withSpring(0, panActivateConfig)
        // }}
        bgColor={colors.p3}
        onPressColor={colors.p3}
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
          gap: 2,
          width: 150,
          height: overlayHeight,
          borderRadius: 999,
          paddingHorizontal: gutterSize / 1.5,
          ...shadow,
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
        <Animated.Text
          numberOfLines={1}
          adjustsFontSizeToFit
          maxFontSizeMultiplier={1}
          style={[
            typography(
              sizes.tiny,
              'uib',
              'l',
              colors.id === 'light' ? colors.fg3 : colors.p1
            ),
            textStyles,
          ]}
        >
          {activeChapter.chapterId === 'TUT.1' ? 'Tutorial' : text}
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
      </TovPressable>
    </Animated.View>
  )
}
