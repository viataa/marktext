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
