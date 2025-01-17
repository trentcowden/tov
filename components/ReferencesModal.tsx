import { openBrowserAsync } from 'expo-web-browser'
import React, { useMemo, useRef } from 'react'
import {
  FlatList,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import Animated, {
  LinearTransition,
  SharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { panActivateConfig } from '../constants'
import references from '../data/references.json'
import { References } from '../data/types/references'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import { getModalHeight, getModalWidth } from '../functions/utils'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { br, sans, shadow, sp, tx } from '../styles'
import BackButton from './BackButton'
import Fade from './Fade'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import ReferenceItem from './ReferenceItem'
import Spacer from './Spacer'
import TovPressable from './TovPressable'

interface Props {
  referenceVerse:
    | {
        verseId: string
        text: string
      }
    | undefined
  openReferences: SharedValue<number>
  openReferencesNested: SharedValue<number>
  jumpToChapter: JumpToChapter
}

export default function ReferencesModal({
  openReferences,
  openReferencesNested,
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
    if (!referenceVerse || !(referenceVerse.verseId in references)) return []

    // if (referenceVerse.includes('tutorial')) return ['tutorial.1']

    referencesRef.current?.scrollToOffset({ animated: false, offset: 0 })
    const activeReferences = (references as References)[referenceVerse.verseId]

    return activeReferences.sort((r1, r2) => isPassageAfter(r1[0], r2[0]))
  }, [referenceVerse])

  const modalHeight = getModalHeight(height, insets)

  function renderReference({
    item,
    index,
  }: {
    item: [string] | [string, string]
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
        openReferences.value = withSpring(
          0,
          panActivateConfig,
          () => (openReferencesNested.value = 0)
        )
      }}
      onBack={() => {
        wordListRef.current?.scrollToOffset({ animated: false, offset: 0 })
      }}
      openNested={openReferencesNested}
      nestedHeight={modalHeight}
      nestedScreen={
        <View style={{ flex: 1 }}>
          <ModalScreenHeader
            paddingLeft={0}
            icon={
              <BackButton
                onPress={() => {
                  openReferencesNested.value = withSpring(0, panActivateConfig)
                }}
              />
            }
          >
            What are cross references?
          </ModalScreenHeader>
          {/* <Spacer s={sp.md} /> */}
          <View
            style={{
              paddingHorizontal: sp.xl,
              flex: 1,
            }}
          >
            <ScrollView>
              <Spacer s={sp.md} />
              <Text style={sans(tx.body, 'm', 'l', colors.fg1)}>
                Cross references connect different parts of the Bible that share
                similar themes, words, events, or people.
              </Text>
              <Spacer s={sp.md} />
              <Text style={sans(tx.body, 'm', 'l', colors.fg1)}>
                These connections illuminate the meaning of passages by showing
                how they relate to other biblical texts, deepening
                understanding.
              </Text>
              <Spacer s={sp.md} />
              {/* <Text style={sans(tx.body, 'm', 'l', colors.fg1)}>
                Cross references for Psalm 23:1 ("The Lord is my Shepherd...")
                might include other passages about God as a shepherd.
              </Text>
              <Spacer s={sp.md} /> */}
              <Text style={sans(tx.body, 'm', 'l', colors.fg1)}>
                For example, Jesus frequently draws from the Old Testament in
                his teachings, making these connections essential for
                understanding his words. Check out{' '}
                <Text
                  style={{
                    // fontFamily: 'Figtree-Bold',
                    color: colors.p1,
                    textDecorationLine: 'underline',
                  }}
                  onPress={() => {
                    openBrowserAsync('https://www.bemadiscipleship.com/110')
                  }}
                >
                  this episode of the BEMA podcast
                </Text>{' '}
                to learn more.
              </Text>
            </ScrollView>
            <Fade place="top" color={colors.bg2} />
          </View>
        </View>
      }
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
          // height={64}
        >
          <Text style={sans(tx.subtitle, 'b', 'l', colors.fg2)}>
            {`${referenceVerse ? getVerseReference(referenceVerse.verseId) : ''}`}
          </Text>
          {/* <TovPressable
            onPress={() => {
              openReferencesNested.value = withSpring(1, panActivateConfig)
            }}
            bgColor={colors.bg2}
            style={{ flexDirection: 'row', alignItems: 'center', gap: sp.xs }}
          >
            <Text style={sans(tx.body, 'r', 'l', colors.fg3)}>
              Cross References
            </Text>
            <Help {...ic.md} color={colors.p1} />
          </TovPressable> */}
        </ModalScreenHeader>
        {referenceVerse ? (
          <View
            style={{
              width: '100%',
              paddingHorizontal: sp.xl,
            }}
          >
            <Text
              style={[
                sans(tx.tiny, 'l', 'l', colors.fg3),
                { fontFamily: 'Bookerly-Regular' },
              ]}
            >
              {referenceVerse.text
                .replace(/\*/g, '')
                .replace(/[\r\n]+/g, ' ')
                .trim()}
            </Text>
            <TovPressable
              onPress={() => {
                const text =
                  referenceVerse.text
                    .replace(/\*/g, '')
                    .replace(/[\r\n]+/g, ' ')
                    .trim() +
                  '\n\n' +
                  getVerseReference(referenceVerse.verseId)
                Share.share({ message: text })
              }}
              style={{
                flexDirection: 'row',
                alignSelf: 'flex-start',
                alignItems: 'center',
                gap: sp.xs,
                borderRadius: br.lg,
                paddingHorizontal: sp.md,
                paddingVertical: sp.xs,
                marginTop: sp.sm,
              }}
              bgColor={colors.bg3}
            >
              <Text
                style={[
                  sans(tx.tiny, 'b', 'l', colors.p1),
                  // { textDecorationLine: 'underline' },
                ]}
              >
                Share text
              </Text>
              {/* <ArrowRight {...ic.sm} color={colors.p1} /> */}
            </TovPressable>
          </View>
        ) : null}
        <View
          style={{
            flex: 1,
            borderTopWidth: 1,
            marginTop: sp.md,
            borderColor: colors.bg3,
          }}
        >
          <Animated.FlatList
            itemLayoutAnimation={LinearTransition.springify()
              .damping(20)
              .mass(0.5)
              .stiffness(140)
              .restDisplacementThreshold(0)}
            ref={referencesRef}
            data={activeReferences}
            ListFooterComponent={<Spacer s={sp.md} />}
            ListHeaderComponent={
              <TovPressable
                onPress={() => {
                  openReferencesNested.value = withSpring(1, panActivateConfig)
                }}
                bgColor={colors.bg2}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: sp.md,
                  marginTop: sp.md,
                  marginBottom: sp.sm,
                  gap: sp.xs,
                }}
              >
                <Text style={sans(tx.subtitle, 'b', 'l', colors.fg3)}>
                  Cross References
                </Text>
                {/* <Help {...ic.md} color={colors.p1} /> */}
              </TovPressable>
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
