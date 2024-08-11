import React from 'react'
import { Text, View } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { panActivateConfig } from '../constants'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { sp, tx, typography } from '../styles'
import BackButton from './BackButton'
import ModalScreenHeader from './ModalScreenHeader'
import Spacer from './Spacer'

interface Props {
  openSettingsNested: SharedValue<number>
}

export default function TranslationExplanation({ openSettingsNested }: Props) {
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
        Why the NET?
      </ModalScreenHeader>
      <Spacer s={sp.md} />
      <View
        style={{
          paddingHorizontal: sp.xl,
          gap: sp.md,
          flex: 1,
        }}
      >
        {/* <Text style={typography(tx.body, 'b', 'l', colors.p1)}>
          Freely you have received; freely give.
        </Text>
        <Text style={typography(tx.caption, 'uim', 'l', colors.p1)}>
          - Matthew 10:8
        </Text> */}
        <Text style={typography(tx.body, 'uim', 'l', colors.fg1)}>
          Unlike many Bible publishers who restrict access to their translations
          (like the NIV and ESV) behind paywalls and legal requirements, the NET
          Bible has an{' '}
          <Text style={{ fontFamily: 'Figtree-Bold' }}>
            open copyright policy
          </Text>
          . This means anyone, like a solo developer with a passion for
          beautiful and simple apps, can use it and distribute it for free.
        </Text>
        <Text style={typography(tx.body, 'uim', 'l', colors.fg1)}>
          By including the NET Bible, I'm affirming my commitment to—and sharing
          my passion for—the open and free distribution of God's Word to
          everyone.
        </Text>
      </View>
      <Spacer s={sp.xl} />
    </View>
  )
}
