# ProgramStyle

Sitio estático con un servidor local de Node.js y funciones de backend compatibles con Vercel. Supabase proporciona autenticación administrativa y almacenamiento compartido del contenido.

## Desarrollo local

Necesitas Node.js 20.18 o posterior. Crea `.env.local` a partir de `.env.example`, completa las credenciales del proyecto Supabase y ejecuta:

```powershell
Copy-Item .env.example .env.local
npm.cmd install
npm.cmd start
```

Abre `http://localhost:3000`. El servidor local entrega tanto las páginas como las mismas rutas `/api` que se despliegan como funciones en Vercel. Sin credenciales Supabase, las páginas públicas muestran el contenido predeterminado, pero el inicio de sesión y los cambios compartidos no estarán disponibles.

## Configurar Supabase

1. Crea un proyecto Supabase y abre **SQL Editor**.
2. Ejecuta el contenido de [`supabase/schema.sql`](./supabase/schema.sql). Las tablas no conceden acceso directo a visitantes; el servidor accede a ellas con su clave privada.
3. En **Authentication → Users**, crea el primer usuario administrador con correo y contraseña confirmados. Desactiva el registro público de usuarios en Authentication.
4. Autoriza esa cuenta ejecutando en SQL Editor, sustituyendo el correo de ejemplo:

   ```sql
   insert into public.admin_users (id, email)
   select id, lower(email)
   from auth.users
   where lower(email) = lower('admin@example.com')
   on conflict (id) do nothing;
   ```

5. En la configuración API de Supabase, copia la URL del proyecto, la clave publicable/anon y la clave `service_role`/secreta. Ponlas en `.env.local` para desarrollo y en las variables de entorno del proyecto Vercel:

   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

   La clave `SUPABASE_SERVICE_ROLE_KEY` es privada: no la pongas en archivos HTML/JavaScript del navegador, no la publiques y no la compartas por chat. `.env.local` está excluido de Git.

## Desplegar en Vercel

1. Importa este repositorio en Vercel, usando la carpeta raíz del proyecto. No configures una carpeta de salida distinta: `vercel.json` asigna la portada y las rutas de Inicio, Servicios y Admin.
2. Añade las tres variables de Supabase anteriores en **Project Settings → Environment Variables** para los entornos que vayas a usar.
3. Despliega el proyecto. Vercel servirá HTML, CSS, JavaScript e imágenes como archivos estáticos y ejecutará los módulos de `api/` como funciones Node.js.
4. Abre el dominio asignado e inicia sesión con el correo de la cuenta autorizada. Cuando confirmes una edición, se almacena en Supabase y se comparte con todos los visitantes.

El servidor local escucha solo en `127.0.0.1`; Vercel no puede conectarse al equipo local. En producción, Vercel ejecuta sus propias funciones `/api`, que comparten el código de backend con el servidor local. Las claves de entorno y la inicialización del proyecto Supabase son necesarias antes de habilitar el panel administrativo.
