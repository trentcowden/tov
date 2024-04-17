import React from 'react'
import { Dimensions, ScrollView, Text, View } from 'react-native'
import { SharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import { colors, gutterSize, modalWidth, typography } from '../constants'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SettingsItem from './SettingsItem'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
}

export default function Settings({ openSettings, openSettingsNested }: Props) {
  const insets = useSafeAreaInsets()

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 4

  return (
    <ModalScreen
      openModal={openSettings}
      openNested={openSettingsNested}
      close={() => {
        openSettings.value = withTiming(0)
      }}
      nestedScreen={<></>}
      onBack={() => {}}
    >
      <View
        style={{
          width: modalWidth,
          height: navigatorHeight,
          backgroundColor: colors.bg2,
          borderRadius: 16,
          paddingTop: gutterSize,
        }}
      >
        <ModalScreenHeader
          close={() => {
            openSettings.value = withTiming(0)
          }}
        >
          Settings
        </ModalScreenHeader>
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView
            contentContainerStyle={{
              gap: gutterSize / 2,
              paddingTop: gutterSize / 2,
            }}
          >
            <SettingsItem
              rightText={'WEB'}
              rightIcon="arrowRight"
              description="More translations are on the way! Bible licenses are expensive :("
            >
              Translation
            </SettingsItem>
            <SettingsItem
              rightText={'16'}
              rightIcon="arrowRight"
              description="Change the size of the Bible text. Take it easy on those eyes!"
            >
              Font size
            </SettingsItem>
            <SettingsItem
              rightText={'Tov'}
              rightIcon="arrowRight"
              description="Find your fashion!"
            >
              Color theme
            </SettingsItem>
            <SettingsItem
              // rightText={'Tov'}
              rightIcon="arrowRight"
              description="Support the development of Tov, and also be a friend."
            >
              Buy me a coffee
            </SettingsItem>
            <Spacer units={2} />
            <Text style={typography(14, 'uim', 'c', colors.p2)}>
              {'Made with 🧡 by Trent Cowden'}
            </Text>
          </ScrollView>
          {/* <Fade place="top" color={colors.bg2} /> */}
        </View>
      </View>
    </ModalScreen>
  )
}
