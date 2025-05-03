<template>
  <Milkdown v-if="editor" :editor="editor" /> <!-- Pass editor instance via prop -->
  <div v-else>Initializing Editor...</div> <!-- Placeholder while editor initializes -->
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // Import ref and onMounted
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, useEditor } from '@milkdown/vue';
import { commonmark } from '@milkdown/preset-commonmark';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { clipboard } from '@milkdown/plugin-clipboard';
import { history } from '@milkdown/plugin-history';

// Define props and emits for v-model binding
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['update:modelValue']);

const editor = ref(null); // Use ref to hold the editor instance

onMounted(() => {
  // Ensure useEditor is only called on the client side within onMounted
  const editorInstance = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        // Set initial value from prop
        ctx.set(defaultValueCtx, props.modelValue);
        // Update modelValue when editor content changes
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          // Avoid emitting update if the change came from the prop watcher
          if (props.modelValue !== markdown) {
             emit('update:modelValue', markdown);
          }
        });
      })
      .use(nord) // Apply the Nord theme
      .use(commonmark) // Use CommonMark preset (Markdown support)
      .use(listener) // Enable listener plugin for content updates
      .use(clipboard) // Enable clipboard plugin (paste support)
      .use(history); // Enable history plugin (undo/redo)
  }).value; // Get the actual editor instance from the ref returned by useEditor

  editor.value = editorInstance; // Assign the instance to our ref
});


// Watch for external changes to modelValue and update the editor
// Note: Directly updating editor content like this might need refinement
// depending on Milkdown's API for programmatic updates.
// Consider using editor commands if available for better control.
// watch(() => props.modelValue, (newValue) => {
//   const editorInstance = editor.value; // Access the editor instance
//   if (editorInstance && editorInstance.ctx.get(defaultValueCtx) !== newValue) {
//      // This might reset the editor state, investigate Milkdown's update methods
//      editorInstance.ctx.set(defaultValueCtx, newValue);
//      // editorInstance.action(replaceAll(newValue)); // Example using a hypothetical command
//   }
// });

</script>