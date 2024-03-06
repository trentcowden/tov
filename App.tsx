import { useFonts } from 'expo-font'
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Bible from './Bible'

export default function App() {
  useFonts({
    iAWriter: require('./assets/fonts/iAWriterQuattroV.ttf'),
    iAWriterItalic: require('./assets/fonts/iAWriterQuattroV-Italic.ttf'),
  })

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Bible />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
