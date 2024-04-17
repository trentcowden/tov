import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'
import { Text, View } from 'react-native'
import { FadeInRight, FadeOut } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { colors, gutterSize, typography } from '../constants'
import bibles from '../data/bibles'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getBook } from '../functions/bible'
import { useAppSelector } from '../redux/hooks'
import TovPressable from './TovPressable'

interface Props {
  goToChapter: (chapterId: Chapters[number]['chapterId']) => void
  closeNavigator: () => void
  navigatorBook: Books[number] | undefined
}

export default function ChapterBoxes({
  goToChapter,
  navigatorBook,
  closeNavigator,
}: Props) {
  const settings = useAppSelector((state) => state.settings)

  const thisBookChapters = useMemo(
    () =>
      bibles[settings.translation].filter(
        (chapter) => getBook(chapter.chapterId).bookId === navigatorBook?.bookId
      ),
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
          marginHorizontal: gutterSize / 5,
          // flexDirection: 'row',
          // justifyContent: 'center',
          // alignItems: 'center',
        }}
      >
        <TovPressable
          style={{
            // flex: 1,
            borderRadius: 12,
            height: '100%',
            width: '100%',
            backgroundColor: colors.bg3,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          entering={FadeInRight.duration(200).delay(index * 5)}
          exiting={FadeOut}
          onPress={() => {
            goToChapter(item.chapterId)
            closeNavigator()
          }}
        >
          <Text style={typography(18, 'uib', 'c', colors.fg1)}>
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
      numColumns={5}
      renderItem={renderChapterBoxItem}
      data={thisBookChapters}
      ListHeaderComponent={<Spacer units={3} />}
      contentContainerStyle={{
        paddingHorizontal: (gutterSize * 3) / 4,
      }}
      ItemSeparatorComponent={() => <Spacer units={2} />}
      ListFooterComponent={<Spacer units={4} />}
    />
  )
}
