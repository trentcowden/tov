import * as React from 'react'
import { DimensionValue, View, ViewStyle } from 'react-native'
import Svg, { Defs, G, NumberProp, Path } from 'react-native-svg'

export type IconName =
  | 'history'
  | 'search'
  | 'references'
  | 'forwardReference'
  | 'backReference'
  | 'arrowLeft'
  | 'arrowDown'
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
  | 'help'
  | 'money'
  | 'code'
  | 'delete'

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
    case 'delete':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M17 9l-6 6m0-6l6 6M2.72 12.96l4.32 5.76c.352.47.528.704.751.873.198.15.421.262.66.33C8.72 20 9.013 20 9.6 20h7.6c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C22 17.72 22 16.88 22 15.2V8.8c0-1.68 0-2.52-.327-3.162a3 3 0 00-1.311-1.311C19.72 4 18.88 4 17.2 4H9.6c-.587 0-.88 0-1.15.077a2 2 0 00-.659.33c-.223.169-.399.404-.751.873l-4.32 5.76c-.258.344-.387.516-.437.705a1 1 0 000 .51c.05.189.179.36.437.705z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'code':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M17 17l5-5-5-5M7 7l-5 5 5 5m7-14l-4 18"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'money':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M5 13a6 6 0 016-6m-6 6c0 1.648.665 3.142 1.74 4.226.104.105.156.157.187.207.03.048.046.09.06.144.013.057.013.122.013.253v2.37c0 .28 0 .42.054.527a.5.5 0 00.219.218C7.38 21 7.52 21 7.8 21h1.9c.28 0 .42 0 .527-.055a.5.5 0 00.218-.218c.055-.107.055-.247.055-.527v-.4c0-.28 0-.42.054-.527a.5.5 0 01.219-.218C10.88 19 11.02 19 11.3 19h1.4c.28 0 .42 0 .527.055a.5.5 0 01.218.218c.055.107.055.247.055.527v.4c0 .28 0 .42.054.527a.5.5 0 00.219.218c.107.055.247.055.527.055h1.9c.28 0 .42 0 .527-.055a.5.5 0 00.218-.218C17 20.62 17 20.48 17 20.2v-.976c0-.202 0-.303.029-.384a.462.462 0 01.121-.19c.061-.06.166-.108.374-.205a6.025 6.025 0 002.427-2.055c.107-.155.16-.233.217-.28a.464.464 0 01.17-.089c.07-.021.154-.021.32-.021h.542c.28 0 .42 0 .527-.055a.5.5 0 00.218-.218C22 15.62 22 15.48 22 15.2v-3.414c0-.267 0-.4-.05-.503a.5.5 0 00-.233-.233c-.103-.05-.236-.05-.503-.05-.193 0-.29 0-.367-.026a.463.463 0 01-.203-.13c-.057-.06-.103-.16-.195-.358a6.013 6.013 0 00-1.19-1.712c-.104-.105-.155-.157-.186-.207a.462.462 0 01-.06-.144C19 8.366 19 8.3 19 8.17V7.06c0-.36 0-.54-.075-.66a.5.5 0 00-.288-.218c-.137-.039-.31.01-.657.11l-2.372.677a.498.498 0 01-.136.029C15.45 7 15.43 7 15.387 7H11m-6 6H4a2 2 0 01-1-3.732M11 7h3.965a3.5 3.5 0 10-6.758.688A5.974 5.974 0 0111 7z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'arrowDown':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M12 5v14m0 0l7-7m-7 7l-7-7"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'help':
      return (
        <Svg viewBox="0 0 24 24" fill="none" {...props}>
          <Path
            d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
            stroke={props.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )
    case 'tov':
      return (
        <Svg viewBox="0 0 201 340" fill="none" {...props}>
          <G filter="url(#filter0_d_65_40)">
            <Path
              d="M107.307 331c-14.015 0-26.472-2.184-37.373-6.553-10.9-4.369-19.464-11.702-25.693-22-5.917-10.61-8.876-24.653-8.876-42.128V98.064H12.748A7.748 7.748 0 015 90.316c0-3.947 2.974-7.24 6.876-7.837 13.464-2.062 23.94-5.505 31.43-10.33 9.032-5.617 15.728-13.73 20.088-24.34 3.835-8.967 7.146-19.722 9.932-32.265 1.118-5.036 5.194-8.922 10.307-9.608l33.652-4.52a8.92 8.92 0 0110.109 8.843v70.316h50.584a8.745 8.745 0 010 17.49h-50.584v148.68c0 12.794 0 59.255 27.095 55.755 0 0-9.27-9.277-12.718-17.043-1.059-2.387 1.199-4.345 3.781-3.953 1.589.242 3.344.432 4.937.432 7.163 0 14.015-1.56 20.555-4.681 4.517-2.155 8.887-5.055 13.107-8.7 3.055-2.638 7.786-2.384 10.2.851 1.598 2.143 1.731 5.052.276 7.295-10.589 16.324-22.255 29.275-34.999 38.852C145.925 325.851 128.484 331 107.307 331z"
              fill="#D1A17A"
            />
            <Path
              d="M43.804 302.69l.005.008.004.008c6.283 10.388 14.932 17.795 25.935 22.205 10.97 4.397 23.492 6.589 37.559 6.589 21.26 0 38.813-5.17 52.621-15.547 12.8-9.619 24.505-22.617 35.119-38.98 1.572-2.423 1.424-5.56-.296-7.866-2.607-3.494-7.678-3.735-10.927-.93-4.19 3.618-8.522 6.493-12.996 8.627-6.473 3.089-13.251 4.632-20.339 4.632-1.557 0-3.285-.186-4.862-.426-1.429-.217-2.802.21-3.681 1.071-.899.88-1.249 2.188-.632 3.579 1.754 3.949 4.971 8.254 7.725 11.551a101.626 101.626 0 004.376 4.901c-6.102.515-10.711-1.642-14.225-5.39-3.729-3.976-6.241-9.763-7.926-16.117-3.367-12.706-3.37-27.457-3.37-33.86V98.564h50.084a9.245 9.245 0 100-18.49h-50.084V10.26A9.421 9.421 0 00117.218.921l-33.652 4.52c-5.33.715-9.566 4.762-10.728 9.995-2.781 12.521-6.084 23.245-9.904 32.176h0l-.002.006c-4.324 10.521-10.954 18.55-19.89 24.106h0l-.006.005c-7.408 4.771-17.808 8.2-31.236 10.255-4.132.633-7.3 4.125-7.3 8.332a8.248 8.248 0 008.248 8.248h22.117v161.755c0 17.526 2.966 31.661 8.94 42.371z"
              stroke="#231B16"
            />
          </G>
          <Defs></Defs>
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
