import { Asset } from 'expo-asset'
import Constants from 'expo-constants'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

interface Props {
  children: React.ReactNode
  image: { uri: string | undefined }
}

function AnimatedSplashScreen({ children, image }: Props) {
  const animation = useMemo(() => new Animated.Value(1), [])
  const [isAppReady, setAppReady] = useState(false)
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true))
    }
  }, [isAppReady])

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync()
      // Load stuff
      await Promise.all([])
    } catch (e) {
      // handle errors
    } finally {
      setAppReady(true)
    }
  }, [])

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.expoConfig?.splash?.backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: '100%',
              height: '100%',
              resizeMode: Constants.expoConfig?.splash?.resizeMode || 'contain',
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={image}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  )
}

export default function AnimatedAppLoader({ children, image }: Props) {
  const [isSplashReady, setSplashReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      await Asset.fromURI(image.uri as string)
        .downloadAsync()
        .catch(() => console.log('Error downloading image'))
      setSplashReady(true)
    }

    prepare()
  }, [image])

  if (!isSplashReady) {
    return null
  }

  return <AnimatedSplashScreen image={image}>{children}</AnimatedSplashScreen>
}
