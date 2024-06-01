import * as React from 'react'
import { DimensionValue, View, ViewStyle } from 'react-native'
import Svg, { NumberProp, Path } from 'react-native-svg'

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
  | 'settings'
  | 'arrowRight'
  | 'heart'
  | 'heartFilled'
  | 'trash'
  | 'minus'
  | 'plus'
  | 'bookmark'
  | 'checkmarkCircle'
  | 'mail'
  | 'star'
  | 'tov'

interface ParentProps {
  name: IconName
  size: NumberProp | undefined
  color?: string
  style?: ViewStyle
}

interface ChildProps {
  name: IconName
  width: NumberProp | undefined
  height: NumberProp | undefined
  fill?: string
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
    case 'tov':
      return (
        <Svg viewBox="0 0 64 64" fill="none" {...props}>
          <Path
            d="M21.27 56.771h0l.002.003c1.18 1.922 2.802 3.292 4.866 4.108 2.058.813 4.407 1.218 7.044 1.218 3.987 0 7.28-.956 9.87-2.875 2.582-1.912 4.925-4.547 7.033-7.9l.04-.064-.05-.056-.613-.693-.072-.08-.075.077c-1.103 1.147-2.26 2.004-3.474 2.575a8.849 8.849 0 01-3.812.856c-.403 0-1.006-.066-1.513-.132a32.512 32.512 0 01-.836-.121l-.052-.008-.014-.003h-.003 0-.001 0l-.116-.02v.118c0 .395.162.818.394 1.223.232.406.541.804.848 1.154a12.63 12.63 0 001.053 1.059c-1.121.079-1.971-.35-2.622-1.082-.699-.785-1.17-1.923-1.486-3.167-.632-2.487-.632-5.352-.632-6.535V17.194H48.173V15.609H37.049V1.722l-.05-.03-1.313-.778-.03-.018-.034.005-8.496 1.125-.072.01-.013.07c-.584 2.995-1.312 5.496-2.184 7.507v.001c-.81 1.943-2.053 3.426-3.727 4.452h0l-.001.001c-1.617 1.027-3.993 1.717-7.14 2.062l-.089.01v1.055h5.693v31.74c0 3.241.557 5.856 1.678 7.837z"
            fill="#D1A17A"
            stroke="#231B16"
            strokeWidth={0.2}
          />
        </Svg>
      )
    case 'star':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M11.283 3.453c.23-.467.345-.7.502-.775a.5.5 0 01.43 0c.157.075.272.308.502.775l2.187 4.43c.068.138.102.207.152.26a.502.502 0 00.155.114c.067.03.143.042.295.064l4.891.715c.515.075.773.113.892.238a.5.5 0 01.133.41c-.023.172-.21.353-.582.716L17.3 13.846c-.11.108-.165.162-.2.226a.5.5 0 00-.06.183c-.009.072.004.148.03.3l.835 4.867c.088.514.132.77.05.922a.5.5 0 01-.349.253c-.17.032-.4-.09-.862-.332l-4.373-2.3c-.136-.07-.204-.107-.276-.12a.498.498 0 00-.192 0c-.072.013-.14.05-.276.12l-4.373 2.3c-.461.243-.692.364-.862.332a.5.5 0 01-.348-.253c-.083-.152-.039-.409.05-.922l.834-4.867c.026-.152.039-.228.03-.3a.5.5 0 00-.06-.184c-.035-.063-.09-.117-.2-.225L3.16 10.4c-.373-.363-.56-.544-.582-.716a.5.5 0 01.132-.41c.12-.125.377-.163.892-.238l4.891-.715c.152-.022.228-.034.295-.064a.5.5 0 00.155-.113c.05-.054.084-.123.152-.26l2.187-4.43z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'mail':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M2 7l8.165 5.715c.661.463.992.695 1.351.784a2 2 0 00.968 0c.36-.09.69-.32 1.351-.784L22 7M6.8 20h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C22 17.72 22 16.88 22 15.2V8.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C19.72 4 18.88 4 17.2 4H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C2 6.28 2 7.12 2 8.8v6.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C4.28 20 5.12 20 6.8 20z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'checkmarkCircle':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M7.5 12l3 3 6-6m5.5 3c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'bookmark':
      return (
        <Svg viewBox="0 0 24 24" fill={props.color} {...props}>
          <Path d="M5 7.8c0-1.68 0-2.52.327-3.162a3 3 0 011.311-1.311C7.28 3 8.12 3 9.8 3h4.4c1.68 0 2.52 0 3.162.327a3 3 0 011.311 1.311C19 5.28 19 6.12 19 7.8V21l-7-4-7 4V7.8z" />
        </Svg>
      )
    case 'plus':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M12 8v8m-4-4h8m-8.2 9h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 18.72 21 17.88 21 16.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C18.72 3 17.88 3 16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 21 6.12 21 7.8 21z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'minus':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M8 12h8m-8.2 9h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 18.72 21 17.88 21 16.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C18.72 3 17.88 3 16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 21 6.12 21 7.8 21z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'trash':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M16 6v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C14.48 2 13.92 2 12.8 2h-1.6c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C8 3.52 8 4.08 8 5.2V6m2 5.5v5m4-5v5M3 6h18m-2 0v11.2c0 1.68 0 2.52-.327 3.162a3 3 0 01-1.311 1.311C16.72 22 15.88 22 14.2 22H9.8c-1.68 0-2.52 0-3.162-.327a3 3 0 01-1.311-1.311C5 19.72 5 18.88 5 17.2V6"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'heart':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            clipRule="evenodd"
            d="M11.993 5.136c-2-2.338-5.333-2.966-7.838-.826s-2.858 5.719-.89 8.25c1.635 2.105 6.585 6.544 8.207 7.98.182.162.272.242.378.274a.504.504 0 00.286 0c.106-.032.197-.112.378-.273 1.623-1.437 6.573-5.876 8.208-7.98 1.967-2.532 1.658-6.133-.89-8.251-2.549-2.118-5.84-1.512-7.839.826z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'heartFilled':
      return (
        <Svg viewBox="0 0 24 24" fill={props.color} {...props}>
          <Path
            clipRule="evenodd"
            d="M11.993 5.136c-2-2.338-5.333-2.966-7.838-.826s-2.858 5.719-.89 8.25c1.635 2.105 6.585 6.544 8.207 7.98.182.162.272.242.378.274a.504.504 0 00.286 0c.106-.032.197-.112.378-.273 1.623-1.437 6.573-5.876 8.208-7.98 1.967-2.532 1.658-6.133-.89-8.251-2.549-2.118-5.84-1.512-7.839.826z"
          />
        </Svg>
      )
    case 'arrowRight':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M4 12h16m0 0l-6-6m6 6l-6 6"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'settings':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M12 15a3 3 0 100-6 3 3 0 000 6z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9.29 19.371l.584 1.315a2.213 2.213 0 004.044 0l.585-1.315a2.426 2.426 0 012.47-1.423l1.43.152a2.212 2.212 0 002.022-3.502l-.847-1.164a2.428 2.428 0 01-.46-1.434c0-.513.163-1.014.465-1.429l.847-1.163a2.212 2.212 0 00-2.023-3.502l-1.43.152a2.433 2.433 0 01-1.47-.312 2.425 2.425 0 01-1-1.117l-.588-1.315a2.212 2.212 0 00-4.045 0L9.29 4.63c-.207.468-.558.86-1 1.117-.445.256-.96.365-1.47.312l-1.435-.152a2.212 2.212 0 00-2.022 3.502l.847 1.163a2.43 2.43 0 010 2.858l-.847 1.163a2.21 2.21 0 00.786 3.273c.381.195.81.274 1.236.23l1.43-.153a2.434 2.434 0 012.475 1.43z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'bookOpen':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M12 21l-.1-.15c-.695-1.042-1.042-1.563-1.5-1.94a4 4 0 00-1.378-.737C8.453 18 7.827 18 6.575 18H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 01-.874-.874C2 16.48 2 15.92 2 14.8V6.2c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874C3.52 3 4.08 3 5.2 3h.4c2.24 0 3.36 0 4.216.436a4 4 0 011.748 1.748C12 6.04 12 7.16 12 9.4M12 21V9.4M12 21l.1-.15c.695-1.042 1.042-1.563 1.5-1.94a3.999 3.999 0 011.378-.737C15.547 18 16.173 18 17.425 18H18.8c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C22 16.48 22 15.92 22 14.8V6.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C20.48 3 19.92 3 18.8 3h-.4c-2.24 0-3.36 0-4.216.436a4 4 0 00-1.748 1.748C12 6.04 12 7.16 12 9.4"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'close':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M18 6L6 18M6 6l12 12"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'chevronDown':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M6 9l6 6 6-6"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'arrowRightSquare':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M12 16l4-4m0 0l-4-4m4 4H8m-.2 9h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 18.72 21 17.88 21 16.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C18.72 3 17.88 3 16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C3 5.28 3 6.12 3 7.8v8.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C5.28 21 6.12 21 7.8 21z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'book':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M20 19v-3H7a3 3 0 00-3 3m4.8 3h8c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C20 20.48 20 19.92 20 18.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C18.48 2 17.92 2 16.8 2h-8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C4 4.28 4 5.12 4 6.8v10.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C6.28 22 7.12 22 8.8 22z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'scroll':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M7 15l5 5 5-5M7 9l5-5 5 5"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'arrowLeft':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M19 12H5m0 0l7 7m-7-7l7-7"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'forwardReference':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M6 17l5-5-5-5m7 10l5-5-5-5"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'backReference':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M18 17l-5-5 5-5m-7 10l-5-5 5-5"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )

    case 'references':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M4 17h16m0 0l-4-4m4 4l-4 4m4-14H4m0 0l4-4M4 7l4 4"
            stroke={props.color}
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
            stroke={props.color}
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
            stroke={props.color}
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
