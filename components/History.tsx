import { trackEvent } from '@aptabase/react-native'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { impactAsync } from 'expo-haptics'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useMemo, useState } from 'react'
import { AppState, Text, useWindowDimensions, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  LinearTransition,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import Spacer from '../Spacer'
import {
  gutterSize,
  panActivateConfig,
  shadows,
  sizes,
  typography,
} from '../constants'
import { Chapters } from '../data/types/chapters'
import { getEdges, getHorizTransReq } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { HistoryItem } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { br, sp } from '../styles'
import HistoryListItem from './HistoryItem'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  activeChapter: Chapters[number]
  textTranslationX: SharedValue<number>
  savedTextTranslationX: SharedValue<number>
  closeHistory: () => void
  jumpToChapter: JumpToChapter
  openSettings: SharedValue<number>
  spaceBeforeTextStarts: number
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg)

export default function History({
  textTranslationX,
  savedTextTranslationX,
  closeHistory,
  activeChapter,
  jumpToChapter,
  openSettings,
  spaceBeforeTextStarts,
}: Props) {
  const { height, width } = useWindowDimensions()
  const horizTransReq = getHorizTransReq(width)
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const { top, bottom } = getEdges(insets)
  const dispatch = useAppDispatch()
  const [updateHistory, setUpdateHistory] = useState(false)
  const historyAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslationX.value }],
    }
  })
  const [showFavorites, setShowFavorites] = useState(false)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setUpdateHistory((current) => !current)
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const sections = useMemo(() => {
    const sorted = [...history]
    sorted.sort((a, b) => {
      return b.date - a.date > 0 ? 1 : -1
    })

    if (showFavorites) {
      const favorites = sorted.filter((item) => item.isFavorite)
      if (favorites.length) return favorites
      else return []
    }

    return sorted.reduce(
      (groupedHistory: (string | HistoryItem)[], historyItem) => {
        let distance = formatDistanceToNow(historyItem.date)

        if (historyItem.chapterId === activeChapter.chapterId)
          distance = 'Today'
        else if (isToday(historyItem.date)) distance = 'Today'
        else if (isYesterday(historyItem.date)) distance = 'Yesterday'
        else distance += ' ago'

        if (!groupedHistory.includes(distance)) groupedHistory.push(distance)
        groupedHistory.push(historyItem)

        return groupedHistory
      },
      []
    )
  }, [history, activeChapter, showFavorites, updateHistory])

  function renderHistoryItem({
    item,
    index,
  }: {
    item: HistoryItem | string
    index: number
  }) {
    return typeof item === 'string' ? (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        key={item}
        style={{
          width: '100%',
          paddingHorizontal: gutterSize / 2,
          marginTop: index === 0 ? 0 : gutterSize,
          paddingBottom: gutterSize / 3,
          backgroundColor: colors.bg2,
        }}
      >
        <Text style={typography(sizes.caption, 'uil', 'l', colors.fg3)}>
          {item}
        </Text>
      </Animated.View>
    ) : (
      <HistoryListItem
        closeHistory={closeHistory}
        jumpToChapter={jumpToChapter}
        index={index}
        item={item}
        activeChapter={activeChapter}
        showFavorites={showFavorites}
      />
    )
  }

  const returnTapStyles = useAnimatedStyle(() => ({
    opacity: interpolate(textTranslationX.value, [0, horizTransReq], [0, 1]),
    zIndex: Math.abs(textTranslationX.value) < 10 ? -1 : 1,
  }))

  const bookmarkHeight = useSharedValue(top)
  const bookmarkPressed = useSharedValue(0)

  useEffect(() => {
    if (showFavorites) {
      bookmarkHeight.value = withSpring(br.md * 1.5 + gutterSize, {
        mass: 0.5,
        damping: 10,
        stiffness: 140,
      })
    } else {
      bookmarkHeight.value = withSpring(br.md * 1.5, panActivateConfig)
    }
  }, [showFavorites])

  const bookmarkTopStyles = useAnimatedStyle(() => ({
    height: bookmarkHeight.value,
  }))

  return (
    <>
      <Animated.View
        style={[
          {
            width: width * 2,
            height,
            backgroundColor: colors.bg2,
            position: 'absolute',
            left: -width * 2,
            zIndex: 3,
            // paddingTop: top + gutterSize / 4,
            paddingLeft: width * 1.3,
            ...shadows[0],
          },
          historyAnimatedStyles,
        ]}
      >
        {/* <TovPressable
          bgColor={colors.bg2}
          onPress={() => {
            setShowFavorites((current) => !current)
            trackEvent('View favorites', { value: !showFavorites })
          }}
          onPressColor={colors.bg3}
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: gutterSize / 2,
            gap: 8,
            borderRadius: br.lg,
          }}
        >
          <View
            style={{
              padding: gutterSize / 2,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <TovIcon name="history" size={iconSize} color={colors.p1} />
            <Text
              style={[
                typography(sizes.title, 'uib', 'l', colors.fg2),
                { flex: 1 },
              ]}
            >
              History
            </Text>
          </View>
          <View
            style={{
              width: 32,
              height: '100%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: br.fu,
              backgroundColor: showFavorites ? colors.p1 : colors.bg3,
            }}
          >
            <TovIcon
              name={showFavorites ? 'bookmarkFilled' : 'bookmark'}
              color={showFavorites ? colors.bg1 : colors.fg3}
              size={16}
            />
          </View>
        </TovPressable> */}
        <TovPressable
          bgColor={colors.p3}
          onPress={() => {
            setShowFavorites((current) => !current)
            trackEvent('View favorites', { value: !showFavorites })
          }}
          outerOuterStyle={{
            position: 'absolute',
            top: top,
            right: sp.md,
            zIndex: 1,
            ...shadows[0],
          }}
          style={{
            padding: sp.md,
            borderRadius: br.md,
          }}
          hitSlop={gutterSize / 2}
        >
          <Animated.View
            style={[
              {
                width: 32,
                height: top,
                backgroundColor: showFavorites ? colors.p1 : colors.p2,
                borderTopRightRadius: br.md,
                borderTopLeftRadius: br.md,
              },
              bookmarkTopStyles,
            ]}
          />
          <Svg
            width={32}
            height={18}
            viewBox="0 0 16 9"
            fill={showFavorites ? colors.p1 : colors.p2}
          >
            <Path d="M1 5.8V1h14v6.137a.7.7 0 01-1.227.46L8.753 1.86a1 1 0 00-1.506 0l-5.02 5.738A.7.7 0 011 7.137V5.8z" />
          </Svg>
        </TovPressable>
        <View style={{ flex: 1 }}>
          <Animated.FlatList
            itemLayoutAnimation={LinearTransition.springify()
              .damping(20)
              .mass(0.5)
              .stiffness(140)
              .restDisplacementThreshold(0)}
            data={sections}
            contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
            renderItem={renderHistoryItem}
            // renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) =>
              typeof item === 'string' ? item : item.date.toString()
            }
            showsVerticalScrollIndicator={false}
            // renderSectionFooter={() => <Spacer units={4} />}
            // estimatedItemSize={28}
            ListEmptyComponent={
              <View
                style={{
                  paddingLeft: gutterSize / 2,
                  paddingRight: gutterSize + 40,
                }}
              >
                <Text style={typography(sizes.body, 'uir', 'l', colors.fg3)}>
                  {showFavorites
                    ? 'Long press on a history item to add it as a bookmark.'
                    : 'Come back here to return to chapters you were previously reading.'}
                </Text>
              </View>
            }
            // Plus 2 to account for the line height of the text.
            ListHeaderComponent={
              <Spacer additional={spaceBeforeTextStarts + 6} />
            }
            ListFooterComponent={<Spacer units={14} additional={bottom} />}
          />
          {/* <Fade place="top" color={colors.bg2} /> */}
          <View
            style={{
              position: 'absolute',
              bottom: bottom + gutterSize,
              width: '100%',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingHorizontal: sp.md,
            }}
          >
            <TovPressable
              bgColor={colors.p3}
              onPressColor={colors.p3}
              style={{
                width: 48,
                height: 48,
                borderRadius: br.fu,
                justifyContent: 'center',
                alignItems: 'center',
                ...shadows[0],
              }}
              hitSlop={gutterSize / 2}
              onPress={() => {
                // textTranslationX.value = withSpring(0, panActivateConfig)
                openSettings.value = withSpring(1, panActivateConfig)
                trackEvent('Open settings')
              }}
            >
              <TovIcon name="settings" size={18} color={colors.fg3} />
              {/* <Text style={typography(sizes.caption, 'uis', 'c', colors.fg3)}>
                Settings
              </Text> */}
            </TovPressable>
          </View>
        </View>
        <StatusBar
          hidden
          backgroundColor={colors.bg2}
          translucent={false}
          animated
          style="light"
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            width,
            height,
            position: 'absolute',
          },
          returnTapStyles,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0}
          onPress={() => {
            runOnJS(impactAsync)()
            textTranslationX.value = withSpring(0, panActivateConfig)
            savedTextTranslationX.value = 0
          }}
          style={{
            width,
            height,
          }}
        />
      </Animated.View>
    </>
  )
}
