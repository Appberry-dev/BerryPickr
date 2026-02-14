<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  createBerryPickrController,
  type BerryPickrController,
  type BerryPickrPlugin,
  type BerryPickrPluginErrorPolicy
} from 'berrypickr';

const MAX_LOG_ENTRIES = 10;

const withTimestamp = (message: string): string => `${new Date().toLocaleTimeString()} ${message}`;
const appendLog = (entries: string[], message: string): string[] =>
  [withTimestamp(message), ...entries].slice(0, MAX_LOG_ENTRIES);
const toErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const lifecycleSetupCount = ref(0);
const lifecycleTeardownCount = ref(0);
const lifecycleObservedUpdates = ref(0);
const lifecycleLog = ref<string[]>([]);
let lifecycleController: BerryPickrController | null = null;
let lifecycleFlip = false;

const pushLifecycleLog = (message: string): void => {
  lifecycleLog.value = appendLog(lifecycleLog.value, message);
};

const destroyLifecycleDemo = (): void => {
  if (!lifecycleController) {
    return;
  }

  lifecycleController.destroy();
  lifecycleController = null;
  pushLifecycleLog('controller destroyed');
};

const initializeLifecycleDemo = (): void => {
  destroyLifecycleDemo();

  const lifecyclePlugin: BerryPickrPlugin = {
    name: 'lifecycle-demo',
    setup(context) {
      lifecycleSetupCount.value += 1;
      pushLifecycleLog('setup() called');

      const unsubscribe = context.subscribe(() => {
        lifecycleObservedUpdates.value += 1;
      });

      return () => {
        unsubscribe();
        lifecycleTeardownCount.value += 1;
        pushLifecycleLog('teardown() called');
      };
    },
    onChange(event) {
      pushLifecycleLog(`onChange(${event.source}) -> ${event.value?.to('hexa') ?? 'null'}`);
    }
  };

  lifecycleController = createBerryPickrController({
    defaultValue: '#486DFF',
    plugins: [lifecyclePlugin],
    pluginErrorPolicy: 'emit'
  });

  pushLifecycleLog('controller initialized');
};

const triggerLifecycleChange = (): void => {
  if (!lifecycleController) {
    pushLifecycleLog('initialize first');
    return;
  }

  lifecycleFlip = !lifecycleFlip;
  const nextValue = lifecycleFlip ? '#FF6D8C' : '#3B8F68';
  lifecycleController.setValue(nextValue, { source: 'api' });
};

const telemetryColor = ref('#486DFF');
const telemetryChangeCount = ref(0);
const telemetryCommitCount = ref(0);
const telemetryLastChange = ref('none');
const telemetryLastCommit = ref('none');
const telemetryLog = ref<string[]>([]);
let telemetryController: BerryPickrController | null = null;

const pushTelemetryLog = (message: string): void => {
  telemetryLog.value = appendLog(telemetryLog.value, message);
};

const destroyTelemetryDemo = (): void => {
  if (!telemetryController) {
    return;
  }

  telemetryController.destroy();
  telemetryController = null;
};

const initializeTelemetryDemo = (): void => {
  destroyTelemetryDemo();
  telemetryChangeCount.value = 0;
  telemetryCommitCount.value = 0;
  telemetryLastChange.value = 'none';
  telemetryLastCommit.value = 'none';
  telemetryLog.value = [];

  const telemetryPlugin: BerryPickrPlugin = {
    name: 'telemetry-demo',
    onChange(event) {
      telemetryChangeCount.value += 1;
      telemetryLastChange.value = `${event.source} ${event.transactionId} ${event.value?.to('hexa') ?? 'null'}`;
      pushTelemetryLog(`onChange captured ${event.transactionId}`);
    },
    onCommit(event) {
      telemetryCommitCount.value += 1;
      telemetryLastCommit.value = `${event.source} ${event.transactionId} ${event.value?.to('hexa') ?? 'null'}`;
      pushTelemetryLog(`onCommit captured ${event.transactionId}`);
    }
  };

  telemetryController = createBerryPickrController({
    defaultValue: telemetryColor.value,
    plugins: [telemetryPlugin],
    pluginErrorPolicy: 'emit'
  });

  pushTelemetryLog('controller initialized');
};

