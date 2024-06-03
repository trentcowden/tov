import { Text, View } from 'react-native'
import { sizes, typography } from '../constants'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { SettingsState } from '../redux/settings'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  setting: keyof SettingsState
  decrease: () => void
  increase: () => void
  min: number
  max: number
}

export default function TypographySetting({
  setting,
  max,
  min,
  decrease,
  increase,
}: Props) {
  const settings = useAppSelector((state) => state.settings)
  const colors = useColors()
  const thisSetting =
    setting === 'fontSize'
      ? settings.fontSize
      : setting === 'lineHeight'
        ? settings.lineHeight
        : settings.paragraphSpacing

  const disableMax = thisSetting >= max
  const disableMin = thisSetting <= min

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text
        style={{
          ...typography(sizes.body, 'uim', 'l', colors.fg1),
          flex: 1,
        }}
      >
        {setting === 'fontSize'
          ? 'Font Size'
          : setting === 'lineHeight'
            ? 'Line Height'
            : 'Paragraph Spacing'}
      </Text>
      <TovPressable
        disableAnimation={disableMin}
        onPress={disableMin ? () => {} : decrease}
      >
        <TovIcon
          name="minus"
          size={22}
          color={disableMin ? colors.fg3 : colors.p1}
        />
      </TovPressable>
      <Text
        style={[
          typography(sizes.subtitle, 'uib', 'c', colors.fg2),
          { width: 32 },
        ]}
      >
        {thisSetting}
      </Text>
      <TovPressable onPress={disableMax ? () => {} : increase}>
        <TovIcon
          name="plus"
          size={22}
          color={disableMax ? colors.fg3 : colors.p1}
        />
      </TovPressable>
    </View>
  )
}
