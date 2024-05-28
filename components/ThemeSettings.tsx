import { View, ViewStyle } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, panActivateConfig } from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setTheme } from '../redux/settings'
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
        Theme
      </ModalScreenHeader>
      <Spacer units={2} />
      <View style={{ gap: gutterSize / 2 }}>
        <ThemeItem
          theme="dark"
          onPress={() => dispatch(setTheme('dark'))}
          description="Light text on a dark background for ease on the eyes and maximum coziness."
        >
          Dark
        </ThemeItem>
        <ThemeItem
          theme="light"
          onPress={() => dispatch(setTheme('light'))}
          description="Dark text on a light background for ideal visibility and readability."
        >
          Light
        </ThemeItem>
        <ThemeItem
          theme="auto"
          onPress={() => dispatch(setTheme('auto'))}
          description="Theme will match whatever your phone color theme is set to."
        >
          Auto
        </ThemeItem>
      </View>
    </View>
  )
}
