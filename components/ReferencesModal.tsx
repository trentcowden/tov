import React, { useMemo, useRef } from 'react'
import { FlatList, Text, useWindowDimensions, View } from 'react-native'
import { SharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Help from '../assets/icons/duotone/help-circle.svg'
import { panActivateConfig } from '../constants'
import references from '../data/references.json'
import { References } from '../data/types/references'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import { getModalHeight, getModalWidth } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { br, ic, sans, shadow, sp, tx } from '../styles'
import Fade from './Fade'
import ListBanner from './ListBanner'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import ReferenceItem from './ReferenceItem'
import Spacer from './Spacer'

interface Props {
  referenceVerse: string | undefined
  openReferences: SharedValue<number>
  jumpToChapter: JumpToChapter
}

export default function ReferencesModal({
  openReferences,
  referenceVerse,
  jumpToChapter,
}: Props) {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()
  const modalWidth = getModalWidth(width)
  const referencesRef = useRef<FlatList<References[string][number]>>(null)
  const wordListRef = useRef<FlatList<[string, string, string]>>(null)
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
        referenceVerse={referenceVerse}
      />
    )
  }

  return (
    <ModalScreen
      openModal={openReferences}
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
          paddingTop: sp.md,
          overflow: 'hidden',
          ...shadow,
        }}
      >
        <ModalScreenHeader
          close={() => {
            openReferences.value = withSpring(0, panActivateConfig)
          }}
          height={88}
        >
          <Text style={sans(tx.title, 'b', 'l', colors.fg2)}>
            {`${referenceVerse ? getVerseReference(referenceVerse) : ''}`}
          </Text>
          <Text style={sans(tx.subtitle, 'r', 'l', colors.fg3)}>
            Cross References
          </Text>
        </ModalScreenHeader>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={referencesRef}
            data={activeReferences}
            ListFooterComponent={<Spacer s={sp.md} />}
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
            contentContainerStyle={{ paddingHorizontal: sp.md }}
          />
          <Fade place="top" color={colors.bg2} />
        </View>
      </View>
    </ModalScreen>
  )
}
