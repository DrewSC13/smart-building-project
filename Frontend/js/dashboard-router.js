// dashboard-router.js - Manejo de redirección después del login
class DashboardRouter {
    constructor() {
        this.authChecked = false;
        this.currentPath = window.location.pathname;
        this.init();
    }

    init() {
        console.log('🔄 DashboardRouter inicializando...');
        console.log('📄 Página actual:', this.currentPath);
        console.log('🔍 Es dashboard:', this.isDashboardPage());
        console.log('🔍 Es login:', this.isLoginPage());
        
        // ✅ SOLO verificar autenticación en páginas de dashboard
        if (this.isDashboardPage()) {
            console.log('🔐 Verificando autenticación en dashboard...');
            this.checkAuthentication();
        } else if (this.isLoginPage()) {
            console.log('🔐 En página de login, verificando si ya está autenticado...');
            this.checkIfAlreadyAuthenticated();
        } else {
            console.log('ℹ️ No es dashboard ni login, no se verifica autenticación');
        }
    }

    isLoginPage() {
        return this.currentPath === '/login/' || 
               this.currentPath.includes('login.html') || 
               this.currentPath === '/api/login/' ||
               this.currentPath === '/login';
    }

    isDashboardPage() {
        return this.currentPath.includes('dashboard') || 
               this.currentPath.startsWith('/api/dashboard-') ||
               this.currentPath === '/api/dashboard-admin/' ||
               this.currentPath === '/api/dashboard-residente/' ||
               this.currentPath === '/api/dashboard-guardia/' ||
               this.currentPath === '/api/dashboard-tecnico/' ||
               this.currentPath === '/api/dashboard-visitante/' ||
               this.currentPath === '/dashboard-admin/' ||
               this.currentPath === '/dashboard-residente/' ||
               this.currentPath === '/dashboard-guardia/' ||
               this.currentPath === '/dashboard-tecnico/' ||
               this.currentPath === '/dashboard-visitante/';
    }

    checkIfAlreadyAuthenticated() {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (token && userRole && this.isValidToken(token) && this.isValidRole(userRole)) {
            console.log('✅ Usuario ya autenticado, redirigiendo a dashboard...');
            this.redirectToDashboard(userRole);
            return true;
        }
        return false;
    }

    checkAuthentication() {
        if (this.authChecked) {
            console.log('✅ Autenticación ya verificada');
            return true;
        }
        
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        console.log('🔍 VERIFICANDO AUTENTICACIÓN:');
        console.log('  - Token:', token ? '✅ Existe' : '❌ No existe');
        console.log('  - Rol:', userRole);
        console.log('  - Página actual:', this.currentPath);
        
        // ✅ CRÍTICO: Si no hay token en un dashboard, redirigir a login
        if (!token) {
            console.log('❌ NO HAY TOKEN en dashboard, redirigiendo a login...');
            this.redirectToLogin();
            return false;
        }

        // ✅ Verificar formato del token
        if (!this.isValidToken(token)) {
            console.log('❌ Token inválido, redirigiendo a login...');
            this.redirectToLogin();
            return false;
        }

        // ✅ Verificar rol válido
        if (!this.isValidRole(userRole)) {
            console.log('❌ Rol inválido:', userRole);
            this.redirectToLogin();
            return false;
        }

        this.authChecked = true;
        console.log('✅ AUTENTICACIÓN EXITOSA - Usuario puede acceder al dashboard');
        return true;
    }

    isValidToken(token) {
        if (!token || token === 'undefined' || token === 'null') {
            return false;
        }

        try {
            // Para tokens UUID (generados por el backend)
            if (token.includes('-') && token.length === 36) {
                console.log('✅ Token UUID válido');
                return true;
            }

            // Para tokens simples base64
            try {
                const tokenData = JSON.parse(atob(token));
                console.log('✅ Token base64 válido:', tokenData);
                
                // Verificar expiración (24 horas)
                if (tokenData.timestamp) {
                    const tokenTime = parseInt(tokenData.timestamp);
                    const currentTime = Date.now();
                    const hoursDiff = (currentTime - tokenTime) / (1000 * 60 * 60);
                    
                    if (hoursDiff > 24) {
                        console.log('❌ Token expirado:', hoursDiff.toFixed(2) + ' horas');
                        return false;
                    }
                }
                
                return true;
            } catch (parseError) {
                console.log('✅ Token con formato simple, permitiendo acceso');
                return true;
            }
        } catch (error) {
            console.warn('⚠ Token con formato simple, permitiendo acceso');
            return true;
        }
    }

    isValidRole(role) {
        const validRoles = ['administrador', 'residente', 'guardia', 'tecnico', 'visitante'];
        const isValid = validRoles.includes(role);
        console.log(`🔍 Rol "${role}" es válido:`, isValid);
        return isValid;
    }

