import React, { useMemo, useRef } from 'react'
import { FlatList, useWindowDimensions, View } from 'react-native'
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import Help from '../assets/icons/duotone/help-circle.svg'
import { gutterSize, panActivateConfig, shadows } from '../constants'
import references from '../data/references.json'
import { References } from '../data/types/references'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import { getEdges, getModalHeight, getModalWidth } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import { br, ic } from '../styles'
import Fade from './Fade'
import ListBanner from './ListBanner'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import ReferenceItem from './ReferenceItem'

interface Props {
  referenceVerse: string | undefined
  openReferences: SharedValue<number>
  openReferencesNested: SharedValue<number>
  jumpToChapter: JumpToChapter
  scrollOffset: SharedValue<number>
  overlayOpacity: SharedValue<number>
}

export default function ReferencesModal({
  openReferences,
  openReferencesNested,
  referenceVerse,
  jumpToChapter,
  overlayOpacity,
  scrollOffset,
}: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { bottom, top } = getEdges(insets)
  const { width, height } = useWindowDimensions()
  const modalWidth = getModalWidth(width)
  const dismissed = useAppSelector((state) => state.popups.dismissed)
  const referencesRef = useRef<FlatList<References[string][number]>>(null)
  const wordListRef = useRef<FlatList<[string, string, string]>>(null)
  const [view, setView] = React.useState<'references' | 'hebrew'>('references')

  const activeReferences = useMemo(() => {
    if (!referenceVerse || referenceVerse.includes('tutorial')) return []

    // if (referenceVerse.includes('tutorial')) return ['tutorial.1']

    referencesRef.current?.scrollToOffset({ animated: false, offset: 0 })
    const activeReferences = (references as References)[referenceVerse]

    return activeReferences.sort((r1, r2) => isPassageAfter(r1[0], r2[0]))
  }, [referenceVerse])

  const modalHeight = getModalHeight(height, insets)

  function renderReference({
    item,
    index,
  }: {
    item: string | [string] | [string, string]
    index: number
  }) {
    return (
      <ReferenceItem
        activeReferences={activeReferences}
        index={index}
        item={item}
        jumpToChapter={jumpToChapter}
        openReferences={openReferences}
        openReferencesNested={openReferencesNested}
        referenceVerse={referenceVerse}
      />
    )
  }

  const [animate, setAnimate] = React.useState(false)
  useDerivedValue(() => {
    if (openReferences.value === 0)
      runOnJS(setAnimate)(!dismissed.includes('referencesHelp'))
  })

  return (
    <ModalScreen
      openModal={openReferences}
      overlayOpacity={overlayOpacity}
      scrollOffset={scrollOffset}
      close={() => {
        openReferences.value = withSpring(0, panActivateConfig)
      }}
      onBack={() => {
        wordListRef.current?.scrollToOffset({ animated: false, offset: 0 })
      }}
    >
      <View
        style={{
          width: modalWidth,
          height: modalHeight,
          backgroundColor: colors.bg2,
          borderRadius: br.xl,
          paddingTop: gutterSize / 2,
          overflow: 'hidden',
          ...shadows[1],
        }}
      >
        <ModalScreenHeader
          close={() => {
            openReferences.value = withSpring(0, panActivateConfig)
          }}
          height={72}
        >
          {`Cross References for ${referenceVerse ? getVerseReference(referenceVerse) : ''}`}
        </ModalScreenHeader>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={referencesRef}
            data={activeReferences}
            ListFooterComponent={<Spacer units={2} />}
            ListHeaderComponent={
              <ListBanner
                title="What are cross references?"
                body="Cross references are different parts of the Bible that share
                    similar themes, words, events, or people. They can help
                    define and contextualize what you’re reading for deeper
                    understanding and study."
                icon={<Help {...ic.md} color={colors.p1} />}
                popup="referencesHelp"
              />
            }
            renderItem={renderReference}
            contentContainerStyle={{ paddingHorizontal: gutterSize / 2 }}
          />
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
