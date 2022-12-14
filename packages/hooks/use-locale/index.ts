import { computed, isRef, ref, unref } from 'vue'
import { get } from 'lodash-unified'
import { zh } from '@follow-ui/locale'
import { useGlobalConfig } from '../use-global-config'
import type { Ref } from 'vue'
import type { Language } from '@follow-ui/locale'

export type TranslatorOption = Record<string, string | number>
export type Translator = (path: string, option?: TranslatorOption) => string
export type LocaleContext = {
  locale: Ref<Language>
  lang: Ref<string>
  t: Translator
}

export const buildTranslator =
  (locale: Language | Ref<Language>): Translator =>
  (path, option) =>
    translate(path, option, unref(locale) as Language)

export const translate = (
  path: string,
  option: undefined | TranslatorOption,
  locale: Language
): string =>
  (get(locale, path, path) as string).replace(
    /\{(\w+)\}/g,
    (_, key) => `${option?.[key] ?? `{${key}}`}`
  )

export const buildLocaleContext = (
  locale: Language | Ref<Language>
): LocaleContext => {
  const lang = computed(() => unref(locale).name)
  const localeRef = isRef(locale) ? locale : ref(locale)
  return {
    lang,
    locale: localeRef,
    t: buildTranslator(locale),
  }
}

//本地化钩子
export const useLocale = () => {
  const locale = useGlobalConfig('locale')
  return buildLocaleContext(computed(() => locale.value || zh))
}
