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
import Spacer from '../Spacer'
import Bookmark from '../assets/icons/duotone/bookmark.svg'
import Settings from '../assets/icons/duotone/settings-02.svg'
import BookmarkFilled from '../assets/icons/solid/bookmark.svg'
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
import { br, ic, sp } from '../styles'
import HistoryListItem from './HistoryItem'
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
  const popups = useAppSelector((state) => state.popups)
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
  const startH = gutterSize * 1.5
  const endH = gutterSize * 3

  useEffect(() => {
    if (showFavorites) {
      bookmarkHeight.value = withSpring(endH, {
        mass: 0.5,
        damping: 10,
        stiffness: 140,
      })
    } else {
      bookmarkHeight.value = withSpring(startH, panActivateConfig)
    }
  }, [showFavorites])

  const bookmarkTopStyles = useAnimatedStyle(() => ({
    height: bookmarkHeight.value,
  }))
  const bookmarkStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(bookmarkHeight.value, [startH, endH], [1, 1.2]),
      },
    ],
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
            ListHeaderComponent={<Spacer additional={spaceBeforeTextStarts} />}
            ListFooterComponent={<Spacer units={14} additional={bottom} />}
          />
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
                padding: sp.md,
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
              <Settings {...ic.md} color={colors.fg2} />
              {/* <Text style={typography(sizes.caption, 'uis', 'c', colors.fg3)}>
                Settings
              </Text> */}
            </TovPressable>
          </View>
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
              ...shadows[0],
            }}
          >
            {showFavorites ? (
              <BookmarkFilled color={colors.bg3} {...ic.md} />
            ) : (
              <Bookmark color={colors.fg2} {...ic.md} />
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
