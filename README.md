# Calculadora de Presupuesto (Vite + React)

Si al abrir `index.html` directamente no ves nada, es normal: este proyecto usa Vite y debe ejecutarse con servidor local.

## Ejecutar en local

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Arranca en desarrollo:
   ```bash
   npm run dev
   ```
3. Abre en el navegador la URL que aparece en terminal (por ejemplo `http://localhost:5173/`).

## Build para subir a FTP

1. Compila producción:
   ```bash
   npm run build
   ```
2. Sube **todo el contenido de `dist/`** al hosting FTP.

> No subas los archivos fuente (`App.tsx`, `index.tsx`, etc.).
