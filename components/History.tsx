import { Octicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  FadeOutRight,
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import { colors, gutterSize, type } from '../constants'
import chapters from '../data/chapters.json'
import { Chapters } from '../data/types/chapters'
import { getReference } from '../functions/bible'
import { HistoryItem, addToHistory, clearHistory } from '../redux/history'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { ActiveChapterIndex } from '../types/bible'
import Fade from './Fade'

interface Props {
  activeChapterIndex: ActiveChapterIndex
  setActiveChapterIndex: Dispatch<SetStateAction<ActiveChapterIndex>>
  activeChapter: Chapters[number]
  savedTextTranslateX: SharedValue<number>
  textTranslationX: SharedValue<number>
  openHistory: () => void
  closeHistory: () => void
}

export default function History({
  activeChapterIndex,
  textTranslationX,
  setActiveChapterIndex,
  closeHistory,
  activeChapter,
}: Props) {
  const history = useAppSelector((state) => state.history)
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const [historyOpen, setHistoryOpen] = useState(false)
  const historyAnimatedStyles = useAnimatedStyle(() => {
    console.log(textTranslationX.value)
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
    const chapterIndex = (chapters as Chapters).findIndex(
      (chapter) => chapter.chapterId === item.chapterId
    )
    return (
      <Animated.View exiting={FadeOutRight.duration(100).delay(index * 25)}>
        <TouchableOpacity
          onPress={() => {
            dispatch(
              addToHistory({
                chapterId: item.chapterId,
                date: Date.now(),
              })
            )
            setActiveChapterIndex({
              going: 'forward',
              index: chapterIndex,
            })
            closeHistory()
          }}
          style={{
            width: '100%',
            borderLeftWidth: 4,
            // paddingHorizontal: gutterSize,
            marginLeft: gutterSize,
            borderColor: colors.bg3,
            paddingVertical: 12,
            backgroundColor:
              chapterIndex === activeChapterIndex.index
                ? colors.bg3
                : undefined,
            borderTopRightRadius:
              chapterIndex === activeChapterIndex.index ? 12 : 0,
            borderBottomRightRadius:
              chapterIndex === activeChapterIndex.index ? 12 : 0,
            // borderRadius: chapterIndex === activeChapterIndex.index ? 12 : 0,
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {chapterIndex === activeChapterIndex.index ? null : (
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.bg3,
                position: 'absolute',
                left: -8,
              }}
            />
          )}
          <Text style={[type(18, 'uir', 'l', colors.fg2), { flex: 1 }]}>
            {getReference(item.chapterId)}
          </Text>
          {chapterIndex === activeChapterIndex.index ? (
            <Text style={type(12, 'uir', 'c', colors.fg3)}>Current</Text>
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  useDerivedValue(() => {
    if (textTranslationX.value > -10) runOnJS(setHistoryOpen)(false)
    else runOnJS(setHistoryOpen)(true)
  })

  return (
    <Animated.View
      style={[
        {
          width: Dimensions.get('window').width * 2,
          height: Dimensions.get('window').height,
          backgroundColor: colors.bg2,
          position: 'absolute',
          left: -Dimensions.get('window').width * 2,
          zIndex: 2,
          paddingTop: insets.top + gutterSize,
          paddingHorizontal: gutterSize,
          paddingLeft: Dimensions.get('window').width * 1.2,
        },
        historyAnimatedStyles,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: gutterSize,
          paddingStart: gutterSize,
        }}
      >
        {/* <TouchableOpacity
      onPress={historyOpen ? closeHistory : openHistory}
      style={{
        position: 'absolute',
        width: 48,
        height: 48,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        left: -48,
        bottom: 0,
        backgroundColor: colors.bg2,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Octicons name="history" size={20} color={colors.fg3} />
    </TouchableOpacity> */}
        <Text style={[type(28, 'uib', 'l', colors.fg1), { flex: 1 }]}>
          History
        </Text>
        <TouchableOpacity
          onPress={() => dispatch(clearHistory())}
          style={{
            paddingHorizontal: gutterSize / 1.5,
            paddingVertical: gutterSize / 2,
            gap: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.b,
            borderRadius: 8,
          }}
        >
          <Octicons name="trash" color={colors.fg3} size={16} />
          <Text style={type(14, 'uir', 'c', colors.fg3)}>Clear</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <FlashList
          data={history.filter(
            (item) => item.chapterId !== activeChapter.chapterId
          )}
          renderItem={renderHistoryItem}
          estimatedItemSize={28}
          ListHeaderComponent={
            <>
              <Spacer units={4} />
              {renderHistoryItem({
                item: { chapterId: activeChapter.chapterId, date: 0 },
                index: -1,
              })}
            </>
          }
          ListFooterComponent={<Spacer units={4} additional={insets.bottom} />}
        />
        <Fade place="top" color={colors.bg2} />
      </View>
    </Animated.View>
  )
}
