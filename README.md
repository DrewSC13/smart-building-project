# 🏢 Sistema de Administración de Edificio Inteligente - BuildingPRO

## 📋 Descripción
Sistema web completo para la administración inteligente de edificios multifamiliares y corporativos. Incluye módulos de seguridad, gestión de residentes, control de accesos y sistema de autenticación robusto.

## 🚀 Estado del Proyecto
**✅ FASE DE LOGIN/REGISTER COMPLETADA** - Versión Alpha 1.0

### ✅ COMPLETADO
- [x] **Estructura completa del proyecto** (Backend + Frontend)
- [x] **Backend Django** con API REST y Django REST Framework
- [x] **Frontend HTML/CSS/JS** con diseño responsive
- [x] **Base de datos SQLite3** con modelos completos
- [x] **Sistema de autenticación seguro** con roles de usuario
- [x] **Protección contra fuerza bruta** (3 intentos + bloqueo 15min)
- [x] **Hashing BCrypt** para contraseñas con transparencia
- [x] **Verificación CAPTCHA** en todos los formularios
- [x] **Sistema de tokens** con expiración (login y reset)
- [x] **Emails de verificación** con información de seguridad
- [x] **Interfaz moderna** con efectos futuristas

### 🚧 EN DESARROLLO
- [ ] Dashboards administrativos por rol
- [ ] Gestión de residentes y visitantes
- [ ] Sistema de control de accesos
- [ ] Módulo de finanzas y pagos
- [ ] Sistema de tickets de mantenimiento
- [ ] Notificaciones en tiempo real
- [ ] Integración con dispositivos IoT

---

## 🛠️ Tecnologías Implementadas

### Backend
- **Python 3.13** + **Django 5.2.6**
- **Django REST Framework** para APIs
- **BCrypt** para hashing seguro de contraseñas
- **Django Captcha** para protección contra bots
- **SQLite3** (base de datos de desarrollo)

### Frontend  
- **HTML5, CSS3, JavaScript** vanilla
- **Bootstrap 5** para componentes UI
- **Boxicons** para iconografía moderna
- **Diseño responsive** para PC y móviles

### Seguridad
- ✅ **BCrypt con salt** para contraseñas
- ✅ **Bloqueo automático** después de 3 intentos fallidos
- ✅ **Rate limiting** por IP y email
- ✅ **Tokens expirables** (15min login, 1h reset)
- ✅ **Validación de fortaleza** de contraseñas
- ✅ **Verificación CAPTCHA** en todos los forms
- ✅ **Middleware personalizado** para protección

---

## 🐧 Instalación y Configuración

