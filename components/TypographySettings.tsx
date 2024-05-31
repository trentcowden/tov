import { Text, View, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withSpring } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { gutterSize, panActivateConfig, sizes, typography } from '../constants'
import bibles from '../data/bibles'
import useColors from '../hooks/useColors'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import {
  defaultTypography,
  setFontSize,
  setLineHeight,
  setParagraphSpacing,
} from '../redux/settings'
import BackButton from './BackButton'
import BibleText from './BibleText'
import ModalScreenHeader from './ModalScreenHeader'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  openSettings: SharedValue<number>
  openSettingsNested: SharedValue<number>
}

export default function TypographySettings({
  openSettings,
  openSettingsNested,
}: Props) {
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const colors = useColors()
  const decreaseFontSize = () => {
    const newFontSize = settings.fontSize - 1
    dispatch(setFontSize(newFontSize))
  }

  const increaseFontSize = () => {
    const newFontSize = settings.fontSize + 1
    dispatch(setFontSize(newFontSize))
  }

  const decreaseLineHeight = () => {
    const newLineHeight = settings.lineHeight - 2
    dispatch(setLineHeight(newLineHeight))
  }

  const increaseLineHeight = () => {
    const newLineHeight = settings.lineHeight + 2
    dispatch(setLineHeight(newLineHeight))
  }

  const decreaseParagraphSpacing = () => {
    const newParagraphSpacing = settings.paragraphSpacing - 2
    dispatch(setParagraphSpacing(newParagraphSpacing))
  }

  const increaseParagraphSpacing = () => {
    const newParagraphSpacing = settings.paragraphSpacing + 2
    dispatch(setParagraphSpacing(newParagraphSpacing))
  }

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
        Typography
      </ModalScreenHeader>
      <Spacer units={2} />
      <View style={{ paddingHorizontal: gutterSize, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text
            style={{
              ...typography(sizes.body, 'uim', 'l', colors.fg1),
              flex: 1,
            }}
          >
            Font Size
          </Text>
          <TovPressable onPress={decreaseFontSize} style={buttonStyles}>
            <TovIcon name="minus" size={22} color={colors.p1} />
          </TovPressable>
          <Text
            style={[
              typography(sizes.subtitle, 'uib', 'c', colors.fg2),
              { width: 32 },
            ]}
          >
            {settings.fontSize}
          </Text>
          <TovPressable onPress={increaseFontSize} style={buttonStyles}>
            <TovIcon name="plus" size={22} color={colors.p1} />
          </TovPressable>
        </View>
        {/* <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text
            style={{
              ...typography(sizes.body, 'uim', 'l', colors.fg1),
              flex: 1,
            }}
          >
            Line Height
          </Text>
          <TovPressable onPress={decreaseLineHeight} style={buttonStyles}>
            <TovIcon name="minus" size={22} color={colors.p1} />
          </TovPressable>
          <Text
            style={[
              typography(sizes.subtitle, 'uib', 'c', colors.fg2),
              { width: 32 },
            ]}
          >
            {settings.lineHeight}
          </Text>
          <TovPressable onPress={increaseLineHeight} style={buttonStyles}>
            <TovIcon name="plus" size={22} color={colors.p1} />
          </TovPressable>
        </View> */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text
            style={{
              ...typography(sizes.body, 'uim', 'l', colors.fg1),
              flex: 1,
            }}
          >
            Paragraph Spacing
          </Text>
          <TovPressable onPress={decreaseParagraphSpacing} style={buttonStyles}>
            <TovIcon name="minus" size={22} color={colors.p1} />
          </TovPressable>
          <Text
            style={[
              typography(sizes.subtitle, 'uib', 'c', colors.fg2),
              { width: 32 },
            ]}
          >
            {settings.paragraphSpacing}
          </Text>
          <TovPressable onPress={increaseParagraphSpacing} style={buttonStyles}>
            <TovIcon name="plus" size={22} color={colors.p1} />
          </TovPressable>
        </View>
      </View>
      <TovPressable
        onPress={() => {
          dispatch(setFontSize(defaultTypography.fontSize))
          dispatch(setLineHeight(defaultTypography.lineHeight))
          dispatch(setParagraphSpacing(defaultTypography.paragraphSpacing))
        }}
        onPressColor={colors.bg3}
        style={{
          marginTop: gutterSize,
          marginHorizontal: gutterSize,
          padding: gutterSize / 2,
          backgroundColor: colors.bg3,
          borderRadius: 999,
          alignItems: 'center',
        }}
      >
        <Text style={typography(sizes.caption, 'uis', 'c', colors.fg3)}>
          Reset to Default
        </Text>
      </TovPressable>
      <Spacer units={4} />
      <ScrollView
        style={{
          paddingHorizontal: gutterSize,
          backgroundColor: colors.bg3,
          marginHorizontal: gutterSize,
          borderRadius: 12,
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <Spacer units={4} />
        <BibleText>{bibles[settings.translation][1].md}</BibleText>
        <Spacer units={4} />
      </ScrollView>
      <Spacer units={4} />
    </View>
  )
}
