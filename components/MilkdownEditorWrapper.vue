<template>
    <MilkdownProvider>
        <MilkdownEditor v-model="model" />
    </MilkdownProvider>
</template>

<script setup>
import { MilkdownProvider } from "@milkdown/vue";

const model = defineModel()
</script>