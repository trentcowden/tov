import { ReactNode } from 'react'
import { Dimensions, TouchableOpacity } from 'react-native'
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
  panActivateConfig,
} from '../constants'
import { useAppDispatch } from '../redux/hooks'

interface Props {
  openModal: SharedValue<number>
  openNested: SharedValue<number>
  children: ReactNode
  nestedScreen: ReactNode
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

  const navigatorStyles = useAnimatedStyle(() => {
    return {
      opacity: openModal.value,
      zIndex: openModal.value !== 0 ? 4 : -1,
    }
  })

  const selectedBookStyles = useAnimatedStyle(() => {
    return {
      opacity: openNested.value,
      zIndex: openNested.value !== 0 ? 4 : -1,
      transform: [
        { translateX: interpolate(openNested.value, [0, 1], [200, 0]) },
      ],
    }
  })

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 2

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      if (openNested.value === 0) return

      openNested.value = interpolate(event.translationX, [0, 200], [1, 0])
    })
    .onFinalize((e) => {
      if (openNested.value === 0) return

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
          navigatorStyles,
        ]}
      >
        <TouchableOpacity
          onPress={close}
          style={{
            position: 'absolute',
            height: Dimensions.get('window').height,
            width: '100%',
          }}
        />
        {children}
        <Animated.View
          style={[
            {
              top: insets.top + gutterSize,
              height: navigatorHeight - gutterSize,
              width: Dimensions.get('window').width - gutterSize * 2,
              borderRadius: 16,
              position: 'absolute',
              paddingTop: gutterSize,
              backgroundColor: colors.bg2,
              overflow: 'hidden',
            },
            selectedBookStyles,
          ]}
        >
          {nestedScreen}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  )
}
