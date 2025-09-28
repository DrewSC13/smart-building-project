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
    }

    loadInitialData() {
        // Cargar datos iniciales de cámaras
        this.cameras = this.generateCameraData();
        this.updateCamerasDisplay();

        // Cargar estado inicial del sistema
        this.updateSystemStatus();

        // Configurar horarios de rondas
        this.setupRoundSchedule();
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
        const people = [
            { name: 'Ana Martínez', type: 'residente' },
            { name: 'Pedro González', type: 'visitante' },
            { name: 'Laura Díaz', type: 'proveedor' },
            { name: 'Roberto Silva', type: 'tecnico' },
            { name: 'Carlos López', type: 'entrega' }
        ];
        
        const doors = ['Principal', 'Estacionamiento', 'Servicio'];
        const actions = ['entrada', 'salida'];
        
        const randomPerson = people[Math.floor(Math.random() * people.length)];
        const newAccess = {
            id: Date.now(),
            person: randomPerson.name,
            type: randomPerson.type,
            action: actions[Math.floor(Math.random() * actions.length)],
            time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
            door: doors[Math.floor(Math.random() * doors.length)]
        };
        
        this.accessLog.unshift(newAccess);
        // Mantener máximo 15 entradas
        if (this.accessLog.length > 15) {
            this.accessLog.pop();
        }
        this.updateAccessLog();
    }

    updateAccessLog() {
        const container = document.getElementById('accessLog');
        container.innerHTML = this.accessLog.map(access => `
            <div class="log-entry">
                <strong>${access.person}</strong> (${access.type}) - ${access.action} por ${access.door} - ${access.time}
            </div>
        `).join('');
        
        document.getElementById('accessCount').textContent = this.accessLog.length;
    }

    checkConnection() {
        // Simular verificación de conexión
        const isConnected = Math.random() > 0.1; // 90% de probabilidad de estar conectado
        const statusElement = document.getElementById('connectionStatus');
        
        if (isConnected) {
            statusElement.className = 'connection-status online';
            statusElement.innerHTML = '<i class="fas fa-wifi"></i> Conectado al servidor central';
        } else {
            statusElement.className = 'connection-status offline';
            statusElement.innerHTML = '<i class="fas fa-wifi-slash"></i> Conexión interrumpida - Modo local';
        }
    }

    getAlertIcon(type) {
        const icons = {
            'critical': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
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

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#27ae60',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db'
        };
        return colors[type] || '#3498db';
    }
}

// Funciones globales
function controlDoor(doorId, action) {
    const button = document.querySelector(`[data-door="${doorId}"]`);
    const status = document.getElementById(`door${doorId.charAt(0).toUpperCase() + doorId.slice(1)}Status`);
    
    window.guardiaDashboard.showNotification(
        `${action === 'open' ? 'Abriendo' : 'Cerrando'} puerta ${doorId}...`, 
        'info'
    );
    
    // Simular acción después de 2 segundos
    setTimeout(() => {
        if (action === 'open') {
            button.textContent = 'Cerrar';
            button.classList.remove('open');
            button.classList.add('close');
            button.setAttribute('onclick', `controlDoor('${doorId}', 'close')`);
            status.textContent = 'Abierta';
            status.className = 'door-status warning';
            window.guardiaDashboard.showNotification(`Puerta ${doorId} abierta`, 'success');
            
            // Cerrar automáticamente después de 30 segundos
            setTimeout(() => {
                if (status.textContent === 'Abierta') {
                    controlDoor(doorId, 'close');
                }
            }, 30000);
        } else {
            button.textContent = 'Abrir';
            button.classList.remove('close');
            button.classList.add('open');
            button.setAttribute('onclick', `controlDoor('${doorId}', 'open')`);
            status.textContent = 'Cerrada';
            status.className = 'door-status online';
            window.guardiaDashboard.showNotification(`Puerta ${doorId} cerrada`, 'success');
        }
    }, 2000);
}

function openAccessModal() {
    document.getElementById('accessModal').style.display = 'block';
}

function closeAccessModal() {
    document.getElementById('accessModal').style.display = 'none';
    document.getElementById('manualAccessForm').reset();
}

