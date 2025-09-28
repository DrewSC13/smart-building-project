class AdminDashboard {
    constructor() {
        this.currentSection = 'panel-ejecutivo';
        this.init();
    }

    init() {
        this.initializeCharts();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    initializeCharts() {
        // Gráfico de Ingresos vs Gastos
        const incomeExpenseCtx = document.getElementById('incomeExpenseChart');
        if (incomeExpenseCtx) {
            new Chart(incomeExpenseCtx, {
                type: 'line',
                data: {
                    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: [120000, 125000, 118000, 130000, 125430, 128000],
                            borderColor: '#27ae60',
                            backgroundColor: 'rgba(39, 174, 96, 0.1)',
                            tension: 0.3,
                            fill: true
                        },
                        {
                            label: 'Gastos',
                            data: [80000, 82000, 85000, 83000, 85200, 87000],
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            tension: 0.3,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.switchSection(target);
            });
        });

        // Botones de acción
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleButtonAction(btn);
            });
        });
    }

    switchSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Actualizar menú activo
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.sidebar-menu a[href="#${sectionId}"]`).classList.add('active');

        this.currentSection = sectionId;
    }

    async loadDashboardData() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }

            const response = await fetch('/api/dashboard/admin/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateDashboard(data);
            } else {
                throw new Error('Error al cargar datos del dashboard');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al cargar los datos', 'error');
        }
    }

    updateDashboard(data) {
        // Actualizar KPIs
        if (data.kpis) {
            this.updateKPIs(data.kpis);
        }

        // Actualizar alertas
        if (data.alertas) {
            this.updateAlerts(data.alertas);
        }

        // Actualizar tablas
        if (data.accesos_recientes) {
            this.updateRecentAccess(data.accesos_recientes);
        }

        if (data.tickets_activos) {
            this.updateActiveTickets(data.tickets_activos);
        }
    }

    updateKPIs(kpis) {
        // Implementar actualización dinámica de KPIs
        console.log('Actualizando KPIs:', kpis);
    }

    updateAlerts(alertas) {
        const alertsContainer = document.querySelector('.alerts-list');
        if (alertsContainer) {
            alertsContainer.innerHTML = alertas.map(alert => `
                <div class="alert-item ${alert.prioridad}">
                    <div class="alert-icon">
                        <i class="fas fa-${this.getAlertIcon(alert.tipo)}"></i>
                    </div>
                    <div class="alert-content">
                        <h4>${alert.mensaje}</h4>
                        <p>Área: ${alert.tipo} • ${this.formatTime(alert.timestamp)}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    getAlertIcon(tipo) {
        const icons = {
            'seguridad': 'shield-alt',
            'mantenimiento': 'tools',
            'financiero': 'money-bill-wave',
            'default': 'exclamation-circle'
        };
        return icons[tipo] || icons.default;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('es-ES');
    }

    handleButtonAction(button) {
        const action = button.textContent.trim();
        
        switch(action) {
            case 'Actualizar':
                this.loadDashboardData();
                this.showNotification('Datos actualizados', 'success');
                break;
            case 'Reporte':
                this.generateReport();
                break;
            case 'Nueva Factura':
                this.openInvoiceModal();
                break;
            default:
                console.log('Acción no implementada:', action);
        }
    }

    generateReport() {
        // Generar reporte PDF
        this.showNotification('Generando reporte...', 'info');
        setTimeout(() => {
            this.showNotification('Reporte generado exitosamente', 'success');
        }, 2000);
    }

    openInvoiceModal() {
        // Abrir modal para nueva factura
        this.showNotification('Funcionalidad en desarrollo', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
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

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Función global para logout
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}