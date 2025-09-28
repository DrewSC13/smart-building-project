class TecnicoDashboard {
    constructor() {
        this.currentInterventions = [];
        this.init();
    }

    async init() {
        await this.loadTechData();
        this.initializeEventListeners();
        this.startRealTimeUpdates();
        this.updateAgenda();
    }

    async loadTechData() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('/api/dashboard/tecnico/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentInterventions = data.agenda_trabajo || [];
                this.updateUI(data);
            } else {
                throw new Error('Error al cargar datos del técnico');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al cargar los datos', 'error');
        }
    }

    updateUI(data) {
        if (data.info_tecnico) {
            document.getElementById('tech-name').textContent = data.info_tecnico.nombre;
            document.getElementById('tickets-hoy').textContent = data.metricas_dia?.tickets_hoy || 0;
            document.getElementById('tiempo-promedio').textContent = data.metricas_rendimiento?.tiempo_promedio_respuesta || '0h';
        }
    }

    initializeEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Botones de intervención
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-intervention')) {
                const ticketId = e.target.dataset.ticketId;
                this.startIntervention(ticketId);
            }
        });

        // Formulario de intervención
        document.getElementById('interventionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitIntervention();
        });
    }

    switchSection(sectionId) {
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.sidebar-menu a[href="#${sectionId}"]`).classList.add('active');

        this.loadSectionData(sectionId);
    }

    async loadSectionData(sectionId) {
        try {
            const token = localStorage.getItem('authToken');
            const endpoints = {
                'tickets': '/api/tecnico/tickets/',
                'inventario': '/api/tecnico/inventario/',
                'preventivo': '/api/tecnico/preventivo/',
                'reportes': '/api/tecnico/reportes/'
            };

            if (endpoints[sectionId]) {
                const response = await fetch(endpoints[sectionId], {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.updateSectionContent(sectionId, data);
                }
            }
        } catch (error) {
            console.error('Error cargando datos de sección:', error);
        }
    }

    updateAgenda() {
        const morningSlot = document.querySelector('.time-slot.morning .interventions');
        const afternoonSlot = document.querySelector('.time-slot.afternoon .interventions');

        if (morningSlot && afternoonSlot) {
            // Limpiar slots existentes
            morningSlot.innerHTML = '';
            afternoonSlot.innerHTML = '';

            // Agrupar intervenciones por turno
            this.currentInterventions.forEach(intervention => {
                const interventionCard = this.createInterventionCard(intervention);
                if (intervention.turno === 'mañana') {
                    morningSlot.appendChild(interventionCard);
                } else {
                    afternoonSlot.appendChild(interventionCard);
                }
            });
        }
    }

    createInterventionCard(intervention) {
        const card = document.createElement('div');
        card.className = `intervention-card ${intervention.prioridad}`;
        
        card.innerHTML = `
            <div class="intervention-header">
                <span class="ticket-id">#${intervention.id}</span>
                <span class="priority ${intervention.prioridad}">${intervention.prioridad}</span>
            </div>
            <h4>${intervention.descripcion}</h4>
            <div class="intervention-details">
                <p><i class="fas fa-map-marker-alt"></i> ${intervention.ubicacion}</p>
                <p><i class="fas fa-clock"></i> ${intervention.hora} - Estimado: ${intervention.duracion}</p>
                ${intervention.contacto ? `<p><i class="fas fa-user"></i> Contacto: ${intervention.contacto}</p>` : ''}
            </div>
            <div class="intervention-actions">
                <button class="btn btn-sm start-intervention" data-ticket-id="${intervention.id}">
                    ${intervention.estado === 'asignado' ? 'Iniciar' : 'Continuar'}
                </button>
                <button class="btn btn-outline btn-sm" onclick="viewInterventionDetails(${intervention.id})">
                    Detalles
                </button>
            </div>
        `;

        return card;
    }

    async startIntervention(ticketId) {
        this.showNotification(`Iniciando intervención para ticket #${ticketId}...`, 'info');
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/tecnico/intervenciones/${ticketId}/iniciar/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.showNotification('Intervención iniciada correctamente', 'success');
                // Actualizar estado en la interfaz
                this.updateInterventionStatus(ticketId, 'en_progreso');
            } else {
                throw new Error('Error al iniciar intervención');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al iniciar la intervención', 'error');
        }
    }

    updateInterventionStatus(ticketId, newStatus) {
        const intervention = this.currentInterventions.find(i => i.id == ticketId);
        if (intervention) {
            intervention.estado = newStatus;
            this.updateAgenda();
        }
    }

    async submitIntervention() {
        const formData = new FormData(document.getElementById('interventionForm'));
        this.showNotification('Programando intervención...', 'info');
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/tecnico/intervenciones/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (response.ok) {
                this.showNotification('Intervención programada exitosamente', 'success');
                this.closeInterventionModal();
                document.getElementById('interventionForm').reset();
                // Recargar datos
                this.loadTechData();
            } else {
                throw new Error('Error al programar intervención');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al programar la intervención', 'error');
        }
    }

    startRealTimeUpdates() {
        // Simular actualizaciones en tiempo real de tickets
        setInterval(() => {
            this.simulateNewTicket();
        }, 60000); // Cada minuto
    }

    simulateNewTicket() {
        const newTicket = {
            id: Math.floor(Math.random() * 1000) + 200,
            descripcion: 'Nuevo ticket automático - Revisión requerida',
            prioridad: ['urgente', 'alta', 'media'][Math.floor(Math.random() * 3)],
            ubicacion: `Apto ${Math.floor(Math.random() * 20) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
            estado: 'asignado'
        };

        this.currentInterventions.push(newTicket);
        this.updateAgenda();
        this.showNotification('Nuevo ticket asignado', 'info');
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
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#27ae60',
            'error': '#e74c3c',
            'info': '#3498db'
        };
        return colors[type] || '#3498db';
    }
}

// Funciones globales
function openNewIntervention() {
    document.getElementById('interventionModal').style.display = 'block';
}

function closeInterventionModal() {
    document.getElementById('interventionModal').style.display = 'none';
}

function openInventoryRequest() {
    window.tecnicoDashboard.showNotification('Módulo de solicitud de materiales en desarrollo', 'info');
}

function viewInterventionDetails(interventionId) {
    window.tecnicoDashboard.showNotification(`Abriendo detalles de intervención #${interventionId}`, 'info');
}

function startIntervention(ticketId) {
    window.tecnicoDashboard.startIntervention(ticketId);
}

function viewTicket(ticketId) {
    window.tecnicoDashboard.showNotification(`Abriendo ticket #${ticketId}`, 'info');
}

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.tecnicoDashboard = new TecnicoDashboard();
});