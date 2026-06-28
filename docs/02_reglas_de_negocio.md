# Reglas de Negocio

## 1. Usuarios


## RN-001 - Tipos de usuarios

El sistema maneja tres tipos principales:

- Investigador
- Miembro CEISH
- Administrador


---

# Investigadores


## RN-002

Un investigador puede ser:

- Interno de la universidad.
- Externo.


---

## RN-003

Un investigador no puede pertenecer como miembro CEISH dentro de la misma investigación.


---

# Miembros CEISH


## RN-004

Un miembro CEISH puede participar en diferentes investigaciones con diferentes responsabilidades.


Una misma cuenta puede tener distintos roles según la investigación asignada.


---

## RN-005

Los miembros CEISH se clasifican en:


INTERNAL:

Puede:

- Estratificar investigaciones.
- Evaluar investigaciones.


EXTERNAL:

Puede:

- Evaluar investigaciones.


No puede:

- Determinar nivel de riesgo.


---

# Investigaciones


## RN-006

Toda investigación debe tener un código único generado por el sistema.


Ejemplo:

CEISH-001


---

## RN-007

Una investigación atraviesa diferentes etapas controladas por estados.


No se permite avanzar a una etapa si no cumple los requisitos anteriores.


---

# Estratificación


## RN-008

La estratificación determina el nivel de riesgo de una investigación.


Opciones:

- Sin riesgo.
- Riesgo mínimo.
- Mayor al riesgo mínimo.


---

## RN-009

Solamente miembros CEISH internos pueden realizar estratificaciones.


---

## RN-010

La estratificación debe conservar historial.


Una nueva estratificación no elimina la anterior.


---

## RN-011 - Reestratificación

El administrador puede solicitar una reestratificación.


Cuando ocurre:

- La estratificación actual pasa a estado reemplazada.
- Se seleccionan nuevos miembros CEISH internos.
- Se genera una nueva evaluación de riesgo.


La nueva estratificación no reutiliza los miembros anteriores.


---

# Asignación de miembros


## RN-012

La asignación de miembros puede realizarse:

- Automáticamente.
- Manualmente por administrador.


---

## RN-013

Un miembro asignado no puede evaluar una investigación donde participa como investigador.


---

# Evaluadores


## RN-014

Cuando una investigación es:

Sin riesgo:

Se asigna un evaluador.


Riesgo mínimo o mayor:

Se asignan dos evaluadores.


---

# Conflicto de interés


## RN-015

Cada evaluador debe emitir un anexo de declaración de conflicto.


---

## RN-016

Si un evaluador declara conflicto:


- Se elimina la asignación.
- Se selecciona un nuevo evaluador.
- Los evaluadores activos deben volver a emitir la declaración.


---

## RN-017

Los conflictos deben mantenerse como historial.


Nunca se elimina información de asignaciones anteriores.


---

# Evaluaciones


## RN-018

Las evaluaciones se realizan mediante anexos.


Los anexos pueden contener:

- Campos de texto.
- Checklists.
- Observaciones.


---

## RN-019

Una evaluación puede generar:


- Aprobación.
- Observaciones.
- Solicitud de correcciones.
- Cancelación.


---

# Correcciones


## RN-020

El investigador tiene un plazo definido para responder observaciones.


Ejemplo:

30 días.


---

## RN-021

Cada ciclo de corrección debe conservar historial.


Una nueva corrección no reemplaza una anterior.


---

# Administración de anexos


## RN-022

El administrador puede crear y modificar plantillas de anexos.


---

## RN-023

Las investigaciones deben conservar la versión del anexo utilizada al momento de evaluación.