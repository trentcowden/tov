import { useColorScheme } from 'react-native'
import { themes } from '../styles'

export default function useColors() {
  // const theme = useAppSelector((state) => state.settings.theme)
  const theme = useColorScheme()

  if (theme === 'light')
    return themes.find((t) => t.name === 'Light') as (typeof themes)[0]
  // else if (theme === 'black')
  //   return themes.find((t) => t.name === 'Black') as (typeof themes)[0]
  else return themes.find((t) => t.name === 'Dark') as (typeof themes)[0]
}
