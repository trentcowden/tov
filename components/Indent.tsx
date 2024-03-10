import React from 'react'
import { Text } from 'react-native'
import { gutterSize } from '../constants'

interface Props {}
export default function Indent({}: Props) {
  return <Text style={{ letterSpacing: gutterSize, fontSize: 1 }}> </Text>
}
