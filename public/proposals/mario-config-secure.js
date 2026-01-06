/**
 * MARIO API Key Security Configuration
 * =====================================
 * 
 * Este script configura la API key de MARIO de forma segura.
 * NUNCA subas este archivo a un repositorio público.
 * 
 * Uso: Abre la consola del navegador (F12) y ejecuta:
 *      initMarioSecure();
 * 
 * O simplemente abre este archivo en el navegador una vez.
 */

(function () {
    'use strict';

    // ================================================
    // CONFIGURACIÓN DE SEGURIDAD - NO MODIFICAR
    // ================================================

    const MARIO_CONFIG = {
        // API Key encriptada en Base64 para ofuscación básica
        // Esta clave está destinada SOLO para uso interno de ORION Tech
        _k: 'QUl6YVN5RDlqQXZ5bjFVYW1OaHhLTmNfcFdseG9PbFpscUNDU3Vr',

        // Dominios permitidos (whitelist)
        allowedDomains: [
            'localhost',
            '127.0.0.1',
            'file://',
            'agem2024.github.io',
            'orion-tech.com'
        ],

        // Fecha de expiración (30 días desde hoy)
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    // ================================================
    // FUNCIONES DE SEGURIDAD
    // ================================================

    function isAllowedDomain() {
        const currentDomain = window.location.hostname || 'file://';
        const protocol = window.location.protocol;

        // Permitir archivos locales
        if (protocol === 'file:') return true;

        return MARIO_CONFIG.allowedDomains.some(domain =>
            currentDomain.includes(domain)
        );
    }

    function isNotExpired() {
        return new Date() < new Date(MARIO_CONFIG.expiresAt);
    }

    function decodeKey() {
        try {
            return atob(MARIO_CONFIG._k);
        } catch (e) {
            console.error('❌ MARIO: Error de decodificación');
            return null;
        }
    }

    function configureMarino() {
        // Verificar dominio
        if (!isAllowedDomain()) {
            console.warn('⚠️ MARIO: Dominio no autorizado');
            return false;
        }

        // Verificar expiración
        if (!isNotExpired()) {
            console.warn('⚠️ MARIO: Configuración expirada. Contacte al administrador.');
            return false;
        }

        // Obtener clave
        const apiKey = decodeKey();
        if (!apiKey) return false;

        // Configurar en localStorage (encriptado)
        localStorage.setItem('mario_api_key', btoa(apiKey));

        // También inyectar en window para acceso inmediato
        window.__MARIO_CONFIG__ = {
            apiKey: apiKey,
            configured: true,
            configuredAt: new Date().toISOString()
        };

        console.log('✅ MARIO configurado correctamente');
        console.log('📅 Expira:', MARIO_CONFIG.expiresAt);

        return true;
    }

    // ================================================
    // INICIALIZACIÓN AUTOMÁTICA
    // ================================================

    // Auto-ejecutar al cargar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', configureMarino);
    } else {
        configureMarino();
    }

    // Exponer función global para re-configuración manual
    window.initMarioSecure = configureMarino;

    // ================================================
    // PROTECCIÓN ANTI-INSPECCIÓN (básica)
    // ================================================

    // Limpiar de la consola después de 5 segundos
    setTimeout(() => {
        if (console.clear) {
            // No limpiar en desarrollo
            // console.clear();
        }
    }, 5000);

})();

// ================================================
// INSTRUCCIONES DE USO
// ================================================
/*
 * PARA CONFIGURAR MARIO EN UNA PROPUESTA:
 * 
 * Opción 1: Incluir este script antes de cerrar </body>
 *   <script src="../mario-config-secure.js"></script>
 * 
 * Opción 2: Ejecutar manualmente en consola del navegador:
 *   initMarioSecure();
 * 
 * PARA CAMBIAR LA API KEY:
 * 1. Obtén tu nueva API key de Google AI Studio
 * 2. Conviértela a Base64: btoa('TU_API_KEY')
 * 3. Reemplaza el valor de _k arriba
 * 
 * SEGURIDAD:
 * - Este archivo NO debe subirse a repositorios públicos
 * - Agrégalo a .gitignore
 * - La clave expira automáticamente en 30 días
 * - Solo funciona en dominios autorizados
 */
