// Source - https://stackoverflow.com/a/79741695
// Configuration Metro pour monorepo avec Expo SDK 54+

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Configuration pour transformer les SVG
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  svgTransformerPath: require.resolve('react-native-svg-transformer'),
};

// Configuration pour remplacer les couleurs SVG par des props
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
  resolver: {
    assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
  },
});

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

// Monorepo: watchFolders et nodeModulesPaths uniquement en local (../kidoo-shared existe)
// Sur EAS, le package est dans node_modules → pas de chemins monorepo pour éviter erreurs de bundle
const sharedPath = path.resolve(projectRoot, '../kidoo-shared');
const isMonorepo = fs.existsSync(sharedPath);
if (isMonorepo) {
  config.watchFolders = [monorepoRoot, sharedPath];
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ];
}

// Point d'entrée shared sans Prisma (évite node:buffer en React Native)
// En local : ../kidoo-shared existe. Sur EAS : le package est dans node_modules/@kidoo/shared
const sharedClientEntry = path.join(sharedPath, 'client.ts');

// Configurer les alias pour @shared, @kidoo/shared et @/
// Local (monorepo) : pointer vers ../kidoo-shared/client.ts
// EAS : @kidoo/shared via node_modules ; @shared/@/shared → rediriger vers @kidoo/shared
config.resolver.alias = {
  ...config.resolver?.alias,
  '@': path.resolve(__dirname, 'src'),
  '@/': path.resolve(__dirname, 'src'),
  ...(isMonorepo
    ? {
        '@shared': sharedClientEntry,
        '@/shared': sharedClientEntry,
        '@kidoo/shared': sharedClientEntry,
      }
    : {
        '@shared': '@kidoo/shared',
        '@/shared': '@kidoo/shared',
      }),
};

// Résolution personnalisée pour AppEntry.js qui cherche ../../App
// Dans un monorepo, AppEntry.js est dans node_modules/expo/ à la racine
// et cherche ../../App, mais App.tsx est dans kidoo-app/
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Forcer PubNub à utiliser la build web (standalone, compatible React Native)
  if (moduleName === 'pubnub') {
    const webPath = path.resolve(projectRoot, 'node_modules/pubnub/dist/web/pubnub.min.js');
    if (fs.existsSync(webPath)) {
      return { filePath: webPath, type: 'sourceFile' };
    }
  }

  // Si AppEntry.js cherche ../../App depuis node_modules/expo/
  if (
    moduleName === '../../App' &&
    context.originModulePath &&
    context.originModulePath.includes('node_modules/expo/AppEntry.js')
  ) {
    // Résoudre vers kidoo-app/App.tsx
    const appPath = path.resolve(projectRoot, 'App');
    const extensions = ['tsx', 'ts', 'jsx', 'js'];
    for (const ext of extensions) {
      const fullPath = `${appPath}.${ext}`;
      if (fs.existsSync(fullPath)) {
        return {
          filePath: fullPath,
          type: 'sourceFile',
        };
      }
    }
  }

  // Sinon, utiliser la résolution par défaut
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
