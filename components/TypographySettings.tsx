import { Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SharedValue, withTiming } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { colors, gutterSize, typography } from '../constants'
import bibles from '../data/bibles'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import {
  setFontSize,
  setLineHeight,
  setParagraphSpacing,
} from '../redux/settings'
import BackButton from './BackButton'
import BibleText from './BibleText'
import ModalScreenHeader from './ModalScreenHeader'
import TovIcon from './SVG'

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
              openSettingsNested.value = withTiming(0)
            }}
          />
        }
        // close={() => {
        //   openSettings.value = withTiming(0)
        //   openSettingsNested.value = withTiming(0)
        // }}
      >
        Typography
      </ModalScreenHeader>
      <Spacer units={2} />
      <View style={{ paddingHorizontal: gutterSize, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ ...typography(16, 'uim', 'l', colors.fg1), flex: 1 }}>
            Font Size
          </Text>
          <TouchableOpacity onPress={decreaseFontSize} style={buttonStyles}>
            <TovIcon name="minus" size={18} color={colors.p2} />
          </TouchableOpacity>
          <Text style={[typography(20, 'uib', 'c', colors.p1), { width: 32 }]}>
            {settings.fontSize}
          </Text>
          <TouchableOpacity onPress={increaseFontSize} style={buttonStyles}>
            <TovIcon name="plus" size={18} color={colors.p2} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ ...typography(16, 'uim', 'l', colors.fg1), flex: 1 }}>
            Line Height
          </Text>
          <TouchableOpacity onPress={decreaseLineHeight} style={buttonStyles}>
            <TovIcon name="minus" size={18} color={colors.p2} />
          </TouchableOpacity>
          <Text style={[typography(20, 'uib', 'c', colors.p1), { width: 32 }]}>
            {settings.lineHeight}
          </Text>
          <TouchableOpacity onPress={increaseLineHeight} style={buttonStyles}>
            <TovIcon name="plus" size={18} color={colors.p2} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ ...typography(16, 'uim', 'l', colors.fg1), flex: 1 }}>
            Paragraph Spacing
          </Text>
          <TouchableOpacity
            onPress={decreaseParagraphSpacing}
            style={buttonStyles}
          >
            <TovIcon name="minus" size={18} color={colors.p2} />
          </TouchableOpacity>
          <Text style={[typography(20, 'uib', 'c', colors.p1), { width: 32 }]}>
            {settings.paragraphSpacing}
          </Text>
          <TouchableOpacity
            onPress={increaseParagraphSpacing}
            style={buttonStyles}
          >
            <TovIcon name="plus" size={18} color={colors.p2} />
          </TouchableOpacity>
        </View>
      </View>
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
        <BibleText>{bibles[settings.translation][0].md}</BibleText>
        <Spacer units={4} />
      </ScrollView>
    </View>
  )
}