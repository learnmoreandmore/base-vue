# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## LargeFileUploader 全局组件

已内置全局大文件上传组件：`<LargeFileUploader />`。

示例：

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

默认接口：

- `POST /upload/check`：查询已上传分片（断点续传）
- `POST /upload/chunk`：上传分片
- `POST /upload/merge`：通知服务端合并文件
