# 📊 Google Analytics - ORION Tech Landing Page

## ✅ Configuración Completada

### 🆔 ID de Medición
```
G-GY61W7K2B6
```

### 📍 Ubicación del Archivo
```
c:\Users\alexp\OneDrive\Documentos\_Proyectos\SEGURITI-USC\docs\orion-bots.html
```

### 🌐 URL Live (GitHub Pages)
```
https://agem2024.github.io/SEGURITI-USC/docs/orion-bots.html
```

---

## 🎯 Eventos Rastreados

### 1. **CTA Principal (Botón Hero)**
- **Evento:** `click`
- **Categoría:** `CTA`
- **Etiqueta:** `Hero Button - Access The Future`
- **Descripción:** Rastrea clics en el botón principal "Access The Future"

### 2. **Apertura del Chatbot**
- **Evento:** `chatbot_open`
- **Categoría:** `Chatbot`
- **Etiqueta:** `XONA AI Interaction`
- **Descripción:** Rastrea cuando un usuario abre el chatbot XONA

### 3. **Cierre del Chatbot**
- **Evento:** `chatbot_close`
- **Categoría:** `Chatbot`
- **Etiqueta:** `XONA AI Interaction`
- **Descripción:** Rastrea cuando un usuario cierra el chatbot

### 4. **Cambio de Idioma**
- **Evento:** `language_change`
- **Categoría:** `Chatbot`
- **Etiqueta:** `Language: EN` o `Language: ES`
- **Descripción:** Rastrea el idioma seleccionado por el usuario

### 5. **Mensaje Enviado**
- **Evento:** `message_sent`
- **Categoría:** `Chatbot`
- **Etiqueta:** `Language: EN/ES`
- **Valor:** Longitud del mensaje (número de caracteres)
- **Descripción:** Rastrea cada mensaje enviado al chatbot

### 6. **Respuesta Exitosa del Chatbot**
- **Evento:** `chatbot_response_success`
- **Categoría:** `Chatbot`
- **Etiqueta:** `API Response Received`
- **Descripción:** Rastrea respuestas exitosas de la API

### 7. **Errores de Conexión**
- **Evento:** `chatbot_error`
- **Categoría:** `Chatbot`
- **Etiqueta:** `API Connection Error`
- **Descripción:** Rastrea errores de conexión con la API

---

## 📈 Cómo Acceder a tus Datos

### 1. **Panel Principal de Google Analytics**
1. Ve a: https://analytics.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona la propiedad: **ORION Tech Landing Page**

### 2. **Ver Datos en Tiempo Real**
1. En el menú izquierdo, haz clic en **Informes** → **Tiempo real**
2. Aquí verás:
   - Usuarios activos en este momento
   - Páginas que están viendo
   - Eventos que están ocurriendo en vivo

### 3. **Ver Eventos Personalizados**
1. Ve a **Informes** → **Engagement** → **Eventos**
2. Aquí verás todos los eventos rastreados:
   - `chatbot_open`
   - `chatbot_close`
   - `language_change`
   - `message_sent`
   - `chatbot_response_success`
   - `chatbot_error`
   - `click` (botón CTA)

### 4. **Análisis de Usuario**
- **Demografía:** Informes → Demografía → Descripción general
- **Tecnología:** Informes → Tecnología → Descripción general
- **Ubicación:** Informes → Demografía → Detalles demográficos

---

## 🧪 Cómo Probar que Funciona

### Prueba Manual:
1. Abre tu landing page en el navegador
2. Abre Google Analytics en tiempo real: https://analytics.google.com/ → Tiempo real
3. Realiza las siguientes acciones en tu landing page:
   - Haz clic en "Access The Future"
   - Abre el chatbot XONA
   - Cambia el idioma
   - Envía un mensaje
   - Cierra el chatbot
4. **Deberías ver** cada acción aparecer en tiempo real en Google Analytics

---

## 📊 Métricas Clave que Puedes Analizar

### Rendimiento del Chatbot:
- **Tasa de apertura:** ¿Cuántos visitantes abren el chatbot?
- **Mensajes por sesión:** ¿Cuántos mensajes envía cada usuario?
- **Preferencia de idioma:** ¿Más usuarios usan EN o ES?
- **Tasa de error:** ¿Cuántos errores de API ocurren?

