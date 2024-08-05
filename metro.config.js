// This replaces `const { getDefaultConfig } = require('expo/metro-config');`
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

// This replaces `const config = getDefaultConfig(__dirname);`
const config = getSentryExpoConfig(__dirname)

const { transformer, resolver } = config

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
}
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
}

module.exports = config
