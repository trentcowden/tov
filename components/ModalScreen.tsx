import { ReactNode } from 'react'
import { Dimensions, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  defaultOnPressScale,
  gutterSize,
  horizVelocReq,
  panActivateConfig,
  showOverlayOffset,
} from '../constants'
import { getEdges, getModalHeight, getModalWidth } from '../functions/utils'
import useColors from '../hooks/useColors'
import { useAppDispatch } from '../redux/hooks'
import TovPressable from './TovPressable'

interface Props {
  openModal: SharedValue<number>
  openNested?: SharedValue<number>
  children: ReactNode
  nestedScreen?: ReactNode
  close: () => void
  onBack: () => void
  scrollOffset: SharedValue<number>
  overlayOpacity: SharedValue<number>
}

export default function ModalScreen({
  openModal,
  openNested,
  children,
  nestedScreen,
  close,
  onBack,
  scrollOffset,
  overlayOpacity,
}: Props) {
  const { height, width } = useWindowDimensions()
  const modalWidth = getModalWidth(width)
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { top, bottom } = getEdges(insets)
  const dispatch = useAppDispatch()

  const modalStyle = useAnimatedStyle(() => {
    return {
      opacity: openModal.value,
      zIndex: openModal.value > 0.05 ? 4 : -1,
      transform: [
        { translateY: interpolate(openModal.value, [0, 1], [12, 0]) },
        {
          scale: interpolate(openModal.value, [0, 1], [defaultOnPressScale, 1]),
        },
      ],
    }
  })

  const nestedStyle = useAnimatedStyle(() => {
    return openNested
      ? {
          opacity: openNested.value,
          zIndex: openNested.value !== 0 ? 4 : -1,
          transform: [
            { translateX: interpolate(openNested.value, [0, 1], [200, 0]) },
          ],
        }
      : {
          opacity: 0,
          zIndex: -1,
        }
  })

  const modalHeight = getModalHeight(height, insets)

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (!openNested || openNested.value === 0) return

      openNested.value = interpolate(event.translationX, [0, 200], [1, 0])
    })
    .onFinalize((e) => {
      if (!openNested || openNested.value === 0) return

      if (
        (openNested.value < 0.5 || e.velocityX > horizVelocReq) &&
        e.velocityX > 0
      ) {
        openNested.value = withSpring(0, panActivateConfig, runOnJS(onBack))
      } else {
        openNested.value = withSpring(1, panActivateConfig)
      }
    })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            position: 'absolute',
            alignItems: 'center',
            paddingTop: top + gutterSize,
            justifyContent: 'flex-start',
          },
          modalStyle,
        ]}
      >
        <TovPressable
          bgColor={colors.bd}
          onPress={() => {
            if (scrollOffset.value < showOverlayOffset)
              overlayOpacity.value = withTiming(0)
            close()
          }}
          style={{
            alignSelf: 'center',
            width: width + 200,
            height: height + 200,
            position: 'absolute',
            top: -200,
          }}
          disableAnimation
        />
        {children}
        <Animated.View
          style={[
            {
              zIndex: 3,
              top: top + gutterSize,
              height: modalHeight,
              width: modalWidth,
              borderRadius: 12,
              position: 'absolute',
              paddingTop: gutterSize / 2,
              backgroundColor: colors.bg2,
              overflow: 'hidden',
            },
            nestedStyle,
          ]}
        >
          {nestedScreen}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}
