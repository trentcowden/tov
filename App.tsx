import { useFonts } from 'expo-font'
import React, { useEffect } from 'react'
import { Appearance, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate as ReduxPersistProvider } from 'redux-persist/lib/integration/react'
import Bible from './Bible'
import { persistor, store } from './redux/store'

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    // Regular: require('./assets/fonts/HvDTrial_Brandon_Grotesque_regular-BF64a625c9311e1.otf'),
    // 'Regular-Italic': require('./assets/fonts/HvDTrial_Brandon_Grotesque_regular_italic-BF64a625c94445e.otf'),
    // Bold: require('./assets/fonts/HvDTrial_Brandon_Grotesque_bold-BF64a625c9151d5.otf'),
    // 'Bold-Italic': require('./assets/fonts/HvDTrial_Brandon_Grotesque_bold_italic-BF64a625c93b0ce.otf'),
    // Mono: require('./assets/fonts/iAWriterQuattroV.ttf'),
    Regular: require('./assets/fonts/Literata_18pt-Regular.ttf'),
    'Regular-Italic': require('./assets/fonts/Lora-Italic.ttf'),
    Bold: require('./assets/fonts/Literata_18pt-Bold.ttf'),
    'Bold-Italic': require('./assets/fonts/Lora-BoldItalic.ttf'),
    SemiBold: require('./assets/fonts/Literata_18pt-SemiBold.ttf'),
    UILight: require('./assets/fonts/Figtree-Light.ttf'),
    UIRegular: require('./assets/fonts/Figtree-Regular.ttf'),
    UIBold: require('./assets/fonts/Figtree-Bold.ttf'),
    UIMedium: require('./assets/fonts/Figtree-Medium.ttf'),
    UISemibold: require('./assets/fonts/Figtree-SemiBold.ttf'),
  })

  useEffect(() => {
    Appearance.setColorScheme('dark')
  }, [])

  return !fontsLoaded ? (
    <View />
  ) : (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <ReduxPersistProvider loading={<View />} persistor={persistor}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Bible />
          </GestureHandlerRootView>
        </ReduxPersistProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  )
}
