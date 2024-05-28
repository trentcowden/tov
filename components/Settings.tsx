import React from 'react'
import { Alert, Dimensions, ScrollView, View } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { gutterSize, modalWidth, panActivateConfig, shadow } from '../constants'
import { Chapters } from '../data/types/chapters'
import useColors from '../hooks/useColors'
import { clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SettingsItem from './SettingsItem'
import ThemeSettings from './ThemeSettings'
import TypographySettings from './TypographySettings'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
  activeChapter: Chapters[number]
  scrollOffset: SharedValue<number>
  overlayOpacity: SharedValue<number>
}

export default function Settings({
  openSettings,
  openSettingsNested,
  activeChapter,
  overlayOpacity,
  scrollOffset,
}: Props) {
  const colors = useColors()
  const settings = useAppSelector((state) => state.settings)
  const insets = useSafeAreaInsets()
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
      overlayOpacity={overlayOpacity}
      scrollOffset={scrollOffset}
      close={() => {
        openSettings.value = withSpring(
          0,
          panActivateConfig,
          () => (openSettingsNested.value = 0)
        )
        setTimeout(() => setNestedSetting(undefined), 200)
      }}
      nestedScreen={
        nestedSetting === 'typography' ? (
          <TypographySettings
            openSettings={openSettings}
            openSettingsNested={openSettingsNested}
          />
        ) : nestedSetting === 'theme' ? (
          <ThemeSettings
            openSettings={openSettings}
            openSettingsNested={openSettingsNested}
          />
        ) : undefined
      }
      onBack={() => {}}
    >
      <View
        style={{
          width: modalWidth,
          height: navigatorHeight,
          backgroundColor: colors.bg2,
          borderRadius: 12,
          paddingTop: gutterSize / 2,
          ...shadow,
        }}
      >
        <ModalScreenHeader
          close={() => {
            openSettings.value = withSpring(0, panActivateConfig)
            openSettingsNested.value = withSpring(0, panActivateConfig)
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
                      onPress: () => {
                        openSettings.value = withSpring(0, panActivateConfig)
                        dispatch(clearHistory(activeChapter.chapterId))
                      },
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
                openSettingsNested.value = withSpring(1, panActivateConfig)
              }}
              // rightText={settings.fontSize.toString()}
              rightIcon="arrowRight"
              description="Change the size and spacing of the Bible text. Take it easy on those eyes!"
            >
              Typography
            </SettingsItem>
            <SettingsItem
              onPress={() => {
                setNestedSetting('theme')
                openSettingsNested.value = withSpring(1, panActivateConfig)
              }}
              rightText={
                settings.theme === 'auto'
                  ? 'Auto'
                  : settings.theme === 'dark'
                    ? 'Dark'
                    : 'Light'
              }
              rightIcon="arrowRight"
              description="Find your fashion!"
            >
              Color theme
            </SettingsItem>
            {/* <SettingsItem
              onPress={() => {}}
              // rightText={'Tov'}
              rightIcon="arrowRight"
              description="Support the development of Tov, and also be a friend."
            >
              Buy me a coffee
            </SettingsItem> */}
            {/* <Spacer units={2} />
            <Text style={typography(sizes.caption, 'uim', 'c', colors.p1)}>
              {'Made with 🧡 by Trent Cowden'}
            </Text> */}
          </ScrollView>
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
