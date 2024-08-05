import { ReactNode } from 'react'
import { Dimensions, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  defaultOnPressScale,
  horizVelocReq,
  panActivateConfig,
} from '../constants'
import { getEdges, getModalHeight, getModalWidth } from '../functions/utils'
import useColors from '../hooks/useColors'
import { useAppDispatch } from '../redux/hooks'
import { br, sp } from '../styles'
import TovPressable from './TovPressable'

interface Props {
  openModal: SharedValue<number>
  openNested?: SharedValue<number>
  children: ReactNode
  nestedScreen?: ReactNode
  close: () => void
  onBack?: () => void
  nestedHeight?: number
}

export default function ModalScreen({
  openModal,
  openNested,
  children,
  nestedScreen,
  close,
  onBack,
  nestedHeight,
}: Props) {
  const { height, width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const modalWidth = getModalWidth(width)
  const modalHeight = getModalHeight(height, insets)
  const colors = useColors()
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
        openNested.value = withSpring(
          0,
          panActivateConfig,
          runOnJS(onBack ?? (() => {}))
        )
      } else {
        openNested.value = withSpring(1, panActivateConfig)
      }
    })

  const mainStyles = useAnimatedStyle(() => {
    return {
      opacity: openNested?.value ?? 0,
      zIndex: openNested && openNested?.value !== 0 ? 2 : -1,
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
            paddingTop: top + sp.md,
            justifyContent: 'flex-start',
          },
          modalStyle,
        ]}
      >
        <TovPressable
          bgColor={colors.bd}
          onPress={() => {
            // if (scrollOffset.value < showOverlayOffset)
            //   overlayOpacity.value = withTiming(0)
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
              height: nestedHeight ?? modalHeight,
              width: modalWidth,
              backgroundColor: colors.bd,
              position: 'absolute',
              top: top + sp.md,
              borderRadius: br.xl,
            },
            mainStyles,
          ]}
        />
        <Animated.View
          style={[
            {
              zIndex: 3,
              top: top + sp.md,
              height: nestedHeight ?? modalHeight,
              width: modalWidth,
              position: 'absolute',
              overflow: 'hidden',
              paddingTop: sp.md,
              backgroundColor: colors.bg2,
              borderRadius: br.xl,
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
