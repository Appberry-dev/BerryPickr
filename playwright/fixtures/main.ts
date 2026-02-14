import { createBerryPickrController, mountBerryPickrUI } from '../../src/index';
import '../../src/styles/base.css';

const result = document.querySelector<HTMLElement>('#result');

const controller = createBerryPickrController({
  defaultValue: '#486DFF',
  formats: ['hex', 'rgba', 'hsla'],
  swatches: ['#486DFF', '#FF6D8C', '#3B8F68']
});

const mount = mountBerryPickrUI(controller, {
  target: '#berryPickr-target'
});

controller.on('change', ({ value }) => {
  if (result) {
    result.textContent = value?.to('rgba') ?? 'null';
  }
});

const integrationRoot = document.querySelector<HTMLElement>('#integration-root');
const integrationCleanup: Array<() => void> = [];

const cleanupIntegrations = (): void => {
  while (integrationCleanup.length) {
    const teardown = integrationCleanup.pop();
    teardown?.();
  }

  if (integrationRoot) {
    integrationRoot.innerHTML = '';
  }
};

const createIframeIntegration = async (): Promise<boolean> => {
  cleanupIntegrations();
  if (!integrationRoot) {
    return false;
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'bp-test-iframe';
  iframe.style.width = '500px';
  iframe.style.height = '240px';
  iframe.srcdoc = `
    <!doctype html>
    <html>
      <body style="margin: 16px; font-family: sans-serif;">
        <button id="iframe-target" type="button">Iframe picker</button>
      </body>
    </html>
  `;
  integrationRoot.appendChild(iframe);

  await new Promise<void>((resolve) => {
    iframe.addEventListener('load', () => resolve(), { once: true });
  });

  const iframeDoc = iframe.contentDocument;
  const target = iframeDoc?.querySelector<HTMLElement>('#iframe-target');
  if (!iframeDoc || !target) {
    return false;
  }

  const iframeController = createBerryPickrController({ defaultValue: '#3355AA' });
  const iframeMount = mountBerryPickrUI(iframeController, {
    target,
    container: iframeDoc.body
  });

  integrationCleanup.push(() => {
    iframeMount.destroy({ remove: true });
    iframeController.destroy();
  });

  Object.assign(window, { iframeController, iframeMount });
  return true;
};

const createShadowIntegration = (): boolean => {
  cleanupIntegrations();
  if (!integrationRoot) {
    return false;
  }

  const host = document.createElement('div');
  host.id = 'bp-test-shadow-host';
  integrationRoot.appendChild(host);

  const root = host.attachShadow({ mode: 'open' });
  const layer = document.createElement('div');
  layer.className = 'overlay-layer';
  const target = document.createElement('button');
  target.id = 'shadow-target';
  target.type = 'button';
  target.textContent = 'Shadow picker';
  const outside = document.createElement('button');
  outside.id = 'shadow-outside';
  outside.type = 'button';
  outside.textContent = 'Outside';
  root.append(target, outside, layer);

  const shadowController = createBerryPickrController({ defaultValue: '#6633AA' });
  const shadowMount = mountBerryPickrUI(shadowController, {
    target,
    container: layer
  });

  integrationCleanup.push(() => {
    shadowMount.destroy({ remove: true });
    shadowController.destroy();
  });

  Object.assign(window, {
    shadowController,
    shadowMount,
    shadowOutside: outside
  });
  return true;
};

Object.assign(window, {
  controller,
  mount,
  createIframeIntegration,
  createShadowIntegration,
  cleanupIntegrations
});
