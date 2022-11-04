export const installExamples = (app) => {
  let examples = import.meta.globEager(`../../examples/**/*.vue`)
  Object.keys(examples).forEach((item) => {
    app.component(
      item.replace('../../examples/', '').replace('.vue', ''),
      examples[item].default
    )
  })
}
