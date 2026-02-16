# 🚀 Guía de Deployment - Gym App

## Flujo completo: Backend → Railway + App → Stores

---

## 📦 Parte 1: Deploy del Backend en Railway

### Paso 1: Preparar el proyecto

Railway detecta automáticamente proyectos Go. Solo necesitas:

```bash
# Asegúrate de que tu go.mod esté actualizado
cd /Users/andresramirez/gym-app
go mod tidy
```

### Paso 2: Crear cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Sign up con GitHub
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Conecta tu repositorio

### Paso 3: Configurar variables de entorno

En Railway Dashboard → Variables:

```bash
# Database (Railway provee PostgreSQL gratis)
DB_HOST=<railway-postgres-host>
DB_PORT=5432
DB_USER=<railway-user>
DB_PASSWORD=<railway-password>
DB_NAME=railway
DB_SSL_MODE=require

# Server
SERVER_PORT=8080

# Claude API
CLAUDE_API_KEY=tu_api_key_aqui
```

### Paso 4: Deploy automático

Railway detectará tu `cmd/server/main.go` y:
- ✅ Instalará dependencias
- ✅ Compilará el proyecto
- ✅ Ejecutará el servidor

**Tu API estará disponible en:**
```
https://gym-app-production.up.railway.app
```

### Paso 5: Ejecutar migraciones

En Railway Shell:
```bash
psql $DATABASE_URL -f migrations/001_init_schema.sql
```

---

## 📱 Parte 2: Configurar App Mobile para Production

### Paso 1: Actualizar URL del backend

Edita `mobile/src/config/environment.ts`:

```typescript
const ENV: Environment = 'production'; // ← Cambiar a 'production'

const config = {
  production: {
    API_URL: 'https://gym-app-production.up.railway.app', // ← Tu URL de Railway
    USE_MOCK_API: false,
  },
};
```

### Paso 2: Quitar banner de prueba (opcional)

Edita `mobile/src/screens/HomeScreen.tsx` y comenta/elimina:

```typescript
{/* Banner de modo prueba */}
<View style={styles.banner}>
  <Text style={styles.bannerText}>
    🧪 MODO PRUEBA - Usando datos de ejemplo
  </Text>
</View>
```

### Paso 3: Actualizar versiones y metadata

Edita `mobile/app.json`:

```json
{
  "expo": {
    "name": "Gym App",
    "slug": "gym-app",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.tuempresa.gymapp",
      "supportsTablet": true
    },
    "android": {
      "package": "com.tuempresa.gymapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

## 📲 Parte 3: Crear Build APK/IPA

### Opción A: Build con EAS (Recomendado)

```bash
cd mobile

# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build para Android (APK para testing)
eas build --platform android --profile preview

# Build para iOS
eas build --platform ios --profile preview
```

Recibirás un link para descargar el APK/IPA cuando termine (15-20 min).

### Opción B: Build local (más rápido pero requiere setup)

**Para Android:**
```bash
cd mobile
expo prebuild
cd android
./gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🏪 Parte 4: Publicar en Stores

### Google Play Store

1. **Crear cuenta de desarrollador**: $25 one-time
2. **Crear app en Play Console**
3. **Build para producción**:
   ```bash
   eas build --platform android --profile production
   ```
4. **Upload** del AAB a Play Console
5. **Completar metadata**: screenshots, descripción, etc.
6. **Submit** para review (1-3 días)

### Apple App Store

1. **Cuenta de desarrollador**: $99/año
2. **Crear app en App Store Connect**
3. **Build para producción**:
   ```bash
   eas build --platform ios --profile production
   ```
4. **Upload** con Transporter o Xcode
5. **Completar metadata**
6. **Submit** para review (1-7 días)

---

## 🔄 Workflow de Desarrollo → Producción

### Desarrollo (Local)
```
environment.ts → ENV = 'development'
API_URL = 'http://localhost:8080'
USE_MOCK_API = true
```

### Testing (con Railway)
```
environment.ts → ENV = 'production'
API_URL = 'https://gym-app-production.up.railway.app'
USE_MOCK_API = false
```

### Producción (Stores)
```
Mismo que testing + Build con EAS
```

---

## 📊 Opciones de Distribución

### 1. **Internal Testing** (más rápido)

Distribuye el APK directamente:
```bash
# Build APK
eas build --platform android --profile preview

# Comparte el link de descarga con testers
```

### 2. **TestFlight** (iOS)

```bash
# Build para iOS
eas build --platform ios --profile preview

# Invita testers por email en App Store Connect
```

### 3. **Expo Updates** (OTA - Over The Air)

Puedes actualizar JavaScript sin rebuild:
```bash
# Publicar update
eas update --branch production

# Los usuarios recibirán el update al abrir la app
```

---

## 🎯 Checklist Final

Antes de publicar, verifica:

- [ ] Backend deployado y funcionando en Railway
- [ ] Base de datos migrada correctamente
- [ ] App conectada a URL de producción
- [ ] Banner de "modo prueba" eliminado
- [ ] Iconos y splash screen personalizados
- [ ] Version y versionCode actualizados
- [ ] Testeado en dispositivos reales
- [ ] Screenshots para las stores
- [ ] Descripción y metadata completada
- [ ] Política de privacidad creada

---

## 💡 Tips

1. **Usa environment.ts** para cambiar entre dev/prod fácilmente
2. **TestFlight/Internal Testing** antes de publicar oficialmente
3. **Railway logs** para debugear problemas de backend
4. **Sentry/Crashlytics** para monitorear errores en producción
5. **Expo Updates** para hotfixes sin esperar review

---

## 🆘 Problemas comunes

### "Network request failed"
- ✅ Verifica que Railway esté corriendo
- ✅ Checa que API_URL sea correcta
- ✅ Asegúrate de que USE_MOCK_API = false

### "CORS error"
- ✅ Backend ya tiene CORS habilitado
- ✅ Verifica que la URL en environment.ts sea exacta

### "Database connection failed"
- ✅ Checa variables de entorno en Railway
- ✅ SSL debe estar habilitado para Railway Postgres

---

**¿Listo para deployar? ¿Con cuál paso quieres empezar?**

1. Backend en Railway
2. Build de la app mobile
3. Ambos
