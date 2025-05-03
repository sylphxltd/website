<template>
  <MilkdownProvider>
    <MilkdownEditor
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </MilkdownProvider>
</template>

<script setup>
import { MilkdownProvider } from "@milkdown/vue";
import MilkdownEditor from './MilkdownEditor.vue';

// Define props and emits to allow v-model passthrough
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['update:modelValue']);
</script>