# INSTRUCCIONES PARA ORION - Acceso a Documentos I-601A

## 📍 Repositorio GitHub
**URL:** https://github.com/agem2024/SEGURITI-USC

---

## 🤖 Para Orion (Chatbot WhatsApp)

### Comandos que Orion debe reconocer:

**1. Listar documentos I-601A:**
```
Comando: "documentos i601a"
Respuesta: Mostrar lista de 20 documentos disponibles
```

**2. Obtener documento específico:**
```
Comando: "dame [nombre documento]"
Ejemplos:
  - "dame declaracion personal"
  - "dame lista gastos"
  - "dame cuestionario"
```

**3. Ver fotos:**
```
Comando: "fotos"
Respuesta: Link al Photo Manager Pro
```

**4. Estadísticas del caso:**
```
Comando: "estado caso"
Respuesta:
  - Documentos completados: 20
  - Cuestionario: 100%
  - Fotos organizadas: 89
  - Pendientes: [lista]
```

**5. Datos financieros:**
```
Comando: "gastos" o "ingresos"
Respuesta:
  - Olivia: $11,500/mes
  - Alex: $5,600/mes
  - Balance: Positivo ✅
```

---

## 📂 Estructura de Archivos en GitHub

```
/
├── README.md
├── .gitignore
│
├── OFICIALES_USCIS/
│   ├── DECLARACION_PERSONAL_OFICIAL_USCIS.html
│   └── LISTA_GASTOS_OFICIAL_USCIS.html
│
├── CUESTIONARIOS/
│   ├── I-601A_RESPUESTAS_DESARROLLADAS.md
│   └── DECLARACION_OLIVIA_PETICIONARIA.md
│
├── MEDICO/
│   └── OLIVIA_INFORMACION_COMPLETA.md
│
├── PLANIFICACION/
│   ├── PLAN_MAESTRO_I601A.md
│   ├── DOCUMENTOS_ADICIONALES_PENDIENTES.md
│   └── RESUMEN_COMPLETO_FINAL.md
│
├── HERRAMIENTAS/
│   ├── photo-manager-pro.html
│   ├── photo-organizer.html
│   └── people-identifier.html
│
├── PROFESIONAL/
│   ├── CV_ALEX_ESPINOSA_2025.md
│   ├── SERVICIOS_PROFESIONALES_COMPLETO.md
│   └── landing-alex-espinosa.html
│
└── REPORTES/
    ├── CERTIFICACIONES_ENCONTRADAS.md
    ├── REPORTE_DISCO_F.md
    └── ANALISIS_EXHAUSTIVO_F_DRIVE.md
```

---

## 🔗 URLs Directas (Para Orion)

### Documentos Principales:
- Declaración Personal: `https://github.com/agem2024/SEGURITI-USC/blob/main/OFICIALES_USCIS/DECLARACION_PERSONAL_OFICIAL_USCIS.html`
- Lista Gastos: `https://github.com/agem2024/SEGURITI-USC/blob/main/OFICIALES_USCIS/LISTA_GASTOS_OFICIAL_USCIS.html`
- Cuestionario: `https://github.com/agem2024/SEGURITI-USC/blob/main/CUESTIONARIOS/I-601A_RESPUESTAS_DESARROLLADAS.md`

### Herramientas:
- Photo Manager: `https://github.com/agem2024/SEGURITI-USC/blob/main/HERRAMIENTAS/photo-manager-pro.html`

---

## 💡 Integración Orion + GitHub

### Opción A: GitHub API (Recomendado)
```python
import requests

def get_documento(nombre):
    BASE_URL = "https://api.github.com/repos/agem2024/SEGURITI-USC/contents/"
    
    documentos = {
        "declaracion": "OFICIALES_USCIS/DECLARACION_PERSONAL_OFICIAL_USCIS.html",
        "gastos": "OFICIALES_USCIS/LISTA_GASTOS_OFICIAL_USCIS.html",
        "cuestionario": "CUESTIONARIOS/I-601A_RESPUESTAS_DESARROLLADAS.md"
    }
    
    if nombre in documentos:
        url = BASE_URL + documentos[nombre]
        response = requests.get(url)
        return response.json()['download_url']
```

### Opción B: GitHub Raw
```python
def get_raw_url(path):
    return f"https://raw.githubusercontent.com/agem2024/SEGURITI-USC/main/{path}"
```

---

## 📱 Ejemplo de Interacción WhatsApp

**Usuario:** "Orion, dame la declaración personal"

**Orion responde:**
```
📄 Declaración Personal I-601A

Estado: ✅ Completo (8 páginas)
Formato: Oficial USCIS
Listo para: Imprimir y firmar

🔗 Ver documento:
https://github.com/agem2024/SEGURITI-USC/blob/main/OFICIALES_USCIS/DECLARACION_PERSONAL_OFICIAL_USCIS.html

📋 Contenido:
- Historia completa Alex
- 11 condiciones Olivia
- Análisis extreme hardship
- Espacios para firma

¿Necesitas otro documento? Escribe "lista documentos"
```

---

## 🔐 Configuración de Orion

### Variables de Entorno Necesarias:
```bash
GITHUB_REPO_OWNER=agem2024
GITHUB_REPO_NAME=SEGURITI-USC
GITHUB_TOKEN=[opcional si repo es público]
```

### Comandos Base para Orion:
1. `documentos` - Lista todos
2. `dame [nombre]` - Obtiene específico
3. `fotos` - Herramienta fotos
4. `estado` - Estado del caso
5. `gastos` - Info financiera
6. `pendientes` - Qué falta
7. `ayuda` - Lista comandos

---

## ✅ Checklist para Activar Orion

- [ ] Subir archivos a GitHub repo SEGURITI-USC
- [ ] Verificar que repo sea privado
- [ ] Configurar variables en Orion
- [ ] Probar comando "documentos"
- [ ] Probar comando "dame declaracion"
- [ ] Probar comando "estado"
- [ ] Documentar respuestas de Orion

---

**Creado:** Diciembre 9, 2025  
**Para:** Integración Orion WhatsApp Bot con I-601A Case Docs
