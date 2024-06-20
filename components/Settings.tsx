import Clipboard from '@react-native-clipboard/clipboard'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import * as StoreReview from 'expo-store-review'
import React, { useEffect } from 'react'
import { Alert, Dimensions, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import {
  gutterSize,
  modalWidth,
  panActivateConfig,
  shadow,
  sizes,
  typography,
} from '../constants'
import { Chapters } from '../data/types/chapters'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fontSizes } from '../styles'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SettingsItem from './SettingsItem'
import ThemeSettings from './ThemeSettings'
import TranslationSettings from './TranslationSettings'
import TypographySettings from './TypographySettings'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
  textTranslateX: SharedValue<number>
  activeChapter: Chapters[number]
  scrollOffset: SharedValue<number>
  overlayOpacity: SharedValue<number>
  jumpToChapter: JumpToChapter
  currentVerseIndex: SharedValue<number | 'bottom' | 'top'>
}

export default function Settings({
  openSettings,
  openSettingsNested,
  activeChapter,
  overlayOpacity,
  scrollOffset,
  textTranslateX,
  jumpToChapter,
  currentVerseIndex,
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

  const [canReview, setCanReview] = React.useState(false)

  useEffect(() => {
    const check = async () => {
      const canReview = await StoreReview.isAvailableAsync()
      setCanReview(canReview)
    }
    check()
  }, [])

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
        nestedSetting === 'translation' ? (
          <TranslationSettings
            openSettings={openSettings}
            openSettingsNested={openSettingsNested}
          />
        ) : nestedSetting === 'typography' ? (
          <TypographySettings
            openSettings={openSettings}
            openSettingsNested={openSettingsNested}
            textTranslateX={textTranslateX}
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
                  "Don't worry–your favorites will NOT be removed.",
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
              description="A tip: you can also swipe history items right to remove them individually."
            >
              Clear History
            </SettingsItem>
            <SettingsItem
              onPress={() => {
                setNestedSetting('typography')
                openSettingsNested.value = withSpring(1, panActivateConfig)
              }}
              rightText={
                fontSizes.find((f) => f.fontSize === settings.fontSize)?.name
              }
              rightIcon="arrowRight"
              description="Increase or decrease the size of the Bible text. Take it easy on those eyes!"
            >
              Text Size
            </SettingsItem>
            <SettingsItem
              onPress={() => {
                setNestedSetting('theme')
                openSettingsNested.value = withSpring(1, panActivateConfig)
              }}
              rightText={
                settings.theme === 'black'
                  ? 'Black'
                  : settings.theme === 'dark'
                    ? 'Dark'
                    : 'Light'
              }
              rightIcon="arrowRight"
              description="Find your fashion!"
            >
              Color Theme
            </SettingsItem>
            <SettingsItem
              rightText={settings.translation}
              rightIcon="arrowRight"
              description="Change the Bible translation."
              onPress={() => {
                setNestedSetting('translation')
                openSettingsNested.value = withSpring(1, panActivateConfig)
              }}
            >
              Bible Translation
            </SettingsItem>
            <SettingsItem
              rightIcon="help"
              description="Go back to the tutorial screen you saw when you first opened the app."
              onPress={() => {
                textTranslateX.value = withSpring(0, panActivateConfig)
                openSettings.value = withSpring(0, panActivateConfig)
                jumpToChapter({
                  chapterId: 'TUT.1',
                  comingFrom: 'history',
                })
              }}
            >
              View Tutorial
            </SettingsItem>
            <Text
              style={[
                typography(sizes.body, 'uib', 'l', colors.fg2),
                { paddingHorizontal: gutterSize, marginTop: gutterSize },
              ]}
            >
              Contribute
            </Text>
            <SettingsItem
              onPress={() => {
                Alert.alert('How would you like to contact me?', '', [
                  {
                    text: 'Open mail app',
                    onPress: () =>
                      Linking.openURL('mailto:trent.cowden@gmail.com'),
                  },
                  {
                    text: 'Copy email to clipboard',
                    onPress: () =>
                      Clipboard.setString('trent.cowden@gmail.com'),
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ])
              }}
              rightIcon="mail"
              description="Send me feedback, share a story, or just say hi! I'd love to hear from you."
            >
              Contact Me
            </SettingsItem>
            {canReview ? (
              <SettingsItem
                onPress={() => {
                  StoreReview.requestReview()
                }}
                rightIcon="star"
                description="If you enjoy using Tov, please consider leaving a review. It helps a lot!"
              >
                Rate{' '}
                <Text style={{ fontFamily: 'UIBold', color: colors.p2 }}>
                  tov
                </Text>{' '}
                on the App Store
              </SettingsItem>
            ) : null}
            <SettingsItem
              onPress={() => {
                WebBrowser.openBrowserAsync(
                  'https://buymeacoffee.com/trentcowden'
                )
              }}
              // rightText={'Tov'}
              rightIcon="money"
              description="Tov will always be free. Send me a donation to support the project and be a friend!"
            >
              Donate to{' '}
              <Text style={{ fontFamily: 'UIBold', color: colors.p2 }}>
                tov
              </Text>
            </SettingsItem>
            <SettingsItem
              onPress={() => {
                WebBrowser.openBrowserAsync(
                  'https://github.com/trentcowden/tov'
                )
              }}
              // rightText={'Tov'}
              rightIcon="code"
              description="Tov is open-source! Check out the code and contribute on GitHub."
            >
              View{' '}
              <Text style={{ fontFamily: 'UIBold', color: colors.p2 }}>
                tov
              </Text>
              's Source Code
            </SettingsItem>
            <Spacer units={2} />
            <Text style={typography(sizes.tiny, 'uim', 'c', colors.p1)}>
              {'Made with 🧡 by '}
              <Text
                style={{ textDecorationLine: 'underline' }}
                onPress={() =>
                  WebBrowser.openBrowserAsync('https://trentcowden.com')
                }
              >
                Trent Cowden
              </Text>
            </Text>
            <Spacer units={4} />
          </ScrollView>
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
