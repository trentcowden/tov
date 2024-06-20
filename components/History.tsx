import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { impactAsync } from 'expo-haptics'
import { StatusBar } from 'expo-status-bar'
import React, { useMemo, useState } from 'react'
import { Dimensions, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SharedValue,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import {
  gutterSize,
  horizTransReq,
  iconSize,
  panActivateConfig,
  screenHeight,
  screenWidth,
  shadow,
  sizes,
  typography,
} from '../constants'
import { Chapters } from '../data/types/chapters'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { HistoryItem } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import Fade from './Fade'
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
}

interface HistorySection {
  distance: string
  data: HistoryItem[]
}

export default function History({
  textTranslationX,
  savedTextTranslationX,
  closeHistory,
  activeChapter,
  jumpToChapter,
  openSettings,
}: Props) {
  const colors = useColors()
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const [historyOpening, setHistoryOpening] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const historyAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslationX.value }],
    }
  })
  const [showFavorites, setShowFavorites] = useState(false)

  // const [time, setTime] = useState(new Date().getTime())

  // useEffect(() => {
  //   setInterval(() => setTime(new Date().getTime()), 5000)
  // }, [])

  useDerivedValue(() => {
    if (textTranslationX.value > 0) runOnJS(setHistoryOpening)(true)
    else runOnJS(setHistoryOpening)(false)

    if (textTranslationX.value > horizTransReq - 10)
      runOnJS(setHistoryOpen)(true)
    else runOnJS(setHistoryOpen)(false)
  })

  // useEffect(() => {
  //   if (historyOpen) {
  //     const match = history.find(
  //       (item) => item.chapterId === activeChapter.chapterId
  //     )

  //     dispatch(
  //       addToHistory({
  //         chapterId: activeChapter.chapterId,
  //         date: Date.now(),
  //         isFavorite: match?.isFavorite ?? false,
  //         verseIndex: currentVerseIndex.current,
  //       })
  //     )
  //   }
  // }, [historyOpen])

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

        // if (existingGroup) existingGroup.data.push(historyItem)
        // else groupedHistory.push({ distance, data: [historyItem] })
        // return groupedHistory
      },
      []
    )
  }, [history, historyOpening, activeChapter, showFavorites])

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

  return (
    <>
      <Animated.View
        style={[
          {
            width: Dimensions.get('window').width * 2,
            height: Dimensions.get('window').height,
            backgroundColor: colors.bg2,
            position: 'absolute',
            left: -Dimensions.get('window').width * 2,
            zIndex: 3,
            paddingTop: insets.top ? insets.top + gutterSize / 4 : gutterSize,
            paddingLeft: Dimensions.get('window').width * 1.3,
            ...shadow,
          },
          historyAnimatedStyles,
        ]}
      >
        <TovPressable
          bgColor={colors.bg2}
          onPress={() => setShowFavorites((current) => !current)}
          onPressColor={colors.bg3}
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            marginHorizontal: gutterSize / 2,
            gap: 8,
            borderRadius: 12,
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
              borderRadius: 12,
              backgroundColor: showFavorites ? colors.p1 : colors.bg3,
            }}
          >
            <TovIcon
              name={showFavorites ? 'heartFilled' : 'heart'}
              color={showFavorites ? colors.bg1 : colors.fg3}
              size={16}
            />
          </View>
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
              <View style={{ paddingHorizontal: gutterSize / 2 }}>
                <Text style={typography(sizes.body, 'uir', 'l', colors.fg3)}>
                  {showFavorites
                    ? 'Long press on a chapter to mark it as a favorite.'
                    : 'Come back here to return to chapters you were previously reading.'}
                </Text>
              </View>
            }
            ListHeaderComponent={<Spacer units={2} />}
            ListFooterComponent={
              <Spacer units={14} additional={insets.bottom} />
            }
          />
          <Fade place="top" color={colors.bg2} />
          <View
            style={{
              position: 'absolute',
              bottom: insets.bottom + gutterSize,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: gutterSize,
            }}
          >
            <TovPressable
              bgColor={colors.bg3}
              onPressColor={colors.bg3}
              style={{
                borderRadius: 99,
                paddingHorizontal: gutterSize,
                paddingVertical: gutterSize / 2,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                alignItems: 'center',
              }}
              onPress={() => {
                // textTranslationX.value = withSpring(0, panActivateConfig)
                openSettings.value = withSpring(1, panActivateConfig)
              }}
            >
              <TovIcon name="settings" size={18} color={colors.fg3} />
              <Text style={typography(sizes.caption, 'uis', 'c', colors.fg3)}>
                Settings
              </Text>
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
            width: screenWidth,
            height: screenHeight,
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
            ...Dimensions.get('window'),
          }}
        />
      </Animated.View>
    </>
  )
}