const applyTelemetryChange = (): void => {
  if (!telemetryController) {
    pushTelemetryLog('controller unavailable');
    return;
  }

  telemetryController.setValue(telemetryColor.value, { source: 'api' });
};

const commitTelemetryChange = (): void => {
  if (!telemetryController) {
    pushTelemetryLog('controller unavailable');
    return;
  }

  const transactionId = telemetryController.commit({ source: 'commit' });
  pushTelemetryLog(`commit() called ${transactionId ?? 'null'}`);
};

const errorPolicy = ref<BerryPickrPluginErrorPolicy>('emit');
const errorLog = ref<string[]>([]);
const errorPluginEventCount = ref(0);
let errorController: BerryPickrController | null = null;

const pushErrorLog = (message: string): void => {
  errorLog.value = appendLog(errorLog.value, message);
};

const destroyErrorPolicyDemo = (): void => {
  if (!errorController) {
    return;
  }

  errorController.destroy();
  errorController = null;
};

const initializeErrorPolicyDemo = (): void => {
  destroyErrorPolicyDemo();
  errorPluginEventCount.value = 0;
  errorLog.value = [];

  const failingPlugin: BerryPickrPlugin = {
    name: 'failing-demo',
    onCommit() {
      throw new Error('Intentional failing-demo onCommit error');
    }
  };

  errorController = createBerryPickrController({
    defaultValue: '#3355EE',
    plugins: [failingPlugin],
    pluginErrorPolicy: errorPolicy.value
  });

  errorController.on('pluginError', ({ plugin, phase, error }) => {
    errorPluginEventCount.value += 1;
    pushErrorLog(`pluginError(${plugin}:${phase}) ${toErrorMessage(error)}`);
  });

  pushErrorLog(`controller initialized with policy=${errorPolicy.value}`);
};

const runErrorPolicyCommit = (): void => {
  if (!errorController) {
    initializeErrorPolicyDemo();
  }

  if (!errorController) {
    return;
  }

  try {
    errorController.commit({ source: 'commit' });
    pushErrorLog('commit() completed without throw');
  } catch (error) {
    pushErrorLog(`caught throw: ${toErrorMessage(error)}`);
  }
};

watch(errorPolicy, () => {
  initializeErrorPolicyDemo();
});

onMounted(() => {
  initializeLifecycleDemo();
  initializeTelemetryDemo();
  initializeErrorPolicyDemo();
});

onBeforeUnmount(() => {
  destroyLifecycleDemo();
  destroyTelemetryDemo();
  destroyErrorPolicyDemo();
});
</script>

