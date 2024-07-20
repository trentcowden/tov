import { trackEvent } from '@aptabase/react-native'
import { View, ViewStyle } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import RNRestart from 'react-native-restart' // Import package from node modules
import Spacer from '../Spacer'
import { gutterSize, panActivateConfig } from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { SettingsState, setTheme } from '../redux/settings'
import { themes } from '../styles'
import BackButton from './BackButton'
import ModalScreenHeader from './ModalScreenHeader'
import ThemeItem from './ThemeItem'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
}

export default function ThemeSettings({
  openSettings,
  openSettingsNested,
}: Props) {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const colors = useColors()

  const buttonStyles: ViewStyle = {}

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
        Color Theme
      </ModalScreenHeader>
      <Spacer units={2} />
      <View style={{ gap: gutterSize / 2 }}>
        {themes.map((t) => (
          <ThemeItem
            key={t.id}
            theme={t}
            onPress={() => {
              dispatch(setTheme(t.id as SettingsState['theme']))
              trackEvent('Change theme', { theme: t.id })
              setTimeout(RNRestart.restart, 250)
            }}
            description={t.description}
          >
            {t.name} {t.emoji}
          </ThemeItem>
        ))}
      </View>
    </View>
  )
}
