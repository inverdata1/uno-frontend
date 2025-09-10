# uno-delivery

## 🚨 IMPORTANTE PARA PASANTES 🚨

- NO trabajar en `main`.
- Usar SIEMPRE la rama `pasantes` como base.
- Flujo:
  1. Hacer `git pull origin pasantes`.
  2. Crear rama nueva: `git checkout -b feature-nueva`.
  3. Subir cambios con `git push origin feature-nueva`.
  4. Abrir Pull Request hacia `pasantes`.
- Solo el administrador abre PR de `pasantes → main`.

# 🚀 Proyecto Uno Delivery

Este proyecto se gestiona con dos ramas principales:

- **`main`** → Rama estable, solo el administrador puede aprobar cambios aquí.
- **`pasantes`** → Rama de trabajo para pasantes, donde se concentran las colaboraciones.

---

## 👩‍💻 Instrucciones para pasantes

### 1. Clonar solo la rama `pasantes`

Usa este comando para clonar únicamente la rama de trabajo:

```bash
git clone -b pasantes --single-branch https://github.com/inverdata1/uno-delivery.git
cd uno-delivery

2. Actualizar la rama pasantes

Antes de comenzar cualquier tarea, asegúrate de tener la última versión:
git checkout pasantes
git pull origin pasantes

3. Crear tu propia rama de trabajo
Siempre trabaja en una rama aparte:
git checkout -b feature/nombre-tarea

4. Hacer commits
Agrega tus cambios y haz commit con un mensaje claro:
git add .
git commit -m "Agregada pantalla de login con validaciones"

5. Subir tu rama
Envía tu rama al repositorio remoto:
git push origin feature/nombre-tarea

6. Abrir un Pull Request
Entra a GitHub → pestaña Pull Requests. Puedes usar Github Desktop para crear PR
Crea un PR desde tu rama (feature/nombre-tarea) hacia pasantes.
Espera la revisión del administrador.

🚫 Reglas importantes

❌ No trabajar en main.

❌ No abrir PRs hacia main.

✅ Solo el administrador abre PR de pasantes → main.
```
