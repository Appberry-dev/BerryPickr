import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import BerryPlayground from './components/BerryPlayground.vue';
import DocsCallout from './components/DocsCallout.vue';
import DocsFeatureCards from './components/DocsFeatureCards.vue';
import DocsHero from './components/DocsHero.vue';
import PluginLiveDemos from './components/PluginLiveDemos.vue';
import './style.css';

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('BerryPlayground', BerryPlayground);
    app.component('DocsHero', DocsHero);
    app.component('DocsFeatureCards', DocsFeatureCards);
    app.component('DocsCallout', DocsCallout);
    app.component('PluginLiveDemos', PluginLiveDemos);
  }
};

export default theme;
