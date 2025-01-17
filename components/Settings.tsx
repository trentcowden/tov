import Clipboard from '@react-native-clipboard/clipboard'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'

import { trackEvent } from '@aptabase/react-native'
import * as Application from 'expo-application'
import * as StoreReview from 'expo-store-review'
import React, { useEffect } from 'react'
import { Alert, Text, useWindowDimensions, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Book from '../assets/icons/duotone/book-closed.svg'
import Code from '../assets/icons/duotone/code-browser.svg'
import Heart from '../assets/icons/duotone/heart-rounded.svg'
import Help from '../assets/icons/duotone/help-circle.svg'
import Mail from '../assets/icons/duotone/mail-01.svg'
import Money from '../assets/icons/duotone/piggy-bank-01.svg'
import Star from '../assets/icons/duotone/star-01.svg'
import Trash from '../assets/icons/duotone/trash-04.svg'
import ZoomIn from '../assets/icons/duotone/zoom-in.svg'
import { panActivateConfig, textSizeNames } from '../constants'
import { Chapters } from '../data/types/chapters'
import { getModalHeight, getModalWidth } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { br, ic, sans, shadow, sp, tx } from '../styles'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import SettingsItem from './SettingsItem'
import SettingsSection from './SettingsSection'
import Spacer from './Spacer'
import TovPressable from './TovPressable'
import TranslationExplanation from './TranslationExplanation'
import TypographySettings from './TypographySettings'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
  textTranslateX: SharedValue<number>
  activeChapter: Chapters[number]
  jumpToChapter: JumpToChapter
}

export default function Settings({
  openSettings,
  openSettingsNested,
  activeChapter,
  textTranslateX,
  jumpToChapter,
}: Props) {
  const colors = useColors()
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const settings = useAppSelector((state) => state.settings)
  const { width, height } = useWindowDimensions()
  const modalWidth = getModalWidth(width)
  const modalHeight = getModalHeight(height, insets)

  const dispatch = useAppDispatch()

  const [canReview, setCanReview] = React.useState(false)
  const [nestedSetting, setNestedSetting] = React.useState<
    'typography' | 'translation'
  >()

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
      close={() => {
        openSettings.value = withSpring(
          0,
          panActivateConfig,
          () => (openSettingsNested.value = 0)
        )
      }}
      nestedScreen={
        nestedSetting === 'typography' ? (
          <TypographySettings openSettingsNested={openSettingsNested} />
        ) : nestedSetting === 'translation' ? (
          <TranslationExplanation openSettingsNested={openSettingsNested} />
        ) : undefined
      }
      onBack={() => {}}
    >
      <View
        style={{
          width: modalWidth,
          height: modalHeight,
          backgroundColor: colors.bg2,
          borderRadius: br.xl,
          paddingTop: sp.md,
          overflow: 'hidden',
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
              gap: sp.md,
              paddingTop: sp.md,
            }}
          >
            {/* <View>
              <Text
                style={[
                  sans(tx.caption, 'm', 'l', colors.p1),
                  {
                    paddingHorizontal: sp.xl,
                  },
                ]}
              >
                Tov uses the New English Translation (NET) Bible.{' '}
              </Text>
              <TovPressable
                bgColor={colors.bg2}
                onPress={() => {
                  setNestedSetting('translation')
                  openSettingsNested.value = withSpring(1, panActivateConfig)
                  trackEvent('Clicked Bible translation why')
                }}
              >
                <Text
                  style={[
                    sans(tx.caption, 'b', 'l', colors.p1),
                    {
                      textDecorationLine: 'underline',
                      paddingHorizontal: sp.xl,
                      marginBottom: sp.sm,
                    },
                  ]}
                >
                  Why the NET?
                </Text>
              </TovPressable>
            </View> */}
            <SettingsSection disableTopMargin>General</SettingsSection>
            <SettingsItem
              onPress={() => {
                setNestedSetting('translation')
                openSettingsNested.value = withSpring(1, panActivateConfig)
                trackEvent('Clicked Bible translation why')
              }}
              rightIcon={<Book {...ic.md} color={colors.p1} />}
              description="Learn why Tov uses the NET Bible translation."
              rightText="NET"
            >
              Bible Translation
            </SettingsItem>
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
                        trackEvent('Clear history', {
                          items:
                            history.filter((item) => !item.isFavorite).length -
                            1,
                        })
                        openSettings.value = withSpring(0, panActivateConfig)
                        dispatch(clearHistory(activeChapter.chapterId))
                      },
                    },
                  ]
                )
              }}
              rightIcon={<Trash {...ic.md} color={colors.p1} />}
              description="Swiping chapters in the history right will remove them too!"
              rightText={`${history.filter((item) => !item.isFavorite).length - 1} items`}
            >
              Clear History
            </SettingsItem>
            <SettingsItem
              onPress={() => {
                setNestedSetting('typography')
                openSettingsNested.value = withSpring(1, panActivateConfig)
                trackEvent('Open typography settings')
              }}
              rightIcon={<ZoomIn {...ic.md} color={colors.p1} />}
              description="Try 'pinching to zoom' to change the Bible text size while reading."
              rightText={
                textSizeNames[settings.fontSize as keyof typeof textSizeNames]
              }
            >
              Bible Text Size
            </SettingsItem>
            <SettingsSection>Help</SettingsSection>
            <SettingsItem
              onPress={() => {
                trackEvent('Contact open')
                Alert.alert('How would you like to contact me?', '', [
                  {
                    text: 'Open mail app',
                    onPress: () => {
                      Linking.openURL('mailto:tov@trentcowden.com')
                      trackEvent('Contact: open mail app')
                    },
                  },
                  {
                    text: 'Copy email to clipboard',
                    onPress: () => {
                      Clipboard.setString('tov@trentcowden.com')
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
            <View
              style={{
                marginHorizontal: sp.xl,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: sp.xl,
                gap: sp.sm,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: sp.xl,
                  gap: sp.xs,
                }}
              >
                <Text style={[sans(tx.tiny, 'b', 'c', colors.fg3)]}>
                  Made with
                </Text>
                <Heart {...ic.md} color={colors.p1} />
                <Text style={[sans(tx.tiny, 'b', 'c', colors.fg3)]}>by</Text>
                <TovPressable
                  onPress={() => {
                    WebBrowser.openBrowserAsync('https://trentcowden.com')
                    trackEvent('Clicked Trent Cowden')
                  }}
                  style={{
                    paddingVertical: sp.xs,
                    paddingHorizontal: sp.sm,
                    borderRadius: br.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  bgColor={colors.bg3}
                  onPressColor={colors.bg3}
                >
                  <Text style={sans(tx.tiny, 'b', 'c', colors.p1)}>
                    Trent Cowden
                  </Text>
                </TovPressable>
              </View>
              <Text style={sans(tx.tiny, 'm', 'c', colors.fg3)}>
                {/* You're using{' '}
                <Text style={{ color: colors.p1, fontFamily: 'Figtree-Bold' }}>
                  tov
                </Text>{' '} */}
                Version {Application.nativeApplicationVersion}
              </Text>
            </View>
            <Spacer s={sp.xl} />
          </ScrollView>
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
