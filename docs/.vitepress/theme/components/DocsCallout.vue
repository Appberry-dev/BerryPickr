<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    type?: 'info' | 'tip' | 'warning' | 'danger';
    title?: string;
  }>(),
  {
    type: 'info',
    title: 'Note'
  }
);

const className = computed(() => `docs-callout is-${props.type}`);
</script>

<template>
  <aside :class="className" role="note">
    <p class="docs-callout-title">{{ title }}</p>
    <div class="docs-callout-content">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.docs-callout {
  margin: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-left-width: 4px;
  border-radius: 10px;
  padding: 0.7rem 0.85rem;
  background: color-mix(in srgb, var(--vp-c-bg-soft), #ffffff 10%);
}

.docs-callout-title {
  margin: 0 0 0.3rem;
  font-family: var(--bp-font-display);
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
}

.docs-callout-content {
  color: var(--vp-c-text-2);
}

.docs-callout-content :deep(p:first-child) {
  margin-top: 0;
}

.docs-callout-content :deep(p:last-child) {
  margin-bottom: 0;
}

.docs-callout.is-info {
  border-left-color: #3f86e8;
}

.docs-callout.is-tip {
  border-left-color: #2f9e6a;
}

.docs-callout.is-warning {
  border-left-color: #d47c18;
}

.docs-callout.is-danger {
  border-left-color: #c4475f;
}
</style>
