import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

interface VocabularyMatcherOptions {
  words: string[]
  className: string
}

const VocabularyMatcherPluginKey = new PluginKey('vocabularyMatcher')

export const VocabularyMatcher = Extension.create<VocabularyMatcherOptions>({
  name: 'vocabularyMatcher',

  addOptions() {
    return {
      words: [],
      className: 'text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]',
    }
  },

  addProseMirrorPlugins() {
    const { words, className } = this.options

    return [
      new Plugin({
        key: VocabularyMatcherPluginKey,
        state: {
          init(_, { doc }) {
            return DecorationSet.empty
          },
          apply(tr, oldSet, oldState, newState) {
            const { doc } = newState
            
            if (!tr.docChanged && oldSet !== DecorationSet.empty && words.length === 0) {
                return oldSet.map(tr.mapping, doc)
            }

            const decorations: Decoration[] = []

            if (words.length > 0) {
              const escapedWords = words
                .filter(w => w.length > 0)
                .map(word => word.replace(/[.*+?^${}()|[\\]/g, '\\$&'))
              
              const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi')

              doc.descendants((node, pos) => {
                if (node.isText && node.text) {
                  let match
                  while ((match = regex.exec(node.text)) !== null) {
                    const start = pos + match.index
                    const end = start + match[0].length
                    decorations.push(
                      Decoration.inline(start, end, {
                        class: className,
                      })
                    )
                  }
                }
              })
            }

            return DecorationSet.create(doc, decorations)
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
