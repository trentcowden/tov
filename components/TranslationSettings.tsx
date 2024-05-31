import { Text, View, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, panActivateConfig, typography } from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import BackButton from './BackButton'
import Fade from './Fade'
import ModalScreenHeader from './ModalScreenHeader'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
}

export default function TranslationSettings({
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
        Translation
      </ModalScreenHeader>
      <Spacer units={2} />
      <View style={{ flex: 1 }}>
        <ScrollView style={{ paddingHorizontal: gutterSize }}>
          <Spacer units={2} />
          <Text style={typography(14, 'uir', 'l', colors.fg1)}>
            Tov currently only contains the World English Bible (WEB). The WEB
            is a public domain translation, meaning that anyone can use and
            distribute it for free.
          </Text>
          <Spacer units={2} />
          <Text style={typography(14, 'uir', 'l', colors.fg1)}>
            If you would like to see a different translation in Tov, or if you
            have connections to Bible licensers who can assist in getting
            permissions for other translations, please contact me at
            trent.cowden@gmail.com.
          </Text>
        </ScrollView>
        <Fade place="top" color={colors.bg2} />
      </View>
    </View>
  )
}
