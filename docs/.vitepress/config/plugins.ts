import path from 'path'
import fs from 'fs'
import MarkdownIt from 'markdown-it'
import mdContainer from 'markdown-it-container'
import { docRoot } from '@follow-ui/build-utils'
import type Token from 'markdown-it/lib/token'
import type Renderer from 'markdown-it/lib/renderer'
import { highlight } from '../utils/highlight'

const localMd = MarkdownIt()

interface ContainerOpts {
  marker?: string | undefined

  validate?(params: string): boolean

  render?(
    tokens: Token[],
    index: number,
    options: any,
    env: any,
    self: Renderer
  ): string
}

export const mdPlugin = (md: MarkdownIt) => {
  md.use(mdContainer, 'demo', {
    validate(params) {
      return !!params.trim().match(/^demo\s*(.*)$/)
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/)
      if (tokens[idx].nesting === 1 /* means the tag is opening */) {
        const description = m && m.length > 1 ? m[1] : ''
        const sourceFileToken = tokens[idx + 2]
        let source = ''
        const sourceFile = sourceFileToken.children?.[0].content ?? ''
        if (sourceFileToken.type === 'inline') {
          source = fs.readFileSync(
            path.resolve(docRoot, 'examples', `${sourceFile}.vue`),
            'utf-8'
          )
        }
        if (!source) throw new Error(`Incorrect source file: ${sourceFile}`)
        return `<Demo source="${encodeURIComponent(
          highlight(source, 'vue')
        )}" path="${sourceFile}" raw-source="${encodeURIComponent(
          source
        )}" description="${encodeURIComponent(localMd.render(description))}">`
      } else {
        return '</Demo>'
      }
    },
  } as ContainerOpts)

  md.use(mdContainer, 'code', {
    validate(params) {
      return !!params.trim().match(/^code\s*(.*)$/)
    },
    render(tokens, idx) {
      const m = tokens[idx].info.trim().match(/^code\s*(.*)$/)
      if (tokens[idx].nesting === 1) {
        const language = m && m.length > 1 ? m[1] : ''
        let content = ''
        let i = idx + 1
        while (i < tokens.length && tokens[i].markup !== ':::') {
          let pre = ''
          if (tokens[i]?.content) {
            if (tokens[i].children?.length) {
              const inline = tokens[i].children?.filter(
                (item) => item.type === 'html_inline'
              )
              if (inline?.length) {
                pre =
                  inline.reduce((total, item) => {
                    return total + item.content
                  }, '') ?? ''
              }
            }
            content += pre + tokens[i]?.content
          } else {
            content += '\n'
          }
          i++
        }
        return `<ClientOnly><Code source="${encodeURIComponent(
          highlight(content.trim(), language)
        )}" language="${language}">`
      } else {
        return '</Code></ClientOnly>'
      }
    },
  } as ContainerOpts)
}
