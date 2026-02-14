<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
  createBerryPickrController,
  mountBerryPickrUI,
  type BerryPickrController,
  type BerryPickrUIOptions,
  type BerryPickrUIMount
} from 'berrypickr';
import '../../../../src/styles/base.css';

const anchor = ref<HTMLElement | null>(null);
const eventLog = ref<string[]>([]);
const mode = ref<'popover' | 'inline'>('popover');
const optionsJson = ref(`{
  "formats": ["hex", "rgba", "hsla", "cmyk"],
  "swatches": ["#486DFF", "#FF6D8C", "#3B8F68", "#F6A31A"]
}`);

let controller: BerryPickrController | null = null;
let mount: BerryPickrUIMount | null = null;
const subscriptions: Array<() => void> = [];

const pushLog = (message: string): void => {
  eventLog.value = [`${new Date().toLocaleTimeString()} ${message}`, ...eventLog.value].slice(0, 18);
};

const clearSubscriptions = (): void => {
  while (subscriptions.length) {
    const unsubscribe = subscriptions.pop();
    unsubscribe?.();
  }
};

const destroyCurrent = (): void => {
  clearSubscriptions();
  mount?.destroy({ remove: true });
  controller?.destroy();
  mount = null;
  controller = null;
};

const mountPicker = (): void => {
  if (!anchor.value) {
    return;
  }

  destroyCurrent();

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(optionsJson.value) as Record<string, unknown>;
  } catch {
    pushLog('Invalid JSON options; using defaults.');
  }

  controller = createBerryPickrController({
    defaultValue: '#486DFF',
    ...(parsed as object)
  });

  mount = mountBerryPickrUI(controller, {
    target: anchor.value,
    mode: mode.value
  });

  subscriptions.push(
    controller.on('change', ({ value, source }) => pushLog(`change(${source}) ${value?.to('rgba') ?? 'null'}`)),
    controller.on('commit', ({ value }) => pushLog(`commit ${value?.to('hexa') ?? 'null'}`)),
    controller.on('openChange', ({ open }) => pushLog(`openChange(${open})`)),
    controller.on('pluginError', ({ plugin, phase }) => pushLog(`pluginError(${plugin}:${phase})`))
  );
};

const updateMountOptions = (): void => {
  if (!mount) {
    return;
  }

  const next: Partial<BerryPickrUIOptions> = { mode: mode.value };
  mount.update(next);
};

onMounted(() => {
  mountPicker();
});

onBeforeUnmount(() => {
  destroyCurrent();
});
</script>

<template>
  <div class="BerryPlayground">
    <div class="top">
      <div class="top-copy">
        <p class="eyebrow">Interactive Playground</p>
        <h3>Live Controller + UI Mount</h3>
        <p>Toggle mount mode, edit options, and inspect emitted events.</p>
      </div>
      <div class="controls">
        <label>
          Mode
          <select v-model="mode" @change="updateMountOptions">
            <option value="popover">popover</option>
            <option value="inline">inline</option>
          </select>
        </label>
        <button type="button" @click="mountPicker">Recreate picker</button>
      </div>
    </div>

    <label class="options-label">
      Controller Options JSON
      <textarea v-model="optionsJson" rows="9" spellcheck="false" />
    </label>

    <div class="demo">
      <div class="launch">
        <button ref="anchor" class="anchor" type="button">Open BerryPickr</button>
        <p>Tip: change the options JSON and recreate to test different controller configurations.</p>
      </div>
      <div class="events">
        <strong>Event log</strong>
        <ul>
          <li v-for="entry in eventLog" :key="entry">{{ entry }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.BerryPlayground {
  display: grid;
  gap: 0.85rem;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 72%);
  border-radius: 16px;
  padding: clamp(0.85rem, 2.4vw, 1.1rem);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--vp-c-brand-2), transparent 80%), transparent 55%),
    color-mix(in srgb, var(--vp-c-bg-alt), #ffffff 8%);
}

.top {
  display: grid;
  gap: 0.7rem;
}

.top-copy h3 {
  margin: 0;
  font-size: 1.1rem;
}

.top-copy p {
  margin: 0.22rem 0 0;
}

.eyebrow {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.62rem;
  align-items: end;
}

.controls label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

.controls select,
.controls button,
.options-label textarea,
.anchor {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 55%);
  border-radius: 10px;
  padding: 0.45rem 0.65rem;
  font-size: 0.88rem;
  background: color-mix(in srgb, var(--vp-c-bg-elv), #ffffff 12%);
  color: var(--vp-c-text-1);
}

.controls button,
.anchor {
  cursor: pointer;
  font-weight: 600;
}

.controls button {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.options-label {
  display: grid;
  gap: 0.33rem;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

.options-label textarea {
  width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  resize: vertical;
  min-height: 170px;
}

.demo {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(240px, 2fr);
  gap: 0.8rem;
}

.launch {
  display: grid;
  gap: 0.55rem;
}

.events {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 74%);
  border-radius: 12px;
  padding: 0.65rem;
  background: color-mix(in srgb, var(--vp-c-bg-elv), #ffffff 11%);
}

.events strong {
  font-size: 0.85rem;
}

.events ul {
  margin: 0.5rem 0 0;
  padding-left: 1rem;
  max-height: 210px;
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.8rem;
}

@media (max-width: 760px) {
  .demo {
    grid-template-columns: 1fr;
  }

  .launch p {
    margin: 0;
  }
}
</style>