    redirectToLogin() {
        console.log('🔒 REDIRIGIENDO A LOGIN...');
        
        // Limpiar sesión
        this.clearSession();
        
        // Redirigir después de un breve delay
        setTimeout(() => {
            console.log('🚀 Ejecutando redirección a login...');
            window.location.href = '/login/';
        }, 1000);
    }

    redirectToDashboard(role) {
        console.log(`🎯 Redirigiendo a dashboard de: ${role}`);
        
        const dashboardMap = {
            'administrador': '/api/dashboard-admin/',
            'residente': '/api/dashboard-residente/',
            'guardia': '/api/dashboard-guardia/',
            'tecnico': '/api/dashboard-tecnico/',
            'visitante': '/api/dashboard-visitante/'
        };
        
        const dashboardUrl = dashboardMap[role] || '/api/dashboard-residente/';
        
        console.log(`🚀 URL de destino: ${dashboardUrl}`);
        
        // ✅ CORRECCIÓN: Redirección inmediata sin delays
        console.log('🔀 EJECUTANDO REDIRECCIÓN INMEDIATA...');
        window.location.href = dashboardUrl;
    }

    clearSession() {
        console.log('🧹 Limpiando sesión...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('invitationCode');
        this.authChecked = false;
    }

    // Método para obtener información del usuario actual
    getCurrentUser() {
        try {
            const token = localStorage.getItem('authToken');
            const userRole = localStorage.getItem('userRole');
            const userEmail = localStorage.getItem('userEmail');
            const userName = localStorage.getItem('userName');
            
            if (token && userRole) {
                return {
                    role: userRole,
                    email: userEmail,
                    name: userName,
                    token: token
                };
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    }

    // Método para debug
    debugAuth() {
        console.log('🔍 DEBUG - Estado completo:');
        console.log('  - authToken:', localStorage.getItem('authToken'));
        console.log('  - userRole:', localStorage.getItem('userRole'));
        console.log('  - userEmail:', localStorage.getItem('userEmail'));
        console.log('  - currentPath:', this.currentPath);
        console.log('  - isDashboardPage:', this.isDashboardPage());
        console.log('  - isLoginPage:', this.isLoginPage());
        console.log('  - authChecked:', this.authChecked);
    }
}

// ✅ FUNCIÓN GLOBAL MEJORADA para login exitoso
window.handleLoginSuccess = function(userData) {
    console.log('🎉 LOGIN EXITOSO - Iniciando redirección...');
    
    if (userData && userData.token) {
        // ✅ GUARDAR DATOS PRIMERO
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userEmail', userData.email);
        if (userData.name) {
            localStorage.setItem('userName', userData.name);
        }
        
        console.log('✅ Datos guardados en localStorage:');
        console.log('  - Token:', userData.token);
        console.log('  - Rol:', userData.role);
        console.log('  - Email:', userData.email);
        
        // ✅ REDIRECCIÓN INMEDIATA
        const role = userData.role || 'residente';
        console.log(`🎯 Redirigiendo a dashboard de: ${role}`);
        
        const dashboardMap = {
            'administrador': '/api/dashboard-admin/',
            'residente': '/api/dashboard-residente/',
            'guardia': '/api/dashboard-guardia/',
            'tecnico': '/api/dashboard-tecnico/',
            'visitante': '/api/dashboard-visitante/'
        };
        
        const dashboardUrl = dashboardMap[role] || '/api/dashboard-residente/';
        
        console.log(`🚀 URL de destino: ${dashboardUrl}`);
        
        // ✅ REDIRECCIÓN DIRECTA SIN DELAY
        window.location.href = dashboardUrl;
    } else {
        console.error('❌ Error: userData o token no definidos');
        alert('Error en el login. Por favor intenta nuevamente.');
    }
};

// ✅ NUEVA: Función global para manejar login
window.handleLogin = async function(credentials) {
    try {
        console.log('🔐 Iniciando login...', credentials);
        
        if (!window.apiService) {
            console.error('❌ apiService no disponible');
            return;
        }
        
        const result = await window.apiService.login(credentials);
        
        if (result.success) {
            window.handleLoginSuccess(result.user);
        } else {
            alert(result.message || 'Error en el login');
        }
    } catch (error) {
        console.error('❌ Error en login:', error);
        alert('Error: ' + error.message);
    }
};

// Función global para logout
window.handleLogout = function() {
    console.log('🔒 Cerrando sesión...');
    localStorage.clear();
    setTimeout(() => {
        window.location.href = '/login/';
    }, 500);
};

// Inicializar en todas las páginas
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando aplicación...');
    console.log('📄 Página:', window.location.pathname);
    
    // Inicializar DashboardRouter siempre
    window.dashboardRouter = new DashboardRouter();
    
    // Mostrar información del usuario si está logueado
    const userInfo = window.dashboardRouter.getCurrentUser();
    if (userInfo) {
        console.log('👤 Usuario actual:', userInfo);
    }
    
    // ✅ DEBUG: Mostrar estado completo
    window.dashboardRouter.debugAuth();
});