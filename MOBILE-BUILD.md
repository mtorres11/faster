# Convertir F.A.S.T.E.R. en app Android e iOS

Tu `faster-diario/index.html` sigue igual. Solo hace falta instalar dependencias y añadir las plataformas.

## 1. Instalar dependencias

En la raíz del proyecto (donde está este archivo):

```bash
npm install
```

## 2. Añadir Android

```bash
npx cap add android
```

Luego sincronizar el contenido web y abrir Android Studio:

```bash
npx cap sync
npx cap open android
```

En Android Studio: compila la app (Build > Build Bundle(s) / APK(s)) y ejecútala en un emulador o dispositivo. Para publicar en Play Store necesitas firmar la app y crear una ficha en Google Play Console.

## 3. Añadir iOS (solo en Mac)

```bash
npx cap add ios
npx cap sync
npx cap open ios
```

En Xcode: selecciona tu equipo de desarrollo, compila y ejecuta en simulador o dispositivo. Para App Store necesitas cuenta de Apple Developer (99 USD/año).

## Después de cambiar el HTML/JS/CSS

Cada vez que modifiques algo en `faster-diario/`:

```bash
npx cap sync
```

Luego vuelve a compilar en Android Studio o Xcode.

## Requisitos

- **Node.js** (v18 o superior): https://nodejs.org
- **Android:** Android Studio y SDK de Android
- **iOS:** Mac con Xcode (y cuenta Apple Developer para publicar)
