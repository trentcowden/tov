import * as React from 'react'
import { DimensionValue, View, ViewStyle } from 'react-native'
import Svg, { NumberProp, Path } from 'react-native-svg'
import { colors } from '../constants'

export type IconName =
  | 'history'
  | 'search'
  | 'references'
  | 'forwardReference'
  | 'backReference'
  | 'arrowLeft'
  | 'scroll'
  | 'book'
  | 'arrowRightSquare'
  | 'chevronDown'
  | 'close'
  | 'bookOpen'

interface ParentProps {
  name: IconName
  size: NumberProp | undefined
  // color?: string
  style?: ViewStyle
}

interface ChildProps {
  name: IconName
  width: NumberProp | undefined
  height: NumberProp | undefined
  // fill?: string
  color?: string
}

function exhaustiveMatchingGuard(_: never): never {
  throw new Error('Should not have reached here.')
}

/**
 * This acts as a wrapper around the <SVGComponent />. For some reason, SVGs not
 * wrapped in a view will scale down as their available space runs out. Wrapping
 * it in a view of the same size removes this issue.
 */
export default function TovIcon({ name, size, color, style }: ParentProps) {
  return (
    <View
      style={{
        width: size as DimensionValue,
        height: size as DimensionValue,
        ...style,
      }}
    >
      <SVGComponent
        height={size}
        width={size}
        name={name}
        // fill={color}
        color={color}
      />
    </View>
  )
}

function SVGComponent(props: ChildProps) {
  // For regular icons, make sure to remove any hard-coded fill colors in order to fill with the prop color.
  switch (props.name) {
    case 'bookOpen':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M12 21l-.1-.15c-.695-1.042-1.042-1.563-1.5-1.94a4 4 0 00-1.378-.737C8.453 18 7.827 18 6.575 18H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 01-.874-.874C2 16.48 2 15.92 2 14.8V6.2c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874C3.52 3 4.08 3 5.2 3h.4c2.24 0 3.36 0 4.216.436a4 4 0 011.748 1.748C12 6.04 12 7.16 12 9.4M12 21V9.4M12 21l.1-.15c.695-1.042 1.042-1.563 1.5-1.94a3.999 3.999 0 011.378-.737C15.547 18 16.173 18 17.425 18H18.8c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C22 16.48 22 15.92 22 14.8V6.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C20.48 3 19.92 3 18.8 3h-.4c-2.24 0-3.36 0-4.216.436a4 4 0 00-1.748 1.748C12 6.04 12 7.16 12 9.4"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'close':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M18 6L6 18M6 6l12 12"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'chevronDown':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M6 9l6 6 6-6"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'arrowRightSquare':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M12 16l4-4m0 0l-4-4m4 4H8m-.2 9h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 18.72 21 17.88 21 16.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C18.72 3 17.88 3 16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 21 6.12 21 7.8 21z"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'book':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M20 19v-3H7a3 3 0 00-3 3m4.8 3h8c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C20 20.48 20 19.92 20 18.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C18.48 2 17.92 2 16.8 2h-8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C4 4.28 4 5.12 4 6.8v10.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C6.28 22 7.12 22 8.8 22z"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'scroll':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M7 15l5 5 5-5M7 9l5-5 5 5"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'arrowLeft':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M19 12H5m0 0l7 7m-7-7l7-7"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'forwardReference':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M6 17l5-5-5-5m7 10l5-5-5-5"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'backReference':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M18 17l-5-5 5-5m-7 10l-5-5 5-5"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )

    case 'references':
      return (
        <Svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <Path
            d="M4 17h16m0 0l-4-4m4 4l-4 4m4-14H4m0 0l4-4M4 7l4 4"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'history':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M22.7 13.5l-2-2-2 2M21 12a9 9 0 11-1.245-4.57M12 7v5l3 2"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'search':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
            stroke={colors.p1}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    default:
      console.log(props.name)
      return exhaustiveMatchingGuard(props.name)
  }
}
