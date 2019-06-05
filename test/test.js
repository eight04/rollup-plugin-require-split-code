/* eslint-env mocha */
const assert = require("assert");
const {rollup} = require("rollup");
const {withDir} = require("tempdir-yaml");

const split = require("..");

describe("main", () => {
  async function bundleOutput(file) {
    const bundle = await rollup({
      input: [file],
      plugins: [split()]
    });
    const {output} = await bundle.generate({format: "cjs"});
    return output.reduce((o, out) => {
      o[out.fileName] = out;
      return o;
    }, {});
  }
  
  it("split code", () =>
    withDir(`
      - entry.js: |
          export default () => {
            const foo = require("./foo"); // split
            console.log(foo);
          };
      - foo.js: |
          export default "foo";
    `, async resolve => {
      const output = await bundleOutput(resolve("entry.js"));
      assert.equal(Object.keys(output).length, 2);
      const fooFileName = Object.keys(output).find(n => n !== "entry.js");
      const match = output["entry.js"].code.match(/foo = require\(['"]([^'"]+)/);
      assert.equal(match[1], `./${fooFileName}`);
    })
  );
  
  it("require is redefined", () =>
    withDir(`
      - entry.js: |
          export default () => {
            const require = "wat";
            const foo = require("./foo"); // split
            console.log(foo);
          };
      - foo.js: |
          export default "foo";
    `, async resolve => {
      const output = await bundleOutput(resolve("entry.js"));
      assert.equal(Object.keys(output).length, 1);
    })
  );
});
