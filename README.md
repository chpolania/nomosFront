# Nomos Impresores — Frontend

Frontend responsive en React + TypeScript, basado en la identidad visual existente en
`../html`. La autenticación es la vista inicial y está disponible en `/` y `/login`.

## Desarrollo

Requiere Node.js 18.18.0 o superior.

```bash
npm install
npm run dev
```

## Estructura

Los componentes se organizan con Atomic Design en `src/components/atoms`,
`src/components/molecules` y `src/components/organisms`. Las páginas que componen cada
vista están en `src/pages`.

Los recursos visuales originales del sitio se sirven desde `public/assets`. El formulario
de acceso incluye validación nativa del navegador y estados de interfaz; la autenticación
y la recuperación de contraseña requieren conectarse al servicio correspondiente.
