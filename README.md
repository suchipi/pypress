# pypress

Pypress provides an API similar to [Cypress](http://cypress.io)'s `cy`, but uses `puppeteer` instead.

It's useful for writing non-test code using `cy`-like syntax.

## Usage

```js
// Pypress exports a `makePypress` function that you use to make a Pypress instance.
const makePypress = require("pypress");

const py = makePypress({
  // Optional: You can log every time pypress runs a command, or when an error occurs
  log: (message) => console.log(message);
});

// Use py like Cypress's cy
py.goto("https://google.com");

py.get("input").type("test");

// Once you've queued up a bunch of stuff to do, you'll want to use `py.asPromise()` to handle errors.
// py.asPromise() returns a Promise that resolves when all the work you've queued up so far is completed,
// and rejects if any of the work you've queued up fails.
py.asPromise().catch((err) => {
  console.error(err);
});
```

For more information, run `npx pypress` to run a node repl with pypress loaded and with a browser window visible. You can use Tab to autocomplete the properties on the `py` object, to see what commands are available.

## License

MIT
