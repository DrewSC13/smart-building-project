class ResidenteDashboard {
    constructor() {
        this.currentSection = 'inicio';
        this.residentData = null;
        this.init();
    }

    async init() {
        await this.loadResidentData();
        this.initializeEventListeners();
        this.updateDashboard();
    }

    async loadResidentData() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('/api/dashboard/residente/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.residentData = await response.json();
                this.updateUI();
            } else {
                throw new Error('Error al cargar datos del residente');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al cargar los datos', 'error');
        }
    }

    updateUI() {
        if (this.residentData.info_personal) {
            document.getElementById('resident-name').textContent = 
                this.residentData.info_personal.nombre_completo;
            document.getElementById('apartment-info').textContent = 
                `Departamento ${this.residentData.info_personal.departamento} - ${this.residentData.info_personal.torre}`;
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

        // Botones de pago rápido
        document.querySelectorAll('.payment-item .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.processQuickPayment(e.target.closest('.payment-item'));
            });
        });

        // Formulario de reserva rápida
        document.getElementById('quickReserveForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuickReservation();
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

        this.currentSection = sectionId;
        
        // Cargar datos específicos de la sección
        this.loadSectionData(sectionId);
    }

    async loadSectionData(sectionId) {
        try {
            const token = localStorage.getItem('authToken');
            const endpoints = {
                'finanzas': '/api/residente/finanzas/',
                'reservas': '/api/residente/reservas/',
                'mantenimiento': '/api/residente/mantenimiento/',
                'consumo': '/api/residente/consumo/'
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

    updateSectionContent(sectionId, data) {
        switch(sectionId) {
            case 'finanzas':
                this.updateFinancialSection(data);
                break;
            case 'reservas':
                this.updateReservationsSection(data);
                break;
            case 'mantenimiento':
                this.updateMaintenanceSection(data);
                break;
            case 'consumo':
                this.updateConsumptionSection(data);
                break;
        }
    }

    updateFinancialSection(data) {
        // Implementar actualización de sección financiera
        console.log('Actualizando finanzas:', data);
    }

    async processQuickPayment(paymentItem) {
        const amount = paymentItem.querySelector('.amount').textContent;
        const concept = paymentItem.querySelector('h4').textContent;
        
        this.showNotification(`Procesando pago de ${amount} para ${concept}...`, 'info');
        
        // Simular procesamiento de pago
        setTimeout(() => {
            this.showNotification(`Pago de ${amount} procesado exitosamente`, 'success');
            paymentItem.style.opacity = '0.6';
            paymentItem.querySelector('.btn').disabled = true;
            paymentItem.querySelector('.btn').textContent = 'Pagado';
        }, 2000);
    }

    submitQuickReservation() {
        const formData = new FormData(document.getElementById('quickReserveForm'));
        this.showNotification('Solicitando reserva...', 'info');
        
        setTimeout(() => {
            this.showNotification('Reserva solicitada exitosamente. Esperando confirmación.', 'success');
            this.closeQuickReserve();
            document.getElementById('quickReserveForm').reset();
        }, 1500);
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
function openQuickReserve() {
    document.getElementById('quickReserveModal').style.display = 'block';
}

function closeQuickReserve() {
    document.getElementById('quickReserveModal').style.display = 'none';
}

function closeAlert(closeButton) {
    closeButton.closest('.alert-banner').style.display = 'none';
}

function switchSection(sectionId) {
    if (window.residenteDashboard) {
        window.residenteDashboard.switchSection(sectionId);
    }
}

function openQuickReport() {
    // Implementar reporte rápido de problemas
    window.residenteDashboard.showNotification('Funcionalidad de reporte rápido en desarrollo', 'info');
}

function viewBuildingStatus() {
    window.residenteDashboard.showNotification('Estado del edificio: Todos los sistemas operativos', 'info');
}

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.residenteDashboard = new ResidenteDashboard();
});