// Loads the OCR core and language data from small .txt parts (upload-size friendly hosting).
const BASE = self.location.href.replace(/[^/]*$/, '');
const PARTS = { 'core-simd-lstm': 3, 'core-lstm': 3, 'eng': 3 };
function joinSync(name) {
  let out = '';
  for (let i = 1; i <= PARTS[name]; i++) {
    const x = new XMLHttpRequest(); x.open('GET', BASE + name + '.' + i + '.txt', false); x.send();
    if (x.status !== 200 && x.status !== 0) throw new Error('missing part ' + name + '.' + i);
    out += x.responseText;
  }
  return out;
}
const _import = self.importScripts.bind(self);
self.importScripts = (...urls) => {
  for (const u of urls) {
    const s = String(u);
    const key = s.includes('simd-lstm') ? 'core-simd-lstm' : (s.includes('tesseract-core') ? 'core-lstm' : null);
    if (key) { _import(URL.createObjectURL(new Blob([joinSync(key)], { type: 'text/javascript' }))); }
    else _import(s);
  }
};
const _fetch = self.fetch.bind(self);
self.fetch = async (url, opts) => {
  if (String(url).endsWith('eng.traineddata')) {
    const b64 = joinSync('eng').trim();
    const bin = atob(b64), n = bin.length, bytes = new Uint8Array(n);
    for (let i = 0; i < n; i++) bytes[i] = bin.charCodeAt(i);
    return new Response(bytes, { status: 200 });
  }
  return _fetch(url, opts);
};
_import(BASE + 'worker.min.js');
