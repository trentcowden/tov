import React from 'react'
import { Alert, Dimensions, ScrollView, Text, View } from 'react-native'
import { SharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import {
  colors,
  gutterSize,
  modalWidth,
  shadow,
  typography,
} from '../constants'
import { clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setTranslation } from '../redux/settings'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SettingsItem from './SettingsItem'
import TovPressable from './TovPressable'
import TypographySettings from './TypographySettings'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
}

export default function Settings({ openSettings, openSettingsNested }: Props) {
  const insets = useSafeAreaInsets()
  const settings = useAppSelector((state) => state.settings)
  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 4
  const dispatch = useAppDispatch()

  const [nestedSetting, setNestedSetting] = React.useState<
    'translation' | 'typography' | 'theme'
  >()

  return (
    <ModalScreen
      openModal={openSettings}
      openNested={openSettingsNested}
      close={() => {
        openSettings.value = withTiming(
          0,
          { duration: 200 },
          () => (openSettingsNested.value = 0)
        )
        setTimeout(() => setNestedSetting(undefined), 200)
      }}
      nestedScreen={
        nestedSetting === 'translation' ? (
          <View>
            <TovPressable onPress={() => dispatch(setTranslation('web'))}>
              <Text>WEB</Text>
            </TovPressable>
            <TovPressable onPress={() => dispatch(setTranslation('nlt'))}>
              <Text>NLT</Text>
            </TovPressable>
          </View>
        ) : nestedSetting === 'typography' ? (
          <TypographySettings
            openSettings={openSettings}
            openSettingsNested={openSettingsNested}
          />
        ) : nestedSetting === 'theme' ? (
          <Text>Theme</Text>
        ) : undefined
      }
      onBack={() => {}}
    >
      <View
        style={{
          width: modalWidth,
          height: navigatorHeight,
          backgroundColor: colors.bg2,
          borderRadius: 16,
          paddingTop: gutterSize,
          ...shadow,
        }}
      >
        <ModalScreenHeader
          close={() => {
            openSettings.value = withTiming(0)
            openSettingsNested.value = withTiming(0)
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
              onPress={() => {
                Alert.alert(
                  'Are you sure you want to clear your history?',
                  '',
                  [
                    { isPreferred: true, style: 'cancel', text: 'Cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => dispatch(clearHistory()),
                    },
                  ]
                )
              }}
              rightIcon="trash"
              description="Did you know you can also swipe history items right to remove them individually?"
            >
              Clear History
            </SettingsItem>
            {/* <SettingsItem
              onPress={() => {
                setNestedSetting('translation')
                openSettingsNested.value = withTiming(1)
              }}
              rightText={settings.translation}
              rightIcon="arrowRight"
              description="Choose your preferred Bible translation. More translations are on the way!"
            >
              Translation
            </SettingsItem> */}
            <SettingsItem
              onPress={() => {
                setNestedSetting('typography')
                openSettingsNested.value = withTiming(1)
              }}
              // rightText={settings.fontSize.toString()}
              rightIcon="arrowRight"
              description="Change the size and spacing of the Bible text. Take it easy on those eyes!"
            >
              Typography
            </SettingsItem>
            {/* <SettingsItem
              onPress={() => {
                setNestedSetting('theme')
                openSettingsNested.value = withTiming(1)
              }}
              rightText={settings.theme}
              rightIcon="arrowRight"
              description="Find your fashion!"
            >
              Color theme
            </SettingsItem> */}
            {/* <SettingsItem
              onPress={() => {}}
              // rightText={'Tov'}
              rightIcon="arrowRight"
              description="Support the development of Tov, and also be a friend."
            >
              Buy me a coffee
            </SettingsItem> */}
            <Spacer units={2} />
            <Text style={typography(14, 'uim', 'c', colors.p2)}>
              {'Made with 🧡 by Trent Cowden'}
            </Text>
          </ScrollView>
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
