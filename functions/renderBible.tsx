import React from 'react'
import { Text, TextStyle } from 'react-native'
import uuid from 'react-native-uuid'
import Spacer from '../Spacer'
import Indent from '../components/Indent'
import { colors, gutterSize, type } from '../constants'

// function renderParagraph(item: any) {

//   global current_chapter_text
//   global recent_style

//   if "text" in item:
//     text = item["text"].strip()
//   if text != "":
//             # Section header.
//   if recent_style == "s1":
//     current_chapter_text += f"## {text}"
//             # Verse number.
//             elif recent_style == "v" or recent_style == "vp":
//   current_chapter_text += f"`{text}` "
//             # Description(like of a psalm).
//             elif recent_style == "d":
//   current_chapter_text += f"*{text}*"
//             # Italics.
//             elif recent_style == "it":
//   current_chapter_text += f"*{text}* "
//             # Words of Jesus.
//             elif recent_style == "wj":
//   current_chapter_text += f"**{text}** "
//             else:
//   current_chapter_text += f"{text} "

//   if "attrs" in item and "style" in item["attrs"]:
//   recent_style = item["attrs"]["style"]
//   if recent_style == "b":
//     current_chapter_text = current_chapter_text[: -2]
//     else:
//   recent_style = ""

//   if "items" in item:
//     for subitem in item["items"]:
//       add_dbl_text(subitem)
// }

export function renderFirstLevelText(fontSize: number, paragraph: any) {
  const standardTextStyles: TextStyle = {
    ...type(fontSize, 'r', 'l', colors.fg1),
    lineHeight: fontSize * 1.6,
  }

  switch (paragraph.attrs.style) {
    // Don't add chapter or book names since we already render those earlier.
    case 'mt1':
      return
    case 'c':
      // return (
      //   <Text
      //     key={uuid.v4().toString()}
      //     style={{
      //       ...type(fontSize + 4, 'b', 'l', colors.fg2),
      //       marginTop: gutterSize,
      //       marginBottom: gutterSize / 2,
      //     }}
      //   >
      //     Chapter{' '}
      //     {paragraph.items.map((sectionTitle: any) => sectionTitle.text)}
      //   </Text>
      // )
      return
    // Section titles.
    case 's1':
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...type(fontSize + 1, 'b', 'l', colors.fg2),
            marginTop: gutterSize,
            marginBottom: gutterSize / 2,
          }}
        >
          {paragraph.items.map((sectionTitle: any) =>
            renderSecondLevelText(fontSize, sectionTitle)
          )}
        </Text>
      )
    // Text break.
    case 'b':
      return <Spacer key={uuid.v4().toString()} units={4} />
    // First level quote (double-indented).
    case 'q1':
    case 'qm1':
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...standardTextStyles,
            paddingLeft: gutterSize * 2,
            // marginBottom: gutterSize / 2,
          }}
        >
          {paragraph.items.map((paragraphChunk: any) =>
            renderSecondLevelText(fontSize, paragraphChunk)
          )}
        </Text>
      )
    // Second level quote (tripe-indented).
    case 'qm2':
    case 'q2':
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...standardTextStyles,
            paddingLeft: gutterSize * 3,
          }}
        >
          {paragraph.items.map((paragraphChunk: any) =>
            renderSecondLevelText(fontSize, paragraphChunk)
          )}
        </Text>
      )
    // Indented paragraph.
    case 'li1':
    case 'pm':
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...standardTextStyles,
            paddingLeft: gutterSize,
          }}
        >
          <Indent />
          {paragraph.items.map((paragraphChunk: any) =>
            renderSecondLevelText(fontSize, paragraphChunk)
          )}
        </Text>
      )
    // Standard paragraph.
    default:
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...standardTextStyles,
          }}
        >
          <Indent />
          {paragraph.items.map((paragraphChunk: any) =>
            renderSecondLevelText(fontSize, paragraphChunk)
          )}
        </Text>
      )
  }
}

export const renderSecondLevelText = (
  fontSize: number,
  paragraphChunk: any
) => {
  if (!paragraphChunk.attrs) return paragraphChunk.text

  const standardTextStyles: TextStyle = {
    ...type(fontSize, 'r', 'l', colors.fg1),
    lineHeight: fontSize * 1.5,
  }

  switch (paragraphChunk.attrs.style) {
    // Jesus' words.
    case 'wj':
      return (
        <Text key={uuid.v4().toString()} style={{ color: '#FFC0C0' }}>
          {paragraphChunk.items.map((paragraphChunk: any) =>
            renderSecondLevelText(fontSize, paragraphChunk)
          )}
        </Text>
      )
    // Verse number.
    case 'v':
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...standardTextStyles,
            fontSize: fontSize - 4,
            color: colors.fg2,
          }}
        >
          {paragraphChunk.items.map((verseNumber: any) => verseNumber.text)}
          <Text style={{ fontSize: 12 }}> </Text>
        </Text>
      )
    // Name of God.
    case 'nd':
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...standardTextStyles,
            textTransform: 'uppercase',
          }}
        >
          {paragraphChunk.items.map((nameOfGod: any) => nameOfGod.text)}
        </Text>
      )
    case 'it':
      return (
        <Text
          key={uuid.v4().toString()}
          style={{
            ...standardTextStyles,
          }}
        >
          {paragraphChunk.items.map((italics: any) => italics.text)}
        </Text>
      )
    default:
      return paragraphChunk.text
  }
}
