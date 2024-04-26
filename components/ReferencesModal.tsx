import React, { MutableRefObject, useMemo, useRef } from 'react'
import { Dimensions, FlatList, Text, View } from 'react-native'
import { SharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import {
  colors,
  gutterSize,
  iconSize,
  modalWidth,
  shadow,
  sizes,
  typography,
} from '../constants'
import references from '../data/references.json'
import { Chapters } from '../data/types/chapters'
import { References } from '../data/types/references'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

interface Props {
  referenceVerse: string | undefined
  openReferences: SharedValue<number>
  openReferencesNested: SharedValue<number>
  goToChapter: (
    chapterId: Chapters[number]['chapterId'],
    verseNumber?: number
  ) => void
  currentVerseIndex: MutableRefObject<number | 'bottom'>
}

export default function ReferencesModal({
  openReferences,
  openReferencesNested,
  referenceVerse,
  goToChapter,
  currentVerseIndex,
}: Props) {
  const insets = useSafeAreaInsets()
  const referencesRef = useRef<FlatList<References[string][number]>>(null)
  const wordListRef = useRef<FlatList<[string, string, string]>>(null)
  const [view, setView] = React.useState<'references' | 'hebrew'>('references')

  const activeReferences = useMemo(() => {
    if (!referenceVerse) return []

    referencesRef.current?.scrollToOffset({ animated: false, offset: 0 })
    const activeReferences = (references as References)[referenceVerse]

    return activeReferences.sort((r1, r2) => isPassageAfter(r1[0], r2[0]))
  }, [referenceVerse])

  // const [selectedWord, setSelectedWord] = React.useState<
  //   [string, string] | undefined
  // >(undefined)

  // const currentVerseHebrew = useMemo(() => {
  //   if (!referenceVerse) return

  //   const chapterIndex = parseInt(referenceVerse.split('.')[1]) - 1
  //   const verseIndex = parseInt(referenceVerse.split('.')[2]) - 1

  //   if (!hebrew[referenceVerse.split('.')[0]]) return

  //   return hebrew[referenceVerse.split('.')[0]][chapterIndex][verseIndex]
  // }, [referenceVerse])

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 4

  function renderReference({
    item,
  }: {
    item: string | [string] | [string, string]
  }) {
    if (!referenceVerse) return <View />

    const start = typeof item === 'string' ? item : item[0]
    const isAfter = isPassageAfter(referenceVerse, start) < 0
    let passageString = getVerseReference(start)

    if (typeof item !== 'string' && item.length === 2) {
      passageString += '-'
      const passage1Chapter = item[0].split('.')[1]
      const passage2Chapter = item[1].split('.')[1]

      if (passage1Chapter !== passage2Chapter)
        passageString += getVerseReference(item[1])
          .split(' ')
          .slice(-1)
          .join(' ')
      else
        passageString += getVerseReference(item[1])
          .split(':')
          .slice(-1)
          .join(' ')
    }
    return (
      // <View
      //   style={{
      //     flexDirection: 'row',
      //     width: '100%',
      //     justifyContent: isAfter ? 'flex-end' : 'flex-start',
      //     paddingHorizontal: gutterSize / 2,
      //   }}
      // >
      <TovPressable
        style={{
          alignItems: 'center',
          gap: 8,
          // width: screenWidth - gutterSize * 4,
          flexDirection: 'row',
          paddingHorizontal: gutterSize / 2,
          paddingVertical: 12,
          borderRadius: 12,
          justifyContent: isAfter ? 'flex-end' : 'flex-start',
        }}
        onPressColor={colors.bg3}
        onPress={() => {
          currentVerseIndex.current = parseInt(referenceVerse.split('.')[2]) - 1
          goToChapter(
            start.split('.').slice(0, 2).join('.'),
            parseInt(start.split('.')[2]) - 1
          )
          openReferencesNested.value = withTiming(0)
          openReferences.value = withTiming(0)
        }}
      >
        {/* <View
          style={{
            width: (screenWidth - gutterSize * 4) / 2 + 11,
            flexDirection: 'row',
            gap: 12,
            // justifyContent: isAfter ? 'flex-start' : 'flex-end',
          }}
        > */}
        {isAfter ? null : (
          <TovIcon name={'backReference'} size={iconSize} color={colors.p1} />
        )}
        <Text style={[typography(sizes.body, 'uir', 'l', colors.fg2)]}>
          {passageString}
        </Text>
        {isAfter ? (
          <TovIcon
            name={'forwardReference'}
            size={iconSize}
            color={colors.p1}
          />
        ) : null}
        {/* </View> */}
      </TovPressable>
      // </View>
    )
  }

  // function renderHebrewWord({ item }: { item: [string, string, string] }) {
  //   // const id = 'H' + item[1].replace(/\D/g, '')
  //   // const def = dbd[id]

  //   return (
  //     <TovPressable
  //       onPress={() => {
  //         openReferencesNested.value = withTiming(1)
  //         setSelectedWord(item)
  //       }}
  //       style={{
  //         flexDirection: 'row',
  //         alignItems: 'center',
  //         paddingVertical: gutterSize / 2,
  //         paddingHorizontal: gutterSize / 2,
  //         borderRadius: 12,
  //       }}
  //       onPressColor={colors.bg3}
  //     >
  //       <View style={{ gap: 4 }}>
  //         <Text style={[typography(sizes.body, 'uib', 'l', colors.fg2)]}>
  //           {item[0]}
  //         </Text>
  //         <Text style={typography(sizes.caption, 'uir', 'l', colors.fg3)}>
  //           {latinMap[item[1]]}
  //         </Text>
  //       </View>
  //       <Text
  //         numberOfLines={1}
  //         adjustsFontSizeToFit
  //         style={[
  //           typography(sizes.body, 'uir', 'l', colors.fg2),
  //           { flex: 1, textAlign: 'right' },
  //         ]}
  //       >
  //         {defMap[item[1]]}
  //       </Text>
  //       {/* <Text style={typography(sizes.subtitle, 'uir', 'l', colors.fg2)}>
  //         {item[2]}
  //       </Text> */}
  //     </TovPressable>
  //   )
  // }

  // useEffect(() => {
  //   if (!currentVerseHebrew) setView('references')
  // }, [currentVerseHebrew])

  return (
    <ModalScreen
      openModal={openReferences}
      // openNested={openReferencesNested}
      close={() => {
        openReferences.value = withTiming(0)
      }}
      // nestedScreen={
      //   <View>
      //     {selectedWord ? (
      //       <ModalScreenHeader
      //         paddingLeft={0}
      //         icon={
      //           <BackButton
      //             onPress={() => {
      //               openReferencesNested.value = withTiming(0)
      //             }}
      //           />
      //         }

      //         // close={() => {
      //         //   openSettings.value = withTiming(0)
      //         //   openSettingsNested.value = withTiming(0)
      //         // }}
      //       >
      //         {`${selectedWord[0]} - ${latinMap[selectedWord[1]]}`}
      //       </ModalScreenHeader>
      //     ) : null}
      //     <View style={{ height: navigatorHeight - gutterSize - 50 }}>
      //       {selectedWord ? (
      //         <FlashList
      //           estimatedItemSize={50}
      //           ListHeaderComponent={() => (
      //             <View
      //               style={{
      //                 paddingHorizontal: gutterSize / 2,
      //               }}
      //             >
      //               <Spacer units={2} />
      //               <Text
      //                 style={typography(sizes.subtitle, 'uis', 'l', colors.fg1)}
      //               >
      //                 Definition
      //               </Text>
      //               <Spacer units={1} />
      //               <Text
      //                 style={typography(sizes.body, 'uir', 'l', colors.fg2)}
      //               >
      //                 {
      //                   strongsDefinitions['H' + strongMap[selectedWord[1]]]
      //                     .strongs_def
      //                 }
      //               </Text>
      //               <Spacer units={4} />
      //               <Text
      //                 style={typography(sizes.subtitle, 'uis', 'l', colors.fg1)}
      //               >
      //                 Verses with this word
      //               </Text>
      //               <Spacer units={2} />
      //             </View>
      //           )}
      //           data={wordReferences[selectedWord[1]].filter(
      //             (reference) => reference !== referenceVerse
      //           )}
      //           contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
      //           renderItem={renderReference}
      //         />
      //       ) : null}
      //       <Fade place="top" color={colors.bg2} />
      //     </View>
      //   </View>
      // }
      onBack={() => {
        wordListRef.current?.scrollToOffset({ animated: false, offset: 0 })
        // setSelectedWord(undefined)
      }}
    >
      <View
        style={{
          width: modalWidth,
          height: navigatorHeight,
          backgroundColor: colors.bg2,
          borderRadius: 16,
          paddingTop: gutterSize / 2,
          ...shadow,
        }}
      >
        <ModalScreenHeader
          close={() => {
            openReferences.value = withTiming(0)
            // setSelectedWord(undefined)
          }}
          // icon={<TovIcon name="references" size={iconSize} />}
        >
          {`${referenceVerse ? getVerseReference(referenceVerse) : ''}`}
        </ModalScreenHeader>
        {/* {currentVerseHebrew ? (
          <View
            style={{
              flexDirection: 'row',
              width: screenWidth - gutterSize * 2,
              paddingHorizontal: gutterSize,
              gap: gutterSize / 2,
              marginTop: gutterSize / 4,
            }}
          >
            <TovPressable
              outerOuterStyle={{
                flex: 1,
              }}
              onPressColor={colors.p2}
              style={{
                borderWidth: 1,
                borderColor: colors.b,
                borderRadius: 12,
                paddingHorizontal: gutterSize / 2,
                paddingVertical: gutterSize / 3,
                backgroundColor: view === 'references' ? colors.p1 : colors.bg2,
              }}
              onPress={() => setView('references')}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={typography(
                  sizes.caption,
                  view === 'references' ? 'uis' : 'uir',
                  'c',
                  view === 'references' ? colors.bg1 : colors.fg3
                )}
              >
                Cross References
              </Text>
            </TovPressable>
            <TovPressable
              onPressColor={colors.p2}
              outerOuterStyle={{
                flex: 1,
              }}
              style={{
                borderWidth: 1,
                borderColor: colors.b,
                borderRadius: 12,
                paddingHorizontal: gutterSize / 2,
                paddingVertical: gutterSize / 3,
                backgroundColor: view === 'hebrew' ? colors.p1 : colors.bg2,
              }}
              onPress={() => setView('hebrew')}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={typography(
                  sizes.caption,
                  view === 'hebrew' ? 'uis' : 'uir',
                  'c',
                  view === 'hebrew' ? colors.bg1 : colors.fg3
                )}
              >
                Hebrew Words
              </Text>
            </TovPressable>
          </View>
        ) : null} */}
        <Text
          style={[
            typography(sizes.body, 'uis', 'l', colors.fg3),
            { paddingHorizontal: gutterSize },
          ]}
        >
          Cross References
        </Text>
        <View style={{ flex: 1 }}>
          {/* {view === 'references' ? ( */}
          <FlatList
            ref={referencesRef}
            data={activeReferences}
            ListHeaderComponent={<Spacer units={2} />}
            ListFooterComponent={<Spacer units={4} />}
            renderItem={renderReference}
            contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
          />
          {/* ) : currentVerseHebrew ? (
            <FlatList
              ref={wordListRef}
              data={currentVerseHebrew}
              renderItem={renderHebrewWord}
              ListHeaderComponent={<Spacer units={2} />}
              ListFooterComponent={<Spacer units={4} />}
              keyExtractor={(item, index) => item[0] + item[1] + index}
              contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
            />
          ) : null} */}

          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
