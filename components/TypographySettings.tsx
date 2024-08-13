import { trackEvent } from '@aptabase/react-native'
import React from 'react'
import { Text, View } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import CheckmarkCircle from '../assets/icons/duotone/check-circle.svg'
import { panActivateConfig, textSizeNames } from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setTextSize } from '../redux/settings'
import { fontSizes, ic, sans, sp } from '../styles'
import BackButton from './BackButton'
import ModalScreenHeader from './ModalScreenHeader'
import Spacer from './Spacer'
import TovPressable from './TovPressable'

interface Props {
  openSettingsNested: SharedValue<number>
}

export default function TypographySettings({ openSettingsNested }: Props) {
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
      <Spacer s={sp.md} />
      <View
        style={{
          paddingHorizontal: sp.xl,
          gap: sp.md,
          flex: 1,
        }}
      >
        {fontSizes.map((f) => {
          const isActive = settings.fontSize === f

          return (
            <TovPressable
              key={f}
              onPress={() => {
                dispatch(setTextSize(f))
                trackEvent('Change font size', { fontSize: f })
              }}
              bgColor={colors.bg3}
              onPressColor={colors.bg3}
              outerOuterStyle={{ flex: 1, maxHeight: 60 }}
              style={{
                height: '100%',
                justifyContent: 'center',
                paddingHorizontal: sp.md,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isActive ? colors.p1 : 'transparent',
                alignItems: 'flex-start',
              }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={sans(f, 's', 'l', colors.fg2)}
              >
                {textSizeNames[f as keyof typeof textSizeNames]}
              </Text>
              {isActive ? (
                <View style={{ position: 'absolute', right: sp.md }}>
                  <CheckmarkCircle {...ic.md} color={colors.p1} />
                </View>
              ) : null}
            </TovPressable>
          )
        })}
      </View>
      <Spacer s={sp.xl} />
    </View>
  )
}
