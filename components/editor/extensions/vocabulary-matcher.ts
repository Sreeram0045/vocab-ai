import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

interface VocabularyWord {
  word: string;
  meaning: string;
  universe: string;
}

interface VocabularyMatcherOptions {
  words: VocabularyWord[]
  className: string
}

const VocabularyMatcherPluginKey = new PluginKey('vocabularyMatcher')

export const VocabularyMatcher = Extension.create<VocabularyMatcherOptions>({
  name: 'vocabularyMatcher',

  addOptions() {
    return {
      words: [],
      className: 'text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.4)] cursor-help border-b border-emerald-500/30 border-dashed',
    }
  },

  addProseMirrorPlugins() {
    const { className } = this.options
    const initialWords = this.options.words;

    // Helper to generate decorations
    const getDecorations = (doc: any, words: VocabularyWord[]) => {
        const decorations: Decoration[] = []
        if (words.length > 0) {
            const escapedWords = words
                .filter(w => w.word && w.word.length > 0)
                .map(w => w.word.replace(/[.*+?^${}()|[\\]/g, '\\$&'))
            
            if (escapedWords.length === 0) return DecorationSet.empty;

            const regex = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi')

            doc.descendants((node: any, pos: number) => {
                if (node.isText && node.text) {
                    let match
                    while ((match = regex.exec(node.text)) !== null) {
                        const start = pos + match.index
                        const end = start + match[0].length
                        const matchedText = match[0]
                        const wordData = words.find(w => w.word.toLowerCase() === matchedText.toLowerCase())

                        decorations.push(
                            Decoration.inline(start, end, {
                                class: className,
                                'data-word': wordData?.word || matchedText,
                                'data-meaning': wordData?.meaning || '',
                                'data-universe': wordData?.universe || '',
                            })
                        )
                    }
                }
            })
        }
        return DecorationSet.create(doc, decorations)
    }

    return [
      new Plugin({
        key: VocabularyMatcherPluginKey,
        state: {
          init(_, { doc }) {
            return {
                words: initialWords,
                decorations: getDecorations(doc, initialWords)
            }
          },
          apply(tr, oldState) {
            const newWords = tr.getMeta('setVocabulary')
            const { doc } = tr
            
            // 1. New words provided?
            if (newWords) {
                return {
                    words: newWords,
                    decorations: getDecorations(doc, newWords)
                }
            }

            // 2. Doc changed?
            if (tr.docChanged) {
                return {
                    words: oldState.words,
                    decorations: getDecorations(doc, oldState.words)
                }
            }

            // 3. Nothing changed, map decorations (though we generated them, mapping is fine for non-content changes)
            return {
                words: oldState.words,
                decorations: oldState.decorations.map(tr.mapping, doc)
            }
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decorations ?? DecorationSet.empty
          },
        },
      }),
    ]
  },
})
