import { Pressable, Text, View } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import Spacer from '../Spacer'
import {
  gutterSize,
  horizTransReq,
  panActivateConfig,
  screenWidth,
  sizes,
  typography,
} from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setTypography, typographyOptions } from '../redux/settings'
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
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const colors = useColors()

  const names = {
    small: 'Tiny 🐞',
    default: 'Default 🐱',
    large: 'Quite Big 🐴',
    xlarge: 'Very Large 🦖',
  }

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
        Typography
      </ModalScreenHeader>
      <Spacer units={2} />
      <View
        style={{
          paddingHorizontal: gutterSize,
          gap: gutterSize / 2,
          width: screenWidth - gutterSize * 2,
          flex: 1,
        }}
      >
        {Object.keys(typographyOptions).map((key) => {
          const option = key as keyof typeof typographyOptions
          const isActive =
            settings.fontSize === typographyOptions[option].fontSize

          return (
            <TovPressable
              key={key}
              onPress={() => {
                dispatch(setTypography(option))
              }}
              onPressColor={isActive ? colors.ph : colors.bg3}
              style={{
                justifyContent: 'center',
                padding: gutterSize / 2,
                backgroundColor: isActive ? colors.ph : colors.bg3,
                borderRadius: 12,
                alignItems: 'center',
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={typography(
                  typographyOptions[option].fontSize,
                  'uis',
                  'c',
                  colors.fg2
                )}
              >
                {names[option]}
              </Text>
            </TovPressable>
          )
        })}
      </View>
      <Pressable
        onPressIn={() => {
          openSettings.value = withSpring(0, panActivateConfig)
          textTranslateX.value = withSpring(0, panActivateConfig)
        }}
        onPressOut={() => {
          openSettings.value = withSpring(1, panActivateConfig)
          textTranslateX.value = withSpring(horizTransReq, panActivateConfig)
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
