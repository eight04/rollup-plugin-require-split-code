/* eslint-env mocha */
const assert = require("assert");
const {rollup} = require("rollup");
const {withDir} = require("tempdir-yaml");

const split = require("..");

describe("main", () => {
  async function bundleOutput(file) {
    const bundle = await rollup({
      input: [file],
      plugins: [split()],
      experimentalCodeSplitting: true
    });
    const {output} = await bundle.generate({format: "cjs"});
    return output;
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
      assert(output["entry.js"].code.includes('foo = require("./foo.js")'));
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