<template>
  <div class="PluginLiveDemos">
    <section class="demo-panel">
      <div class="panel-header">
        <p class="eyebrow">Lifecycle</p>
        <h3>`setup` + teardown behavior</h3>
        <p>Initialize and destroy the controller to verify plugin setup and cleanup flow.</p>
      </div>

      <div class="controls">
        <button type="button" @click="initializeLifecycleDemo">Initialize</button>
        <button type="button" @click="triggerLifecycleChange">Trigger change</button>
        <button type="button" class="muted" @click="destroyLifecycleDemo">Destroy</button>
      </div>

      <div class="metrics">
        <p><strong>setup count</strong> {{ lifecycleSetupCount }}</p>
        <p><strong>teardown count</strong> {{ lifecycleTeardownCount }}</p>
        <p><strong>setup subscription updates</strong> {{ lifecycleObservedUpdates }}</p>
      </div>

      <div class="log">
        <strong>Lifecycle log</strong>
        <ul>
          <li v-for="(entry, index) in lifecycleLog" :key="`lifecycle-${index}`">{{ entry }}</li>
        </ul>
      </div>
    </section>

    <section class="demo-panel">
      <div class="panel-header">
        <p class="eyebrow">Telemetry</p>
        <h3>`onChange` vs `onCommit`</h3>
        <p>Apply live edits and explicit commits to compare telemetry payloads.</p>
      </div>

      <div class="controls">
        <label>
          Value
          <input v-model="telemetryColor" type="color" />
        </label>
        <button type="button" @click="applyTelemetryChange">Apply change</button>
        <button type="button" @click="commitTelemetryChange">Commit</button>
      </div>

      <div class="metrics">
        <p><strong>change events</strong> {{ telemetryChangeCount }}</p>
        <p><strong>commit events</strong> {{ telemetryCommitCount }}</p>
      </div>

      <p class="summary"><strong>Last change</strong> {{ telemetryLastChange }}</p>
      <p class="summary"><strong>Last commit</strong> {{ telemetryLastCommit }}</p>

      <div class="log">
        <strong>Telemetry log</strong>
        <ul>
          <li v-for="(entry, index) in telemetryLog" :key="`telemetry-${index}`">{{ entry }}</li>
        </ul>
      </div>
    </section>

    <section class="demo-panel">
      <div class="panel-header">
        <p class="eyebrow">Error Policy</p>
        <h3>`pluginErrorPolicy` behavior</h3>
        <p>The demo plugin throws on commit so you can compare `emit` and `throw` outcomes.</p>
      </div>

      <div class="controls">
        <label>
          Policy
          <select v-model="errorPolicy">
            <option value="emit">emit</option>
            <option value="throw">throw</option>
          </select>
        </label>
        <button type="button" @click="runErrorPolicyCommit">Commit test</button>
      </div>

      <div class="metrics">
        <p><strong>pluginError events</strong> {{ errorPluginEventCount }}</p>
      </div>

      <div class="log">
        <strong>Error policy log</strong>
        <ul>
          <li v-for="(entry, index) in errorLog" :key="`error-${index}`">{{ entry }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.PluginLiveDemos {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.demo-panel {
  display: grid;
  gap: 0.72rem;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 70%);
  border-radius: 14px;
  padding: clamp(0.82rem, 2.2vw, 1rem);
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--vp-c-brand-2), transparent 84%), transparent 58%),
    color-mix(in srgb, var(--vp-c-bg-elv), #ffffff 10%);
}

.panel-header h3 {
  margin: 0;
  font-size: 1.04rem;
}

.panel-header p {
  margin: 0.2rem 0 0;
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
  gap: 0.55rem;
  align-items: end;
}

.controls label {
  display: grid;
  gap: 0.24rem;
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

.controls button,
.controls select,
.controls input {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 55%);
  border-radius: 10px;
  padding: 0.42rem 0.62rem;
  font-size: 0.88rem;
  background: color-mix(in srgb, var(--vp-c-bg-soft), #ffffff 10%);
  color: var(--vp-c-text-1);
}

.controls button {
  cursor: pointer;
  font-weight: 600;
  background: var(--vp-c-brand-1);
  color: #fff;
}

.controls button.muted {
  background: color-mix(in srgb, var(--vp-c-bg-soft), #ffffff 10%);
  color: var(--vp-c-text-1);
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.metrics p {
  margin: 0;
  padding: 0.36rem 0.58rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 72%);
  background: color-mix(in srgb, var(--vp-c-bg-soft), #ffffff 10%);
  font-size: 0.86rem;
}

.summary {
  margin: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
}

.log {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1), #ffffff 74%);
  border-radius: 11px;
  padding: 0.6rem;
  background: color-mix(in srgb, var(--vp-c-bg-soft), #ffffff 8%);
}

.log strong {
  font-size: 0.84rem;
}

.log ul {
  margin: 0.45rem 0 0;
  padding-left: 1rem;
  max-height: 185px;
  overflow: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.78rem;
}

@media (max-width: 760px) {
  .controls {
    align-items: stretch;
  }
}
</style>
