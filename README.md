# ProgramStyle

Sitio estático de ProgramStyle, publicado en GitHub Pages con Vite. Supabase proporciona autenticación, contenido compartido, recepción privada de solicitudes y Edge Functions. OpenAI alimenta los asistentes de Servicios y Admin.

## Desarrollo local

Requisitos: Node.js 20.19 o posterior.

1. Copia `.env.example` como `.env.local`.
2. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores públicos del proyecto Supabase. No pongas claves privadas en variables `VITE_*`.
3. Instala y ejecuta:

   ```powershell
   npm.cmd ci
   npm.cmd start
   ```

4. Abre `http://127.0.0.1:5173`. Para compilar la web estática localmente, ejecuta `npm.cmd run build`; los archivos resultantes quedan en `dist`.

Sin credenciales, Vite puede compilar y mostrar el contenido predeterminado, pero la autenticación, el guardado compartido, los chats y el formulario que registra solicitudes no funcionarán.

## Configurar Supabase

1. Crea un proyecto Supabase y ejecuta [`supabase/schema.sql`](./supabase/schema.sql) desde **SQL Editor**.
2. En **Authentication → Users**, crea el primer usuario con correo y contraseña. Desactiva el registro público de usuarios.
3. Autoriza el usuario inicial desde SQL Editor, sustituyendo el correo:

   ```sql
   insert into public.admin_users (id, email)
   select id, lower(email)
   from auth.users
   where lower(email) = lower('admin@example.com')
   on conflict (id) do nothing;
   ```

4. Instala la CLI de Supabase, autentícate y vincula el proyecto:

   ```powershell
   npx supabase login
   npx supabase link --project-ref TU_PROJECT_REF
   ```

5. Configura secretos de las Edge Functions. `ALLOWED_ORIGINS` debe contener los orígenes separados por coma, sin rutas. Incluye el dominio `https://TU_USUARIO.github.io` y los orígenes locales `http://127.0.0.1:5173,http://localhost:5173`.

   ```powershell
   npx supabase secrets set OPENAI_API_KEY=TU_CLAVE_OPENAI ALLOWED_ORIGINS="https://TU_USUARIO.github.io,http://127.0.0.1:5173,http://localhost:5173"
   ```

   Supabase proporciona `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` a las funciones. Nunca publiques la clave de OpenAI ni la clave service role en el frontend o en GitHub Pages.

6. Despliega cada función desde la raíz del repositorio:

   ```powershell
   npx supabase functions deploy ai-chat
   npx supabase functions deploy admins
   npx supabase functions deploy contact-request
   npx supabase functions deploy contact-requests
   ```

   [`supabase/config.toml`](./supabase/config.toml) desactiva la verificación JWT automática del gateway; cada función valida explícitamente los tokens y permisos de Admin cuando corresponde. Las consultas públicas siguen limitadas por origen y tasa.

## Publicar en GitHub Pages

1. Sube el repositorio a GitHub en la rama `main`.
2. En **Settings → Secrets and variables → Actions → Variables**, crea:
   - `SUPABASE_URL`: URL del proyecto Supabase.
   - `SUPABASE_ANON_KEY`: clave publicable/anon del proyecto. Es pública y se usa para conectar el navegador.
3. En **Settings → Pages**, selecciona **GitHub Actions** como origen.
4. Cada push a `main` construye el sitio con Vite y lo despliega. También puedes iniciarlo desde **Actions → Deploy ProgramStyle to GitHub Pages → Run workflow**.

El workflow configura la ruta base tanto para un repositorio de proyecto (`https://TU_USUARIO.github.io/NOMBRE_REPO/`) como para el repositorio principal de usuario (`https://TU_USUARIO.github.io/`).

## Funcionalidad y límites

- El formulario de Servicios registra solicitudes en `contact_requests`; las cuentas autorizadas las revisan en Admin y pueden marcarlas como atendidas.
- El contenido compartido se lee desde `site_content`. Hasta que se confirme el primer cambio, la web y la IA usan el contenido predeterminado incorporado.
- Los cambios de contenido y de cuentas administrativas requieren confirmación en el panel. La IA explica y prepara, pero no ejecuta ni publica acciones por sí sola.
- Para comprobar `package.json` y los módulos del navegador: `npm.cmd run build`. La integración real requiere configurar GitHub Pages, Supabase y una clave válida de OpenAI.
