/**
 * One-off dev script: extracts antd's Select CSS (with the arianERP theme
 * tokens, un-hashed) into ui/styles/antd-select.css. Run with the arianERP
 * checkout that has antd installed:
 *   node scripts/extract-antd-select-css.cjs C:/fallahi/newFront
 * antd is NOT a dependency of this package; this only reads its output.
 */
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const host = path.resolve(process.argv[2] || '.');
const req = createRequire(path.join(host, 'package.json'));
const React = req('react');
const { renderToString } = req('react-dom/server');
const { createCache, StyleProvider, extractStyle } = req('@ant-design/cssinjs');
const antd = req('antd');
const { ConfigProvider, Select } = antd;
const h = React.createElement;

const theme = {
  algorithm: antd.theme.defaultAlgorithm,
  hashed: false,
  token: {
    fontFamily: '',
    colorBgBase: '#fff',
    colorTextBase: '#000',
    colorBgContainer: '#fff',
    colorText: '#000',
  },
};

const opts = [{ value: 1, label: 'a' }, { value: 2, label: 'b' }];
function variants(direction) {
  const common = { options: opts, style: { width: 120 } };
  return h(
    ConfigProvider,
    { theme, direction, wave: { disabled: true } },
    h(Select, { ...common }),
    h(Select, { ...common, showSearch: true, allowClear: true, value: 1 }),
    h(Select, { ...common, disabled: true, value: 1 }),
    h(Select, { ...common, loading: true }),
    h(Select, { ...common, status: 'error' }),
    h(Select, { ...common, size: 'small' }),
    h(Select, { ...common, size: 'large' }),
    h(Select, { ...common, open: true, getPopupContainer: () => ({ appendChild() {} }) }),
    h(Select, { options: [], open: true }),
  );
}

let css = '';
for (const dir of ['ltr', 'rtl']) {
  const cache = createCache();
  renderToString(h(StyleProvider, { cache, hashPriority: 'low' }, variants(dir)));
  css += extractStyle(cache, true) + '\n';
}
// de-duplicate identical rule blocks across the two passes
const seen = new Set();
const out = css
  .split(/(?<=\})\s*(?=[^{}]+\{)/)
  .filter((r) => (seen.has(r.trim()) ? false : (seen.add(r.trim()), true)))
  .join('\n');
const target = path.join(__dirname, '..', 'ui', 'styles', 'antd-select.css');
fs.writeFileSync(target, out);
console.log('wrote', target, out.length, 'bytes');
