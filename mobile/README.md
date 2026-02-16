# Gym App Mobile - React Native

App móvil para iOS y Android con React Native + Expo.

## 🚀 Inicio Rápido

### 1. Instalar Expo Go en tu teléfono

- **iOS**: [Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: [Expo Go en Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Configurar la API

**IMPORTANTE**: Antes de ejecutar la app, debes configurar la URL de tu backend.

Edita `src/services/api.ts` y cambia `API_BASE_URL`:

```typescript
// Si pruebas en el simulador de iOS
const API_BASE_URL = 'http://localhost:8080';

// Si pruebas en un dispositivo físico, usa la IP de tu computadora
// Para encontrar tu IP:
// - Mac/Linux: ejecuta `ifconfig | grep "inet "`
// - Windows: ejecuta `ipconfig`
const API_BASE_URL = 'http://192.168.1.100:8080'; // Reemplaza con tu IP
```

### 3. Iniciar el backend

Asegúrate de que el backend de Go esté corriendo:

```bash
cd ..
go run cmd/server/main.go
```

### 4. Iniciar la app

```bash
npm start
```

Esto abrirá Expo DevTools. Verás un código QR.

### 5. Abrir en tu teléfono

1. Abre **Expo Go** en tu teléfono
2. Escanea el código QR:
   - **iOS**: Usa la cámara del iPhone
   - **Android**: Usa el escáner dentro de Expo Go

¡La app se cargará en tu teléfono!

## 📱 Funcionalidades Implementadas

### ✅ Autenticación
- Login con ID de usuario
- Registro de nuevos usuarios
- Persistencia de sesión con AsyncStorage

### ✅ Rutinas
- Generación de rutinas con IA (Claude API)
- Visualización de rutina activa
- Detalle de cada día de entrenamiento

### ✅ Workouts
- Registro de entrenamientos
- Seguimiento de series, peso y repeticiones
- Historial de entrenamientos completados

## 🎨 Estructura del Proyecto

```
mobile/
├── src/
│   ├── screens/          # Pantallas de la app
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DayDetailScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── contexts/         # Contextos de React (Auth)
│   ├── services/         # API y servicios
│   ├── types/            # TypeScript types
│   └── components/       # Componentes reutilizables
├── App.tsx               # Navegación principal
└── package.json
```

## 🔧 Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm start

# Iniciar y abrir en simulador de iOS
npm run ios

# Iniciar y abrir en emulador de Android
npm run android

# Limpiar caché de Expo
npm start -- --clear
```

## 📝 Notas

### Testing en Dispositivo Físico

Si pruebas en un teléfono real, asegúrate de:

1. **Estar en la misma red WiFi** que tu computadora
2. Cambiar `API_BASE_URL` a la IP de tu computadora
3. El backend debe estar corriendo en tu computadora

### Simuladores

- **iOS**: Requiere Mac con Xcode instalado
- **Android**: Requiere Android Studio con emulador configurado

### Hot Reload

Expo tiene hot reload automático. Cuando guardes cambios en el código, la app se actualizará automáticamente en tu teléfono.

## 🐛 Troubleshooting

### "Network request failed"

- Verifica que el backend esté corriendo
- Asegúrate de usar la IP correcta (no `localhost` en dispositivos físicos)
- Verifica que estés en la misma red WiFi

### "Unable to resolve module"

```bash
npm start -- --clear
```

### CORS errors

Ya está configurado en el backend, pero si tienes problemas verifica que `cmd/server/main.go` tenga el middleware CORS.

## 🚧 Por Hacer

- [ ] Gráficas de progreso de peso
- [ ] Notificaciones push para recordar entrenamientos
- [ ] Modo offline
- [ ] Editar/eliminar rutinas
- [ ] Calendario de entrenamientos
- [ ] Estadísticas avanzadas
