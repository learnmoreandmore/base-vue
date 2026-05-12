<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import LargeFileUploader from '@/components/common/LargeFileUploader.vue'

const active = ref('upload')

const onUploadOk = (payload: { fileUrl?: string; fileHash: string; filename: string }) => {
  ElMessage.success(`上传完成：${payload.filename}（hash 前缀 ${payload.fileHash.slice(0, 8)}…）`)
}

const previewSrc = ref(
  'https://picsum.photos/seed/loan-doc/800/480',
)
</script>

<template>
  <el-tabs v-model="active" type="border-card">
    <el-tab-pane label="大文件 / 断点续传" name="upload">
      <p class="hint">对接后端分片接口后，可用于借款合同扫描件、尽调材料等大文件上传。</p>
      <LargeFileUploader :auto-upload="false" accept=".pdf,.zip,.png,.jpg" @success="onUploadOk" />
    </el-tab-pane>
    <el-tab-pane label="图片预览" name="image">
      <p class="hint">常见能力：缩略图、灯箱预览（此处为静态示例）。</p>
      <el-image :src="previewSrc" fit="cover" class="preview-img" :preview-src-list="[previewSrc]" preview-teleported />
    </el-tab-pane>
    <el-tab-pane label="视频 / 音频" name="av">
      <p class="hint">可嵌入双录视频、培训录像；生产环境请使用受控 CDN 与鉴权播放地址。</p>
      <video class="video" controls playsinline poster="https://picsum.photos/seed/video-poster/960/540">
        <source src="" type="video/mp4" />
      </video>
      <p class="muted">未配置真实片源时浏览器不播放，仅保留控件与 poster 占位。</p>
    </el-tab-pane>
    <el-tab-pane label="Office / PDF" name="doc">
      <p class="hint">PDF 可用浏览器内嵌预览；Office 建议走 OnlyOffice / WPS 在线预览服务。</p>
      <el-empty description="接入文档预览服务后在此嵌入 iframe 或官方 SDK" />
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>
.hint {
  color: var(--el-text-color-secondary);
  margin: 0 0 12px;
  font-size: 13px;
}
.preview-img {
  width: min(100%, 560px);
  height: 240px;
  border-radius: 8px;
}
.video {
  width: 100%;
  max-width: 720px;
  border-radius: 8px;
  background: #000;
}
.muted {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
