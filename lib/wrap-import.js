const MagicString = require("magic-string");
const {walk} = require("estree-walker");
const {attachScopes} = require("rollup-pluginutils");
const isRequire = require("estree-is-require");

const RX_SPLIT = /.*?\/\/\s*?split/y;

function createTransformer({ast, code}) {
  const context = {
    ast,
    code,
    s: new MagicString(code),
    scope: attachScopes(ast, "scope"),
    node: null,
    isTouched: false,
    hasSplitComment(node) {
      RX_SPLIT.lastIndex = node.end;
      return RX_SPLIT.test(code);
    }
  };
  return {transform};
  
  function walkTree() {
    walk(context.ast, {
      enter(node) {
        context.node = node;
        if (node.scope) {
          if (node.scope.contains("require")) {
            this.skip();
            return;
          }
          context.scope = node.scope;
        }
        if (node.type === "CallExpression") {
          wrapImport(node);
        }
      },
      leave(node) {
        if (node.scope) {
          context.scope = node.scope.parent;
        }
      }
    });
  }
  
  function wrapImport(node) {
    if (
      !isRequire(node) ||
      !context.hasSplitComment(node)
    ) {
      return;
    }
    context.s.overwrite(node.start, node.callee.end, "_UNWRAP_IMPORT_(import");
    context.s.appendLeft(node.end, ")");
    context.isTouched = true;
  }

  function transform() {
    try {
      walkTree();
    } catch (err) {
      if (err.pos == null && context.node) {
        err.pos = context.node.start;
      }
      throw err;
    }
    if (context.isTouched) {
      return {
        code: context.s.toString(),
        map: context.s.generateMap(),
        isTouched: true
      };
    }
    return {
      isTouched: false
    };
  }
}

module.exports = {
  wrapImport(options) {
    return createTransformer(options).transform();
  }
};
