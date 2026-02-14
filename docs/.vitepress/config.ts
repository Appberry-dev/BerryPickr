import { defineConfig } from 'vitepress';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from '../../package.json';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    base: '/BerryPickr/',
    title: 'BerryPickr',
    description:
        'Headless color controller + skinnable UI picker for modern website builders and apps.',
    lastUpdated: true,
    themeConfig: {
        nav: [
            {
                text: 'Start',
                items: [
                    { text: 'Home', link: '/' },
                    { text: 'Quickstart', link: '/quickstart' },
                    { text: 'Concepts', link: '/concepts' }
                ]
            },
            {
                text: 'Guides',
                items: [
                    { text: 'Controller', link: '/controller' },
                    { text: 'UI Mount', link: '/ui-mount' },
                    { text: 'Bindings', link: '/bindings' },
                    { text: 'Integrations', link: '/integrations' },
                    { text: 'Plugins', link: '/plugins' },
                    { text: 'Styling', link: '/styling' }
                ]
            },
            {
                text: 'Reference',
                items: [
                    { text: 'API Index', link: '/api' },
                    { text: 'Recipes', link: '/recipes' },
                    { text: 'Troubleshooting', link: '/troubleshooting' }
                ]
            }
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/Appberry-dev/BerryPickr' }],
        sidebar: [
            {
                text: 'Start',
                items: [
                    { text: 'Home', link: '/' },
                    { text: 'Quickstart', link: '/quickstart' },
                    { text: 'Concepts', link: '/concepts' }
                ]
            },
            {
                text: 'Guides',
                items: [
                    { text: 'Controller', link: '/controller' },
                    { text: 'UI Mount', link: '/ui-mount' },
                    { text: 'Bindings', link: '/bindings' },
                    { text: 'Integrations', link: '/integrations' },
                    { text: 'Plugins', link: '/plugins' },
                    { text: 'Styling', link: '/styling' }
                ]
            },
            {
                text: 'Quality',
                items: [
                    { text: 'Accessibility', link: '/accessibility' },
                    { text: 'Troubleshooting', link: '/troubleshooting' },
                    { text: 'FAQ', link: '/faq' }
                ]
            },
            {
                text: 'Reference',
                items: [
                    { text: 'API Index', link: '/api' },
                    { text: 'Recipes', link: '/recipes' }
                ]
            }
        ],
        footer: {
            message:
                'Built by <a href="https://appberry.dev" target="_blank" rel="noreferrer">AppBerry</a> · <a href="https://github.com/Appberry-dev/BerryPickr" target="_blank" rel="noreferrer">GitHub repository</a>.',
            copyright: 'Provided under the Apache License 2.0.'
        }
    },
    vite: {
        define: {
            __BERRYPICKR_VERSION__: JSON.stringify(pkg.version)
        },
        resolve: {
            alias: {
                berrypickr: path.resolve(dirname, '../../src/index.ts')
            }
        }
    }
});
