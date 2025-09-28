class DashboardRouter {
    constructor() {
        this.init();
    }

    async init() {
        await this.verifyAuthentication();
        this.loadDashboard();
    }

    async verifyAuthentication() {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            this.redirectToLogin();
            return;
        }

        try {
            const response = await fetch('/api/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Token inválido');
            }

            this.userData = await response.json();
        } catch (error) {
            console.error('Error de autenticación:', error);
            this.redirectToLogin();
        }
    }

    loadDashboard() {
        if (!this.userData) return;

        const role = this.userData.role;
        const currentPath = window.location.pathname;
        
        const dashboardMap = {
            'administrador': '/dashboard-admin/',
            'residente': '/dashboard-residente/',
            'guardia': '/dashboard-guardia/',
            'tecnico': '/dashboard-tecnico/',
            'visitante': '/dashboard-visitante/'
        };

        const correctDashboard = dashboardMap[role];
        
        // Redirigir si no está en el dashboard correcto
        if (currentPath !== correctDashboard) {
            window.location.href = correctDashboard;
            return;
        }

        // Inicializar el dashboard específico
        this.initializeDashboard(role);
    }

    initializeDashboard(role) {
        const dashboardInitializers = {
            'administrador': () => {
                if (typeof AdminDashboard !== 'undefined') {
                    window.adminDashboard = new AdminDashboard();
                }
            },
            'residente': () => {
                if (typeof ResidenteDashboard !== 'undefined') {
                    window.residenteDashboard = new ResidenteDashboard();
                }
            },
            'guardia': () => {
                if (typeof GuardiaDashboard !== 'undefined') {
                    window.guardiaDashboard = new GuardiaDashboard();
                }
            },
            'tecnico': () => {
                if (typeof TecnicoDashboard !== 'undefined') {
                    window.tecnicoDashboard = new TecnicoDashboard();
                }
            },
            'visitante': () => {
                if (typeof VisitanteDashboard !== 'undefined') {
                    window.visitanteDashboard = new VisitanteDashboard();
                }
            }
        };

        const initialize = dashboardInitializers[role];
        if (initialize) {
            initialize();
        }
    }

    redirectToLogin() {
        localStorage.removeItem('authToken');
        window.location.href = '/login/';
    }

    getUserInfo() {
        return this.userData;
    }
}

// Inicializar router en cada dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardRouter = new DashboardRouter();
});