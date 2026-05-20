# EcoCampus Mobile

Aplicacion movil en React Native para controlar dispositivos energeticos de salones mediante QR, roles de usuario y sincronizacion en tiempo real con el backend `ecocampus-backend`.

El proyecto permite que docentes y alumnos inicien sesion, escaneen o capturen el codigo QR de un aula, consulten los dispositivos disponibles, controlen solo los dispositivos permitidos por su rol y visualicen metricas del dashboard del campus.

## Tabla de Contenido

- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Configuracion del Backend](#configuracion-del-backend)
- [Ejecucion](#ejecucion)
- [Flujo de Uso](#flujo-de-uso)
- [Endpoints Consumidos](#endpoints-consumidos)
- [WebSocket](#websocket)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Notas de Desarrollo](#notas-de-desarrollo)

## Stack

- React Native `0.85.3`
- React `19.2.3`
- React Native CLI
- JavaScript / JSX
- AsyncStorage para persistencia de sesion
- Socket.IO Client para eventos en tiempo real
- Jest para pruebas
- ESLint para validacion estatica
- CocoaPods para dependencias nativas iOS

## Funcionalidades

### Autenticacion

- Login con email y password.
- Registro de usuarios.
- Roles soportados:
  - `TEACHER`
  - `STUDENT`
- Persistencia del JWT localmente.
- Restauracion automatica de sesion al abrir la app.
- Logout con limpieza de token local.

### Control por QR

- Captura manual del texto del QR, por ejemplo `ROOM_A201`.
- Envio del QR al backend con `POST /qr/scan`.
- Visualizacion del salon detectado.
- Listado de dispositivos disponibles en el salon.
- Respeto de permisos enviados por el backend mediante `device.allowed`.

### Dispositivos

- Visualizacion de nombre, tipo y estado.
- Estados soportados:
  - `ON`
  - `OFF`
- Tipos soportados:
  - `LIGHT`
  - `PROJECTOR`
  - `FAN`
- Toggle de dispositivos permitidos con `PATCH /devices/:id/toggle`.
- Dispositivos no permitidos aparecen bloqueados en la interfaz.

### Dashboard

La app consume y muestra:

- Aulas activas.
- Dispositivos encendidos.
- Total de dispositivos.
- Sesiones activas.
- Consumo estimado.
- Ahorro estimado.
- Salones y su estado.
- Dispositivos agrupados por salon.
- Actividad reciente de QR y dispositivos.

### Tiempo Real

La app escucha eventos de Socket.IO:

- `device.updated`
- `qr.scanned`

Cuando llega un evento, se actualizan los dispositivos visibles y se refrescan las metricas del dashboard.

## Arquitectura

```txt
src/
  api/
    auth.js          # Login y registro
    client.js        # Cliente HTTP con JWT
    config.js        # URL base del backend
    dashboard.js     # Endpoints del dashboard
    devices.js       # Toggle de dispositivos
    qr.js            # Escaneo/captura de QR
    socket.js        # Conexion Socket.IO
    storage.js       # Persistencia de sesion
  components/
    TabButton.jsx
    ClassItem.jsx
    HistoryItem.jsx
    InfoRow.jsx
  screens/
    LoginScreen.jsx
    TeacherHome.jsx
  styles/
    theme.js
App.jsx
```

### Flujo principal de estado

`App.jsx` es el punto de entrada:

1. Intenta restaurar la sesion desde AsyncStorage.
2. Si existe token, configura el cliente HTTP y conecta Socket.IO.
3. Si no existe sesion, muestra `LoginScreen`.
4. Si existe sesion, muestra `TeacherHome`.

## Requisitos

- Node.js `>= 22.11.0`
- npm
- Xcode para iOS
- CocoaPods
- Android Studio para Android
- Backend `ecocampus-backend` corriendo en el puerto `3000`

Verifica Node:

```sh
node -v
```

Verifica CocoaPods:

```sh
pod --version
```

## Instalacion

Desde la raiz del proyecto:

```sh
npm install
```

Para iOS, instala Pods:

```sh
cd ios
pod install
cd ..
```

Si CocoaPods falla por Bundler, puedes usar `pod install` directo desde `ios/`, que es lo que este proyecto usa actualmente para regenerar Pods.

## Configuracion del Backend

La URL base esta en:

[src/api/config.js](src/api/config.js)

Configuracion actual:

```js
export const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
```

### iOS Simulator

Usa:

```txt
http://localhost:3000
```

### Android Emulator

Usa:

```txt
http://10.0.2.2:3000
```

### Dispositivo fisico

`localhost` apunta al telefono, no a tu computadora. Cambia temporalmente la URL por la IP local de tu maquina:

```txt
http://TU_IP_LOCAL:3000
```

Ejemplo:

```txt
http://192.168.1.50:3000
```

Puedes obtener tu IP en macOS con:

```sh
ipconfig getifaddr en0
```

## Ejecucion

### 1. Levantar Metro

```sh
npm start
```

Si tienes problemas de cache:

```sh
npm start -- --reset-cache
```

### 2. Correr iOS

En otra terminal:

```sh
npm run ios
```

Tambien puedes abrir el workspace:

```sh
open ios/enerControlFront.xcworkspace
```

Importante: abre siempre el `.xcworkspace`, no el `.xcodeproj`, porque CocoaPods genera configuracion necesaria dentro del workspace.

### 3. Correr Android

```sh
npm run android
```

## Flujo de Uso

### 1. Login

Usa un usuario existente del backend. Ejemplo de desarrollo:

```txt
email: ana@ecocampus.com
password: 123456
```

La app guarda:

- `accessToken`
- `user`

en AsyncStorage.

### 2. Registro

Desde la pantalla inicial puedes cambiar a modo `Registro` y crear un usuario con:

- nombre
- email
- password
- rol `TEACHER` o `STUDENT`

### 3. Capturar QR

En la pantalla de inicio escribe el codigo del salon:

```txt
ROOM_A201
```

La app llama:

```txt
POST /qr/scan
```

Si el QR es valido, se navega a la vista de dispositivos del salon.

### 4. Controlar Dispositivos

Cada dispositivo muestra:

- nombre
- tipo
- estado `ON/OFF`
- accion de encender/apagar si `allowed === true`
- estado bloqueado si `allowed === false`

Reglas esperadas por rol:

| Rol | Dispositivos esperados |
| --- | --- |
| `TEACHER` | `LIGHT`, `PROJECTOR`, `FAN` |
| `STUDENT` | `LIGHT` |

Nota: el frontend respeta `allowed`, pero la seguridad final debe vivir en el backend.

### 5. Dashboard

La pestana `Dashboard` muestra metricas y listas del backend. Se refresca:

- al montar la pantalla
- con pull-to-refresh
- al recibir eventos `device.updated`
- al recibir eventos `qr.scanned`

## Endpoints Consumidos

### Auth

```txt
POST /auth/login
POST /auth/register
```

### QR

```txt
POST /qr/scan
```

Body:

```json
{
  "qrCode": "ROOM_A201"
}
```

### Devices

```txt
PATCH /devices/:id/toggle
```

### Dashboard

```txt
GET /dashboard/summary
GET /dashboard/classrooms
GET /dashboard/devices
GET /dashboard/activity
```

## WebSocket

La conexion se inicializa en:

[src/api/socket.js](src/api/socket.js)

```js
io(API_BASE_URL, {
  autoConnect: false,
  transports: ['websocket'],
});
```

Eventos escuchados:

```txt
device.updated
qr.scanned
```

`device.updated` actualiza el dispositivo visible si coincide con la lista cargada.

`qr.scanned` refresca el dashboard para mantener las metricas vivas.

## Scripts

```sh
npm start
```

Levanta Metro.

```sh
npm run ios
```

Compila y corre iOS.

```sh
npm run android
```

Compila y corre Android.

```sh
npm run lint
```

Ejecuta ESLint.

```sh
npm test
```

Ejecuta Jest.

## Validacion Recomendada

Antes de entregar cambios:

```sh
npm run lint -- --quiet
npm test -- --runInBand
```

Para revisar que iOS carga el workspace:

```sh
cd ios
xcodebuild -workspace enerControlFront.xcworkspace \
  -scheme enerControlFront \
  -configuration Debug \
  -sdk iphonesimulator \
  -showBuildSettings
```

## Troubleshooting

### Xcode no encuentra `Pods-enerControlFront.debug.xcconfig`

Sintoma:

```txt
Unable to open base configuration reference file ... Pods-enerControlFront.debug.xcconfig
```

Solucion:

```sh
cd ios
pod install
cd ..
open ios/enerControlFront.xcworkspace
```

No abras `enerControlFront.xcodeproj` para compilar con Pods.

### `undefined is not a function` al abrir la app

Si ocurre durante restauracion de sesion, revisa que `src/api/storage.js` use:

```js
AsyncStorage.getItem
AsyncStorage.setItem
AsyncStorage.removeItem
```

La version instalada de AsyncStorage no usa `multiGet`, `multiSet` ni `multiRemove`.

### El backend no responde en Android

En Android Emulator, `localhost` no apunta a tu computadora. Usa:

```txt
http://10.0.2.2:3000
```

### El backend no responde en dispositivo fisico

Usa la IP local de la computadora:

```txt
http://192.168.x.x:3000
```

Tambien revisa:

- que el backend este corriendo
- que telefono y computadora esten en la misma red
- que el firewall permita conexiones al puerto `3000`

### Metro muestra errores viejos

Limpia cache:

```sh
npm start -- --reset-cache
```

### Agregaste una dependencia nativa

Despues de instalar librerias nativas:

```sh
cd ios
pod install
cd ..
```

## Notas de Desarrollo

- La lectura de QR esta implementada como captura manual del texto del QR. Esto permite probar en simulador sin configurar camara nativa.
- Para escaneo real por camara en React Native CLI se puede integrar una libreria nativa como `react-native-vision-camera` o una alternativa de barcode scanner.
- El frontend respeta `device.allowed`, pero el backend debe aplicar guards de rol para seguridad real.
- Socket.IO usa `transports: ['websocket']` para evitar problemas de fallback en ambientes moviles.
- El cliente HTTP esta centralizado en `src/api/client.js`; cualquier endpoint protegido hereda el header `Authorization: Bearer <token>`.

## Estado Actual

Implementado:

- Login
- Registro
- Persistencia de JWT
- Restauracion de sesion
- Captura manual de QR
- Dispositivos por salon
- Toggle de dispositivos permitidos
- Dashboard
- Eventos en tiempo real
- iOS Pods actualizados

Pendiente sugerido:

- Escaneo real con camara.
- Navegacion formal con React Navigation si el flujo crece.
- Pantallas separadas por feature.
- Guards de rol en backend para `PATCH /devices/:id/toggle`.
- Manejo de expiracion de token con logout automatico.

