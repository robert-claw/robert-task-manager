import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load and merge message modules
  const common = (await import(`../messages/${locale}/common.json`)).default;
  const tasks = (await import(`../messages/${locale}/tasks.json`)).default;

  return {
    locale,
    messages: {
      common,
      tasks
    }
  };
});
