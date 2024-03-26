import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import Animated, { FadeInRight, FadeOut } from 'react-native-reanimated'
import Spacer from '../Spacer'
import { colors, gutterSize, type } from '../constants'
import chapters from '../data/chapters.json'
import { Books } from '../data/types/books'
import { Chapters } from '../data/types/chapters'
import { getBook } from '../functions/bible'

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
  const thisBookChapters = useMemo(
    () =>
      (chapters as Chapters).filter(
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
      <Animated.View
        entering={FadeInRight.duration(200).delay(index * 5)}
        exiting={FadeOut}
        style={{
          flex: 1,
          aspectRatio: 1,
          backgroundColor: colors.bg3,
          marginHorizontal: gutterSize / 4,
          borderRadius: 16,
        }}
      >
        <TouchableOpacity
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            goToChapter(item.chapterId)
            closeNavigator()
          }}
        >
          <Text style={type(18, 'uib', 'c', colors.fg1)}>
            {item.chapterId.split('.')[1]}
          </Text>
        </TouchableOpacity>
      </Animated.View>
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
      ItemSeparatorComponent={() => <Spacer units={3} />}
      ListFooterComponent={<Spacer units={4} />}
    />
  )
}
