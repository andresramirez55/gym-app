# 🚀 Cómo Probar la App Gym Mobile

## Opción 1: En tu iPhone/Android (RECOMENDADO)

### Paso 1: Descargar Expo Go
- **iPhone**: https://apps.apple.com/app/expo-go/id982107779
- **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

### Paso 2: Abrir una nueva terminal y ejecutar:
```bash
cd /Users/andresramirez/gym-app/mobile
npx expo start
```

### Paso 3: Escanear el QR
- Verás un código QR en la terminal
- **iPhone**: Abre la cámara y escanea el QR
- **Android**: Abre Expo Go y escanea el QR

¡Listo! La app se abrirá en tu teléfono.

---

## Opción 2: En el Simulador de iOS (solo Mac)

### Requiere Xcode instalado

```bash
cd /Users/andresramirez/gym-app/mobile
npx expo start
```

Luego presiona `i` en la terminal para abrir en el simulador de iOS.

---

## Opción 3: Ver screenshots de cómo se ve

Si solo quieres ver cómo quedó la UI sin instalar nada, puedo:
1. Crear un video/gif mostrando la app
2. Tomar screenshots de cada pantalla
3. Crear una demo web simplificada

---

## 🎨 Lo que verás en la app:

### Pantalla 1: Login/Registro
- Título "💪 Gym App"
- 2 opciones: Login o Registro
- Formulario de registro con:
  - Nombre
  - Email
  - Objetivo (4 opciones: Ganar Músculo, Perder Peso, Fuerza, Resistencia)
  - Días por semana (3, 4 o 5)

### Pantalla 2: Home
- Banner amarillo "MODO PRUEBA"
- Saludo: "Hola, Juan Pérez! 👋"
- Botón "✨ Generar Rutina con IA"
- 5 días de entrenamiento:
  - Día 1 - Pecho y Tríceps (5 ejercicios)
  - Día 2 - Espalda y Bíceps (4 ejercicios)
  - Día 3 - Piernas (4 ejercicios)
  - Día 4 - Hombros (3 ejercicios)
  - Día 5 - Full Body (3 ejercicios)

### Pantalla 3: Día de Entrenamiento
- Lista de ejercicios con sets, reps y descanso
- Formulario para registrar cada serie:
  - Peso (kg)
  - Repeticiones
- Botón "✓ Finalizar Entrenamiento"

### Pantalla 4: Historial
- 2 entrenamientos de ejemplo
- Cada uno muestra:
  - Fecha
  - Duración
  - Ejercicios con peso y reps

---

## ¿Problemas?

### "Network request failed"
- La app está en modo PRUEBA con datos mock
- No necesitas el backend corriendo
- Si ves este error, verifica que USE_MOCK_API = true en `src/services/api.ts`

### "Unable to resolve module"
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### "Port 8081 already in use"
```bash
# Encuentra el proceso
lsof -ti:8081

# Mata el proceso
kill -9 $(lsof -ti:8081)

# Reinicia
npm start
```
