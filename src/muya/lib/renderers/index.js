const rendererCache = new Map()

const loadRenderer = async (name) => {
  if (!rendererCache.has(name)) {
    let m
    let renderer
    let mermaidLoader

    switch (name) {
      case 'sequence':
        m = await import('../parser/render/sequence')
        renderer = m.default
        break
      case 'plantuml':
        m = await import('../parser/render/plantuml')
        renderer = m.default
        break
      case 'flowchart':
        m = await import('flowchart.js')
        renderer = m.default
        break
      case 'mermaid':
        mermaidLoader = await import('../utils/mermaid-loader')
        renderer = await mermaidLoader.default()
        break
      case 'vega-lite':
        m = await import('vega-embed')
        renderer = m.default
        break
      default:
        throw new Error(`Unknown diagram name ${name}`)
    }
    rendererCache.set(name, renderer)
  }

  return rendererCache.get(name)
}

export default loadRenderer
