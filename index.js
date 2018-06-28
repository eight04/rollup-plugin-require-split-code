const {createFilter} = require("rollup-pluginutils");
const {wrapImport} = require("./lib/wrap-import");
const {unwrapImport} = require("./lib/unwrap-import");

function factory({include, exclude} = {}) {
  let isImportWrapped = false;
  const filter = createFilter(include, exclude);
	return {
    name: "rollup-plugin-require-split-code",
    transform(code, id) {
      if (!filter(id)) {
        return;
      }
      const result = wrapImport({
        ast: this.parse(code),
        code
      });
      if (result.isTouched) {
        isImportWrapped = true;
        return {
          code: result.code,
          map: result.map
        };
      }
    },
    transformChunk(code, {format}) {
      if (!isImportWrapped) {
        return;
      }
      if (format !== "cjs") {
        throw new Error("output format must be 'cjs'");
      }
      const result = unwrapImport({
        ast: this.parse(code),
        code
      });
      if (result.isTouched) {
        return {
          code: result.code,
          map: result.map
        };
      }
    }
  };
}

module.exports = factory;
