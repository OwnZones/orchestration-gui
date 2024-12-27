/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  experimental: {},
  i18n: {
    locales: ['en', 'sv'],
    defaultLocale: 'en',
    localeDetection: false
  }
};
