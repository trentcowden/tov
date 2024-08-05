import ArrowLeft from '../assets/icons/duotone/arrow-narrow-left.svg'
import useColors from '../hooks/useColors'
import { br, ic, sp } from '../styles'
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
        paddingHorizontal: sp.md,
        marginLeft: sp.md,
        borderRadius: br.lg,
      }}
      bgColor={colors.bg2}
      onPressColor={colors.bg3}
    >
      <ArrowLeft {...ic.lg} color={colors.fg3} />
    </TovPressable>
  )
}
