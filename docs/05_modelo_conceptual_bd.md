# Modelo Conceptual Base de Datos


# users

Usuarios del sistema.


Campos:

- id
- name
- email
- password
- user_type


Tipos:

- INVESTIGATOR
- CEISH
- ADMIN


---

# ceish_members


Información adicional de miembros CEISH.


Campos:

- user_id
- member_type


Valores:


INTERNAL

EXTERNAL


---

# investigations


Investigaciones.


Campos:

- id
- code
- title
- status
- created_by


---

# investigation_participants


Investigadores asociados.


Campos:

- investigation_id
- name
- identification
- email


---

# research_types


Tipos de investigación.


---

# annex_templates


Plantillas administrables.


Ej:

Anexo 12

Anexo 23

Anexo 27


---

# annex_versions


Control de versiones.


Permite mantener anexos históricos.


---

# investigation_annexes


Anexos utilizados por investigación.


---

# annex_answers


Respuestas de investigadores.


---

# risk_assessments


Procesos de estratificación.


Campos:


- investigation_id
- status
- risk_level
- created_by


Estados:


ACTIVE

REPLACED


---

# risk_assessment_members


Miembros participantes en estratificación.


Campos:


- risk_assessment_id
- member_id


---

# evaluation_processes


Procesos de evaluación.


Campos:


- investigation_id
- risk_assessment_id
- status


---

# evaluation_members


Evaluadores asignados.


Campos:


- evaluation_id
- member_id
- status


Estados:


ACTIVE

CONFLICT

REMOVED

FINISHED


---

# conflict_declarations


Declaraciones de conflicto.


Campos:


- evaluation_member_id
- has_conflict
- reason


---

# evaluations


Evaluaciones realizadas.


---

# observations


Observaciones generadas.


---

# correction_rounds


Ciclos de corrección.


Campos:


- evaluation_id
- deadline
- status


---

# documents


Archivos almacenados.


Campos:


- url
- filename
- type


---

# workflow_events


Historial del proceso.


Permite saber:

- quién cambió un estado
- cuándo
- qué acción realizó