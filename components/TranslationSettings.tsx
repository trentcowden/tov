import { Text, View, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, panActivateConfig, sizes, typography } from '../constants'
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
          <Text style={typography(sizes.body, 'uir', 'l', colors.fg1)}>
            Tov only contains the New English Translation (NET). The NET is a
            modern translation of the Bible designed to make it accessible and
            understandable to contemporary readers. It aims to balance accuracy
            with readability, employing a clear and dynamic language that
            resonates with today's audience while remaining faithful to the
            original texts.
          </Text>
        </ScrollView>
        <Fade place="top" color={colors.bg2} />
      </View>
    </View>
  )
}
