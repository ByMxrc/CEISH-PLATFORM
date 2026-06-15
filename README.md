# CEISH-PLATFORM Frontend
El repositorio está organizado de manera que los cambios y ampliaciones se ubiquen con claridad en carpetas específicas:

- `src/components`: componentes reutilizables del UI.
- `src/constants`: variables de tema, colores, espaciados y sombras.
- `src/pages`: páginas que representan vistas completas.
- `src/types`: tipos TypeScript compartidos para datos y formularios.

---

## Distribución principal

### `src/pages`

Contiene las páginas principales del frontend.

- `src/pages/Login.tsx`
  - Define la página de inicio de sesión.
  - Usa `AuthLayout` para el layout y `LoginForm` para el formulario.
  - Aquí está la lógica de simulación de autenticación actual (`demo` / `password`).

### `src/components`

Contiene componentes divididos por función y por área.

#### `src/components/auth`

Componentes específicos para la autenticación:

- `AuthLayout.tsx`
  - Define el layout completo de la página de login.
  - Controla la estructura de la sección izquierda (mensaje institucional) y la sección derecha (formulario).
  - Aquí se ajusta la apariencia general del login, los fondos y las animaciones.

- `LoginForm.tsx`
  - Contiene el formulario de login, la validación de campos y los mensajes de error/éxito.
  - Usa los componentes `Input`, `Button` y `Card` para construir el formulario.
  - Aquí se modifica el espaciado, el texto, el comportamiento del botón y los mensajes visuales.

#### `src/components/common`

Componentes reutilizables que pueden usarse en varias páginas:

- `Input.tsx`
  - Componente de campo de texto con estado de focus, error y helper text.
  - Si se cambian estilos de formularios o validación visual, este es el lugar.

- `Button.tsx`
  - Componente de botón configurable por `variant`, `size`, `fullWidth` e `isLoading`.
  - Aquí se modifica el estilo del botón principal y los efectos hover.

- `Card.tsx`
  - Contenedor visual que se usa para agrupar contenido con sombra y padding.
  - Es el componente que envuelve el formulario de login.

- `Logo.tsx`
  - Componente de marca que renderiza el nombre `CEISH` y el icono.
  - Si se quiere cambiar el logo o el texto institucional, se edita aquí.

---

## `src/constants`

Aquí están las configuraciones de tema y el diseño común.

- `src/constants/colors.ts`
  - Define la paleta de colores (`primary`, `success`, `gray`, `surface`, `state`, etc.).
  - Contiene tipografía, tamaños de fuente, pesos, espaciado, radios y sombras.
  - Cambios aquí afectan todo el estilo de la aplicación.

---

## `src/types`

Define los tipos usados en la aplicación.

- `src/types/auth.ts`
  - Define `LoginCredentials`, `LoginResponse` y posiblemente tipos relacionados con autenticación.
  - Si se agregan nuevos campos al formulario de login o la API cambia, este archivo es el origen de verdad para los tipos.

---

## Dónde hacer cambios comunes

1. **Cambiar texto o estructura del login**
   - `src/pages/Login.tsx` para la página y la función de envío.
   - `src/components/auth/LoginForm.tsx` para campos, validación y mensajes.

2. **Ajustar la apariencia del layout**
   - `src/components/auth/AuthLayout.tsx` para la disposición visual de izquierda/derecha, el fondo y el container general.

3. **Modificar componentes reutilizables**
   - `src/components/common/Input.tsx` para cambiar bordes, focus y comportamiento de inputs.
   - `src/components/common/Button.tsx` para cambiar tamaño, color, hover y estilos generales del botón.
   - `src/components/common/Card.tsx` para cambiar padding o sombras de tarjetas.
   - `src/components/common/Logo.tsx` para cambiar la marca o el icono.

4. **Actualizar la paleta de diseño**
   - `src/constants/colors.ts` para usar nuevos colores, ajustar tipografías o refinar espaciados.

5. **Actualizar tipos y datos**
   - `src/types/auth.ts` para extender credenciales o la respuesta de login.

---

## Recomendaciones

- Mantener los estilos visuales en `constants/colors.ts` siempre que sea posible.
- Evitar estilos inline complejos en componentes reutilizables cuando se puedan estandarizar.
- Para agregar una nueva página, crearla en `src/pages` y usar componentes de `src/components`.
- Para agregar un nuevo tipo, definirlo en `src/types` y exportarlo donde se necesite.

Con esta organización es fácil localizar dónde está cada parte del frontend y qué archivo debe editarse al extender la interfaz o el comportamiento del login.