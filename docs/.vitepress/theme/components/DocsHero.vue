<script setup lang="ts">
withDefaults(
  defineProps<{
    badge?: string;
    title?: string;
    lede?: string;
    install?: string;
    primaryHref?: string;
    primaryText?: string;
    secondaryHref?: string;
    secondaryText?: string;
    repoHref?: string;
    repoText?: string;
  }>(),
  {
    badge: 'BerryPickr Handbook',
    title: 'Ship reliable color tooling with a headless controller and optional UI mount.',
    lede:
      'Use one controller surface across app builders, design systems, and framework wrappers without rewriting state logic.',
    install: 'pnpm add berrypickr',
    primaryHref: '/quickstart',
    primaryText: 'Start in 10 Minutes',
    secondaryHref: '/concepts',
    secondaryText: 'Learn Core Concepts',
    repoHref: 'https://github.com/Appberry-dev/BerryPickr',
    repoText: 'View on GitHub'
  }
);
</script>

<template>
  <section class="docs-hero">
    <p class="docs-hero-badge">{{ badge }}</p>
    <h1 class="docs-hero-title">{{ title }}</h1>
    <p class="docs-hero-lede">{{ lede }}</p>

    <div class="docs-hero-actions">
      <a class="docs-hero-button is-primary" :href="primaryHref">{{ primaryText }}</a>
      <a class="docs-hero-button is-secondary" :href="secondaryHref">{{ secondaryText }}</a>
      <a class="docs-hero-button is-secondary" :href="repoHref" target="_blank" rel="noreferrer">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          class="docs-hero-icon"
        >
          <path
            fill="currentColor"
            d="M12 .5a12 12 0 0 0-3.79 23.39c.6.1.82-.26.82-.57v-2.02c-3.34.73-4.05-1.42-4.05-1.42a3.2 3.2 0 0 0-1.33-1.76c-1.08-.75.08-.73.08-.73a2.53 2.53 0 0 1 1.84 1.24 2.58 2.58 0 0 0 3.53 1 2.58 2.58 0 0 1 .77-1.61c-2.67-.3-5.48-1.34-5.48-5.95a4.66 4.66 0 0 1 1.24-3.23 4.34 4.34 0 0 1 .12-3.19s1.01-.32 3.3 1.24a11.46 11.46 0 0 1 6 0c2.29-1.56 3.3-1.24 3.3-1.24a4.34 4.34 0 0 1 .12 3.19 4.66 4.66 0 0 1 1.24 3.23c0 4.63-2.82 5.65-5.5 5.94a2.9 2.9 0 0 1 .83 2.25v3.33c0 .31.22.67.83.56A12 12 0 0 0 12 .5Z"
          />
        </svg>
        {{ repoText }}
      </a>
    </div>

    <div class="docs-hero-install">
      <span class="docs-hero-install-label">Install</span>
      <code>{{ install }}</code>
    </div>
  </section>
</template>

<style scoped>
.docs-hero {
  display: grid;
  gap: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 70%);
  border-radius: 18px;
  padding: clamp(1.1rem, 2vw, 1.5rem);
  background:
    radial-gradient(circle at 5% -20%, color-mix(in srgb, var(--vp-c-brand-1), transparent 75%), transparent 46%),
    radial-gradient(circle at 95% -30%, color-mix(in srgb, var(--vp-c-brand-2), transparent 76%), transparent 48%),
    color-mix(in srgb, var(--vp-c-bg-alt), #ffffff 12%);
}

.docs-hero-badge {
  margin: 0;
  font-family: var(--bp-font-display);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.docs-hero-title {
  margin: 0;
  font-family: var(--bp-font-display);
  font-size: clamp(1.5rem, 3.5vw, 2.15rem);
  line-height: 1.15;
  letter-spacing: -0.015em;
  text-wrap: balance;
}

.docs-hero-lede {
  margin: 0;
  color: var(--vp-c-text-2);
  max-width: 70ch;
}

.docs-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.docs-hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  gap: 0.42rem;
  padding: 0.48rem 0.88rem;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.docs-hero-button:hover {
  transform: translateY(-1px);
}

.docs-hero-button.is-primary {
  background: var(--vp-c-brand-1);
  color: #ffffff;
  box-shadow: 0 8px 18px color-mix(in srgb, var(--vp-c-brand-1), transparent 70%);
}

.docs-hero-button.is-secondary {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg-alt), #ffffff 15%);
}

.docs-hero-icon {
  width: 1rem;
  height: 1rem;
}

.docs-hero-install {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  width: fit-content;
  border-radius: 10px;
  padding: 0.38rem 0.64rem;
  background: color-mix(in srgb, var(--vp-c-bg-soft), #ffffff 10%);
  border: 1px solid var(--vp-c-divider);
}

.docs-hero-install-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

.docs-hero-install code {
  font-size: 0.82rem;
  color: var(--vp-c-text-1);
}
</style>
