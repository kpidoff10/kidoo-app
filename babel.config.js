const path = require('path');
const fs = require('fs');

const sharedPath = path.resolve(__dirname, '../kidoo-shared');
const sharedExists = fs.existsSync(sharedPath);

module.exports = function (api) {
  api.cache(true);
  const alias = {
    '@': './src',
    ...(sharedExists
      ? {
          '@shared': path.join(sharedPath, 'client.ts'),
          '@/shared': path.join(sharedPath, 'client.ts'),
          '@kidoo/shared': path.join(sharedPath, 'client.ts'),
          '@/shared/*': path.join(sharedPath, '*'),
        }
      : {
          '@shared': '@kidoo/shared',
          '@/shared': '@kidoo/shared',
        }),
  };
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: sharedExists ? ['./src', '../kidoo-shared'] : ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias,
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
