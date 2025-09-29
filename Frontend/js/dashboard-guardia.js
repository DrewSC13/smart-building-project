class GuardiaDashboard {
    constructor() {
        this.guardData = null;
        this.alerts = [];
        this.cameras = [];
        this.accessLog = [];
        this.systemStartTime = new Date();
        this.init();
    }

    async init() {
        await this.loadGuardData();
        this.initializeDashboard();
        this.startRealTimeServices();
        this.showNotification('Sistema de vigilancia activado', 'success');
    }

    async loadGuardData() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            // Cargar datos del guardia desde el backend
            const response = await fetch('/api/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                this.guardData = {
                    name: `${userData.first_name} ${userData.last_name}`,
                    email: userData.email,
                    phone: userData.phone
                };
                this.updateGuardInterface();
            } else {
                throw new Error('Error al cargar datos del guardia');
            }
        } catch (error) {
            console.error('Error:', error);
            // Usar datos por defecto si hay error
            this.guardData = {
                name: 'Guardia de Seguridad',
                email: 'guardia@buildingpro.com',
                phone: 'N/A'
            };
            this.updateGuardInterface();
        }
    }

    updateGuardInterface() {
        document.getElementById('guardName').textContent = this.guardData.name;
        document.getElementById('guardIdDisplay').textContent = `ID: ${this.guardData.phone || 'Sistema Activo'}`;
        document.getElementById('systemStartTime').textContent = this.systemStartTime.toLocaleTimeString('es-ES', { hour12: false });
    }

    initializeDashboard() {
        this.initializeEventListeners();
        this.loadInitialData();
        this.startTimeUpdates();
    }

    initializeEventListeners() {
        // Filtros de alertas
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterAlerts(e.target.dataset.filter);
            });
        });

        // Control de cámaras
        document.getElementById('cameraGroup').addEventListener('change', () => {
            this.filterCameras();
        });

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    loadInitialData() {
        // Cargar datos iniciales de cámaras
        this.cameras = this.generateCameraData();
        this.updateCamerasDisplay();

        // Cargar estado inicial del sistema
        this.updateSystemStatus();

        // Configurar horarios de rondas
        this.setupRoundSchedule();

        // Cargar alertas iniciales
        this.generateInitialAlerts();
    }

    generateCameraData() {
        return [
            { id: 1, name: 'Entrada Principal', status: 'online', group: 'entrada' },
            { id: 2, name: 'Recepción', status: 'online', group: 'entrada' },
            { id: 3, name: 'Estacionamiento N1', status: 'online', group: 'estacionamiento' },
            { id: 4, name: 'Estacionamiento N2', status: 'online', group: 'estacionamiento' },
            { id: 5, name: 'Hall Principal', status: 'online', group: 'areas-comunes' },
            { id: 6, name: 'Área Piscina', status: 'offline', group: 'areas-comunes' },
            { id: 7, name: 'Gimnasio', status: 'online', group: 'areas-comunes' },
            { id: 8, name: 'Puerta Trasera', status: 'online', group: 'entrada' }
        ];
    }

    generateInitialAlerts() {
        const initialAlerts = [
            { 
                type: 'info', 
                title: 'Sistema de vigilancia activo', 
                message: 'Monitoreo en tiempo real iniciado',
                priority: 'low'
            },
            { 
                type: 'info', 
                title: 'Conexión establecida', 
                message: 'Conexión con servidor central establecida',
                priority: 'low'
            }
        ];
        
        initialAlerts.forEach(alert => this.addAlert(alert));
    }

    setupRoundSchedule() {
        const now = new Date();
        const nextRound = new Date(now);
        nextRound.setHours(now.getHours() + 1, 0, 0, 0);
        
        document.getElementById('nextRoundTime').textContent = nextRound.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('lastRoundTime').textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('lastRoundGuard').textContent = this.guardData.name;
    }

    startRealTimeServices() {
        // Simular alertas en tiempo real cada 30-60 segundos
        setInterval(() => this.generateRandomAlert(), 30000 + Math.random() * 30000);
        
        // Actualizar estado del sistema cada 15 segundos
        setInterval(() => this.updateSystemStatus(), 15000);
        
        // Simular accesos automáticos cada 45 segundos
        setInterval(() => this.generateRandomAccess(), 45000);
        
        // Verificar estado de conexión cada 10 segundos
        setInterval(() => this.checkConnection(), 10000);
    }

    startTimeUpdates() {
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = now.toLocaleTimeString('es-ES', { hour12: false });
        document.getElementById('current-date').textContent = now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('lastUpdate').textContent = `Última actualización: ${now.toLocaleTimeString('es-ES', { hour12: false })}`;
    }

    generateRandomAlert() {
        const alertTypes = [
            { 
                type: 'info', 
                title: 'Movimiento detectado', 
                message: 'Área: Estacionamiento N1 - Movimiento normal',
                priority: 'low'
            },
            { 
                type: 'warning', 
                title: 'Puerta abierta', 
                message: 'Puerta principal abierta por más de 2 minutos',
                priority: 'medium' 
            },
            { 
                type: 'critical', 
                title: 'Sensor de puerta forzada', 
                message: 'Intento de acceso no autorizado en puerta trasera',
                priority: 'high' 
            },
            { 
                type: 'info', 
                title: 'Ronda completada', 
                message: 'Ronda de vigilancia interna finalizada correctamente',
                priority: 'low' 
            }
        ];
        
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        this.addAlert(randomAlert);
    }

    addAlert(alertData) {
        const alert = {
            id: Date.now(),
            ...alertData,
            time: new Date()
        };
        
        this.alerts.unshift(alert);
        this.updateAlertsDisplay();
        
        // Mostrar notificación para alertas importantes
        if (alertData.priority === 'high') {
            this.showNotification(`ALERTA CRÍTICA: ${alertData.title}`, 'error');
        } else if (alertData.priority === 'medium') {
            this.showNotification(`Advertencia: ${alertData.title}`, 'warning');
        }
    }

    updateAlertsDisplay() {
        const container = document.getElementById('alertsContainer');
        const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        const filteredAlerts = filter === 'all' 
            ? this.alerts 
            : this.alerts.filter(alert => alert.type === filter);
        
        container.innerHTML = filteredAlerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                </div>
                <div class="alert-time">${alert.time.toLocaleTimeString('es-ES', { hour12: false })}</div>
            </div>
        `).join('');
    }

    filterAlerts(filterType) {
        this.updateAlertsDisplay();
    }

    updateCamerasDisplay() {
        const container = document.getElementById('camerasGrid');
        const groupFilter = document.getElementById('cameraGroup').value;
        
        const filteredCameras = groupFilter === 'all' 
            ? this.cameras 
            : this.cameras.filter(cam => cam.group === groupFilter);
        
        container.innerHTML = filteredCameras.map(camera => `
            <div class="camera-card">
                <div class="camera-feed">
                    <div class="camera-placeholder">
                        <i class="fas fa-video${camera.status === 'offline' ? '-slash' : ''}"></i>
                        <span>${camera.name}</span>
                        ${camera.status === 'offline' ? '<div class="offline-overlay">OFFLINE</div>' : ''}
                    </div>
                </div>
                <div class="camera-info">
                    <span class="camera-name">${camera.name}</span>
                    <span class="camera-status ${camera.status}">${camera.status === 'online' ? 'En línea' : 'Offline'}</span>
                </div>
            </div>
        `).join('');
    }

    filterCameras() {
        this.updateCamerasDisplay();
    }

    updateSystemStatus() {
        // Simular estado del sistema
        const onlineCameras = this.cameras.filter(cam => cam.status === 'online').length;
        const totalCameras = this.cameras.length;
        
        // Actualizar contadores
        document.getElementById('camCount').textContent = `${onlineCameras}/${totalCameras}`;
        document.getElementById('sensorCount').textContent = `${Math.floor(Math.random() * 6) + 95}%`; // 95-100%
        document.getElementById('doorCount').textContent = '12/12';
        
        // Actualizar estados visuales
        document.getElementById('camStatus').className = `status-item ${onlineCameras === totalCameras ? 'online' : 'warning'}`;
        document.getElementById('sensorStatus').className = 'status-item online';
        document.getElementById('doorStatus').className = 'status-item online';
        
        // Actualizar contador de accesos
        document.getElementById('accessCount').textContent = this.accessLog.length;
    }

    generateRandomAccess() {
        const accessTypes = ['Residente', 'Visitante', 'Proveedor', 'Personal'];
        const doors = ['Entrada Principal', 'Puerta Trasera', 'Estacionamiento N1', 'Estacionamiento N2'];
        
        const access = {
            id: Date.now(),
            type: accessTypes[Math.floor(Math.random() * accessTypes.length)],
            door: doors[Math.floor(Math.random() * doors.length)],
            time: new Date(),
            authorized: Math.random() > 0.1 // 90% autorizados
        };
        
        this.accessLog.unshift(access);
        this.updateAccessLog();
    }

    updateAccessLog() {
        const container = document.getElementById('accessLog');
        const recentLogs = this.accessLog.slice(0, 10); // Últimos 10 accesos
        
        container.innerHTML = recentLogs.map(access => `
            <div class="log-entry">
                <strong>${access.type}</strong> - ${access.door}
                <span class="badge">${access.authorized ? 'Autorizado' : 'Denegado'}</span>
                <br>
                <small>${access.time.toLocaleTimeString('es-ES', { hour12: false })}</small>
            </div>
        `).join('');
    }

    // Control de puertas
    controlDoor(doorId, action) {
        const door = document.getElementById(`door${doorId}`);
        const status = document.getElementById(`doorStatus${doorId}`);
        
        if (action === 'open') {
            door.textContent = 'Abriendo...';
            door.disabled = true;
            
            setTimeout(() => {
                door.textContent = 'Cerrar';
                door.classList.add('close');
                door.classList.remove('open');
                status.textContent = 'Abierta';
                status.className = 'door-status warning';
                
                this.showNotification(`Puerta ${doorId} abierta`, 'success');
                
                // Cerrar automáticamente después de 10 segundos
                setTimeout(() => {
                    this.controlDoor(doorId, 'close');
                }, 10000);
                
            }, 2000);
            
        } else if (action === 'close') {
            door.textContent = 'Cerrando...';
            door.disabled = true;
            
            setTimeout(() => {
                door.textContent = 'Abrir';
                door.classList.add('open');
                door.classList.remove('close');
                status.textContent = 'Cerrada';
                status.className = 'door-status online';
                door.disabled = false;
                
                this.showNotification(`Puerta ${doorId} cerrada`, 'success');
            }, 2000);
        }
    }

    // Control de rondas
    startRound(roundId) {
        const round = document.getElementById(`round${roundId}`);
        const status = document.getElementById(`roundStatus${roundId}`);
        
        round.disabled = true;
        round.textContent = 'En progreso...';
        status.textContent = 'En progreso';
        status.className = 'status in-progress';
        
        this.showNotification('Ronda de vigilancia iniciada', 'success');
        
        // Simular finalización de ronda después de 5 minutos
        setTimeout(() => {
            round.style.display = 'none';
            status.textContent = 'Completada';
            status.className = 'status completed';
            this.showNotification('Ronda de vigilancia completada', 'success');
        }, 300000); // 5 minutos
    }

    // Funciones de emergencia
    openEmergencyModal() {
        document.getElementById('emergencyModal').style.display = 'block';
    }

    selectEmergencyOption(option) {
        document.getElementById('emergencyOptions').style.display = 'none';
        document.getElementById('emergencyConfirm').style.display = 'block';
        
        const confirmTitle = document.getElementById('confirmTitle');
        const confirmMessage = document.getElementById('confirmMessage');
        
        switch(option) {
            case 'fire':
                confirmTitle.textContent = 'Confirmar Alarma de Incendio';
                confirmMessage.textContent = '¿Está seguro de activar la alarma de incendio? Esto iniciará la evacuación automática.';
                break;
            case 'medical':
                confirmTitle.textContent = 'Confirmar Emergencia Médica';
                confirmMessage.textContent = '¿Está seguro de activar la alerta médica? Se contactará a servicios de emergencia.';
                break;
            case 'security':
                confirmTitle.textContent = 'Confirmar Emergencia de Seguridad';
                confirmMessage.textContent = '¿Está seguro de activar el protocolo de seguridad? Se bloquearán todas las puertas.';
                break;
            case 'evacuation':
                confirmTitle.textContent = 'Confirmar Evacuación';
                confirmMessage.textContent = '¿Está seguro de iniciar la evacuación? Se activarán todas las salidas de emergencia.';
                break;
        }
        
        document.getElementById('confirmEmergency').onclick = () => this.activateEmergency(option);
    }

    activateEmergency(type) {
        this.showNotification(`EMERGENCIA ACTIVADA: ${type.toUpperCase()}`, 'error');
        
        // Simular acciones de emergencia
        switch(type) {
            case 'fire':
                this.addAlert({
                    type: 'critical',
                    title: 'ALARMA DE INCENDIO ACTIVADA',
                    message: 'Protocolo de evacuación iniciado automáticamente',
                    priority: 'high'
                });
                break;
            case 'security':
                this.addAlert({
                    type: 'critical',
                    title: 'PROTOCOLO DE SEGURIDAD ACTIVADO',
                    message: 'Todas las puertas bloqueadas - Contactando autoridades',
                    priority: 'high'
                });
                break;
        }
        
        this.closeEmergencyModal();
    }

    closeEmergencyModal() {
        document.getElementById('emergencyModal').style.display = 'none';
        document.getElementById('emergencyOptions').style.display = 'grid';
        document.getElementById('emergencyConfirm').style.display = 'none';
    }

    // Funciones de utilidad
    getAlertIcon(type) {
        const icons = {
            critical: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    checkConnection() {
        const connectionStatus = document.getElementById('connectionStatus');
        const isOnline = Math.random() > 0.05; // 95% de probabilidad de estar online
        
        if (isOnline) {
            connectionStatus.textContent = 'Conectado';
            connectionStatus.className = 'connection-status online';
        } else {
            connectionStatus.textContent = 'Desconectado';
            connectionStatus.className = 'connection-status offline';
            this.showNotification('Pérdida de conexión con servidor central', 'warning');
        }
    }

    // Control de sesión
    logout() {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }

    takeBreak() {
        this.showNotification('Pausa registrada - Sistema en modo automático', 'info');
        
        // Simular modo automático
        setTimeout(() => {
            this.showNotification('Regreso de pausa - Sistema en modo manual', 'success');
        }, 300000); // 5 minutos
    }

    refreshCameras() {
        this.showNotification('Actualizando cámaras...', 'info');
        
        // Simular refresco de cámaras
        setTimeout(() => {
            this.updateCamerasDisplay();
            this.showNotification('Cámaras actualizadas', 'success');
        }, 2000);
    }
}

// Inicializar dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new GuardiaDashboard();
});

// Funciones globales para los botones HTML
function openDoor(doorId) {
    window.dashboard.controlDoor(doorId, 'open');
}

function closeDoor(doorId) {
    window.dashboard.controlDoor(doorId, 'close');
}

function startRound(roundId) {
    window.dashboard.startRound(roundId);
}

function openEmergencyModal() {
    window.dashboard.openEmergencyModal();
}

function selectEmergencyOption(option) {
    window.dashboard.selectEmergencyOption(option);
}

function closeEmergencyModal() {
    window.dashboard.closeEmergencyModal();
}

function logout() {
    window.dashboard.logout();
}

function takeBreak() {
    window.dashboard.takeBreak();
}

function refreshCameras() {
    window.dashboard.refreshCameras();
}