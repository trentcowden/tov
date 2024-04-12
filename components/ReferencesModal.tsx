import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import React, { MutableRefObject, useMemo, useRef } from 'react'
import {
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import {
  colors,
  gutterSize,
  iconSize,
  modalWidth,
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

interface Props {
  referenceVerse: string | undefined
  openReferences: SharedValue<number>
  openReferencesNested: SharedValue<number>
  goToChapter: (
    chapterId: Chapters[number]['chapterId'],
    verseNumber?: number
  ) => void
  currentVerseIndex: MutableRefObject<number>
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
  const activeReferences = useMemo(() => {
    if (!referenceVerse) return []

    referencesRef.current?.scrollToOffset({ animated: false, offset: 0 })
    const activeReferences = (references as References)[referenceVerse]

    return activeReferences.sort((r1, r2) => isPassageAfter(r1[0], r2[0]))
  }, [referenceVerse])

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 2

  function renderReference({ item }: { item: References[string][number] }) {
    if (!referenceVerse) return <View />

    const isAfter = isPassageAfter(referenceVerse, item[0]) < 0
    let passageString = getVerseReference(item[0])

    if (item.length === 2) {
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
      <TouchableOpacity
        style={{
          width: '100%',
          paddingHorizontal: gutterSize,
          paddingVertical: 12,
          flexDirection: 'row',
          gap: 8,
          justifyContent: isAfter ? 'flex-end' : 'flex-start',
          alignItems: 'center',
        }}
        onPress={() => {
          currentVerseIndex.current = parseInt(referenceVerse.split('.')[2]) - 1
          goToChapter(
            item[0].split('.').slice(0, 2).join('.'),
            parseInt(item[0].split('.')[2]) - 1
          )
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
        {isAfter ? null : <TovIcon name={'backReference'} size={iconSize} />}
        <Text style={[typography(18, 'uir', 'l', colors.fg2)]}>
          {passageString}
        </Text>
        {isAfter ? <TovIcon name={'forwardReference'} size={iconSize} /> : null}
        {/* </View> */}
      </TouchableOpacity>
    )
  }

  return (
    <ModalScreen
      openModal={openReferences}
      openNested={openReferencesNested}
      close={() => {
        impactAsync(ImpactFeedbackStyle.Light)
        openReferences.value = withTiming(0)
      }}
      nestedScreen={<></>}
      onBack={() => {}}
    >
      <View
        style={{
          width: modalWidth,
          height: navigatorHeight,
          backgroundColor: colors.bg2,
          borderRadius: 16,
          paddingTop: gutterSize,
        }}
      >
        <ModalScreenHeader
          close={() => {
            impactAsync(ImpactFeedbackStyle.Light)
            openReferences.value = withTiming(0)
          }}
          // icon={<TovIcon name="references" size={iconSize} />}
        >
          {`Cross References for ${referenceVerse ? getVerseReference(referenceVerse) : ''}`}
        </ModalScreenHeader>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={referencesRef}
            data={activeReferences}
            ListHeaderComponent={<Spacer units={4} />}
            ListFooterComponent={<Spacer units={4} />}
            renderItem={renderReference}
          />
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
