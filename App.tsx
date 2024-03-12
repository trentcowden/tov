import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import Bible from './Bible'
import store from './redux/store'

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Bible />
        </GestureHandlerRootView>
      </Provider>
    </SafeAreaProvider>
  )
}
