import ArrowLeft from '../assets/icons/duotone/arrow-narrow-left.svg'
import { gutterSize } from '../constants'
import useColors from '../hooks/useColors'
import { ic } from '../styles'
import TovPressable from './TovPressable'
interface Props {
  onPress: () => void
}

export default function BackButton({ onPress }: Props) {
  const colors = useColors()

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
      }}
      bgColor={colors.bg2}
      onPressColor={colors.bg3}
    >
      <ArrowLeft {...ic.lg} color={colors.fg3} />
    </TovPressable>
  )
}
