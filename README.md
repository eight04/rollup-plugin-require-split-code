rollup-plugin-require-split-code
================================

[![Build Status](https://travis-ci.org/eight04/rollup-plugin-require-split-code.svg?branch=master)](https://travis-ci.org/eight04/rollup-plugin-require-split-code)
[![install size](https://packagephobia.now.sh/badge?p=rollup-plugin-require-split-code)](https://packagephobia.now.sh/result?p=rollup-plugin-require-split-code)

Enable code splitting with `require()`.

Installation
------------

```
npm install -D rollup-plugin-require-split-code
```

Usage
-----

Mark the split point with `// split` comment:

```
function lazyLoadSomeModule() {
  const foo = require("foo"); // split
  // do something with foo...
}

module.exports = lazyLoadSomeModule;
```

Then add the plugin to the config:

```js
import split from "rollup-plugin-require-split-code";
import cjs from "rollup-plugin-cjs-es";

export default {
  input: ["entry.js"],
  output: {
    dir: "dist",
    format: "cjs"
  },
  plugins: [
    split(),
    cjs()
  ],
  experimentalCodeSplitting: true
};
```

Options
-------

### include

An array of glob pattern. Only matched files would be processed. If not set then process all files. Default: `undefined`.

### exclude

An array of glob pattern. Matched files would not be processed. Default: `undefined`.

Changelog
---------

* 0.1.0 (Next)

  - Pulled out from rollup-plugin-cjs-es.
