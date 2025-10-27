let mermaidInstance = null

export const loadMermaid = async () => {
  if (mermaidInstance) return mermaidInstance

  try {
    // 强制使用 ES Module 版本
    const m = await import('mermaid/dist/mermaid.esm.mjs')
    mermaidInstance = m.default

    // Mermaid 11.x 的初始化方式
    if (mermaidInstance && typeof mermaidInstance.initialize === 'function') {
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose'
      })
    } else {
      console.warn('Mermaid initialize not found, using default configuration')
    }

    return mermaidInstance
  } catch (error) {
    console.error('Failed to load mermaid:', error)
    throw error
  }
}

export default loadMermaid
