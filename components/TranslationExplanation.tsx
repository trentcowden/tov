import React from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { panActivateConfig } from '../constants'
import useColors from '../hooks/useColors'
import { sans, sp, tx } from '../styles'
import BackButton from './BackButton'
import Fade from './Fade'
import ModalScreenHeader from './ModalScreenHeader'
import Spacer from './Spacer'

interface Props {
  openSettingsNested: SharedValue<number>
}

export default function TranslationExplanation({ openSettingsNested }: Props) {
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
      {/* <Spacer s={sp.md} /> */}
      <View
        style={{
          paddingHorizontal: sp.xl,
          flex: 1,
        }}
      >
        <ScrollView>
          <Spacer s={sp.md} />
          <Text style={sans(tx.body, 'm', 'l', colors.fg1)}>
            Tov uses the New English Translation (NET) of the Bible.
          </Text>
          <Spacer s={sp.md} />
          <Text style={sans(tx.body, 'm', 'l', colors.fg1)}>
            Unlike many Bible publishers who restrict access to their
            translations (like the NIV and ESV) behind paywalls and legal
            requirements, the NET Bible has an{' '}
            <Text style={{ fontFamily: 'Figtree-Bold', color: colors.p1 }}>
              open copyright policy
            </Text>
            . This means anyone, like a solo developer with a passion for
            beautiful and simple apps, can use it and distribute it for free.
          </Text>
          <Spacer s={sp.md} />
          <Text style={sans(tx.body, 'm', 'l', colors.fg1)}>
            By including the NET Bible, I'm affirming my commitment to—and
            sharing my passion for—the open and free distribution of God's Word
            to everyone.
          </Text>
        </ScrollView>
        <Fade place="top" color={colors.bg2} />
      </View>
    </View>
  )
}