### Engagement General:
- **Páginas vistas:** Total de veces que se carga la página
- **Tiempo promedio:** Cuánto tiempo pasan los usuarios
- **Tasa de rebote:** % de usuarios que se van inmediatamente
- **Dispositivos:** Desktop vs Mobile vs Tablet

### Conversiones:
- **Clics en CTA:** ¿Cuántos usuarios hacen clic en "Access The Future"?
- **Interacción con chatbot:** Tasa de conversión chatbot

---

## 🔍 Verificación de Instalación

### Método 1: Consola del Navegador
1. Abre tu landing page
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**
4. Escribe: `gtag`
5. Deberías ver la función definida (no "undefined")

### Método 2: Google Tag Assistant
1. Instala la extensión: [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Abre tu landing page
3. Haz clic en el icono de Tag Assistant
4. **Deberías ver:** "Google Analytics 4" en verde ✅

### Método 3: Network Tab
1. Abre tu landing page
2. Presiona `F12` → pestaña **Network**
3. Filtra por "analytics" o "gtag"
4. **Deberías ver** peticiones a `google-analytics.com/g/collect`

---

## 🚀 Próximos Pasos Recomendados

### 1. **Configurar Conversiones en GA4**
- Define qué acciones son "conversiones" importantes
- Ejemplos: apertura de chatbot, envío de formulario de contacto

### 2. **Crear Audiencias Personalizadas**
- Usuarios que abrieron el chatbot
- Usuarios que cambiaron de idioma
- Usuarios que enviaron más de 3 mensajes

### 3. **Configurar Alertas**
- Alerta si hay más de X errores de chatbot en 1 hora
- Alerta si la tasa de rebote supera el X%

### 4. **Integrar con Google Search Console**
- Conecta GA4 con Search Console
- Ve qué búsquedas de Google llevan a tu página

### 5. **Crear Informes Personalizados**
- Dashboard específico para el rendimiento de XONA chatbot
- Informe de conversión de visitantes a usuarios activos del chatbot

---

## 📞 Soporte

### Recursos de Google Analytics:
- **Documentación oficial:** https://support.google.com/analytics
- **Academia de Analytics:** https://analytics.google.com/analytics/academy/
- **Comunidad:** https://support.google.com/analytics/community

### Verificación de Estado:
- **Estado de Google Analytics:** https://status.cloud.google.com/

---

## ⚠️ Importante

### Privacidad y GDPR:
Si tu sitio tiene usuarios de Europa, considera agregar:
1. **Banner de cookies/consentimiento**
2. **Política de privacidad** actualizada mencionando Google Analytics
3. **Opción para rechazar tracking**

### Código de Ejemplo para Banner de Cookies:
```html
<!-- Agregar antes del cierre de </body> -->
<div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.9); color: white; padding: 20px; text-align: center; z-index: 10000;">
    <p>Este sitio usa cookies para mejorar tu experiencia. <a href="/privacy" style="color: #00f3ff;">Política de Privacidad</a></p>
    <button onclick="acceptCookies()" style="background: #00f3ff; border: none; padding: 10px 20px; cursor: pointer; margin: 0 10px;">Aceptar</button>
    <button onclick="rejectCookies()" style="background: #666; color: white; border: none; padding: 10px 20px; cursor: pointer;">Rechazar</button>
</div>
```

---

## ✅ Checklist de Verificación

- [x] ID de Google Analytics configurado: `G-GY61W7K2B6`
- [x] Script de GA4 cargado en `<head>`
- [x] Evento: Clic en botón CTA
- [x] Evento: Apertura de chatbot
- [x] Evento: Cierre de chatbot
- [x] Evento: Cambio de idioma
- [x] Evento: Mensaje enviado
- [x] Evento: Respuesta exitosa
- [x] Evento: Error de conexión
- [ ] Verificación en tiempo real completada
- [ ] Banner de cookies implementado (si es necesario)
- [ ] Política de privacidad actualizada

---

**Fecha de configuración:** 2025-12-13  
**Configurado por:** Antigravity AI  
**Estado:** ✅ **COMPLETADO Y OPERACIONAL**
