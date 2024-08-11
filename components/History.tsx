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
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Bookmark from '../assets/icons/duotone/bookmark.svg'
import Settings from '../assets/icons/duotone/settings-02.svg'
import BookmarkFilled from '../assets/icons/solid/bookmark.svg'
import { panActivateConfig } from '../constants'
import { Chapters } from '../data/types/chapters'
import { getEdges, getHorizTransReq } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { HistoryItem } from '../redux/history'
import { useAppSelector } from '../redux/hooks'
import { br, ic, sans, shadow, sp, tx } from '../styles'
import HistoryListItem from './HistoryItem'
import Spacer from './Spacer'
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
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const { top, bottom } = getEdges(insets)
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
      if (favorites.length) return ['Bookmarks', ...favorites]
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
          paddingHorizontal: sp.md,
          marginTop: index === 0 ? 0 : sp.xl,
          paddingBottom: sp.sm,
          backgroundColor: colors.bg2,
        }}
      >
        <Text style={sans(tx.caption, 'l', 'l', colors.fg3)}>{item}</Text>
      </Animated.View>
    ) : (
      <HistoryListItem
        closeHistory={closeHistory}
        jumpToChapter={jumpToChapter}
        index={index}
        item={item}
        activeChapter={activeChapter}
        textTranslateX={textTranslationX}
      />
    )
  }

  const returnTapStyles = useAnimatedStyle(() => ({
    opacity: interpolate(textTranslationX.value, [0, horizTransReq], [0, 1]),
    zIndex: Math.abs(textTranslationX.value) < 10 ? -1 : 1,
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
            paddingLeft: width * 2 - horizTransReq,
            ...shadow,
          },
          historyAnimatedStyles,
        ]}
      >
        <View style={{ flex: 1 }}>
          <Animated.FlatList
            itemLayoutAnimation={LinearTransition.springify()
              .damping(20)
              .mass(0.5)
              .stiffness(140)
              .restDisplacementThreshold(0)}
            data={sections}
            contentContainerStyle={{ paddingHorizontal: sp.md }}
            renderItem={renderHistoryItem}
            keyExtractor={(item) =>
              typeof item === 'string' ? item : item.date.toString()
            }
            ItemSeparatorComponent={() => <Spacer s={sp.xs} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              showFavorites ? (
                <View
                  style={{
                    paddingLeft: sp.md,
                    paddingRight: ic.md.width + sp.md * 4,
                  }}
                >
                  <Text style={sans(tx.body, 'm', 'l', colors.fg2)}>
                    <Text
                      style={{ fontFamily: 'Figtree-Bold', color: colors.p1 }}
                    >
                      Long press
                    </Text>{' '}
                    on a history item to add it as a{' '}
                    <Text
                      style={{ fontFamily: 'Figtree-Bold', color: colors.p1 }}
                    >
                      bookmark
                    </Text>
                    .
                  </Text>
                </View>
              ) : null
            }
            ListHeaderComponent={<Spacer s={spaceBeforeTextStarts} />}
            ListFooterComponent={<Spacer s={bottom + sp.xl * 3} />}
          />
          <TovPressable
            bgColor={colors.p3}
            onPressColor={colors.p3}
            outerOuterStyle={{
              position: 'absolute',
              bottom: bottom + sp.md,
              right: sp.md,
            }}
            style={{
              padding: sp.md,
              borderRadius: br.fu,
              justifyContent: 'center',
              alignItems: 'center',
              ...shadow,
            }}
            hitSlop={sp.md}
            onPress={() => {
              openSettings.value = withSpring(1, panActivateConfig)
              trackEvent('Open settings')
            }}
          >
            <Settings {...ic.md} color={colors.fg3} />
          </TovPressable>
          <TovPressable
            bgColor={showFavorites ? colors.p1 : colors.p3}
            onPress={() => {
              setShowFavorites((current) => !current)
              trackEvent('View favorites', { value: !showFavorites })
            }}
            onPressColor={showFavorites ? colors.p1 : colors.p3}
            outerOuterStyle={{
              position: 'absolute',
              top,
              right: sp.md,
            }}
            style={{
              alignItems: 'center',
              zIndex: 100,
              borderRadius: br.fu,
              padding: sp.md,
              justifyContent: 'center',
              ...shadow,
            }}
          >
            {showFavorites ? (
              <BookmarkFilled color={colors.bg3} {...ic.md} />
            ) : (
              <Bookmark color={colors.fg3} {...ic.md} />
            )}
          </TovPressable>
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
