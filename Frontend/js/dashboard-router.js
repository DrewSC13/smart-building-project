// dashboard-router.js - Manejo de redirección después del login

class DashboardRouter {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔄 DashboardRouter inicializando...');
        
        // Verificar autenticación al cargar cualquier dashboard
        this.checkAuthentication();
        
        // También verificar si hay token en URL (para compatibilidad)
        const urlParams = new URLSearchParams(window.location.search);
        const loginToken = urlParams.get('token');
        
        if (loginToken) {
            console.log('🔑 Token encontrado en URL:', loginToken);
            this.handleTokenFromUrl(loginToken);
        }
    }

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        console.log('🔍 Verificando autenticación:');
        console.log('Token en localStorage:', token ? '✅ Existe' : '❌ No existe');
        console.log('Rol en localStorage:', userRole);
        
        if (!token) {
            console.log('❌ No hay token, redirigiendo a login...');
            this.redirectToLogin();
            return false;
        }

        // Verificación simple del token (sin validación JWT compleja)
        try {
            // Intentar decodificar el token simple
            const tokenData = JSON.parse(atob(token));
            console.log('✅ Token válido:', tokenData);
            return true;
        } catch (error) {
            console.warn('⚠️ Token con formato simple, permitiendo acceso');
            // Si no es un token base64 JSON, igual permitimos el acceso
            return true;
        }
    }

    handleTokenFromUrl(loginToken) {
        console.log('🔄 Procesando token desde URL...');
        
        // Guardar el token en localStorage para futuras sesiones
        localStorage.setItem('authToken', loginToken);
        
        // Intentar obtener el rol del token
        try {
            const tokenData = JSON.parse(atob(loginToken));
            if (tokenData.role) {
                localStorage.setItem('userRole', tokenData.role);
                localStorage.setItem('userEmail', tokenData.email);
                console.log('✅ Datos de usuario guardados desde token URL');
            }
        } catch (error) {
            console.warn('⚠️ Token URL no contiene datos JSON, usando rol por defecto');
            localStorage.setItem('userRole', 'residente');
        }
        
        // Recargar la página sin parámetros de URL
        window.location.href = window.location.pathname;
    }

    redirectByRole(role = null) {
        const targetRole = role || localStorage.getItem('userRole') || 'residente';
        
        console.log(`🎯 Redirigiendo por rol: ${targetRole}`);
        
        const dashboards = {
            'administrador': 'dashboard-admin.html',
            'residente': 'dashboard-residente.html',
            'guardia': 'dashboard-guardia.html',
            'tecnico': 'dashboard-tecnico.html',
            'visitante': 'dashboard-visitante.html'
        };

        const dashboardFile = dashboards[targetRole] || 'dashboard-residente.html';
        
        console.log(`🚀 Redirigiendo a: ${dashboardFile}`);
        
        // Solo redirigir si no estamos ya en esa página
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== dashboardFile) {
            window.location.href = dashboardFile;
        } else {
            console.log('✅ Ya está en la página correcta');
        }
    }

    redirectToLogin() {
        console.log('🔒 Redirigiendo a login...');
        
        // Limpiar localStorage antes de redirigir
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('user_data');
        
        sessionStorage.clear();
        
        setTimeout(() => {
            // ✅ CORRECCIÓN: Usar ruta de Django
            window.location.href = '/login/';
        }, 500);
    }

    // Método para verificar y mantener la sesión
    validateSession() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('🚨 Sesión expirada o inválida');
            this.redirectToLogin();
            return false;
        }
        
        console.log('✅ Sesión válida');
        return true;
    }

    // Método para obtener información del usuario actual
    getCurrentUser() {
        try {
            const token = localStorage.getItem('authToken');
            const userRole = localStorage.getItem('userRole');
            const userEmail = localStorage.getItem('userEmail');
            
            if (token && userRole) {
                return {
                    role: userRole,
                    email: userEmail,
                    token: token
                };
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    }

    // Método para cerrar sesión
    logout() {
        console.log('🔒 Cerrando sesión...');
        
        // Limpiar todo el localStorage relacionado con la sesión
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('user_data');
        
        sessionStorage.clear();
        
        // Redirigir al login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }

    // Método para debuggear el estado de autenticación
    debugAuth() {
        console.log('🔍 DEBUG - Estado de autenticación:');
        console.log('authToken:', localStorage.getItem('authToken'));
        console.log('userRole:', localStorage.getItem('userRole'));
        console.log('userEmail:', localStorage.getItem('userEmail'));
        console.log('URL actual:', window.location.href);
        console.log('Parámetros URL:', new URLSearchParams(window.location.search).toString());
    }
}

// Función global para manejar login exitoso
window.handleLoginSuccess = function(userData) {
    console.log('🎉 Login exitoso, manejando redirección...');
    
    if (userData && userData.token) {
        localStorage.setItem('authToken', userData.token);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userEmail', userData.email);
    }
    
    const router = new DashboardRouter();
    router.redirectByRole(userData?.role);
};

// Función global para logout
window.handleLogout = function() {
    const router = new DashboardRouter();
    router.logout();
};

// Función global para verificar autenticación
window.checkAuth = function() {
    const router = new DashboardRouter();
    return router.validateSession();
};

// Función global para debug
window.debugAuth = function() {
    const router = new DashboardRouter();
    router.debugAuth();
};

// Inicializar el router cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando DashboardRouter...');
    window.dashboardRouter = new DashboardRouter();
    
    // Agregar event listener para el botón de logout si existe
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.handleLogout();
        });
    }
    
    // Mostrar información del usuario si está logueado
    const userInfo = window.dashboardRouter.getCurrentUser();
    if (userInfo) {
        console.log('👤 Usuario actual:', userInfo);
        
        // Actualizar la UI con información del usuario si es necesario
        const userMenu = document.querySelector('.user-menu span');
        if (userMenu && userInfo.email) {
            userMenu.textContent = userInfo.email.split('@')[0]; // Mostrar solo el nombre
        }
        
        const roleBadge = document.querySelector('.role-badge');
        if (roleBadge && userInfo.role) {
            roleBadge.textContent = userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1);
        }
    }
});

// Interceptar clicks en enlaces de logout
document.addEventListener('click', function(e) {
    if (e.target.matches('[href*="logout"], [onclick*="logout"]')) {
        e.preventDefault();
        window.handleLogout();
    }
});

// Verificar sesión periódicamente (cada minuto)
setInterval(() => {
    if (window.dashboardRouter) {
        window.dashboardRouter.validateSession();
    }
}, 60000);