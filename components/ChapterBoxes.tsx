import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'
import { Text, View } from 'react-native'
import { FadeInRight, FadeOut } from 'react-native-reanimated'
import { chapterRow } from '../constants'
import bibles from '../data/bibles'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getBook } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, sp, tx, typography } from '../styles'
import Spacer from './Spacer'
import TovPressable from './TovPressable'

interface Props {
  jumpToChapter: JumpToChapter
  closeNavigator: () => void
  navigatorBook: Books[number] | undefined
}

export default function ChapterBoxes({
  jumpToChapter,
  navigatorBook,
  closeNavigator,
}: Props) {
  const colors = useColors()
  const settings = useAppSelector((state) => state.settings)

  const thisBookChapters = useMemo(
    () =>
      bibles[settings.translation]
        .filter(
          (chapter) =>
            getBook(chapter.chapterId).bookId === navigatorBook?.bookId
        )
        .filter((chapter) => chapter.chapterId !== 'TUT.1'),
    [navigatorBook]
  )

  function renderChapterBoxItem({
    item,
    index,
  }: {
    item: Chapters[number]
    index: number
  }) {
    // const availableWidth =
    return (
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          marginHorizontal: sp.sm,
          // flexDirection: 'row',
          // justifyContent: 'center',
          // alignItems: 'center',
        }}
      >
        <TovPressable
          style={{
            // flex: 1,
            borderRadius: br.md,
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          bgColor={colors.bg3}
          onPressColor={colors.bg3}
          entering={FadeInRight.duration(200).delay(index * chapterRow)}
          exiting={FadeOut}
          onPress={() => {
            jumpToChapter({
              chapterId: item.chapterId,
              comingFrom: 'navigator',
            })
            closeNavigator()
          }}
        >
          <Text style={typography(tx.body, 'uib', 'c', colors.fg1)}>
            {item.chapterId.split('.')[1]}
          </Text>
        </TovPressable>
      </View>
    )
  }

  return (
    <FlashList
      estimatedItemSize={64}
      keyboardShouldPersistTaps="always"
      numColumns={chapterRow}
      renderItem={renderChapterBoxItem}
      data={thisBookChapters}
      ListHeaderComponent={<Spacer s={sp.lg} />}
      contentContainerStyle={{ paddingHorizontal: sp.lg }}
      ItemSeparatorComponent={() => <Spacer s={sp.md} />}
      ListFooterComponent={<Spacer s={sp.xl} />}
    />
  )
}
