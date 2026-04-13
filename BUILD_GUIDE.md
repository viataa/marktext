# MarkText v1.0.1 构建指导

## 版本信息

| 组件 | 版本 |
|------|------|
| MarkText | 1.0.1 |
| Electron | ^15.4.0 |
| Webpack | ^5.69.1 |
| Mermaid | ^11.14.0（从 8.14.0 升级） |
| Terser | ^5.31.0（通过 resolutions 强制升级） |

## 环境要求

| 依赖 | 要求 |
|------|------|
| Node.js | >=16 且 <17（推荐 v16.20.2） |
| Yarn | 1.x（项目强制要求，不支持 npm） |
| Python | >=3.6（node-gyp 编译原生模块需要） |
| C++ 编译器 | GCC / G++（编译原生模块需要） |

## Ubuntu 22.04 构建步骤

### 1. 安装系统依赖

```bash
sudo apt-get update
sudo apt-get install -y build-essential python3 python-is-python3 git \
  libx11-dev libxkbfile-dev libsecret-1-dev libfontconfig-dev
```

### 2. 安装 Node.js 16 + Yarn

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16
npm install -g yarn
```

验证：
```bash
node -v   # v16.x.x
yarn -v   # 1.x.x
```

### 3. 安装项目依赖

```bash
cd marktext
yarn install --ignore-engines
```

`--ignore-engines` 是必须的，因为 mermaid 11.14 的传递依赖 `marked@16` 声明要求 Node >= 20，但实际上 mermaid 的 dist bundle 已内联了 marked，运行时不依赖它。

### 4. 构建

```bash
# 开发模式（热重载）
yarn dev

# 构建二进制（不打包安装程序，用于测试）
yarn run build:bin
# 产物：build/linux-unpacked/marktext

# 构建 Linux 发布包（AppImage + deb 等）
yarn run release:linux
# 产物：build/ 目录下

# 仅构建 deb 包
node .electron-vue/build.js && electron-builder build --linux deb

# 构建 Windows 版本（需要 wine64 和 mono-devel）
sudo apt-get install -y wine64 mono-devel
node .electron-vue/build.js && electron-builder build --win nsis
```

## Red Hat / Fedora 系统依赖

```bash
sudo dnf install libX11-devel libxkbfile-devel libsecret-devel fontconfig-devel
```

## Mermaid 11.14 升级技术说明

### 核心改动

1. **ESM 运行时加载**：mermaid 11.14 是 ESM-only 模块，无法被 webpack 的 CJS externals 机制通过 `require()` 加载。通过 `mermaid-loader.js` 使用 Node.js 原生 `import()` 在运行时动态加载 ESM 模块，绕过 webpack 的静态分析。

2. **Terser 升级**：mermaid 11.14 的 dist 文件使用 ES2022 class static blocks（`static { }`）语法，原有 terser 5.10 无法解析，通过 `resolutions` 强制升级到 5.31+。

3. **structuredClone polyfill**：mermaid 11.14 内部使用 `structuredClone`，该 API 在 Electron 15 / Node 16 中不存在，在 `mermaid-loader.js` 中提供了基于 JSON 序列化的 polyfill。

4. **异步渲染锁**：mermaid 11.14 的 `init()` / `parse()` 变为异步操作，多次调用会导致 SVG 并发渲染重叠。在 `renderMermaid()` 中加入锁机制，确保串行渲染。

### 改动文件清单

| 文件 | 说明 |
|------|------|
| `package.json` | 版本号、mermaid 依赖、terser resolution |
| `.electron-vue/webpack.renderer.config.js` | resolve extensions 加 `.mjs` |
| `src/muya/lib/utils/mermaid-loader.js` | 新文件：ESM 动态加载 + polyfill |
| `src/muya/lib/renderers/index.js` | 使用 mermaid-loader |
| `src/muya/lib/parser/render/index.js` | 异步渲染锁 |
| `src/muya/lib/utils/exportHtml.js` | `mermaid.init()` 加 await |

## 常见问题

| 问题 | 解决 |
|------|------|
| `yarn install` 报 engine 不兼容 | 加 `--ignore-engines` 参数 |
| Terser 报 `Unexpected token: punc` | 确认 `resolutions` 中 terser 为 `^5.31.0`，重新 `yarn install` |
| Electron 下载超时 | `export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` |
| `electron-rebuild` 失败 | 确认 `build-essential` 和 `python-is-python3` 已安装 |
| `keytar` 编译报错 | `sudo apt-get install libsecret-1-dev` |
| `fontmanager-redux` 报错 | `sudo apt-get install libfontconfig-dev` |
| mermaid 渲染时报 `structuredClone is not defined` | 确认 `mermaid-loader.js` 中包含 polyfill |
| 多个 mermaid 图表重叠 | 确认 `renderMermaid()` 使用了异步锁机制 |
