import { trackEvent } from '@aptabase/react-native'
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, panActivateConfig, sizes, typography } from '../constants'
import { getHorizTransReq } from '../functions/utils'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setTypography } from '../redux/settings'
import { fontSizes } from '../styles'
import BackButton from './BackButton'
import ModalScreenHeader from './ModalScreenHeader'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
  textTranslateX: SharedValue<number>
}

export default function TypographySettings({
  openSettings,
  openSettingsNested,
  textTranslateX,
}: Props) {
  const { width } = useWindowDimensions()
  const horizTransReq = getHorizTransReq(width)
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const colors = useColors()

  return (
    <View style={{ flex: 1 }}>
      <ModalScreenHeader
        paddingLeft={0}
        icon={
          <BackButton
            onPress={() => {
              openSettingsNested.value = withSpring(0, panActivateConfig)
            }}
          />
        }
      >
        Bible Text Size
      </ModalScreenHeader>
      <Spacer units={2} />
      <View
        style={{
          paddingHorizontal: gutterSize,
          gap: gutterSize / 2,
          flex: 1,
        }}
      >
        {fontSizes.map((f) => {
          const isActive = settings.fontSize === f.fontSize

          return (
            <TovPressable
              key={f.name}
              onPress={() => {
                dispatch(setTypography(f))
                trackEvent('Change font size', { fontSize: f.fontSize })
              }}
              bgColor={colors.bg3}
              onPressColor={colors.bg3}
              style={{
                justifyContent: 'center',
                height: 60,
                paddingHorizontal: gutterSize / 2,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isActive ? colors.p1 : 'transparent',
                alignItems: 'flex-start',
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={typography(f.fontSize, 'uis', 'l', colors.fg2)}
              >
                {f.name} {f.emoji}
              </Text>
              {isActive ? (
                <View style={{ position: 'absolute', right: gutterSize / 2 }}>
                  <TovIcon name="checkmarkCircle" size={20} color={colors.p1} />
                </View>
              ) : null}
            </TovPressable>
          )
        })}
      </View>
      <Pressable
        onPressIn={() => {
          openSettings.value = withSpring(0, panActivateConfig)
          textTranslateX.value = withSpring(0, panActivateConfig)
          impactAsync(ImpactFeedbackStyle.Heavy)
        }}
        onPressOut={() => {
          openSettings.value = withSpring(1, panActivateConfig)
          textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
          impactAsync(ImpactFeedbackStyle.Light)
        }}
        style={{
          marginTop: gutterSize,
          marginHorizontal: gutterSize,
          padding: gutterSize,
          backgroundColor: colors.ph,
          borderRadius: 12,
          alignItems: 'center',
          // flexDirection: 'row',
          gap: gutterSize / 2,
          justifyContent: 'center',
        }}
      >
        <TovIcon name="eye" size={40} color={colors.fg2} />
        <Text style={typography(sizes.body, 'uib', 'c', colors.fg1)}>
          Press and Hold to Preview
        </Text>
      </Pressable>
      <Spacer units={4} />
    </View>
  )
}
