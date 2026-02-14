<script setup lang="ts">
import { computed } from 'vue';

interface DocsFeatureCard {
    title: string;
    description: string;
    href: string;
    tag: string;
}

const props = defineProps<{
    items?: DocsFeatureCard[];
}>();

const defaults: DocsFeatureCard[] = [
    {
        title: 'New to BerryPickr',
        description: 'Get a controller mounted, committed, and bound to real UI state in minutes.',
        href: '/quickstart',
        tag: 'Start'
    },
    {
        title: 'Understand the model',
        description:
            'Learn contexts, transaction IDs, and event semantics before scaling integrations.',
        href: '/concepts',
        tag: 'Core'
    },
    {
        title: 'Build custom workflows',
        description:
            'Dive into controller methods, mount options, bindings, and plugin lifecycles.',
        href: '/controller',
        tag: 'Build'
    }
];

const cards = computed(() => props.items ?? defaults);
</script>

<template>
    <section class="docs-feature-cards">
        <article v-for="item in cards" :key="item.href" class="docs-feature-card">
            <p class="docs-feature-tag">{{ item.tag }}</p>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <a :href="item.href">Open {{ item.title }}</a>
        </article>
    </section>
</template>

<style scoped>
.docs-feature-cards {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.docs-feature-card {
    display: grid;
    gap: 0.55rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 14px;
    padding: 0.85rem;
    background: color-mix(in srgb, var(--vp-c-bg-soft), #ffffff 12%);
}

.docs-feature-card h3 {
    margin: 0;
    font-family: var(--bp-font-display);
    font-size: 1rem;
}

.docs-feature-card p {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 0.92rem;
}

.docs-feature-card a {
    margin-top: 0.2rem;
    width: fit-content;
    text-decoration: none;
    color: var(--vp-c-brand-1);
    font-weight: 600;
}

.docs-feature-card a:hover {
    text-decoration: underline;
}

.docs-feature-tag {
    margin: 0;
    font-size: 0.71rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--vp-c-brand-2);
}
</style>
