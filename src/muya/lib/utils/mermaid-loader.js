let mermaidInstance = null

// Polyfill structuredClone for Electron 15 / Node 16
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
}

const loadMermaid = async () => {
  if (mermaidInstance) return mermaidInstance

  // eslint-disable-next-line no-eval
  const nodeRequire = eval('require')
  const mermaidPath = nodeRequire.resolve('mermaid/dist/mermaid.esm.mjs')

  // eslint-disable-next-line no-new-func
  const importModule = new Function('specifier', 'return import(specifier)')
  const m = await importModule('file://' + mermaidPath)
  mermaidInstance = m.default || m
  mermaidInstance.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'strict'
  })
  return mermaidInstance
}

export default loadMermaid
