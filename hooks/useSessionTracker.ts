import { trackEvent } from '@aptabase/react-native'
import { useEffect, useState } from 'react'
import { AppState } from 'react-native'

const useSessionTracker = () => {
  const [startTime, setStartTime] = useState<number>()

  useEffect(() => {
    trackEvent('App opened')
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log(nextAppState)
      if (nextAppState === 'active') {
        // App has come to the foreground, start the timer
        setStartTime(Date.now())
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background or become inactive, stop the timer
        if (startTime) {
          const sessionDuration = Date.now() - startTime
          trackEvent('Session duration', { duration: sessionDuration })
        }
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  return null
}

export default useSessionTracker