### Prerrequisitos
```bash
# Verificar instalaciones
python --version  # 3.8+
pip --version
git --version
📦 Instalación Manual
bash
# 1. Clonar repositorio
git clone https://github.com/DrewSC13/smart-building-project.git
cd smart-building-project

# 2. Configurar entorno virtual
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Aplicar migraciones
python manage.py makemigrations
python manage.py migrate

# 5. Crear superusuario (opcional)
python manage.py createsuperuser
🚀 Ejecución de la Aplicación
bash
# Terminal 1 - Backend (Django)
cd Backend
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
python manage.py runserver 0.0.0.0:8000
📊 URLs de Acceso
🖥️ Desde PC - Desarrollo Local
Servicio	URL	Descripción
Frontend Web	http://localhost:8000	Aplicación principal
Login	http://localhost:8000/login/	Página de inicio de sesión
Registro	http://localhost:8000/register/	Página de registro
API REST	http://localhost:8000/api/	Endpoints JSON
Admin Django	http://localhost:8000/admin/	Panel administrativo
📱 Desde Celular (Misma Red)
Servicio	URL	Requisito
Frontend Web	http://[IP-PC]:8000	Misma red WiFi
API REST	http://[IP-PC]:8000/api/	Misma red WiFi
Reemplazar [IP-PC] con la IP de tu computadora:

Linux: hostname -I

Windows: ipconfig

👥 Roles del Sistema
🔐 Roles Implementados
👨‍💼 Administrador - Acceso completo al sistema

👨‍👩‍👧 Residente - Habitantes del edificio

🛡️ Guardia de Seguridad - Control de accesos

🔧 Personal de Mantenimiento - Gestión técnica

👤 Visitante - Acceso temporal con invitación

🎯 Permisos por Rol
Registro: Todos los roles con verificación por email

Login: Verificación de credenciales + código de rol

Dashboard: Próxima implementación por rol

🔐 Flujos de Autenticación Implementados
1. 📝 Registro de Usuario






2. 🔑 Inicio de Sesión















3. 🔓 Recuperación de Contraseña








🛡️ Características de Seguridad
🔒 Nivel Empresarial Implementado
BCrypt Hashing: $2b$12$9dc9xfcRdIoIh9KbG1WwWujz4Ui0axpPvRKyJpip2NjqB47ZCrrge

Protección Fuerza Bruta: 3 intentos → bloqueo 15min

Rate Limiting: Límite por IP y email

Tokens Desechables: Expiración automática

Validación Contraseñas: Mínimo 8 chars, números, mayúsculas

Transparencia: Hash visible en emails para confianza

📧 Sistema de Emails Seguros
Verificación de Cuenta: Con hash BCrypt visible

Tokens de Acceso: Instrucciones claras + seguridad

Recuperación: Verificación de identidad robusta

Confirmaciones: Notificación de actividades

🎨 Interfaz de Usuario
✨ Diseño Moderno
Estilo futurista con efectos de fondo animados

Responsive design para PC, tablet y móvil

Formularios intuitivos con validación en tiempo real

Feedback visual de intentos y estado de cuenta

📱 Experiencia de Usuario
Contador de intentos visible en login

Mensajes de error descriptivos y útiles

Modales informativos para tokens y verificaciones

Navegación fluida entre secciones

📁 Estructura del Proyecto
text
smart-building-project/
├── 📁 Backend/
│   ├── 📁 authentication/
│   │   ├── models.py          # Modelos: User, Tokens, Attempts
│   │   ├── views.py           # Lógica auth + seguridad
│   │   ├── serializers.py     # Validación APIs
│   │   ├── middleware.py      # Protección fuerza bruta
│   │   └── urls.py           # Endpoints auth
│   ├── 📁 buildingpro/
│   │   ├── settings.py        # Configuración Django
│   │   └── urls.py           # URLs principales
│   └── manage.py
├── 📁 Frontend/
│   ├── 📁 css/
│   │   ├── login.css         # Estilos modernos login
│   │   └── register.css      # Estilos registro
│   ├── 📁 js/
│   │   ├── login.js          # Lógica frontend login
│   │   └── register.js       # Lógica registro
│   ├── 📁 img/
│   │   └── Logo.png          # Logo BuildingPRO
│   ├── login.html           # Página login
│   ├── register.html        # Página registro
│   ├── dashboard.html       # Dashboard (próximo)
│   └── reset-password.html  # Recuperación contraseña
└── requirements.txt         # Dependencias Python
🚀 Próximas Features
📋 En Desarrollo para Alpha 2.0
Dashboards por rol (Admin, Residente, Guardia, etc.)

Gestión de perfiles de usuario

Sistema de visitas y control de accesos

Panel administrativo completo

Sistema de notificaciones

API documentation con Swagger

🔮 Roadmap Futuro
App móvil React Native

Sistema de pagos y finanzas

Integración IoT para domótica

Reportes analytics y estadísticas

Sistema de reservas áreas comunes

👨‍💻 Desarrollo
🛠️ Comandos Útiles
bash
# Ejecutar tests
python manage.py test

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Colectar archivos estáticos
python manage.py collectstatic
📝 Estructura de Commits
bash
feat:     Nueva funcionalidad
fix:      Corrección de bugs
docs:     Documentación
style:    Mejoras de formato
refactor: Refactorización de código
security: Mejoras de seguridad
📄 Licencia
Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

🤝 Soporte y Contacto
Para soporte técnico o contribuciones:

📧 Email: drewsc13@gmail.com

📱 GitHub: @DrewSC13

🐛 Issues: Reportar problemas

💬 Discusiones: GitHub Discussions

Desarrollado con ❤️ por Claudio Andrew - Sistema BuildingPRO v1.0 🏢🔐
