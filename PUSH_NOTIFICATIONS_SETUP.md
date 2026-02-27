# Configuration des Push Notifications (Android)

Pour que les notifications push fonctionnent sur Android, il faut configurer Firebase.

## Étapes

### 1. Créer un projet Firebase

1. Va sur [Firebase Console](https://console.firebase.google.com)
2. Crée un nouveau projet (ou utilise un existant)
3. Clique sur **Ajouter une application** → **Android**

### 2. Enregistrer l'app Android

- **Nom du package Android** : `com.kidooapp` (doit correspondre à app.json)
- Télécharge **google-services.json**
- Place le fichier à la racine de `kidoo-app/` :
  ```
  kidoo-app/
  ├── google-services.json   ← ici
  ├── app.json
  └── ...
  ```

### 3. Rebuild l'app

Après avoir ajouté `google-services.json` :

```bash
npx expo prebuild --clean --platform android
npm run android
```

### 4. (Optionnel) Clé Service Account pour envoyer des push

Pour que ton **serveur** ou **EAS** puisse envoyer des notifications (ex. alerte réveil nocturne), configure une **Google Service Account Key** :

#### Générer la clé

1. [Firebase Console](https://console.firebase.google.com) → ton projet
2. **Paramètres du projet** (⚙️) → **Comptes de service**
3. **Générer une nouvelle clé privée** → enregistre le fichier JSON

#### L’ajouter dans Expo

**Option A – Expo Dashboard (recommandé)**

1. Va sur [expo.dev](https://expo.dev) → ton projet Kidoo
2. **Credentials** (ou **Project settings** → **Credentials**)
3. **Android** → **FCM V1 service account key**
4. **Add a service account key** → upload du fichier JSON

**Option B – Ligne de commande**

```bash
eas credentials
# Android → production → Google Service Account
# → Manage your Google Service Account Key for Push Notifications (FCM V1)
# → Upload a new service account key
```

> ⚠️ Ajoute le fichier JSON à `.gitignore` (il contient des secrets).
