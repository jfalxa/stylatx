Another small css in js lib.

## Usage

You get two functions that you can play with:
- css
- createStyled

### css

Creates rules in a global stylesheet and returns the related class names

```JS
// generate a class that will give a red background
const bgRed = css({ background: 'red' });

// create a class with variations by giving a function as style
const color = css(color => ({ color })); // returns a function
const colorGreen = color('green'); // generates the rule and returns a class name

// combine different styles
const misc = css(bgRed, colorGreen, { border: '1px solid black' })

// you can also add a custom class without any attached style
const myClassName = css('myClassName', { background: 'red' })
```

### createStyled

Creates a `styled()` function similar to styled-components.

```JS

```

