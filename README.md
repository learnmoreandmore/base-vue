# base-vue

基于 **Vue 3 + TypeScript + Vite** 的前端脚手架，集成 **Vue Router、Pinia、Element Plus、ECharts、Axios** 等，适合作为中后台或企业类应用的起点。

## 环境要求

- [Node.js](https://nodejs.org/)（建议使用当前 LTS）

## 快速开始

```bash
npm install
npm run dev
```

| 命令            | 说明                          |
| --------------- | ----------------------------- |
| `npm run dev`   | 启动开发服务（默认 HTTPS）    |
| `npm run build` | `vue-tsc` 类型检查 + 生产构建 |
| `npm run preview` | 本地预览构建产物            |

开发服务默认监听 **5173**，`host` 为 `0.0.0.0`，便于局域网访问；HTTPS 由 `@vitejs/plugin-basic-ssl` 提供自签名证书。

## 工程约定

- **路径别名**：`@` 指向 `src`（见 `vite.config.ts` → `resolve.alias`）。
- **Element Plus**：通过 `unplugin-vue-components` / `unplugin-auto-import` 按需引入，无需在业务里手写大量 `import`。
- **HTTP**：封装在 `src/api/http.ts`，`baseURL` 来自环境变量 `VITE_API_BASE_URL`，未配置时回退为 `/api`。

## 环境变量

根目录提供 `.env.development`、`.env.production`、`.env.test`，可按环境覆盖：

- **`VITE_API_BASE_URL`**：接口根路径（开发默认见 `.env.development`）。
- **`VITE_APP_TITLE`**：应用标题。
- **AI 对话（可选）**：`VITE_AI_CHAT_API_BASE`、`VITE_AI_CHAT_API_KEY`、`VITE_AI_CHAT_MODEL` 等，说明见各 `.env` 文件内注释。

> **提示**：当前 `vite.config.ts` 里开发代理写的是前缀 **`/api`** → `http://localhost:3000`（并会去掉 `/api` 前缀）。若你继续使用 `.env.development` 中的 **`/dev-api`**，需要在 `server.proxy` 里增加对 `/dev-api` 的转发，或把 `VITE_API_BASE_URL` 改为 `/api` 与现有代理对齐。

## Vite 代理摘要

| 前缀       | 行为说明 |
| ---------- | -------- |
| `/api`     | 开发环境转发到 `http://localhost:3000`，路径中的 `/api` 会被改写掉。 |
| `/ai-chat` | 开发 / 本地预览时转发到本机 **Ollama** `http://127.0.0.1:11434`，并重写为 OpenAI 兼容前缀 `/v1`。生产环境请在 `.env` 中配置 `VITE_AI_CHAT_API_BASE` 等直连地址。 |

## 大文件上传 `LargeFileUploader`

组件路径：`src/components/common/LargeFileUploader.vue`。在 `unplugin-vue-components` 扫描范围内，可在任意 SFC 中直接使用标签 **`<LargeFileUploader />`**（无需手写 `import`）。

**当前行为**：`src/api/modules/largeUpload.ts` 为**纯前端模拟**（内存中模拟分片检查、上传与合并），**不会**请求真实后端。对接真实服务时，需在该模块中改为通过 `http` 调用后端，常见约定为（相对 `VITE_API_BASE_URL`）：

- `POST /upload/check` — 查询已上传分片（断点续传）
- `POST /upload/chunk` — 上传单个分片
- `POST /upload/merge` — 通知服务端合并文件

使用示例：

```vue
<LargeFileUploader
  accept=".zip,.pdf,image/*"
  :max-size="1024 * 1024 * 1024"
  :chunk-size="5 * 1024 * 1024"
  :concurrency="3"
  :enable-compress="true"
  @success="onUploadSuccess"
/>
```

更多 props（如 `auto-upload`、`show-uploaded-list`、`max-history` 等）见组件源码 `defineProps`。

## 参考文档

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 与 Vue](https://vuejs.org/guide/typescript/overview.html)
