// utils

function kebabCase(str = "") {
  return str.replace(/[A-Z]/g, "-$&").toLowerCase()
}

function uniq(value, index, arr) {
  return arr.lastIndexOf(value) === index
}

function isFn(value) {
  return typeof value === "function"
}

function isDef(value) {
  return value === 0 || Boolean(value)
}

function rid() {
  const randomString = Math.random()
    .toString(36)
    .substring(7)

  return "sx-" + randomString
}

function isEmpty(obj) {
  return !Object.values(obj).some(isDef)
}

function applyArgsToStyle(args, style) {
  return isFn(style) ? style(...args) : style
}

function cs(...classNames) {
  return classNames
    .filter(isDef)
    .filter(uniq)
    .join(" ")
}


// rules

let stylesheet

function initSheet() {
  stylesheet = document.createElement("style")
  document.head.appendChild(stylesheet)
  return stylesheet
}

function getSheet() {
  return !stylesheet || !stylesheet.sheet
    ? initSheet().sheet
    : stylesheet.sheet
}

function parseRules(selector, style, wrapper) {
  const baseRule = [selector, {}, wrapper]
  const otherRules = []

  Object.keys(style).forEach(prop => {
    const value = style[prop]

    if (typeof value !== "object") {
      // flat values
      baseRule[1][prop] = value
    } else if (prop.startsWith("@")) {
      // media queries
      otherRules.push(...parseRules(selector, value, prop))
    } else if (/^(:|>|\.|\*)/.test(prop)) {
      // nested selector
      const space = prop[0] === ":" ? "" : " "
      otherRules.push(...parseRules(selector + space + prop, value, wrapper))
    }
  })

  return [baseRule, ...otherRules].filter(rule => !isEmpty(rule[1]))
}

function cssDeclaration(selector, rules, wrapper) {
  const cssRules = Object.keys(rules)
    .filter(prop => rules[prop])
    .map(prop => `${kebabCase(prop)}: ${rules[prop]};`)

  const declaration = `${selector} { ${cssRules.join(" ")} }`
  return wrapper ? `${wrapper} { ${declaration} }` : declaration
}

function insertRule(className, style) {
  const selector = `.${className}`
  const sheet = getSheet()
  const last = () => sheet.cssRules.length

  parseRules(selector, style)
    .map(rule => cssDeclaration(...rule))
    .forEach(declaration => sheet.insertRule(declaration, last()))

  return className
}


// css

const identifier = Symbol()

function combine(...defs) {
  const styles = defs.map(style => css(style))

  if (!styles.some(isFn)) {
    return cs(...styles)
  }

  const wrapper = (...args) =>
    cs(...styles.map(style => applyArgsToStyle(args, style)))

  wrapper.identifier = identifier
  return wrapper
}

function css(style, ...extraStyles) {
  const className = rid()

  if (extraStyles.length > 0) {
    return combine(style, ...extraStyles)
  } else if (typeof style === "string" || style.identifier === identifier) {
    return style
  } else if (!isFn(style)) {
    return insertRule(className, style)
  }

  const cache = {}

  const applyStyle = (...args) => {
    const computedStyle = style(...args)
    const key = JSON.stringify(computedStyle)

    if (!cache[key]) {
      const version = Object.keys(cache).length
      const name = version > 0 ? `${className}-${version}` : className
      cache[key] = insertRule(name, computedStyle)
    }

    return cache[key]
  }

  applyStyle.identifier = identifier
  applyStyle({}) // create default style with no params
  return applyStyle
}


// create styled

function createStyled(render) {
  return function styled(Component) {
    return (...defs) => {
      const styles = css(...defs)

      return (...args) =>
        render(
          Component,
          applyArgsToStyle(args, styles),
          ...args
        )
    }
  }
}

module.exports = { createStyled, css, cs }
