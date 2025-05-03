<template>
  <Milkdown />
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { Editor, rootCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, useEditor } from '@milkdown/vue';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { clipboard } from '@milkdown/plugin-clipboard';
import { history } from '@milkdown/plugin-history';
import { replaceAll, getMarkdown } from '@milkdown/utils';

const model = defineModel({
  default: '',
})

// 使用單一的鎖來防止重入，更簡潔可靠
const updateLock = ref(false);

const { get, loading } = useEditor((root) => Editor.make()
  .config((ctx) => {
    ctx.set(rootCtx, root);
    
    // 監聽編輯器內容變化
    ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
      if (updateLock.value) return; // 如果更新鎖定中，不執行
      
      try {
        updateLock.value = true; // 鎖定更新
        model.value = markdown; // 更新模型
      } finally {
        // 使用 nextTick 確保在 Vue 的更新循環後解鎖
        nextTick(() => {
          updateLock.value = false;
        });
      }
    });
  })
  .use(nord)
  .use(commonmark)
  .use(listener)
  .use(clipboard)
  .use(history));

// 監聽模型變化並更新編輯器
watch(
  () => model.value,
  async (newValue) => {
    if (updateLock.value || loading.value) return; // 如果鎖定中或編輯器加載中，不執行
    
    const editor = get();
    if (!editor) return;
    
    const currentContent = editor.action(getMarkdown());
    if (currentContent === newValue) return; // 內容相同，不需更新
    
    try {
      updateLock.value = true; // 鎖定更新
      await editor.action(replaceAll(newValue || ''));
    } finally {
      // 確保在任何情況下都會解鎖
      nextTick(() => {
        updateLock.value = false;
      });
    }
  }
);
</script>

<style>
.milkdown-editor {
  min-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>