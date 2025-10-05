class GuardiaDashboard {
    constructor() {
        this.guardData = null;
        this.alerts = [];
        this.cameras = [];
        this.accessLog = [];
        this.recentActivity = [];
        this.guards = [];
        this.systemStartTime = new Date();
        this.currentShift = null;
        this.shiftActive = false;
        this.buildingMap = null;
        this.heatMap = null;
        this.voiceRecognition = null;
        this.isVoiceControlActive = false;
        this.notificationSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        
        this.init();
    }

    async init() {
        await this.loadGuardData();
        this.initializeDashboard();
        this.startRealTimeServices();
        this.showNotification('Sistema de vigilancia futurista activado', 'success');
    }

    async loadGuardData() {
        try {
            // Simular carga de datos del guardia
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.guardData = {
                name: 'CARLOS RODRÍGUEZ',
                email: 'c.rodriguez@smartbuilding.com',
                phone: '+34 612 345 678',
                id: 'GRD-2024-001',
                shift: '08:00 - 20:00',
                rank: 'Guardia Principal'
            };
            
            this.updateGuardInterface();
        } catch (error) {
            console.error('Error:', error);
            // Datos por defecto
            this.guardData = {
                name: 'GUARDIA DE SEGURIDAD',
                email: 'guardia@smartbuilding.com',
                phone: 'N/A',
                id: 'SISTEMA-ACTIVO',
                shift: '08:00 - 20:00',
                rank: 'Guardia'
            };
            this.updateGuardInterface();
        }
    }

    updateGuardInterface() {
        document.getElementById('guardName').textContent = this.guardData.name;
        document.getElementById('guardIdDisplay').textContent = `ID: ${this.guardData.id}`;
        document.getElementById('systemStartTime').textContent = this.systemStartTime.toLocaleTimeString('es-ES', { hour12: false });
        document.getElementById('guardNameRound').textContent = this.guardData.name;
        document.getElementById('lastRoundGuard').textContent = this.guardData.name;
    }

    initializeDashboard() {
        this.initializeEventListeners();
        this.loadInitialData();
        this.startTimeUpdates();
        this.initializeMap();
        this.initializeVoiceControl();
    }

    initializeEventListeners() {
        // Filtros de actividad
        document.querySelectorAll('.activity-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.activity-filters .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterActivity(e.target.dataset.filter);
            });
        });

        // Filtros de alertas
        document.querySelectorAll('.alert-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.alert-filters .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterAlerts(e.target.dataset.filter);
            });
        });

        // Control de cámaras
        document.getElementById('cameraGroup').addEventListener('change', () => {
            this.filterCameras();
        });

        // Formularios
        document.getElementById('eventForm').addEventListener('submit', (e) => this.handleEventForm(e));
        document.getElementById('accessForm').addEventListener('submit', (e) => this.handleAccessForm(e));

        // Chat
        document.getElementById('sendMessageBtn').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    loadInitialData() {
        // Cargar datos de sistema
        this.updateSystemStatus();

        // Cargar cámaras
        this.cameras = this.generateCameraData();
        this.updateCamerasDisplay();

        // Cargar actividad reciente
        this.recentActivity = this.generateRecentActivity();
        this.updateActivityTimeline();

        // Cargar alertas
        this.alerts = this.generateInitialAlerts();
        this.updateAlertsDisplay();

        // Cargar accesos
        this.accessLog = this.generateAccessLog();
        this.updateAccessLog();

        // Cargar guardias
        this.guards = this.generateGuardsData();
        this.updateGuardsDisplay();

        // Configurar horarios
        this.setupRoundSchedule();
    }

    generateCameraData() {
        return [
            { 
                id: 1, 
                name: 'Entrada Principal', 
                status: 'online', 
                group: 'entrada',
                location: [40.7128, -74.0060],
                lastActive: new Date()
            },
            { 
                id: 2, 
                name: 'Recepción', 
                status: 'online', 
                group: 'entrada',
                location: [40.7129, -74.0061],
                lastActive: new Date()
            },
            { 
                id: 3, 
                name: 'Estacionamiento N1', 
                status: 'online', 
                group: 'estacionamiento',
                location: [40.7130, -74.0062],
                lastActive: new Date()
            },
            { 
                id: 4, 
                name: 'Estacionamiento N2', 
                status: 'offline', 
                group: 'estacionamiento',
                location: [40.7131, -74.0063],
                lastActive: new Date(Date.now() - 3600000)
            },
            { 
                id: 5, 
                name: 'Hall Principal', 
                status: 'online', 
                group: 'areas-comunes',
                location: [40.7127, -74.0059],
                lastActive: new Date()
            },
            { 
                id: 6, 
                name: 'Área Piscina', 
                status: 'online', 
                group: 'areas-comunes',
                location: [40.7126, -74.0058],
                lastActive: new Date()
            },
            { 
                id: 7, 
                name: 'Gimnasio', 
                status: 'online', 
                group: 'areas-comunes',
                location: [40.7125, -74.0057],
                lastActive: new Date()
            },
            { 
                id: 8, 
                name: 'Puerta Trasera', 
                status: 'online', 
                group: 'perimetro',
                location: [40.7132, -74.0064],
                lastActive: new Date()
            }
        ];
    }

    generateRecentActivity() {
        const now = new Date();
        return [
            { 
                id: 1,
                type: 'access', 
                title: 'Acceso Autorizado', 
                description: 'María González - Residente - Puerta Principal',
                time: new Date(now - 300000),
                status: 'authorized'
            },
            { 
                id: 2,
                type: 'access', 
                title: 'Acceso Denegado', 
                description: 'Visitante sin identificación - Puerta Trasera',
                time: new Date(now - 600000),
                status: 'denied'
            },
            { 
                id: 3,
                type: 'alarm', 
                title: 'Alarma Activada', 
                description: 'Sensor de movimiento - Área común P2',
                time: new Date(now - 900000),
                status: 'active'
            },
            { 
                id: 4,
                type: 'sensor', 
                title: 'Sensor Activado', 
                description: 'Temperatura elevada - Sala eléctrica',
                time: new Date(now - 1200000),
                status: 'warning'
            },
            { 
                id: 5,
                type: 'shift', 
                title: 'Inicio de Turno', 
                description: `Guardia: ${this.guardData.name}`,
                time: new Date(now - 1800000),
                status: 'started'
            },
            { 
                id: 6,
                type: 'manual', 
                title: 'Evento Registrado', 
                description: 'Revisión de área - Estacionamiento N1 - Sin novedades',
                time: new Date(now - 2400000),
                status: 'info'
            }
        ];
    }

    generateInitialAlerts() {
        return [
            { 
                id: 1,
                type: 'warning', 
                title: 'Cámara Desconectada', 
                description: 'Cámara Estacionamiento N2 sin señal - Verificar conexión',
                time: new Date(Date.now() - 1500000),
                priority: 'medium'
            },
            { 
                id: 2,
                type: 'info', 
                title: 'Mantenimiento Programado', 
                description: 'Revisión sistema eléctrico - 15:00',
                time: new Date(Date.now() - 3600000),
                priority: 'low'
            },
            { 
                id: 3,
                type: 'critical', 
                title: 'Movimiento Nocturno', 
                description: 'Detección en área restringida - Perímetro Norte',
                time: new Date(Date.now() - 7200000),
                priority: 'high'
            }
        ];
    }

    generateAccessLog() {
        const now = new Date();
        return [
            { 
                id: 1,
                person: 'Ana López', 
                type: 'residente', 
                door: 'Principal', 
                time: new Date(now - 300000), 
                status: 'authorized',
                document: '12345678A'
            },
            { 
                id: 2,
                person: 'Juan Pérez', 
                type: 'visitante', 
                door: 'Trasera', 
                time: new Date(now - 600000), 
                status: 'authorized',
                document: 'V-87654321'
            },
            { 
                id: 3,
                person: 'Pedro García', 
                type: 'proveedor', 
                door: 'Estacionamiento N1', 
                time: new Date(now - 900000), 
                status: 'authorized',
                document: 'PROV-112233'
            },
            { 
                id: 4,
                person: 'Laura Martínez', 
                type: 'contratista', 
                door: 'Principal', 
                time: new Date(now - 1200000), 
                status: 'authorized',
                document: 'CT-445566'
            }
        ];
    }

    generateGuardsData() {
        return [
            { 
                id: 1, 
                name: 'Carlos Rodríguez', 
                position: 'Guardia Principal', 
                status: 'online', 
                location: 'Control Central',
                shift: '08:00 - 20:00'
            },
            { 
                id: 2, 
                name: 'María Santos', 
                position: 'Guardia de Ronda', 
                status: 'online', 
                location: 'Perímetro Norte',
                shift: '08:00 - 20:00'
            },
            { 
                id: 3, 
                name: 'Luis Fernández', 
                position: 'Supervisor', 
                status: 'break', 
                location: 'Sala de Descanso',
                shift: '08:00 - 20:00'
            },
            { 
                id: 4, 
                name: 'Ana García', 
                position: 'Guardia de Ronda', 
                status: 'online', 
                location: 'Perímetro Sur',
                shift: '20:00 - 08:00'
            }
        ];
    }

    setupRoundSchedule() {
        const now = new Date();
        const nextRound = new Date(now);
        nextRound.setHours(now.getHours() + 1, 0, 0, 0);
        
        document.getElementById('nextRoundTime').textContent = nextRound.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('lastRoundTime').textContent = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    startRealTimeServices() {
        // Simular alertas en tiempo real
        setInterval(() => this.generateRandomAlert(), 30000 + Math.random() * 30000);
        
        // Actualizar estado del sistema
        setInterval(() => this.updateSystemStatus(), 15000);
        
        // Simular accesos automáticos
        setInterval(() => this.generateRandomAccess(), 45000);
        
        // Verificar estado de conexión
        setInterval(() => this.checkConnection(), 10000);
        
        // Actualizar actividad de guardias
        setInterval(() => this.updateGuardsActivity(), 20000);
        
        // Simular eventos del sistema
        setInterval(() => this.generateSystemEvent(), 60000);
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

    updateSystemStatus() {
        // Simular estado del sistema
        const onlineCameras = this.cameras.filter(cam => cam.status === 'online').length;
        const totalCameras = this.cameras.length;
        
        // Actualizar contadores
        document.getElementById('camCount').textContent = `${onlineCameras}/${totalCameras}`;
        document.getElementById('sensorCount').textContent = `${Math.floor(Math.random() * 6) + 95}%`;
        document.getElementById('doorCount').textContent = '4/4';
        
        // Actualizar estados visuales
        document.getElementById('camStatus').className = `status-item ${onlineCameras === totalCameras ? 'online' : 'warning'}`;
        document.getElementById('sensorStatus').className = 'status-item online';
        document.getElementById('doorStatus').className = 'status-item online';
        document.getElementById('systemStatus').className = 'status-item online';
        
        // Actualizar panel de estado global
        this.updateGlobalStatusPanel();
        
        // Actualizar contador de accesos
        document.getElementById('accessCount').textContent = this.accessLog.length;
    }

    updateGlobalStatusPanel() {
        // Simular datos del sistema
        const electricalStatus = Math.random() > 0.9 ? 'warning' : 'normal';
        const fireStatus = 'normal';
        const cameraStatus = this.cameras.every(cam => cam.status === 'online') ? 'normal' : 'warning';
        const sensorStatus = 'normal';
        
        // Actualizar indicadores
        this.updateStatusIndicator('electricalStatus', electricalStatus);
        this.updateStatusIndicator('fireStatus', fireStatus);
        this.updateStatusIndicator('cameraStatus', cameraStatus);
        this.updateStatusIndicator('sensorStatusGlobal', sensorStatus);
        
        // Actualizar detalles
        document.getElementById('electricalLastCheck').textContent = new Date().toLocaleTimeString();
        document.getElementById('fireSensorsActive').textContent = '12/12';
        document.getElementById('camerasOnline').textContent = `${this.cameras.filter(cam => cam.status === 'online').length}/${this.cameras.length}`;
        document.getElementById('sensorsActive').textContent = '45/45';
    }

    updateStatusIndicator(elementId, status) {
        const element = document.getElementById(elementId);
        element.className = `status-item-global ${status}`;
        
        const statusText = element.querySelector('.status-text');
        switch(status) {
            case 'normal':
                statusText.textContent = 'Normal';
                statusText.style.color = '#00ff88';
                break;
            case 'warning':
                statusText.textContent = 'Advertencia';
                statusText.style.color = '#ffaa00';
                break;
            case 'critical':
                statusText.textContent = 'Crítico';
                statusText.style.color = '#ff4444';
                break;
        }
    }

    updateActivityTimeline() {
        const container = document.getElementById('activityTimeline');
        container.innerHTML = '';
        
        this.recentActivity.forEach(activity => {
            const item = this.createTimelineItem(activity);
            container.appendChild(item);
        });
    }

    createTimelineItem(activity) {
        const item = document.createElement('div');
        item.className = `timeline-item ${activity.type}`;
        
        const icon = this.getActivityIcon(activity.type);
        const time = activity.time.toLocaleTimeString('es-ES', { hour12: false });
        
        item.innerHTML = `
            <div class="timeline-icon">
                <i class="${icon}"></i>
            </div>
            <div class="timeline-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="timeline-time">${time}</div>
        `;
        
        return item;
    }

    getActivityIcon(type) {
        switch(type) {
            case 'access': return 'fas fa-door-open';
            case 'alarm': return 'fas fa-bell';
            case 'sensor': return 'fas fa-sensor';
            case 'shift': return 'fas fa-user-shield';
            case 'manual': return 'fas fa-clipboard-list';
            default: return 'fas fa-info-circle';
        }
    }

    filterActivity(filter) {
        const items = document.querySelectorAll('.timeline-item');
        
        items.forEach(item => {
            if (filter === 'all' || item.classList.contains(filter)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    updateAlertsDisplay() {
        const container = document.getElementById('alertsContainer');
        container.innerHTML = '';
        
        this.alerts.forEach(alert => {
            const alertElement = this.createAlertElement(alert);
            container.appendChild(alertElement);
        });
        
        // Actualizar contador
        document.getElementById('alertsCount').textContent = this.alerts.length;
    }

    createAlertElement(alert) {
        const element = document.createElement('div');
        element.className = `alert-item ${alert.type}`;
        
        const icon = this.getAlertIcon(alert.type);
        const time = alert.time.toLocaleTimeString('es-ES', { hour12: false });
        
        element.innerHTML = `
            <div class="alert-icon">
                <i class="${icon}"></i>
            </div>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.description}</p>
            </div>
            <div class="alert-time">${time}</div>
        `;
        
        return element;
    }

    getAlertIcon(type) {
        switch(type) {
            case 'critical': return 'fas fa-exclamation-triangle';
            case 'warning': return 'fas fa-exclamation-circle';
            case 'info': return 'fas fa-info-circle';
            default: return 'fas fa-bell';
        }
    }

    filterAlerts(filter) {
        const alerts = document.querySelectorAll('.alert-item');
        
        alerts.forEach(alert => {
            if (filter === 'all' || alert.classList.contains(filter)) {
                alert.style.display = 'flex';
            } else {
                alert.style.display = 'none';
            }
        });
    }

    generateRandomAlert() {
        const alertTypes = [
            { 
                type: 'info', 
                title: 'Movimiento detectado', 
                description: 'Área: Estacionamiento N1 - Movimiento normal',
                priority: 'low'
            },
            { 
                type: 'warning', 
                title: 'Puerta abierta', 
                description: 'Puerta principal abierta por más de 2 minutos',
                priority: 'medium' 
            },
            { 
                type: 'critical', 
                title: 'Sensor de puerta forzada', 
                description: 'Intento de acceso no autorizado en puerta trasera',
                priority: 'high' 
            },
            { 
                type: 'info', 
                title: 'Ronda completada', 
                description: 'Ronda de vigilancia interna finalizada correctamente',
                priority: 'low' 
            }
        ];
        
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        this.addAlert({
            ...randomAlert,
            id: Date.now(),
            time: new Date()
        });
    }

    addAlert(alertData) {
        this.alerts.unshift(alertData);
        
        // Mantener máximo 50 alertas
        if (this.alerts.length > 50) {
            this.alerts.pop();
        }
        
        this.updateAlertsDisplay();
        
        // Mostrar notificación para alertas importantes
        if (alertData.priority === 'high') {
            this.showNotification(`ALERTA CRÍTICA: ${alertData.title}`, 'error', true);
        } else if (alertData.priority === 'medium') {
            this.showNotification(`Advertencia: ${alertData.title}`, 'warning');
        }
    }

    updateCamerasDisplay() {
        const container = document.getElementById('camerasGrid');
        const groupFilter = document.getElementById('cameraGroup').value;
        
        const filteredCameras = groupFilter === 'all' 
            ? this.cameras 
            : this.cameras.filter(cam => cam.group === groupFilter);
        
        container.innerHTML = filteredCameras.map(camera => `
            <div class="camera-card">
                <div class="camera-header">
                    <div class="camera-name">${camera.name}</div>
                    <div class="camera-status ${camera.status}">${camera.status === 'online' ? 'En línea' : 'Offline'}</div>
                </div>
                <div class="camera-feed">
                    <img src="/api/camera/${camera.id}/feed" alt="${camera.name}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjE0MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNBTUVSQSA8dHNwYW4gZHk9IjE1IiB4PSIxNDAiPiR7Y2FtZXJhLm5hbWV9PC90c3Bhbj48L3RleHQ+PC9zdmc+'">
                    <div class="camera-overlay">
                        <button onclick="dashboard.zoomCamera(${camera.id})" title="Zoom">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button onclick="dashboard.recordCamera(${camera.id})" title="Grabar">
                            <i class="fas fa-record-vinyl"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterCameras() {
        this.updateCamerasDisplay();
    }

    refreshCameras() {
        this.showNotification('Actualizando estado de cámaras...', 'info');
        
        // Simular refresco de cámaras
        setTimeout(() => {
            // Cambiar estado aleatorio de algunas cámaras
            this.cameras.forEach(camera => {
                if (Math.random() < 0.1) { // 10% de probabilidad de cambiar estado
                    camera.status = camera.status === 'online' ? 'offline' : 'online';
                    camera.lastActive = new Date();
                }
            });
            
            this.updateCamerasDisplay();
            this.updateSystemStatus();
            this.showNotification('Cámaras actualizadas correctamente', 'success');
        }, 2000);
    }

    toggleMapView() {
        const grid = document.getElementById('camerasGrid');
        const map = document.getElementById('mapContainer');
        const heatmap = document.getElementById('heatmapContainer');
        
        if (grid.style.display !== 'none') {
            grid.style.display = 'none';
            map.style.display = 'block';
            heatmap.style.display = 'none';
            this.initializeMap();
        } else {
            grid.style.display = 'grid';
            map.style.display = 'none';
            heatmap.style.display = 'none';
        }
    }

    showHeatMap() {
        const grid = document.getElementById('camerasGrid');
        const map = document.getElementById('mapContainer');
        const heatmap = document.getElementById('heatmapContainer');
        
        grid.style.display = 'none';
        map.style.display = 'none';
        heatmap.style.display = 'block';
        
        this.initializeHeatMap();
    }

    initializeMap() {
        if (this.buildingMap) {
            this.buildingMap.remove();
        }
        
        this.buildingMap = L.map('buildingMap').setView([40.7128, -74.0060], 17);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.buildingMap);
        
        // Agregar marcadores de cámaras
        this.cameras.forEach(camera => {
            const iconColor = camera.status === 'online' ? '#00ff88' : '#ff4444';
            const cameraIcon = L.divIcon({
                className: 'camera-marker',
                html: `<i class="fas fa-video" style="color: ${iconColor}; font-size: 20px; text-shadow: 0 0 8px ${iconColor};"></i>`,
                iconSize: [24, 24]
            });
            
            const marker = L.marker(camera.location, { icon: cameraIcon }).addTo(this.buildingMap);
            marker.bindPopup(`
                <div style="color: #333;">
                    <strong>${camera.name}</strong><br>
                    Estado: ${camera.status === 'online' ? 'En línea' : 'Desconectada'}<br>
                    Última actividad: ${camera.lastActive.toLocaleTimeString()}<br>
                    <button onclick="dashboard.showCameraFeed(${camera.id})" style="margin-top: 8px; padding: 5px 10px; background: #00ffff; border: none; border-radius: 4px; cursor: pointer;">Ver video</button>
                </div>
            `);
        });
        
        // Agregar áreas del edificio
        const buildingAreas = [
            {
                name: 'Edificio Principal',
                coordinates: [[40.7125, -74.0065], [40.7125, -74.0055], [40.7135, -74.0055], [40.7135, -74.0065]]
            },
            {
                name: 'Estacionamiento',
                coordinates: [[40.7130, -74.0070], [40.7130, -74.0060], [40.7140, -74.0060], [40.7140, -74.0070]]
            }
        ];
        
        buildingAreas.forEach(area => {
            L.polygon(area.coordinates, {
                color: '#00ffff',
                fillColor: '#00ffff',
                fillOpacity: 0.1,
                weight: 2
            }).addTo(this.buildingMap).bindPopup(area.name);
        });
    }

    initializeHeatMap() {
        if (this.heatMap) {
            this.heatMap.remove();
        }
        
        this.heatMap = L.map('heatMap').setView([40.7128, -74.0060], 17);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.heatMap);
        
        // Simular datos de movimiento para el mapa térmico
        const heatPoints = [];
        for (let i = 0; i < 50; i++) {
            heatPoints.push([
                40.7125 + Math.random() * 0.01,
                -74.0065 + Math.random() * 0.01,
                Math.random()
            ]);
        }
        
        // Aquí iría la implementación real del mapa de calor
        // Por ahora solo mostramos puntos
        heatPoints.forEach(point => {
            L.circleMarker([point[0], point[1]], {
                radius: 8,
                fillColor: this.getHeatColor(point[2]),
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(this.heatMap);
        });
    }

    getHeatColor(intensity) {
        if (intensity < 0.3) return '#0000ff';
        if (intensity < 0.6) return '#00ffff';
        if (intensity < 0.8) return '#00ff00';
        return '#ff0000';
    }

    updateAccessLog() {
        const container = document.getElementById('accessLog');
        container.innerHTML = '';
        
        const recentLogs = this.accessLog.slice(0, 10);
        
        recentLogs.forEach(access => {
            const item = this.createAccessLogItem(access);
            container.appendChild(item);
        });
        
        document.getElementById('accessCount').textContent = this.accessLog.length;
    }

    createAccessLogItem(access) {
        const item = document.createElement('div');
        item.className = 'access-item';
        
        const time = access.time.toLocaleTimeString('es-ES', { hour12: false });
        
        item.innerHTML = `
            <div class="access-info">
                <div class="access-person">${access.person}</div>
                <div class="access-details">${access.type} - ${access.door}</div>
            </div>
            <div class="access-time">${time}</div>
        `;
        
        return item;
    }

    generateRandomAccess() {
        const accessTypes = ['Residente', 'Visitante', 'Proveedor', 'Personal'];
        const doors = ['Entrada Principal', 'Puerta Trasera', 'Estacionamiento N1', 'Estacionamiento N2'];
        const people = ['Ana López', 'Juan Pérez', 'María García', 'Carlos Martínez', 'Laura Rodríguez'];
        
        const access = {
            id: Date.now(),
            person: people[Math.floor(Math.random() * people.length)],
            type: accessTypes[Math.floor(Math.random() * accessTypes.length)],
            door: doors[Math.floor(Math.random() * doors.length)],
            time: new Date(),
            status: Math.random() > 0.1 ? 'authorized' : 'denied',
            document: 'DOC-' + Math.floor(Math.random() * 1000000)
        };
        
        this.accessLog.unshift(access);
        
        // Mantener máximo 100 accesos
        if (this.accessLog.length > 100) {
            this.accessLog.pop();
        }
        
        this.updateAccessLog();
        
        // Agregar a actividad reciente
        this.addActivity('access', 
            access.status === 'authorized' ? 'Acceso Autorizado' : 'Acceso Denegado',
            `${access.person} - ${access.type} - ${access.door}`
        );
    }

    updateGuardsDisplay() {
        const container = document.getElementById('guardsList');
        container.innerHTML = '';
        
        this.guards.forEach(guard => {
            const card = this.createGuardCard(guard);
            container.appendChild(card);
        });
        
        // Actualizar contador de guardias online
        const onlineGuards = this.guards.filter(g => g.status === 'online').length;
        document.getElementById('guardsOnline').textContent = onlineGuards;
        document.getElementById('onlineGuardsCount').textContent = `${onlineGuards} guardias conectados`;
    }

    createGuardCard(guard) {
        const card = document.createElement('div');
        card.className = 'guard-card';
        
        const statusIcon = this.getGuardStatusIcon(guard.status);
        const statusText = this.getGuardStatusText(guard.status);
        
        card.innerHTML = `
            <div class="guard-avatar">
                <i class="fas fa-user-shield"></i>
            </div>
            <div class="guard-name">${guard.name}</div>
            <div class="guard-position">${guard.position}</div>
            <div class="guard-location">${guard.location}</div>
            <div class="guard-status ${guard.status}">
                <i class="${statusIcon}"></i>
                ${statusText}
            </div>
        `;
        
        return card;
    }

    getGuardStatusIcon(status) {
        switch(status) {
            case 'online': return 'fas fa-circle';
            case 'offline': return 'fas fa-circle';
            case 'break': return 'fas fa-coffee';
            default: return 'fas fa-circle';
        }
    }

    getGuardStatusText(status) {
        switch(status) {
            case 'online': return 'En servicio';
            case 'offline': return 'No disponible';
            case 'break': return 'En descanso';
            default: return 'Desconocido';
        }
    }

    updateGuardsActivity() {
        // Simular cambios en la actividad de los guardias
        this.guards.forEach(guard => {
            if (guard.status === 'online' && Math.random() < 0.1) {
                // Cambiar ubicación aleatoriamente
                const locations = ['Control Central', 'Perímetro Norte', 'Perímetro Sur', 'Áreas Comunes', 'Estacionamiento'];
                guard.location = locations[Math.floor(Math.random() * locations.length)];
            }
            
            if (Math.random() < 0.05) {
                // Cambiar estado aleatoriamente
                const states = ['online', 'break'];
                guard.status = states[Math.floor(Math.random() * states.length)];
            }
        });
        
        this.updateGuardsDisplay();
    }

    generateSystemEvent() {
        const events = [
            {
                type: 'sensor',
                title: 'Verificación de Sensores',
                description: 'Verificación automática completada - Todos los sensores operativos'
            },
            {
                type: 'manual',
                title: 'Backup del Sistema',
                description: 'Copia de seguridad automática completada correctamente'
            },
            {
                type: 'info',
                title: 'Actualización de Firmware',
                description: 'Sistema actualizado a la versión más reciente'
            }
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.addActivity(randomEvent.type, randomEvent.title, randomEvent.description);
    }

    addActivity(type, title, description) {
        const activity = {
            id: Date.now(),
            type: type,
            title: title,
            description: description,
            time: new Date(),
            status: 'info'
        };
        
        this.recentActivity.unshift(activity);
        
        // Mantener solo los últimos 50 eventos
        if (this.recentActivity.length > 50) {
            this.recentActivity.pop();
        }
        
        this.updateActivityTimeline();
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
                door.className = 'btn-door close';
                door.onclick = () => this.controlDoor(doorId, 'close');
                status.textContent = 'Abierta';
                status.className = 'door-status open';
                
                this.showNotification(`Puerta ${doorId} abierta`, 'success');
                this.addActivity('access', 'Puerta Abierta', `Puerta ${this.getDoorName(doorId)} abierta manualmente`);
                
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
                door.className = 'btn-door open';
                door.onclick = () => this.controlDoor(doorId, 'open');
                status.textContent = 'Cerrada';
                status.className = 'door-status online';
                door.disabled = false;
                
                this.showNotification(`Puerta ${doorId} cerrada`, 'success');
            }, 2000);
        }
    }

    getDoorName(doorId) {
        const doors = {
            1: 'Principal',
            2: 'Trasera',
            3: 'Estacionamiento N1',
            4: 'Estacionamiento N2'
        };
        return doors[doorId] || `Puerta ${doorId}`;
    }

    // Control de turno
    toggleShiftStatus() {
        const btn = document.getElementById('shiftStatusBtn');
        const statusText = document.getElementById('shiftStatusText');
        
        if (!this.shiftActive) {
            // Iniciar turno
            this.currentShift = {
                startTime: new Date(),
                guard: this.guardData.name,
                status: 'active'
            };
            
            this.shiftActive = true;
            btn.innerHTML = '<i class="fas fa-pause-circle"></i><span>PAUSAR TURNO</span>';
            btn.style.background = 'linear-gradient(135deg, var(--warning), #cc8800)';
            
            this.addActivity('shift', 'Inicio de Turno', `Guardia: ${this.guardData.name}`);
            this.showNotification('Turno iniciado correctamente', 'success');
        } else {
            // Pausar turno
            this.currentShift.status = 'paused';
            this.shiftActive = false;
            btn.innerHTML = '<i class="fas fa-play-circle"></i><span>REANUDAR TURNO</span>';
            btn.style.background = 'rgba(0, 255, 255, 0.1)';
            
            this.showNotification('Turno pausado', 'warning');
        }
    }

    takeBreak() {
        if (!this.shiftActive) {
            this.showNotification('Debe iniciar el turno primero', 'warning');
            return;
        }
        
        this.showNotification('Pausa registrada - 15 minutos', 'info');
        this.addActivity('shift', 'Pausa de Guardia', `Guardia: ${this.guardData.name}`);
    }

    // Control de rondas
    startRound(roundId) {
        const btn = document.getElementById(`round${roundId}`);
        const status = document.getElementById(`roundStatus${roundId}`);
        
        btn.disabled = true;
        btn.textContent = 'Iniciando...';
        
        setTimeout(() => {
            status.textContent = 'En progreso';
            status.className = 'status pending';
            btn.textContent = 'Completar';
            btn.onclick = () => this.completeRound(roundId);
            btn.disabled = false;
            
            this.showNotification('Ronda de vigilancia iniciada', 'success');
            this.addActivity('shift', 'Ronda Iniciada', 'Ronda interna - Planta baja');
        }, 1000);
    }

    completeRound(roundId) {
        const btn = document.getElementById(`round${roundId}`);
        const status = document.getElementById(`roundStatus${roundId}`);
        
        btn.disabled = true;
        btn.textContent = 'Finalizando...';
        
        setTimeout(() => {
            status.textContent = 'Completada';
            status.className = 'status completed';
            btn.style.display = 'none';
            
            // Actualizar tiempo de última ronda
            document.getElementById('lastRoundTime').textContent = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            this.showNotification('Ronda de vigilancia completada', 'success');
            this.addActivity('shift', 'Ronda Completada', 'Ronda interna - Planta baja - Sin novedades');
        }, 1000);
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
        const protocol = document.getElementById('emergencyProtocol');
        
        let title, message, steps;
        
        switch(option) {
            case 'fire':
                title = 'EMERGENCIA - INCENDIO';
                message = '¿Activar protocolo de incendio? Se activarán alarmas y se notificará a bomberos.';
                steps = [
                    'Activar alarma general de incendio',
                    'Notificar a cuerpo de bomberos (911)',
                    'Iniciar evacuación controlada',
                    'Cortar suministro eléctrico en áreas afectadas',
                    'Usar extintores si es seguro hacerlo',
                    'Dirigirse a punto de encuentro designado'
                ];
                break;
            case 'medical':
                title = 'EMERGENCIA - MÉDICA';
                message = '¿Solicitar asistencia médica de emergencia?';
                steps = [
                    'Evaluar situación y asegurar área',
                    'Llamar a servicios médicos (911)',
                    'Aplicar primeros auxilios si está capacitado',
                    'Preparar acceso para ambulancia',
                    'Acompañar a la persona hasta llegada de ayuda'
                ];
                break;
            case 'security':
                title = 'EMERGENCIA - SEGURIDAD';
                message = '¿Activar protocolo de seguridad? Se bloquearán accesos y se contactará a autoridades.';
                steps = [
                    'Bloquear todos los accesos al edificio',
                    'Contactar a autoridades policiales',
                    'Activar modo vigilancia máxima',
                    'Mantener comunicación con personal de seguridad',
                    'Preparar informe de situación'
                ];
                break;
            case 'evacuation':
                title = 'PROTOCOLO - EVACUACIÓN';
                message = '¿Iniciar evacuación controlada del edificio?';
                steps = [
                    'Activar alarmas de evacuación',
                    'Verificar rutas de evacuación despejadas',
                    'Coordinar salida por sectores',
                    'Verificar conteo en punto de encuentro',
                    'Reportar situación a autoridades'
                ];
                break;
        }
        
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        
        const stepsList = document.getElementById('protocolSteps');
        stepsList.innerHTML = '';
        steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepsList.appendChild(li);
        });
        
        protocol.style.display = 'block';
        
        document.getElementById('confirmEmergency').onclick = () => this.activateEmergencyProtocol(option);
    }

    activateEmergencyProtocol(type) {
        this.showNotification(`PROTOCOLO ACTIVADO: ${type.toUpperCase()}`, 'error', true);
        
        // Simular acciones de emergencia
        switch(type) {
            case 'fire':
                this.addAlert({
                    type: 'critical',
                    title: 'ALARMA DE INCENDIO ACTIVADA',
                    description: 'Protocolo de evacuación iniciado automáticamente',
                    priority: 'high',
                    id: Date.now(),
                    time: new Date()
                });
                break;
            case 'security':
                this.addAlert({
                    type: 'critical',
                    title: 'PROTOCOLO DE SEGURIDAD ACTIVADO',
                    description: 'Todas las puertas bloqueadas - Contactando autoridades',
                    priority: 'high',
                    id: Date.now(),
                    time: new Date()
                });
                
                // Bloquear todas las puertas
                for (let i = 1; i <= 4; i++) {
                    const status = document.getElementById(`doorStatus${i}`);
                    if (status.textContent === 'Abierta') {
                        this.controlDoor(i, 'close');
                    }
                }
                break;
        }
        
        this.addActivity('alarm', `Emergencia Activada - ${type.toUpperCase()}`, `Protocolo iniciado por: ${this.guardData.name}`);
        this.closeEmergencyModal();
    }

    closeEmergencyModal() {
        document.getElementById('emergencyModal').style.display = 'none';
        document.getElementById('emergencyOptions').style.display = 'grid';
        document.getElementById('emergencyConfirm').style.display = 'none';
        document.getElementById('emergencyProtocol').style.display = 'none';
    }

    // Funciones de registro manual
    openManualEventModal() {
        document.getElementById('manualEventModal').style.display = 'block';
    }

    closeManualEventModal() {
        document.getElementById('manualEventModal').style.display = 'none';
        document.getElementById('eventForm').reset();
    }

    handleEventForm(e) {
        e.preventDefault();
        
        const type = document.getElementById('eventType').value;
        const location = document.getElementById('eventLocation').value;
        const priority = document.getElementById('eventPriority').value;
        const description = document.getElementById('eventDescription').value;
        
        // Registrar evento
        this.addActivity('manual', `Evento Registrado - ${this.getEventTypeText(type)}`, `${description} (Ubicación: ${this.getLocationText(location)}, Prioridad: ${priority})`);
        
        // Si es de alta prioridad, crear alerta
        if (priority === 'high' || priority === 'critical') {
            this.addAlert({
                type: priority === 'critical' ? 'critical' : 'warning',
                title: `Evento Manual - ${this.getEventTypeText(type)}`,
                description: `${description} - Ubicación: ${this.getLocationText(location)}`,
                priority: priority,
                id: Date.now(),
                time: new Date()
            });
        }
        
        this.showNotification('Evento registrado correctamente', 'success');
        this.closeManualEventModal();
    }

    getEventTypeText(type) {
        const types = {
            'revision': 'Revisión de Área',
            'incident': 'Incidente',
            'observation': 'Observación',
            'maintenance': 'Mantenimiento',
            'suspicious': 'Actividad Sospechosa'
        };
        return types[type] || type;
    }

    getLocationText(location) {
        const locations = {
            'entrada-principal': 'Entrada Principal',
            'puerta-trasera': 'Puerta Trasera',
            'estacionamiento-n1': 'Estacionamiento N1',
            'estacionamiento-n2': 'Estacionamiento N2',
            'areas-comunes': 'Áreas Comunes',
            'perimetro-norte': 'Perímetro Norte',
            'perimetro-sur': 'Perímetro Sur',
            'sala-electrica': 'Sala Eléctrica'
        };
        return locations[location] || location;
    }

    // Funciones de acceso manual
    openManualAccessModal() {
        document.getElementById('manualAccessModal').style.display = 'block';
    }

    closeManualAccessModal() {
        document.getElementById('manualAccessModal').style.display = 'none';
        document.getElementById('accessForm').reset();
    }

    handleAccessForm(e) {
        e.preventDefault();
        
        const person = document.getElementById('accessPerson').value;
        const type = document.getElementById('accessType').value;
        const document = document.getElementById('accessDocument').value;
        const door = document.getElementById('accessDoor').value;
        const reason = document.getElementById('accessReason').value;
        const duration = document.getElementById('accessDuration').value;
        
        const doorName = this.getDoorName(parseInt(door));
        
        // Registrar acceso manual
        this.accessLog.unshift({
            id: Date.now(),
            person: person,
            type: type,
            door: doorName,
            time: new Date(),
            status: 'authorized',
            document: document,
            reason: reason,
            duration: duration
        });
        
        // Actualizar interfaz
        this.updateAccessLog();
        
        // Registrar actividad
        this.addActivity('access', 'Acceso Manual Autorizado', `${person} - ${type} - ${doorName} - Duración: ${duration}h`);
        
        this.showNotification(`Acceso autorizado para ${person}`, 'success');
        this.closeManualAccessModal();
    }

    // Funciones de chat interno
    openInternalChat() {
        document.getElementById('chatModal').style.display = 'block';
        this.loadChatMessages();
    }

    closeChatModal() {
        document.getElementById('chatModal').style.display = 'none';
    }

    loadChatMessages() {
        const messages = document.getElementById('chatMessages');
        messages.innerHTML = '';
        
        // Mensajes de ejemplo
        const chatMessages = [
            { 
                sender: 'María Santos', 
                message: 'Revisión completada en perímetro norte - sin novedades', 
                time: new Date(Date.now() - 300000), 
                type: 'received' 
            },
            { 
                sender: 'Luis Fernández', 
                message: 'Recordatorio: reunión de guardias a las 16:00 en sala de control', 
                time: new Date(Date.now() - 600000), 
                type: 'received' 
            },
            { 
                sender: this.guardData.name, 
                message: 'Entendido, estaré presente en la reunión', 
                time: new Date(Date.now() - 590000), 
                type: 'sent' 
            },
            { 
                sender: 'Sistema', 
                message: 'Backup automático completado correctamente', 
                time: new Date(Date.now() - 1200000), 
                type: 'received' 
            }
        ];
        
        chatMessages.forEach(msg => {
            const messageElement = this.createChatMessage(msg);
            messages.appendChild(messageElement);
        });
        
        messages.scrollTop = messages.scrollHeight;
    }

    createChatMessage(msg) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${msg.type}`;
        
        const time = msg.time.toLocaleTimeString('es-ES', { hour12: false });
        
        messageElement.innerHTML = `
            <div class="chat-message-header">${msg.sender} - ${time}</div>
            <div class="chat-message-text">${msg.message}</div>
        `;
        
        return messageElement;
    }

    sendChatMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            const messages = document.getElementById('chatMessages');
            
            const messageElement = this.createChatMessage({
                sender: this.guardData.name,
                message: message,
                time: new Date(),
                type: 'sent'
            });
            
            messages.appendChild(messageElement);
            input.value = '';
            
            messages.scrollTop = messages.scrollHeight;
            
            // Simular respuesta automática
            setTimeout(() => {
                const autoReply = this.createChatMessage({
                    sender: 'Sistema',
                    message: 'Mensaje recibido y registrado en el sistema',
                    time: new Date(),
                    type: 'received'
                });
                
                messages.appendChild(autoReply);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
        }
    }

    // Control por voz
    initializeVoiceControl() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'es-ES';
            
            this.voiceRecognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Error en reconocimiento de voz:', event.error);
                this.showNotification('Error en reconocimiento de voz', 'error');
            };
        } else {
            console.warn('Reconocimiento de voz no soportado');
            this.showNotification('Control por voz no disponible', 'warning');
        }
    }

    toggleVoiceControl() {
        const btn = document.getElementById('voiceControlBtn');
        
        if (!this.voiceRecognition) {
            this.showNotification('Control por voz no disponible', 'warning');
            return;
        }
        
        if (!this.isVoiceControlActive) {
            this.voiceRecognition.start();
            btn.classList.add('listening');
            btn.querySelector('span').textContent = 'Escuchando...';
            this.isVoiceControlActive = true;
            
            setTimeout(() => {
                if (this.isVoiceControlActive) {
                    this.voiceRecognition.stop();
                    this.isVoiceControlActive = false;
                    btn.classList.remove('listening');
                    btn.querySelector('span').textContent = 'Control por Voz';
                }
            }, 5000);
        } else {
            this.voiceRecognition.stop();
            this.isVoiceControlActive = false;
            btn.classList.remove('listening');
            btn.querySelector('span').textContent = 'Control por Voz';
        }
    }

    processVoiceCommand(command) {
        this.showNotification(`Comando: ${command}`, 'info');
        
        if (command.includes('abrir') && command.includes('puerta')) {
            if (command.includes('principal')) {
                this.controlDoor(1, 'open');
            } else if (command.includes('trasera')) {
                this.controlDoor(2, 'open');
            } else if (command.includes('estacionamiento')) {
                if (command.includes('uno') || command.includes('1')) {
                    this.controlDoor(3, 'open');
                } else if (command.includes('dos') || command.includes('2')) {
                    this.controlDoor(4, 'open');
                }
            }
        } else if (command.includes('mostrar') && command.includes('cámara')) {
            if (command.includes('entrada')) {
                document.getElementById('cameraGroup').value = 'entrada';
                this.filterCameras();
            } else if (command.includes('estacionamiento')) {
                document.getElementById('cameraGroup').value = 'estacionamiento';
                this.filterCameras();
            } else if (command.includes('mapa')) {
                this.toggleMapView();
            }
        } else if (command.includes('emergencia')) {
            this.openEmergencyModal();
        } else if (command.includes('ronda')) {
            this.startRound(1);
        } else if (command.includes('estado') && command.includes('sistema')) {
            this.showSystemDetails();
        } else {
            this.showNotification('Comando no reconocido', 'warning');
        }
    }

    // Funciones de utilidad
    showNotification(message, type = 'info', sound = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Estilos para la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: this.getNotificationColor(type),
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Reproducir sonido si es necesario
        if (sound) {
            this.playNotificationSound();
        }
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-triangle';
            case 'warning': return 'exclamation-circle';
            default: return 'info-circle';
        }
    }

    getNotificationColor(type) {
        switch(type) {
            case 'success': return 'var(--success)';
            case 'error': return 'var(--danger)';
            case 'warning': return 'var(--warning)';
            default: return 'var(--info)';
        }
    }

    playNotificationSound() {
        try {
            this.notificationSound.play();
        } catch (error) {
            console.log('No se pudo reproducir el sonido de notificación');
        }
    }

    checkConnection() {
        const connectionStatus = document.getElementById('connectionStatus');
        const isOnline = Math.random() > 0.02; // 98% de probabilidad de estar online
        
        if (isOnline) {
            connectionStatus.textContent = 'Conectado al servidor central';
            connectionStatus.className = 'connection-status online';
        } else {
            connectionStatus.textContent = 'Desconectado del servidor central';
            connectionStatus.className = 'connection-status offline';
            this.showNotification('Pérdida de conexión con servidor central', 'warning');
        }
    }

    // Funciones de cámara
    showCameraFeed(cameraId) {
        this.showNotification(`Mostrando feed de cámara ${cameraId}`, 'info');
        // Aquí iría la lógica para mostrar el feed de la cámara
    }

    zoomCamera(cameraId) {
        this.showNotification(`Zoom aplicado a cámara ${cameraId}`, 'info');
        // Aquí iría la lógica para hacer zoom en la cámara
    }

    recordCamera(cameraId) {
        this.showNotification(`Grabando cámara ${cameraId}`, 'info');
        // Aquí iría la lógica para iniciar grabación
    }

    // Funciones de reportes
    showSystemDetails() {
        this.showNotification('Mostrando detalles del sistema...', 'info');
        
        const details = `
Sistema Eléctrico: Normal
Sistema de Incendios: Normal
Cámaras: ${this.cameras.filter(cam => cam.status === 'online').length}/${this.cameras.length} en línea
Sensores: 45/45 activos
Última verificación: ${new Date().toLocaleTimeString()}
        `;
        
        console.log('Detalles del sistema:', details);
    }

    showAccessHistory() {
        this.showNotification('Mostrando historial completo de accesos...', 'info');
    }

    generateAccessReport() {
        this.showNotification('Generando reporte de accesos en PDF...', 'info');
        
        setTimeout(() => {
            this.showNotification('Reporte de accesos generado correctamente', 'success');
        }, 2000);
    }

    createNewRound() {
        this.showNotification('Creando nueva ronda de vigilancia...', 'info');
    }

    showReports() {
        this.showNotification('Mostrando reportes del sistema...', 'info');
    }

    showMaintenanceSchedule() {
        this.showNotification('Mostrando calendario de mantenimiento...', 'info');
    }

    viewRoundReport(roundId) {
        this.showNotification(`Mostrando reporte de ronda ${roundId}...`, 'info');
    }

    showGuardSchedule() {
        this.showNotification('Mostrando horarios de guardias...', 'info');
    }

    // Control de sesión
    logout() {
        if (confirm('¿Está seguro de que desea cerrar sesión?')) {
            this.showNotification('Cerrando sesión...', 'info');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
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

function openManualEventModal() {
    window.dashboard.openManualEventModal();
}

function closeManualEventModal() {
    window.dashboard.closeManualEventModal();
}

function openManualAccessModal() {
    window.dashboard.openManualAccessModal();
}

function closeManualAccessModal() {
    window.dashboard.closeManualAccessModal();
}

function openInternalChat() {
    window.dashboard.openInternalChat();
}

function closeChatModal() {
    window.dashboard.closeChatModal();
}

function toggleShiftStatus() {
    window.dashboard.toggleShiftStatus();
}

function takeBreak() {
    window.dashboard.takeBreak();
}

function refreshCameras() {
    window.dashboard.refreshCameras();
}

function toggleMapView() {
    window.dashboard.toggleMapView();
}

function showHeatMap() {
    window.dashboard.showHeatMap();
}

function showSystemDetails() {
    window.dashboard.showSystemDetails();
}

function showAccessHistory() {
    window.dashboard.showAccessHistory();
}

function generateAccessReport() {
    window.dashboard.generateAccessReport();
}

function createNewRound() {
    window.dashboard.createNewRound();
}

function showReports() {
    window.dashboard.showReports();
}

function showMaintenanceSchedule() {
    window.dashboard.showMaintenanceSchedule();
}

function viewRoundReport(roundId) {
    window.dashboard.viewRoundReport(roundId);
}

function showGuardSchedule() {
    window.dashboard.showGuardSchedule();
}

function toggleVoiceControl() {
    window.dashboard.toggleVoiceControl();
}

function logout() {
    window.dashboard.logout();
}