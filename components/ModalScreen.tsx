import { ReactNode } from 'react'
import { Dimensions } from 'react-native'
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
  colors,
  gutterSize,
  horizVelocReq,
  modalWidth,
  panActivateConfig,
  screenHeight,
  screenWidth,
} from '../constants'
import { useAppDispatch } from '../redux/hooks'
import TovPressable from './TovPressable'

interface Props {
  openModal: SharedValue<number>
  openNested?: SharedValue<number>
  children: ReactNode
  nestedScreen?: ReactNode
  close: () => void
  onBack: () => void
}

export default function ModalScreen({
  openModal,
  openNested,
  children,
  nestedScreen,
  close,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  const modalStyle = useAnimatedStyle(() => {
    return {
      opacity: openModal.value,
      zIndex: openModal.value !== 0 ? 4 : -1,
      transform: [
        { translateY: interpolate(openModal.value, [0, 1], [12, 0]) },
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

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 4

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
            paddingTop: insets.top + gutterSize,
            justifyContent: 'flex-start',
          },
          modalStyle,
        ]}
      >
        <TovPressable
          onPress={close}
          style={{
            alignSelf: 'center',
            width: screenWidth + 100,
            height: screenHeight + 100,
            backgroundColor: '#00000033',
            position: 'absolute',
            top: -100,
          }}
          disableAnimation
        />
        {children}
        <Animated.View
          style={[
            {
              top: insets.top + gutterSize,
              height: navigatorHeight,
              width: modalWidth,
              borderRadius: 16,
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
