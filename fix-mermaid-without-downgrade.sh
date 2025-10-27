#!/bin/bash
set -e

echo "🚀 解决 Mermaid 10+ 构建问题（不降级）..."

# 1. 检查当前 Mermaid 版本
echo "📦 当前 Mermaid 版本:"
yarn list mermaid | grep mermaid

# 2. 升级构建工具
echo "🔄 升级构建工具..."
yarn add --dev \
  webpack@^5.88.0 \
  webpack-cli@^4.10.0 \
  terser@^5.27.0 \
  css-minimizer-webpack-plugin@^5.0.0 \
  babel-loader@^8.4.0 \
  @babel/core@^7.22.0 \
  @babel/preset-env@^7.22.0 \
  @babel/plugin-transform-typescript@^7.22.0 \
  @babel/plugin-proposal-decorators@^7.22.0 \
  @babel/plugin-proposal-class-properties@^7.18.0 \
  --legacy-peer-deps

# 3. 创建现代构建配置
echo "📄 创建现代构建配置..."
cat > vue.config.js << 'EOF'
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    optimization: {
      minimizer: [
        (compiler) => {
          const TerserPlugin = require('terser-webpack-plugin');
          new TerserPlugin({
            terserOptions: {
              ecma: 2020,
              compress: { ecma: 2020 },
              mangle: { safari10: true },
              output: { ecma: 2020, comments: false }
            },
            parallel: true
          }).apply(compiler);
        }
      ]
    }
  },
  chainWebpack: config => {
    config.module
      .rule('mermaid-modern')
      .test(/[\\/]node_modules[\\/]mermaid[\\/].*\.mjs$/)
      .use('babel')
      .loader('babel-loader')
      .options({
        presets: [['@babel/preset-env', { targets: { node: '16' }, modules: false }]]
      });
  }
})
EOF

# 4. 清理和重建
echo "🧹 清理缓存..."
rm -rf node_modules/.cache build dist

echo "🏗️ 重新构建..."
yarn build --linux

echo "✅ 构建完成！Mermaid 保持最新版本"


