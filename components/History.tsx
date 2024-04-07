import { FontAwesome5, Octicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import React from 'react'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import { colors, gutterSize, type } from '../constants'
import { Chapters } from '../data/types/chapters'
import { HistoryItem } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import Fade from './Fade'
import HistoryListItem from './HistoryItem'

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

  const historyAnimatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: textTranslationX.value }],
    }
  })

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
      />
    )
  }
  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 2

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
          gap: gutterSize,
          paddingHorizontal: gutterSize,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            flexDirection: 'row',
            gap: gutterSize / 3,
          }}
        >
          <FontAwesome5 name="history" size={20} color={colors.fg2} />
          <Text style={[type(28, 'uib', 'l', colors.fg1), { flex: 1 }]}>
            History
          </Text>
        </View>
        {/* <TouchableOpacity
          onPress={() => dispatch(clearHistory())}
          style={{
            paddingHorizontal: gutterSize / 2,
            paddingVertical: gutterSize / 2.5,
            gap: 5,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.b,
            borderRadius: 8,
          }}
        >
          <Octicons name="trash" color={colors.fg3} size={14} />
          <Text style={type(13, 'uir', 'c', colors.fg3)}>Clear</Text>
        </TouchableOpacity> */}
      </View>
      <View style={{ flex: 1 }}>
        <FlashList
          data={history.filter(
            (item) => item.chapterId !== activeChapter.chapterId
          )}
          contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.chapterId}
          showsVerticalScrollIndicator={false}
          // estimatedItemSize={28}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: gutterSize / 2 }}>
              <Text style={type(16, 'uir', 'l', colors.fg3)}>
                Come back here to return to chapters you were previously
                reading.
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
          ListHeaderComponent={<Spacer units={4} />}
          ListFooterComponent={<Spacer units={4} additional={insets.bottom} />}
        />
        <Fade place="top" color={colors.bg2} />
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
            }}
            onPress={() => {
              openSettings.value = withTiming(1)
            }}
          >
            <Octicons name="gear" size={16} color={colors.b} />
            <Text style={type(15, 'uir', 'c', colors.fg3)}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}
