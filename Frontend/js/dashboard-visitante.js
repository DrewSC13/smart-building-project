// dashboard-visitante.js
class VisitanteDashboard {
    constructor() {
        this.visitEndTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 horas desde ahora
        this.init();
    }

    init() {
        this.updateDateTime();
        this.startTimers();
        this.setupEventListeners();
        this.loadVisitData();
    }

    updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const dateString = now.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('current-time').textContent = timeString;
        document.getElementById('current-date').textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }

    startTimers() {
        // Actualizar hora cada segundo
        setInterval(() => {
            this.updateDateTime();
            this.updateTimeRemaining();
        }, 1000);

        // Actualizar tiempo restante cada minuto
        setInterval(() => {
            this.updateTimeRemaining();
        }, 60000);
    }

    updateTimeRemaining() {
        const now = new Date();
        const timeDiff = this.visitEndTime - now;
        
        if (timeDiff <= 0) {
            document.getElementById('time-remaining').textContent = '00:00:00';
            document.querySelector('.status.active').textContent = 'Expirado';
            document.querySelector('.status.active').style.background = '#e74c3c';
            this.showNotification('Su tiempo de visita ha expirado', 'warning');
            return;
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('time-remaining').textContent = timeString;

        // Cambiar color cuando quede menos de 30 minutos
        if (hours === 0 && minutes < 30) {
            document.getElementById('time-remaining').style.color = '#e74c3c';
        }
    }

    setupEventListeners() {
        // Selector de pisos
        document.querySelectorAll('.floor-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.showFloorMap(e.target.dataset.floor);
            });
        });

        // Botones de contacto
        document.querySelectorAll('.btn-contact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('helpModal').addEventListener('click', (e) => {
            if (e.target.id === 'helpModal') {
                this.closeHelp();
            }
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeHelp();
            }
        });
    }

    loadVisitData() {
        // Simular carga de datos de la visita
        setTimeout(() => {
            // En una implementación real, estos datos vendrían de una API
            const visitData = {
                hostName: 'María González',
                apartment: '5B - Torre 1',
                visitDate: '17 Enero 2024',
                visitHours: '14:00 - 18:00',
                hostPhone: '+56 9 5555 4444'
            };

            document.getElementById('host-name').textContent = visitData.hostName;
            document.getElementById('host-apartment').textContent = visitData.apartment;
            document.getElementById('visit-date').textContent = visitData.visitDate;
            document.getElementById('visit-hours').textContent = visitData.visitHours;
            document.getElementById('host-phone').textContent = visitData.hostPhone;
        }, 1000);
    }

    showFloorMap(floor) {
        const mapDisplay = document.querySelector('.map-placeholder');
        const floorNames = {
            '1': 'Planta Baja - Recepción y Áreas Comunes',
            '2': 'Primer Piso - Oficinas y Servicios',
            '3': 'Segundo Piso - Área Social y Terraza'
        };

        mapDisplay.innerHTML = `
            <i class="fas fa-map-marked-alt"></i>
            <h3>Piso ${floor}</h3>
            <p>${floorNames[floor]}</p>
            <p style="font-size: 0.9rem; margin-top: 10px; color: #7f8c8d;">
                Mapa interactivo - Áreas destacadas en color
            </p>
        `;

        this.showNotification(`Mostrando mapa del Piso ${floor}`, 'info');
    }

    showNotification(message, type = 'info') {
        // Remover notificación anterior si existe
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'error': 'fas fa-times-circle'
        };

        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Funciones de los botones de acción
    extendVisit() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-clock"></i> Extender Visita</h3>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>¿Desea solicitar una extensión de su tiempo de visita?</p>
                    <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                        <button class="btn-contact" onclick="dashboard.requestExtension(1)">+1 Hora</button>
                        <button class="btn-contact" onclick="dashboard.requestExtension(2)">+2 Horas</button>
                        <button class="btn-contact" style="background: #95a5a6;" onclick="this.closest('.modal').remove()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    requestExtension(hours) {
        document.querySelector('.modal').remove();
        
        // Simular solicitud a la API
        this.showNotification(`Solicitando extensión de ${hours} hora(s)...`, 'info');
        
        setTimeout(() => {
            // Simular respuesta positiva
            const newEndTime = new Date(this.visitEndTime.getTime() + hours * 60 * 60 * 1000);
            this.visitEndTime = newEndTime;
            
            this.showNotification(`¡Extensión aprobada! Su visita ahora termina a las ${newEndTime.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'})}`, 'success');
            
            // Actualizar interfaz
            document.querySelector('.qr-valid').textContent = `Válido por ${hours + 4} horas`;
        }, 2000);
    }

    requestAssistance() {
        this.showNotification('Solicitud de ayuda enviada al guardia de seguridad', 'info');
        
        // Simular llamada a API
        setTimeout(() => {
            this.showNotification('El guardia de seguridad se dirigirá a su ubicación', 'success');
        }, 1500);
    }

    endVisit() {
        if (confirm('¿Está seguro de que desea finalizar su visita? Esta acción no se puede deshacer.')) {
            this.showNotification('Finalizando visita...', 'info');
            
            // Simular proceso de finalización
            setTimeout(() => {
                this.showNotification('Visita finalizada correctamente. ¡Gracias por su visita!', 'success');
                
                // Redirigir después de 3 segundos
                setTimeout(() => {
                    window.location.href = '../login.html';
                }, 3000);
            }, 2000);
        }
    }
}

// Funciones globales para los botones
function showHelp() {
    document.getElementById('helpModal').style.display = 'block';
}

function closeHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

function callSecurity() {
    dashboard.showNotification('Llamando al guardia de seguridad...', 'info');
    // En un entorno real, esto podría iniciar una llamada telefónica
}

function callAdmin() {
    dashboard.showNotification('Llamando a administración...', 'info');
    // En un entorno real, esto podría iniciar una llamada telefónica
}

function messageHost() {
    dashboard.showNotification('Enviando mensaje a su anfitrión...', 'info');
    // En un entorno real, esto abriría WhatsApp o enviaría un SMS
}

// Inicializar dashboard cuando el DOM esté listo
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new VisitanteDashboard();
    
    // Mostrar primer piso por defecto
    dashboard.showFloorMap('1');
});

// Manejar errores no capturados
window.addEventListener('error', (e) => {
    console.error('Error en el dashboard:', e.error);
});