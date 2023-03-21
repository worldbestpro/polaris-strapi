import React from 'react';
import { SWRConfig } from 'swr';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import { AppProvider, CustomProperties, Frame } from '@shopify/polaris';
import { I18nContext, I18nManager, useI18n } from '@shopify/react-i18n';
import translations from '@shopify/polaris/locales/en.json';

import '@shopify/polaris/build/esm/styles.css';
import '@shop3/polaris-markdown/styles/markdown.css';

export const parameters = {
  layout: 'fullscreen',
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    defaultValue: 'en',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', right: '🇺🇸', title: 'English' },
        { value: 'fr', right: '🇫🇷', title: 'Français' },
      ],
    },
  },
};

// eslint-disable-next-line react/prop-types
const Provider = ({ children }) => {
  const [i18n] = useI18n({
    id: 'Polaris',
    fallback: translations,
    async translations(locale) {
      return import(
        /* webpackChunkName: "Polaris-i18n", webpackMode: "lazy-once" */ `@shopify/polaris/locales/${locale}.json`
      ).then((dictionary) => dictionary && dictionary.default);
    },
  });

  return (
    <AppProvider i18n={i18n.translations}>
      <Frame>{children}</Frame>
    </AppProvider>
  );
};

const withProviders = (Story, context) => {
  const locale = context.globals.locale;

  const i18nManager = new I18nManager({
    locale,
    fallbackLocale: 'en',
    onError(error) {
      // eslint-disable-next-line no-console
      console.error(error);
    },
  });

  return (
    <I18nContext.Provider value={i18nManager}>
      <Provider i18n={translations}>
        <SWRConfig
          value={{
            fetcher: (resource, init) => fetch(resource, init).then((res) => res.json()),
          }}
        >
          <Story {...context} />
        </SWRConfig>
      </Provider>
    </I18nContext.Provider>
  );
};

export const decorators = [withProviders, mswDecorator];

initialize({
  serviceWorker: {
    url: process.env.PUBLIC_URL + '/mockServiceWorker.js',
  },
  onUnhandledRequest: 'bypass',
  waitUntilReady: true,
});
