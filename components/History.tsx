import { formatDistanceToNow } from 'date-fns'
import React, { useMemo, useState } from 'react'
import {
  Alert,
  Dimensions,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import { colors, gutterSize, typography } from '../constants'
import { Chapters } from '../data/types/chapters'
import { HistoryItem, clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import HistoryListItem from './HistoryItem'
import TovIcon from './SVG'

interface Props {
  activeChapter: Chapters[number]
  textTranslationX: SharedValue<number>
  closeHistory: () => void
  goToChapter: (
    chapterId: Chapters[number]['chapterId'],
    verseNumber?: number
  ) => void
  openSettings: SharedValue<number>
}

interface HistorySection {
  distance: string
  data: HistoryItem[]
}

export default function History({
  textTranslationX,
  closeHistory,
  activeChapter,
  goToChapter,
  openSettings,
}: Props) {
  const activeChapterIndex = useAppSelector((state) => state.activeChapterIndex)
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const [historyOpen, setHistoryOpen] = useState(false)
  const historyAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslationX.value }],
    }
  })
  const [showFavorites, setShowFavorites] = useState(false)

  useDerivedValue(() => {
    if (textTranslationX.value > 0) runOnJS(setHistoryOpen)(true)
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
      if (favorites.length)
        return [
          {
            distance: 'Favorites',
            data: favorites,
          },
        ]
      else return []
    }

    return (
      sorted
        // .filter((item) => item.chapterId !== activeChapter.chapterId)
        .reduce((groupedHistory: HistorySection[], historyItem) => {
          if (historyItem.chapterId === activeChapter.chapterId) {
            groupedHistory.unshift({
              distance: 'Currently reading',
              data: [historyItem],
            })
            return groupedHistory
          }
          let distance = formatDistanceToNow(historyItem.date)
          if (distance.includes('minute')) {
            distance = 'In the last hour'
          } else if (distance.includes('hour')) {
            distance = 'In the last day'
          } else distance += ' ago'

          const existingGroup = groupedHistory.find(
            (group) => group.distance === distance
          )

          if (existingGroup) existingGroup.data.push(historyItem)
          else groupedHistory.push({ distance, data: [historyItem] })
          return groupedHistory
        }, [])
    )
  }, [history, historyOpen, activeChapter, showFavorites])

  function renderHistoryItem({
    item,
    index,
  }: {
    item: HistoryItem
    index: number
  }) {
    return (
      <HistoryListItem
        closeHistory={closeHistory}
        goToChapter={goToChapter}
        index={index}
        item={item}
        activeChapter={activeChapter}
      />
    )
  }

  function renderSectionHeader({ section }: { section: HistorySection }) {
    if (showFavorites) return <View />
    return (
      <View
        key={section.distance}
        style={{
          width: '100%',
          paddingHorizontal: gutterSize / 2,
          // marginTop: index === 0 ? 0 : gutterSize * 1.5,
          marginBottom: 5,
          backgroundColor: colors.bg2,
        }}
      >
        <Text style={typography(13, 'uil', 'l', colors.fg3)}>
          {section.distance}
        </Text>
        <Spacer units={1.5} />
        <View style={{ width: '100%', height: 1, backgroundColor: colors.b }} />
      </View>
    )
  }

  return (
    <Animated.View
      style={[
        {
          width: Dimensions.get('window').width * 2,
          height: Dimensions.get('window').height,
          backgroundColor: colors.bg2,
          position: 'absolute',
          left: -Dimensions.get('window').width * 2,
          zIndex: 3,
          paddingTop: insets.top + gutterSize,
          paddingLeft: Dimensions.get('window').width * 1.25,
        },
        historyAnimatedStyles,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: gutterSize,
          marginBottom: gutterSize / 2,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 8,
          }}
        >
          {/* <TovIcon name="history" size={iconSize} color={colors.p1} /> */}
          <Text style={[typography(24, 'uib', 'l', colors.fg1), { flex: 1 }]}>
            History
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowFavorites((current) => !current)}
          style={{
            // aspectRatio: 1,
            height: 30,
            width: 30,
            // paddingVertical: gutterSize / 2.5,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: showFavorites ? colors.p2 : undefined,
            borderWidth: 1,
            borderColor: colors.b,
            borderRadius: 99,
          }}
        >
          <TovIcon
            name="heart"
            color={showFavorites ? colors.fg1 : colors.fg3}
            size={14}
          />
          {/* <Text style={type(13, 'uir', 'c', colors.fg3)}>Clear</Text> */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Are you sure you want to clear your history?', '', [
              { isPreferred: true, style: 'cancel', text: 'Cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: () => dispatch(clearHistory()),
              },
            ])
          }
          style={{
            // aspectRatio: 1,
            height: 30,
            width: 30,
            // paddingVertical: gutterSize / 2.5,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: colors.bg3,
            borderWidth: 1,
            borderColor: colors.b,
            borderRadius: 99,
          }}
        >
          <TovIcon name="trash" color={colors.fg3} size={14} />
          {/* <Text style={type(13, 'uir', 'c', colors.fg3)}>Clear</Text> */}
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <SectionList
          sections={sections}
          contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
          renderItem={renderHistoryItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.chapterId}
          showsVerticalScrollIndicator={false}
          renderSectionFooter={() => <Spacer units={4} />}
          // estimatedItemSize={28}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: gutterSize / 2 }}>
              <Text style={typography(16, 'uir', 'l', colors.fg3)}>
                {showFavorites
                  ? 'Long press on a chapter to mark it as a favorite.'
                  : 'Come back here to return to chapters you were previously reading.'}
              </Text>
            </View>
          }
          // ListHeaderComponent={
          //   <>
          //     <Spacer units={4} />
          //     {renderHistoryItem({
          //       item: { chapterId: activeChapter.chapterId, date: 0 },
          //       index: -1,
          //     })}
          //   </>
          // }
          ListHeaderComponent={<Spacer units={2} />}
          ListFooterComponent={<Spacer units={4} additional={insets.bottom} />}
        />
        {/* <Fade place="top" color={colors.bg2} /> */}
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + gutterSize,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              paddingHorizontal: gutterSize * 2,
              paddingVertical: gutterSize / 2,
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
            }}
            onPress={() => {
              // textTranslationX.value = withSpring(0, panActivateConfig)
              openSettings.value = withTiming(1)
            }}
          >
            <TovIcon name="settings" size={16} color={colors.fg3} />
            <Text style={typography(15, 'uir', 'c', colors.fg2)}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}
