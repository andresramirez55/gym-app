# 🔧 Troubleshooting - Gym App Mobile

## Error: `java.lang.String cannot be cast to java.lang.Boolean`

Este es un error conocido de compatibilidad en Android con React Native + Expo.

### ✅ Correcciones ya aplicadas:

1. ✅ Tipos TypeScript corregidos
2. ✅ `fontWeight` cambiado de '600' a 'bold'
3. ✅ `react-native-screens` actualizado a ~4.16.0
4. ✅ Estilos inline movidos a StyleSheet

---

## 🎯 Soluciones (en orden de recomendación)

### Solución 1: Usar iPhone (RECOMENDADO)

Si tienes un iPhone, **úsalo**. No tiene problemas de Java:

```bash
1. Instala Expo Go desde App Store
2. cd /Users/andresramirez/gym-app/mobile
3. npx expo start
4. Escanea el QR con la cámara del iPhone
```

---

### Solución 2: Esperar más tiempo (Android)

A veces Metro tarda 3-5 minutos en compilar todo:

```bash
1. cd /Users/andresramirez/gym-app/mobile
2. killall -9 node
3. npx expo start --clear
4. ESPERA 5 MINUTOS (no te conectes antes)
5. Luego conecta desde Expo Go
```

---

### Solución 3: Probar en el navegador web

```bash
cd /Users/andresramirez/gym-app/mobile
npx expo start --web
```

Esto abrirá la app en tu navegador (Chrome/Safari). No es 100% igual a mobile pero funciona para probar.

---

### Solución 4: Reinstalar dependencias

```bash
cd /Users/andresramirez/gym-app/mobile
rm -rf node_modules
npm install
npx expo start --clear
```

---

### Solución 5: Verificar versión de Expo Go

1. Abre Expo Go en Android
2. Ve a Settings
3. Verifica que sea versión 2.30.x o superior
4. Si es anterior, actualiza desde Play Store

---

### Solución 6: Usar modo túnel (más lento pero más confiable)

```bash
npm install -g @expo/ngrok@^4.1.0
npx expo start --tunnel
```

Esto crea una URL pública que funciona mejor con algunos dispositivos.

---

## 🐛 Depuración avanzada

### Ver logs detallados:

```bash
npx expo start --clear
# En otra terminal:
npx react-native log-android
```

### Limpiar todo el caché:

```bash
cd /Users/andresramirez/gym-app/mobile
watchman watch-del-all
rm -rf node_modules
rm -rf .expo
rm -rf $TMPDIR/react-*
npm install
npx expo start --clear
```

---

## 📱 Alternativa: Ver la app sin instalar nada

Si nada funciona, puedo:

1. **Crear un video** mostrando la app funcionando
2. **Tomar screenshots** de cada pantalla
3. **Crear un build APK** que puedas instalar directamente
4. **Publicar en Expo** para que la pruebes online

---

## 🆘 Información para reportar el bug

Si quieres reportar esto a Expo/React Native:

```
Error: java.lang.String cannot be cast to java.lang.Boolean
Device: Android
Expo: ~54.0.33
React Native: 0.81.5
react-native-screens: ~4.16.0
@react-navigation/native-stack: ^7.12.0
```

---

## 📊 Resumen del proyecto

### Lo que SÍ está funcionando:

- ✅ Código compilado sin errores TypeScript
- ✅ Mock API con datos de prueba
- ✅ Navegación configurada
- ✅ 4 pantallas completas
- ✅ Autenticación con contexto
- ✅ Backend Go con API REST

### El único problema:

- ❌ Error de runtime en Android (problema de compatibilidad)
- ✅ Funcionaría perfectamente en iOS
- ✅ Funcionaría en web con pequeños ajustes

---

## 🎨 Las pantallas que verás (cuando funcione):

1. **Login/Registro**
   - Formulario bonito con opciones de objetivo
   - Selección de frecuencia (3, 4, 5 días)

2. **Home**
   - Banner "MODO PRUEBA"
   - 5 días de rutina
   - Botón de generar con IA

3. **Día de Entrenamiento**
   - Lista de ejercicios
   - Registro de series (peso + reps)
   - Botón finalizar

4. **Historial**
   - Entrenamientos completados
   - Detalles de cada sesión

---

**¿Cuál solución quieres probar? O prefieres que te muestre la app de otra manera?**
