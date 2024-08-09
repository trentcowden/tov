import Aptabase from '@aptabase/react-native'
import * as Sentry from '@sentry/react-native'
import React from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate as ReduxPersistProvider } from 'redux-persist/lib/integration/react'
import Bible from './components/Bible'
import useSessionTracker from './hooks/useSessionTracker'
import { persistor, store } from './redux/store'

Aptabase.init('A-US-7955042107')

Sentry.init({
  dsn: 'https://65192e4b4c7121f684f52e0346ca9f23@o1007561.ingest.us.sentry.io/4507512500977664',
})

function App() {
  useSessionTracker()

  return (
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

export default Sentry.wrap(App)
