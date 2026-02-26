/**
 * Prépare le projet pour EAS Build en incluant kidoo-shared.
 * EAS n'inclut pas les dossiers frères (../kidoo-shared) dans l'archive.
 * On utilise npm pack pour créer un .tgz que npm install gère correctement.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const sharedSource = path.resolve(projectRoot, '..', 'kidoo-shared');
const packageJsonPath = path.join(projectRoot, 'package.json');

function runEasBuild(profile = 'production') {
  console.log('\n🚀 Lancement de EAS Build...\n');
  let exitCode = 0;
  try {
    execSync(`eas build --platform android --profile ${profile}`, {
      stdio: 'inherit',
      cwd: projectRoot,
    });
  } catch (err) {
    exitCode = err.status ?? 1;
  } finally {
    console.log('\n🔄 Restauration après le build...');
    doRestore();
    console.log('✅ Restauration terminée.');
  }
  if (exitCode !== 0) process.exit(exitCode);
}

function doPrepare() {
  if (!fs.existsSync(sharedSource)) {
    console.error('❌ kidoo-shared non trouvé à:', sharedSource);
    process.exit(1);
  }

  // npm pack crée un .tgz que npm install gère mieux qu'un dossier file:
  console.log('✓ Création du package kidoo-shared...');
  execSync('npm pack', { cwd: sharedSource, stdio: 'pipe' });

  const sharedPkg = JSON.parse(fs.readFileSync(path.join(sharedSource, 'package.json'), 'utf8'));
  const tgzName = `kidoo-shared-${sharedPkg.version}.tgz`;
  const tgzSource = path.join(sharedSource, tgzName);
  const tgzDest = path.join(projectRoot, tgzName);

  if (!fs.existsSync(tgzSource)) {
    console.error('❌ npm pack n\'a pas créé', tgzName);
    process.exit(1);
  }
  fs.copyFileSync(tgzSource, tgzDest);
  fs.unlinkSync(tgzSource);
  console.log('✓', tgzName, 'copié dans le projet');

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const originalDep = pkg.dependencies['@kidoo/shared'];
  if (originalDep === 'file:../kidoo-shared') {
    pkg.dependencies['@kidoo/shared'] = `file:./${tgzName}`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    fs.writeFileSync(
      path.join(projectRoot, '.eas-build-package.json.bak'),
      JSON.stringify({ '@kidoo/shared': originalDep, tgzName })
    );
    console.log('✓ package.json mis à jour');
  }
}

function doRestore() {
  const bakPath = path.join(projectRoot, '.eas-build-package.json.bak');
  const sharedDirInApp = path.join(projectRoot, 'kidoo-shared');

  if (fs.existsSync(sharedDirInApp) && fs.statSync(sharedDirInApp).isDirectory()) {
    fs.rmSync(sharedDirInApp, { recursive: true });
    console.log('✓ kidoo-shared supprimé');
  }

  if (fs.existsSync(bakPath)) {
    const bak = JSON.parse(fs.readFileSync(bakPath, 'utf8'));
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    pkg.dependencies['@kidoo/shared'] = bak['@kidoo/shared'];
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
    if (bak.tgzName) {
      const tgzPath = path.join(projectRoot, bak.tgzName);
      if (fs.existsSync(tgzPath)) {
        fs.unlinkSync(tgzPath);
        console.log('✓', bak.tgzName, 'supprimé');
      }
    }
    fs.unlinkSync(bakPath);
    console.log('✓ package.json restauré');
  }
}

function main() {
  const command = process.argv[2] || 'prepare'; // prepare | restore | build
  const profile = process.argv[3] || 'production'; // production | preview

  if (command === 'build') {
    console.log('📦 Préparation EAS Build...\n');
    doPrepare();
    runEasBuild(profile);
    return;
  }

  if (command === 'prepare') {
    console.log('📦 Préparation EAS Build: inclusion de kidoo-shared...\n');
    doPrepare();
    console.log('\n✅ Prêt pour EAS Build. Lancez: npm run build:apk');
  } else if (command === 'restore') {
    console.log('🔄 Restauration...\n');
    doRestore();
    console.log('\n✅ Restauration terminée.');
  }
}

main();
