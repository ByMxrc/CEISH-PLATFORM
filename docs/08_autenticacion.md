# Módulo de autenticación

Las rutas de autenticación están disponibles bajo el prefijo `/api/v1/auth`.

## Registro público de investigadores

`POST /auth/register` crea exclusivamente solicitudes de cuenta para investigadores. El cuerpo permitido es:

```json
{
  "name": "Nombre del investigador",
  "email": "investigador@ejemplo.edu.ec",
  "password": "minimo-ocho-caracteres",
  "investigatorType": "INTERNAL"
}
```

`investigatorType` es obligatorio y solo acepta `INTERNAL` o `EXTERNAL`. La API asigna siempre el tipo de usuario `INVESTIGATOR`, cifra la contraseña con bcrypt y crea la cuenta en `PENDING_APPROVAL`. Por ello, no es posible registrarse públicamente como miembro CEISH o administrador.

La solicitud crea además el perfil de investigador y un evento de auditoría `USER_REGISTERED`.

## Inicio y renovación de sesión

- `POST /auth/login` recibe `email` y `password` y devuelve access token, refresh token e información segura del usuario únicamente cuando la cuenta está `ACTIVE`.
- `POST /auth/refresh` recibe `refreshToken` y también exige que la cuenta continúe `ACTIVE`.
- Las cuentas `PENDING_APPROVAL`, `REJECTED` y `SUSPENDED` no pueden iniciar ni renovar sesión y reciben un mensaje explícito del estado.

Todas las rutas protegidas verifican el JWT y vuelven a consultar la cuenta. Esto revoca el acceso de una cuenta suspendida, rechazada o eliminada incluso si conserva un access token no expirado.

## Roles y aprobación

Los endpoints de administración bajo `/api/v1/admin/users` requieren JWT y el rol `ADMIN`. El administrador puede aprobar solicitudes pendientes (`POST /admin/users/:id/approve`), rechazarlas o suspender cuentas. La aprobación cambia el estado a `ACTIVE`; el rechazo y la suspensión quedan auditados mediante `workflow_events`.

Los roles `CEISH_MEMBER` y `ADMIN` no disponen de registro público. Su creación o gestión corresponde a los mecanismos administrativos del sistema.
