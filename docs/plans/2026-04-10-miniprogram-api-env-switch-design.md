# Miniprogram API Env Switch Design

## Goal
让小游戏前端在不同小程序环境下自动切换 API 地址：
- `develop` 走本地后端
- `trial` / `release` 走云托管公网域名

## Decision
采用单点配置方案，在 `utils/config.js` 中统一维护环境到 API 地址的映射，并在模块加载时自动识别当前小程序环境。

## Design
- 使用 `wx.getAccountInfoSync().miniProgram.envVersion` 识别当前环境
- 维护一个环境映射表：
  - `develop -> http://127.0.0.1:8000`
  - `trial -> CLOUD_API_BASE_URL`
  - `release -> CLOUD_API_BASE_URL`
- 若运行环境拿不到 `wx` 或 `envVersion`，默认回退到 `develop`
- `app.js` 和 `utils/api.js` 继续只消费 `config.apiBaseUrl`

## Constraints
- 当前还没有用户提供真实云托管公网域名，因此先放一个显眼的占位常量，后续只改一处
- 不在请求层写死任何环境判断

## Verification
- 运行时测试：
  - 无 `wx` 时默认走本地地址
  - `trial` / `release` 时切到云端地址
- 现有前端测试保持通过
