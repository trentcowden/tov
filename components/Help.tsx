import * as StoreReview from 'expo-store-review'
import React, { useEffect } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import { panActivateConfig } from '../constants'
import { getModalHeight, getModalWidth } from '../functions/utils'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { br, shadows, sp } from '../styles'
import Fade from './Fade'
import HelpItem from './HelpItem'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'

interface Props {
  openHelp: SharedValue<number>
}

export default function Help({ openHelp }: Props) {
  const colors = useColors()
  const history = useAppSelector((state) => state.history)
  const settings = useAppSelector((state) => state.settings)
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const modalWidth = getModalWidth(width)
  const modalHeight = getModalHeight(height, insets)

  const dispatch = useAppDispatch()

  const [canReview, setCanReview] = React.useState(false)

  useEffect(() => {
    const check = async () => {
      const canReview = await StoreReview.isAvailableAsync()
      setCanReview(canReview)
    }
    check()
  }, [])

  return (
    <ModalScreen
      openModal={openHelp}
      close={() => {
        openHelp.value = withSpring(0, panActivateConfig)
      }}
    >
      <View
        style={{
          width: modalWidth,
          height: modalHeight,
          backgroundColor: colors.bg2,
          borderRadius: br.xl,
          paddingTop: sp.md,
          overflow: 'hidden',
          ...shadows[1],
        }}
      >
        <ModalScreenHeader
          close={() => {
            openHelp.value = withSpring(0, panActivateConfig)
          }}
        >
          Advanced Features
        </ModalScreenHeader>
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView
            contentContainerStyle={{
              gap: sp.xl,
              paddingTop: sp.md,
            }}
          >
            <HelpItem
              title="Adding and viewing bookmarks"
              body="Long press on a history item to add it as a bookmark. View your bookmarks by tapping the bookmark icon in the upper right of the history."
            />
            <HelpItem
              title="Changing the text size"
              body="Zoom in or out while viewing the Bible text to change the text size."
            />
            <HelpItem
              title="Removing history items"
              body="Swipe a history item right to remove it. You can also clear all history items from the settings."
            />
            <HelpItem
              title="Quickly finding a verse"
              body="Touch and drag the Bible text scroll bar to quickly find a specific verse in the chapter."
            />
            <Spacer s={sp.xl} />
          </ScrollView>
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
