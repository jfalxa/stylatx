const { css } = require('./index')

function removeRules(stylesheet) {
  if (!stylesheet) return

  while (stylesheet.cssRules.length) {
    stylesheet.deleteRule(0)
  }
}

function currentStyle() {
  return []
    .concat(document.styleSheets[0].cssRules)
    .map(rule => rule.cssText)
    .join(' ')
}


afterEach(() => {
  removeRules(document.styleSheets[0])
})

test('return the given class', () => {
  expect(css('given-class')).toBe('given-class')
})

test('generate a class and the associated rule', () => {
  const className = css({ color: 'red' })
  expect(typeof className).toBe('string')
  expect(currentStyle()).toBe(`.${className} {color: red;}`)
})

test('generate a class and the associated rule with many props', () => {
  const className = css({ color: 'red', background: 'green' })
  expect(currentStyle()).toBe(`.${className} {color: red; background: green;}`)
})

test('combine a couple simple rules', () => {
  const combo = css({ color: 'red' }, { background: 'green' })
  expect(typeof combo).toBe('string')

  const [classA, classB] = combo.split(' ')
  expect(currentStyle()).toBe(`.${classA} {color: red;} .${classB} {background: green;}`)
})

test('use a function to generate dynamic styles', () => {
  const bgColor = css(color => ({ background: color }))
  expect(typeof bgColor).toBe('function')

  const bgBlue = bgColor('blue')
  expect(typeof bgBlue).toBe('string')

  expect(currentStyle()).toBe(`.${bgBlue} {background: blue;}`)
})

test('combine existing styles', () => {
  const colorWhite = css({ color: 'white' })
  const bgColor = css(p => ({ background: p.bg }))

  const combo = css(colorWhite, bgColor)
  expect(typeof combo).toBe('function')

  const applied = combo({ bg: 'black' })
  expect(typeof applied).toBe('string')

  const [colorClass, bgClass] = applied.split(' ')
  expect(currentStyle()).toBe(`.${colorClass} {color: white;} .${bgClass} {background: black;}`)
})

test('nested styles', () => {
  const nested = css({ color: 'red', '.child': { background: 'white' }})

  expect(currentStyle()).toBe(`.${nested} {color: red;} .${nested} .child {background: white;}`)
})

test('deeply nested styles', () => {
  const deep = css({ '.child': { '.grand-child': { color: 'red' } }})
  expect(currentStyle()).toBe(`.${deep} .child .grand-child {color: red;}`)
})


test('pseudo styles', () => {
  const pseudo = css({ color: 'red', ':hover': { color: 'cyan' }})
  expect(currentStyle()).toBe(`.${pseudo} {color: red;} .${pseudo}:hover {color: cyan;}`)
})

test('media queries', () => {
  const mediaQuery = '@media screen and (min-width: 300px)'
  const responsive = css({ [mediaQuery]: { color: 'red' } })
  expect(currentStyle()).toBe(`${mediaQuery} {.${responsive} {color: red;}}`)
})


