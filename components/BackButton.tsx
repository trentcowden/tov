import { colors, gutterSize, iconSize } from '../constants'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  onPress: () => void
}

export default function BackButton({ onPress }: Props) {
  return (
    <TovPressable
      onPress={onPress}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: gutterSize / 2,
        marginLeft: gutterSize / 2,
        borderRadius: 99,
        // marginRight: gutterSize / 4,
        // paddingRight: gutterSize / 2,
      }}
      onPressColor={colors.bg3}
    >
      <TovIcon name="arrowLeft" size={iconSize} color={colors.fg3} />
    </TovPressable>
  )
}
