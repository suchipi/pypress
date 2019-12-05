# pypress

Pypress provides an API similar to [Cypress](http://cypress.io)'s `cy`, but uses `puppeteer` instead.

It's useful for writing non-test code using `cy`-like syntax.

## Usage

```js
const py = require("pypress");

// You will want to set up some kind of onError handler,
// so you know when an error happens:
py.onError = (error) => console.error(error);

// Then, use py like Cypress's cy
py.goto("https://google.com");

py.get("input").type("test");
```

For more information, run `node -r 'pypress/repl' -e ''` to run a node repl with pypress loaded and with a browser window visible. You can use Tab to autocomplete the properties on the `py` object, to see what commands are available.

## License

MIT
