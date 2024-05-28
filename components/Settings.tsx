import React from 'react'
import { Alert, Dimensions, ScrollView, View } from 'react-native'
import { SharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, gutterSize, modalWidth, shadow } from '../constants'
import { Chapters } from '../data/types/chapters'
import { clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SettingsItem from './SettingsItem'
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
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)

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
      overlayOpacity={overlayOpacity}
      scrollOffset={scrollOffset}
      close={() => {
        openSettings.value = withTiming(
          0,
          { duration: 200 },
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
          paddingTop: gutterSize / 2,
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
                      onPress: () => {
                        openSettings.value = withTiming(0)
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
