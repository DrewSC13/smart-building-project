class VisitanteDashboard {
    constructor() {
        this.visitData = null;
        this.endTime = null;
        this.init();
    }

    async init() {
        await this.loadVisitData();
        this.startTimers();
        this.initializeEventListeners();
    }

    async loadVisitData() {
        try {
            // En un sistema real, esto vendría de la API
            // Simulamos datos de visita
            this.visitData = {
                hostName: "María González",
                hostApartment: "5B - Torre 1",
                hostPhone: "+56 9 5555 4444",
                visitDate: "17 Enero 2024",
                visitHours: "14:00 - 18:00",
                areasAllowed: [
                    "Sala de espera - Piso 1",
                    "Área social - Piso 3", 
                    "Baños visitantes - Piso 1"
                ],
                areasRestricted: [
                    "Piscina",
                    "Gimnasio"
                ],
                visitStart: new Date(),
                visitEnd: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 horas desde ahora
            };

            this.endTime = this.visitData.visitEnd;
            this.updateUI();
        } catch (error) {
            console.error('Error cargando datos de visita:', error);
        }
    }

    updateUI() {
        document.getElementById('host-name').textContent = this.visitData.hostName;
        document.getElementById('host-apartment').textContent = this.visitData.hostApartment;
        document.getElementById('host-phone').textContent = this.visitData.hostPhone;
        document.getElementById('visit-date').textContent = this.visitData.visitDate;
        document.getElementById('visit-hours').textContent = this.visitData.visitHours;
    }

    startTimers() {
        // Actualizar hora actual
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);

        // Actualizar tiempo restante
        this.updateTimeRemaining();
        setInterval(() => this.updateTimeRemaining(), 1000);
    }

    updateCurrentTime() {
        const now = new Date();
        document.getElementById('current-time').textContent = 
            now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    updateTimeRemaining() {
        if (!this.endTime) return;

        const now = new Date();
        const diff = this.endTime - now;

        if (diff <= 0) {
            document.getElementById('time-remaining').textContent = '00:00:00';
            document.querySelector('.status').textContent = 'Expirado';
            document.querySelector('.status').style.background = '#ffeaea';
            document.querySelector('.status').style.color = '#e74c3c';
            this.showNotification('Su tiempo de visita ha expirado', 'warning');
            return;
        }

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        document.getElementById('time-remaining').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Cambiar color cuando quede menos de 30 minutos
        if (diff < 30 * 60 * 1000) {
            document.getElementById('time-remaining').style.color = '#e74c3c';
        }
    }

    initializeEventListeners() {
        // Navegación del mapa por pisos
        document.querySelectorAll('.floor-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchFloor(btn.dataset.floor);
            });
        });

        // Botones de contacto
        document.querySelectorAll('.btn-contact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    switchFloor(floorNumber) {
        document.querySelectorAll('.floor-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Simular cambio de mapa (en un sistema real cargaría el mapa del piso)
        const mapDisplay = document.querySelector('.map-placeholder');
        mapDisplay.innerHTML = `
            <i class="fas fa-map"></i>
            <p>Mapa del Piso ${floorNumber}</p>
            <p>Áreas permitidas destacadas en verde</p>
            <div style="margin-top: 15px; font-size: 0.8rem; color: #666;">
                <p>• Entrada principal</p>
                <p>• Área social</p>
                <p>• Baños visitantes</p>
                <p>• Ascensores</p>
            </div>
        `;

        this.showNotification(`Mostrando mapa del Piso ${floorNumber}`, 'info');
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
            top: 100px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
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
function showHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

function callSecurity() {
    window.visitanteDashboard.showNotification('Llamando al guardia de seguridad...', 'info');
    // Simular llamada después de 2 segundos
    setTimeout(() => {
        window.visitanteDashboard.showNotification('Guardia de seguridad contactado', 'success');
    }, 2000);
}

function callAdmin() {
    window.visitanteDashboard.showNotification('Contactando a administración...', 'info');
}

function messageHost() {
    window.visitanteDashboard.showNotification('Enviando mensaje a su anfitrión...', 'info');
}

function extendVisit() {
    if (confirm('¿Desea solicitar una extensión de su tiempo de visita?')) {
        window.visitanteDashboard.showNotification('Solicitud de extensión enviada a su anfitrión', 'info');
    }
}

function requestAssistance() {
    window.visitanteDashboard.showNotification('Solicitud de asistencia enviada al guardia de seguridad', 'info');
}

function endVisit() {
    if (confirm('¿Está seguro de que desea finalizar su visita?')) {
        window.visitanteDashboard.showNotification('Visita finalizada. ¡Esperamos verle pronto!', 'success');
        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.visitanteDashboard = new VisitanteDashboard();
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (e) => {
    const modal = document.getElementById('helpModal');
    if (e.target === modal) {
        closeHelp();
    }
});