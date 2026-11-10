import ReactDOM from 'react-dom/client';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '../styles/tokens.css';
import { chatgptAdapter } from '../adapters/chatgpt';
import type { SiteAdapter } from '../adapters/types';
import { App } from '../components/App';

const ADAPTERS: SiteAdapter[] = [chatgptAdapter];

export default defineContentScript({
  matches: ['https://chatgpt.com/*'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const adapter = ADAPTERS.find((a) => a.matches(new URL(location.href)));
    if (!adapter) return;

    const ui = await createShadowRootUi(ctx, {
      name: 'tictic-tokn',
      position: 'inline',
      anchor: 'body',
      append: 'last',
      isolateEvents: true,
      onMount(container) {
        const root = ReactDOM.createRoot(container);
        root.render(<App adapter={adapter} />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });
    ui.mount();
  },
});
