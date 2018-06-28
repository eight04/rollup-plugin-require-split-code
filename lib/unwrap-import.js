const MagicString = require("magic-string");
const {walk} = require("estree-walker");

function createTransformer({ast, code}) {
  const context = {
    ast,
    code,
    s: new MagicString(code),
    isTouched: false
  };
  return {transform};
  
  function transform() {
    walk(context.ast, {
      enter(node) {
        if (node.type === "CallExpression") {
          unwrapImport(node);
        }
      }
    });
    if (context.isTouched) {
      return {
        code: context.s.toString(),
        map: context.s.generateMap(),
        isTouched: true
      };
    }
    return {
      code: context.code,
      isTouched: false
    };
  }
  
  function unwrapImport(node) {
    if (node.callee.name !== "_UNWRAP_IMPORT_" || node.arguments[0].type !== "CallExpression") {
      return;
    }
    // _UNWRAP_IMPORT_(Promise.resolve(require("...")))
    const arg = node.arguments[0].arguments[0];
    context.s.remove(node.callee.start, arg.start);
    context.s.remove(arg.end, node.end);
    context.isTouched = true;
  }
}

module.exports = {
  unwrapImport(options) {
    return createTransformer(options).transform();
  }
};
