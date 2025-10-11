// Frontend/js/api-service.js
class ApiService {
    constructor() {
        this.baseURL = '/api';
        this.csrfToken = this.getCookie('csrftoken');
        this.events = {};
        this.init();
    }

    init() {
        console.log('🚀 ApiService inicializando...');
        this.setupInterceptors();
        this.setupRealTimeConnection();
    }

    setupInterceptors() {
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            // ✅ CORREGIDO: Mejor manejo de headers
            options.headers = {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken'),
                ...options.headers
            };

            console.log(`📤 API Request: ${options.method || 'GET'} ${url}`);

            try {
                const response = await originalFetch(url, options);
                console.log(`📥 API Response: ${response.status} ${url}`);
                
                if (response.status === 401) {
                    this.handleUnauthorized();
                    throw new Error('Sesión expirada');
                }

                if (response.status === 403) {
                    this.handleForbidden();
                    throw new Error('Acceso denegado');
                }

                return response;
            } catch (error) {
                console.error('❌ API Error:', error);
                throw error;
            }
        };
    }

    setupRealTimeConnection() {
        this.setupWebSocket();
        this.startPolling();
    }

    setupWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.ws = new WebSocket(`${protocol}//${window.location.host}/ws/dashboard/`);
            
            this.ws.onopen = () => {
                console.log('🔌 WebSocket conectado');
                const user = this.getCurrentUser();
                if (user) {
                    this.sendWebSocketMessage({ 
                        type: 'subscribe',
                        user: user
                    });
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleRealTimeMessage(data);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = (event) => {
                console.log(`🔌 WebSocket desconectado (code: ${event.code}), reconectando...`);
                setTimeout(() => this.setupWebSocket(), 5000);
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
            };
        } catch (error) {
            console.warn('⚠ WebSocket no disponible, usando polling');
        }
    }

    sendWebSocketMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('⚠ WebSocket no está conectado');
        }
    }

    handleRealTimeMessage(data) {
        console.log('📨 Mensaje tiempo real:', data);
        
        switch(data.type) {
            case 'maintenance_update':
                this.emitEvent('maintenanceUpdated', data.data);
                break;
            case 'financial_update':
                this.emitEvent('financialUpdated', data.data);
                break;
            case 'access_update':
                this.emitEvent('accessUpdated', data.data);
                break;
            case 'communication_update':
                this.emitEvent('communicationUpdated', data.data);
                break;
            case 'resident_update':
                this.emitEvent('residentUpdated', data.data);
                break;
            case 'ticket_assigned':
                this.emitEvent('ticketAssigned', data.data);
                break;
            case 'payment_received':
                this.emitEvent('paymentReceived', data.data);
                break;
            case 'permission_created':
                this.emitEvent('permissionCreated', data.data);
                break;
            case 'session_expired':
                this.handleUnauthorized();
                break;
            default:
                console.log('📨 Mensaje no manejado:', data.type);
        }
    }

    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    emitEvent(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    startPolling() {
        if (this.getCurrentUser()) {
            setInterval(() => {
                this.checkForUpdates();
            }, 30000);
        }
    }

    async checkForUpdates() {
        try {
            const user = this.getCurrentUser();
            if (!user) return;

            const updates = await this.get('/updates/');
            if (updates && updates.changes) {
                updates.changes.forEach(change => {
                    this.handleRealTimeMessage(change);
                });
            }
        } catch (error) {
            console.warn('⚠ Error checking updates:', error);
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'),
                    ...options.headers
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleUnauthorized();
                } else if (response.status === 403) {
                    this.handleForbidden();
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`❌ API Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ✅ NUEVO: Método específico para login
    async login(credentials) {
        try {
            console.log('🔐 Iniciando proceso de login...');
            
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error(`Error de login: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.user) {
                console.log('✅ Login exitoso:', data.user);
                return data;
            } else {
                throw new Error(data.message || 'Error en credenciales');
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            throw error;
        }
    }

    async syncMaintenanceTickets() {
        try {
            return await this.get('/maintenance/tickets/sync/');
        } catch (error) {
            console.error('❌ Error syncing maintenance tickets:', error);
            return { tickets: [], error: 'Error de conexión' };
        }
    }

    async syncFinancialData() {
        try {
            return await this.get('/financial/data/sync/');
        } catch (error) {
            console.error('❌ Error syncing financial data:', error);
            return { data: [], error: 'Error de conexión' };
        }
    }

    async syncAccessLogs() {
        try {
            return await this.get('/access/logs/sync/');
        } catch (error) {
            console.error('❌ Error syncing access logs:', error);
            return { logs: [], error: 'Error de conexión' };
        }
    }

    async syncResidents() {
        try {
            return await this.get('/residents/sync/');
        } catch (error) {
            console.error('❌ Error syncing residents:', error);
            return { residents: [], error: 'Error de conexión' };
        }
    }

    async syncCommunications() {
        try {
            return await this.get('/communications/sync/');
        } catch (error) {
            console.error('❌ Error syncing communications:', error);
            return { communications: [], error: 'Error de conexión' };
        }
    }

    async notifyMaintenanceChange(action, data) {
        try {
            this.sendWebSocketMessage({
                type: 'maintenance_change',
                action: action,
                data: data,
                user: this.getCurrentUser(),
                timestamp: new Date().toISOString()
            });

            return await this.post('/notify/maintenance/', {
                action: action,
                data: data
            });
        } catch (error) {
            console.error('❌ Error notifying maintenance change:', error);
        }
    }

    async notifyFinancialChange(action, data) {
        try {
            this.sendWebSocketMessage({
                type: 'financial_change',
                action: action,
                data: data,
                user: this.getCurrentUser(),
                timestamp: new Date().toISOString()
            });

            return await this.post('/notify/financial/', {
                action: action,
                data: data
            });
        } catch (error) {
            console.error('❌ Error notifying financial change:', error);
        }
    }

    async notifyAccessChange(action, data) {
        try {
            this.sendWebSocketMessage({
                type: 'access_change',
                action: action,
                data: data,
                user: this.getCurrentUser(),
                timestamp: new Date().toISOString()
            });

            return await this.post('/notify/access/', {
                action: action,
                data: data
            });
        } catch (error) {
            console.error('❌ Error notifying access change:', error);
        }
    }

    async notifyResidentChange(action, data) {
        try {
            this.sendWebSocketMessage({
                type: 'resident_change',
                action: action,
                data: data,
                user: this.getCurrentUser(),
                timestamp: new Date().toISOString()
            });

            return await this.post('/notify/resident/', {
                action: action,
                data: data
            });
        } catch (error) {
            console.error('❌ Error notifying resident change:', error);
        }
    }

    async notifyCommunicationChange(action, data) {
        try {
            this.sendWebSocketMessage({
                type: 'communication_change',
                action: action,
                data: data,
                user: this.getCurrentUser(),
                timestamp: new Date().toISOString()
            });

            return await this.post('/notify/communication/', {
                action: action,
                data: data
            });
        } catch (error) {
            console.error('❌ Error notifying communication change:', error);
        }
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    getCurrentUser() {
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
    }

    handleUnauthorized() {
        console.log('🔒 Sesión no autorizada - verificando contexto');
        
        const currentPath = window.location.pathname;
        const isDashboard = currentPath.includes('dashboard') || currentPath.startsWith('/api/dashboard-');
        
        if (isDashboard) {
            console.log('🔒 Redirigiendo a login desde dashboard...');
            this.clearSession();
            setTimeout(() => {
                window.location.href = '/login/';
            }, 2000);
        } else {
            console.log('⚠ Sesión expirada pero no en dashboard, no redirigiendo');
        }
    }

    handleForbidden() {
        console.log('🚫 Acceso denegado');
        this.emitEvent('accessDenied', { message: 'No tienes permisos para esta acción' });
    }

    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('invitationCode');
        
        sessionStorage.clear();
        
        if (this.ws) {
            this.ws.close();
        }
    }

    async checkConnection() {
        try {
            const response = await fetch('/api/health/', {
                method: 'GET',
                headers: {
                    'X-CSRFToken': this.getCookie('csrftoken')
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async retryRequest(endpoint, options, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.request(endpoint, options);
            } catch (error) {
                if (attempt === maxRetries) throw error;
                console.warn(`⚠ Reintento ${attempt}/${maxRetries} para ${endpoint}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
}

// ✅ CORREGIDO: Inicialización segura
if (typeof window !== 'undefined') {
    window.apiService = new ApiService();
}