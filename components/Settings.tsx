import Clipboard from '@react-native-clipboard/clipboard'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import { trackEvent } from '@aptabase/react-native'
import * as StoreReview from 'expo-store-review'
import React, { useEffect } from 'react'
import { Alert, Text, useWindowDimensions, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import Code from '../assets/icons/duotone/code-browser.svg'
import Help from '../assets/icons/duotone/help-circle.svg'
import Mail from '../assets/icons/duotone/mail-01.svg'
import Money from '../assets/icons/duotone/piggy-bank-01.svg'
import Star from '../assets/icons/duotone/star-01.svg'
import Trash from '../assets/icons/duotone/trash-04.svg'
import {
  gutterSize,
  panActivateConfig,
  shadows,
  sizes,
  typography,
} from '../constants'
import { Chapters } from '../data/types/chapters'
import { getModalHeight, getModalWidth } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { resetPopups } from '../redux/popups'
import { br, ic } from '../styles'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SettingsItem from './SettingsItem'
import SettingsSection from './SettingsSection'

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
      }}
      onBack={() => {}}
    >
      <View
        style={{
          width: modalWidth,
          height: modalHeight,
          backgroundColor: colors.bg2,
          borderRadius: br.xl,
          paddingTop: gutterSize / 2,
          overflow: 'hidden',
          ...shadows[1],
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
            <SettingsSection disableTopMargin>General</SettingsSection>
            <SettingsItem
              onPress={() => {
                Alert.alert(
                  'Are you sure you want to clear your history?',
                  "Don't worry–your bookmarks will NOT be removed.",
                  [
                    { isPreferred: true, style: 'cancel', text: 'Cancel' },
                    {
                      text: 'Clear',
                      style: 'destructive',
                      onPress: () => {
                        trackEvent('Clear history', { items: history.length })
                        openSettings.value = withSpring(0, panActivateConfig)
                        dispatch(clearHistory(activeChapter.chapterId))
                        if (__DEV__) dispatch(resetPopups())
                      },
                    },
                  ]
                )
              }}
              rightIcon={<Trash {...ic.md} color={colors.p1} />}
              description="You can also swipe history items right to remove them individually."
            >
              Clear History
            </SettingsItem>
            <SettingsSection>Help</SettingsSection>
            <SettingsItem
              onPress={() => {
                trackEvent('Contact open')
                Alert.alert('How would you like to contact me?', '', [
                  {
                    text: 'Open mail app',
                    onPress: () => {
                      Linking.openURL('mailto:trent.cowden@gmail.com')
                      trackEvent('Contact: open mail app')
                    },
                  },
                  {
                    text: 'Copy email to clipboard',
                    onPress: () => {
                      Clipboard.setString('trent.cowden@gmail.com')
                      trackEvent('Contact: copy email to clipboard')
                    },
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                ])
              }}
              rightIcon={<Mail {...ic.md} color={colors.p1} />}
              description="Report a bug, send me feedback, or just say hi! I'd love to hear from you."
            >
              Contact Me
            </SettingsItem>
            <SettingsItem
              rightIcon={<Help {...ic.md} color={colors.p1} />}
              description="Go back to the tutorial screen you saw when you first opened the app."
              onPress={() => {
                textTranslateX.value = withSpring(0, panActivateConfig)
                openSettings.value = withSpring(0, panActivateConfig)
                jumpToChapter({
                  chapterId: 'TUT.1',
                  comingFrom: 'history',
                })
                trackEvent('Back to tutorial')
              }}
            >
              View Tutorial
            </SettingsItem>
            <SettingsSection>Contribute</SettingsSection>
            {canReview ? (
              <SettingsItem
                onPress={() => {
                  StoreReview.requestReview()
                  trackEvent('Clicked rate')
                }}
                rightIcon={<Star {...ic.md} color={colors.p1} />}
                description="If you enjoy using Tov, please consider leaving a review. It helps a lot!"
              >
                Rate{' '}
                <Text style={{ fontFamily: 'Figtree-Bold', color: colors.p2 }}>
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
                trackEvent('Clicked donate')
              }}
              // rightText={'Tov'}
              rightIcon={<Money {...ic.md} color={colors.p1} />}
              description="Tov will always be free. Send me a donation to support the project and be a friend!"
            >
              Donate to{' '}
              <Text style={{ fontFamily: 'Figtree-Bold', color: colors.p2 }}>
                tov
              </Text>
            </SettingsItem>
            <SettingsItem
              onPress={() => {
                WebBrowser.openBrowserAsync(
                  'https://github.com/trentcowden/tov'
                )
                trackEvent('Clicked source code')
              }}
              // rightText={'Tov'}
              rightIcon={<Code {...ic.md} color={colors.p1} />}
              description="Tov is open-source! Check out the code and contribute on GitHub."
            >
              View{' '}
              <Text style={{ fontFamily: 'Figtree-Bold', color: colors.p2 }}>
                tov
              </Text>
              's Source Code
            </SettingsItem>
            <Spacer units={2} />
            <Text style={typography(sizes.tiny, 'uim', 'c', colors.p1)}>
              {'Made with 🧡 by '}
              <Text
                style={{ textDecorationLine: 'underline' }}
                onPress={() => {
                  WebBrowser.openBrowserAsync('https://trentcowden.com')
                  trackEvent('Clicked Trent Cowden')
                }}
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
