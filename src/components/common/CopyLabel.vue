<script lang="ts" setup>
import clipboard from '@/utils/clipboardUtils';

const props = defineProps({
    // Text to copy to clipboard
    text: {
        type: String,
        default: "",
    },
});

const {text} = toRefs(props);

const copyText = (text: string, event: Event) => {
    clipboard(text, event);
};
</script>

<template>
  <span
    class="text"
    v-bind="props"
    @click.stop.prevent="copyText(text, $event)"
  >{{ text }}</span>
</template>

<style lang="scss" scoped>
.text {
  cursor: pointer;
  display: inline-block;
  border-bottom: 1px dashed;
}
</style>
