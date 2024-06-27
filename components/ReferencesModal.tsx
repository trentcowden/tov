import React, { useMemo, useRef } from 'react'
import { Dimensions, FlatList, Text, View } from 'react-native'
import Animated, {
  LinearTransition,
  SharedValue,
  runOnJS,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spacer from '../Spacer'
import {
  gutterSize,
  modalWidth,
  panActivateConfig,
  shadow,
  sizes,
  typography,
} from '../constants'
import references from '../data/references.json'
import { References } from '../data/types/references'
import { getVerseReference, isPassageAfter } from '../functions/bible'
import { JumpToChapter } from '../hooks/useChapterChange'
import useColors from '../hooks/useColors'
import { useAppSelector } from '../redux/hooks'
import Fade from './Fade'
import ListBanner from './ListBanner'
import ModalScreen from './ModalScreen'
import ModalScreenHeader from './ModalScreenHeader'
import TovIcon from './SVG'
import TovPressable from './TovPressable'

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

  const navigatorHeight =
    Dimensions.get('window').height -
    insets.top -
    insets.bottom -
    gutterSize * 4

  function renderReference({
    item,
    index,
  }: {
    item: string | [string] | [string, string]
    index: number
  }) {
    if (!referenceVerse) return <View />

    const start = typeof item === 'string' ? item : item[0]
    const isAfter = isPassageAfter(referenceVerse, start) < 0
    const prevReference = index > 0 ? activeReferences[index - 1] : null
    const prevStart = prevReference
      ? typeof prevReference === 'string'
        ? prevReference
        : prevReference[0]
      : null
    const prevIsAfter =
      prevStart !== null ? isPassageAfter(referenceVerse, prevStart) < 0 : null

    let passageString = referenceVerse.includes('tutorial')
      ? 'Welcome 1'
      : getVerseReference(start)

    let startingVerse = parseInt(start.split('.')[2])
    let endingVerse = 0

    if (typeof item !== 'string' && item.length === 2) {
      passageString += '-'

      endingVerse = parseInt(
        getVerseReference(item[1]).split(':').slice(-1).join(' ')
      )

      passageString += endingVerse.toString()
    }
    return (
      <View style={{}}>
        {index === 0 && !isAfter ? (
          <Text
            style={[
              typography(sizes.caption, 'uil', 'l', colors.fg3),
              {
                paddingHorizontal: gutterSize / 2,
                marginBottom: gutterSize / 2,
              },
            ]}
          >
            Cross references before this verse
          </Text>
        ) : isAfter && !prevIsAfter ? (
          <View
            style={{
              width: '100%',
              paddingHorizontal: gutterSize / 2,
              marginTop: index !== 0 ? gutterSize : 0,
            }}
          >
            {index !== 0 ? (
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: colors.bg3,
                }}
              />
            ) : null}
            <Text
              style={[
                typography(sizes.caption, 'uil', 'l', colors.fg3),
                {
                  marginBottom: gutterSize / 2,
                  marginTop: index !== 0 ? gutterSize : 0,
                  textAlign: 'right',
                },
              ]}
            >
              Cross references after this verse
            </Text>
          </View>
        ) : null}
        <TovPressable
          style={{
            alignItems: 'center',
            gap: 8,
            flexDirection: 'row',
            paddingHorizontal: gutterSize / 2,
            paddingVertical: 12,
            borderRadius: 12,
            justifyContent: isAfter ? 'flex-end' : 'flex-start',
          }}
          bgColor={colors.bg2}
          onPressColor={colors.bg3}
          onPress={() => {
            jumpToChapter({
              chapterId: start.split('.').slice(0, 2).join('.'),
              verseNumber: startingVerse - 1,
              comingFrom: 'reference',
              currentVerse: parseInt(referenceVerse.split('.')[2]) - 1,
              numVersesToHighlight:
                endingVerse !== 0 ? endingVerse - startingVerse : undefined,
            })
            openReferencesNested.value = withTiming(0)
            openReferences.value = withSpring(0, panActivateConfig)
          }}
        >
          {isAfter ? null : (
            <TovIcon name={'arrowLeft'} size={18} color={colors.p1} />
          )}
          <Text style={[typography(sizes.body, 'uir', 'l', colors.fg1)]}>
            {passageString}
          </Text>
          {isAfter ? (
            <TovIcon name={'arrowRight'} size={18} color={colors.p1} />
          ) : null}
        </TovPressable>
      </View>
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
          height: navigatorHeight,
          backgroundColor: colors.bg2,
          borderRadius: 12,
          paddingTop: gutterSize / 2,
          ...shadow,
        }}
      >
        <ModalScreenHeader
          close={() => {
            openReferences.value = withSpring(0, panActivateConfig)
          }}
        >
          {`${referenceVerse ? getVerseReference(referenceVerse) : ''}`}
        </ModalScreenHeader>
        <View style={{ flex: 1 }}>
          <Animated.FlatList
            itemLayoutAnimation={
              animate
                ? LinearTransition.springify()
                    .damping(20)
                    .mass(0.5)
                    .stiffness(140)
                    .restDisplacementThreshold(0)
                : undefined
            }
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
                icon="help"
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
