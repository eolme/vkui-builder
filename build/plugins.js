const scopeRootPlugin = ({ customPropRoot, except = []}) => ({
  postcssPlugin: 'postcss-scope-root',
  Rule(rule) {
    if (rule.selector === ':root' && !except.includes(rule.source.input.file)) {
      rule.selector = customPropRoot;
    }
  }
});

scopeRootPlugin.postcss = true;

module.exports = {
  scopeRootPlugin
};