function registerManualAccess(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('personName').value,
        type: document.getElementById('personType').value,
        document: document.getElementById('personDoc').value,
        reason: document.getElementById('visitReason').value,
        destination: document.getElementById('destination').value,
        action: document.getElementById('accessType').value
    };
    
    window.guardiaDashboard.showNotification('Registrando acceso manual...', 'info');
    
    // Simular registro
    setTimeout(() => {
        const newAccess = {
            id: Date.now(),
            person: formData.name,
            type: formData.type,
            action: formData.action,
            time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
            door: 'Registro Manual',
            details: `${formData.reason} - ${formData.destination}`
        };
        
        window.guardiaDashboard.accessLog.unshift(newAccess);
        window.guardiaDashboard.updateAccessLog();
        closeAccessModal();
        window.guardiaDashboard.showNotification('Acceso registrado correctamente', 'success');
    }, 1000);
}

function activateEmergency() {
    document.getElementById('emergencyModal').style.display = 'block';
}

function closeEmergencyModal() {
    document.getElementById('emergencyModal').style.display = 'none';
    document.getElementById('emergencyConfirm').style.display = 'none';
}

let pendingEmergency = null;

function triggerFireProtocol() {
    pendingEmergency = {
        type: 'fire',
        title: 'Protocolo de Incendio',
        message: '¿Activar protocolo de incendio? Esto activará las alarmas y notificará a bomberos.'
    };
    showEmergencyConfirm();
}

function triggerSecurityProtocol() {
    pendingEmergency = {
        type: 'security',
        title: 'Protocolo de Seguridad',
        message: '¿Activar protocolo de seguridad? Esto bloqueará todos los accesos y alertará a la policía.'
    };
    showEmergencyConfirm();
}

function triggerMedicalProtocol() {
    pendingEmergency = {
        type: 'medical',
        title: 'Protocolo Médico',
        message: '¿Activar protocolo médico de emergencia? Esto alertará a servicios médicos de urgencia.'
    };
    showEmergencyConfirm();
}

function triggerEvacuationProtocol() {
    pendingEmergency = {
        type: 'evacuation',
        title: 'Protocolo de Evacuación',
        message: '¿Activar protocolo de evacuación general? Esto iniciará la evacuación de todo el edificio.'
    };
    showEmergencyConfirm();
}

function showEmergencyConfirm() {
    document.getElementById('confirmTitle').textContent = pendingEmergency.title;
    document.getElementById('confirmMessage').textContent = pendingEmergency.message;
    document.getElementById('emergencyConfirm').style.display = 'block';
    document.querySelector('.emergency-options').style.display = 'none';
}

function confirmEmergency() {
    window.guardiaDashboard.showNotification(
        `PROTOCOLO ACTIVADO: ${pendingEmergency.title}`, 
        'error'
    );
    
    // Aquí iría la lógica real de activación del protocolo
    setTimeout(() => {
        window.guardiaDashboard.addAlert({
            type: 'critical',
            title: `Protocolo ${pendingEmergency.type} activado`,
            message: `Sistema de emergencia activado - ${pendingEmergency.title}`,
            priority: 'high'
        });
    }, 1000);
    
    closeEmergencyModal();
    pendingEmergency = null;
}

function cancelEmergency() {
    document.getElementById('emergencyConfirm').style.display = 'none';
    document.querySelector('.emergency-options').style.display = 'grid';
    pendingEmergency = null;
}

function refreshCameras() {
    window.guardiaDashboard.showNotification('Actualizando estado de cámaras...', 'info');
    setTimeout(() => {
        window.guardiaDashboard.updateSystemStatus();
        window.guardiaDashboard.showNotification('Estado de cámaras actualizado', 'success');
    }, 1000);
}

function startRound() {
    window.guardiaDashboard.showNotification('Preparando ronda de seguridad...', 'info');
}

function startSpecificRound(type) {
    window.guardiaDashboard.showNotification(`Iniciando ronda ${type}...`, 'info');
}

function logIncident() {
    window.guardiaDashboard.showNotification('Abriendo formulario de reporte de incidente...', 'info');
}

function showVisitorLog() {
    window.guardiaDashboard.showNotification('Mostrando lista de visitantes activos...', 'info');
}

function logout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.guardiaDashboard = new GuardiaDashboard();
});