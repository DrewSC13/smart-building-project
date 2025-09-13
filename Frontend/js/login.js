document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const messageModal = document.getElementById('messageModal');
    const closeButtons = document.querySelectorAll('.close');
    const userRoleSelect = document.getElementById('userRole');
    const additionalFieldContainer = document.getElementById('additionalFieldContainer');
    const additionalFieldLabel = document.getElementById('additionalFieldLabel');
    const additionalField = document.getElementById('additionalField');
    const additionalFieldIcon = document.getElementById('additionalFieldIcon');

    // Mapeo de roles a campos adicionales
    const roleFieldMapping = {
        'administrador': {
            label: 'Clave de Administrador',
            placeholder: 'Ingresa tu clave de administrador',
            icon: 'bx bx-key'
        },
        'residente': {
            label: 'Número de Residente',
            placeholder: 'Ingresa tu número de residente',
            icon: 'bx bx-id-card'
        },
        'guardia': {
            label: 'ID de Guardia',
            placeholder: 'Ingresa tu ID de guardia',
            icon: 'bx bx-shield'
        },
        'tecnico': {
            label: 'Código de Técnico',
            placeholder: 'Ingresa tu código de técnico',
            icon: 'bx bx-wrench'
        },
        'visitante': {
            label: 'Código de Invitación',
            placeholder: 'Ingresa tu código de invitación',
            icon: 'bx bx-user-plus'
        }
    };

    // Manejar cambio de rol
    userRoleSelect.addEventListener('change', function() {
        const selectedRole = this.value;

        if (selectedRole && roleFieldMapping[selectedRole]) {
            const fieldConfig = roleFieldMapping[selectedRole];

            // Mostrar campo adicional
            additionalFieldLabel.textContent = fieldConfig.label;
            additionalField.placeholder = fieldConfig.placeholder;
            additionalFieldIcon.className = fieldConfig.icon;
            additionalFieldContainer.style.display = 'block';

            // Hacer el campo requerido
            additionalField.required = true;
        } else {
            // Ocultar campo adicional si no hay rol seleccionado
            additionalFieldContainer.style.display = 'none';
            additionalField.required = false;
        }
    });

    // Alternar visibilidad de la contraseña
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Cambiar icono
        const icon = this.querySelector('i');
        icon.classList.toggle('bx-hide');
        icon.classList.toggle('bx-show');
    });

    // Manejar envío del formulario de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const userRole = document.getElementById('userRole').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const additionalFieldValue = document.getElementById('additionalField').value;
        const remember = document.getElementById('remember').checked;

        // Validación básica
        if (!userRole) {
            showMessage('Error', 'Por favor selecciona un tipo de usuario.');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (password.length < 6) {
            showMessage('Error', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        // Validar campo adicional según el rol
        if (additionalFieldContainer.style.display === 'block' && !additionalFieldValue) {
            const fieldName = additionalFieldLabel.textContent;
            showMessage('Error', `Por favor ingresa tu ${fieldName.toLowerCase()}.`);
            return;
        }

        // Simular inicio de sesión (esto se conectará con el backend después)
        simulateLogin(userRole, email, password, additionalFieldValue, remember);
    });

    // Abrir modal de "Olvidé mi contraseña"
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
    });

    // Manejar envío del formulario de recuperación
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('recoveryEmail').value;

        if (!validateEmail(email)) {
            showMessage('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        // Simular envío de token (esto se conectará con el backend después)
        simulatePasswordRecovery(email);
    });

    // Cerrar modales
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            forgotPasswordModal.style.display = 'none';
            messageModal.style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera del contenido
    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
        if (e.target === messageModal) {
            messageModal.style.display = 'none';
        }
    });

    // Función para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Función para mostrar mensajes
    function showMessage(title, text) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        messageModal.style.display = 'flex';
    }

    // Simular inicio de sesión (esto será reemplazado con llamada a la API)
    function simulateLogin(userRole, email, password, additionalField, remember) {
      // Mostrar estado de carga
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Iniciando sesión...';
      submitBtn.disabled = true;

      // Datos para enviar al backend
      const formData = {
          email: email,
          password: password,
          role: userRole,
          role_code: additionalField || ''
        };

        // Enviar datos al backend Django
        fetch('/api/login/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookie('csrftoken')
          },
          body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
              showMessage('Éxito', `${data.message} Token de login: ${data.login_token}`);

              // Simular verificación de login después de 2 segundos
              setTimeout(() => {
                  verifyLoginToken(data.login_token);
              }, 2000);
        } else {
            showMessage('Error', 'Error en el login: ' + JSON.stringify(data));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error', 'Error de conexión con el servidor');
    })
    .finally(() => {
        // Restaurar botón
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Función para verificar token de login
function verifyLoginToken(token) {
    fetch(`/api/verify-login/${token}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showMessage('Login Exitoso', 'Redirigiendo al dashboard...');

            // Redirigir al dashboard después de 2 segundos
            setTimeout(() => {
                window.location.href = `/dashboard/?email=${encodeURIComponent(data.user.email)}&role=${encodeURIComponent(data.user.role)}`;
            }, 2000);
        } else {
            showMessage('Error', 'Error en la verificación: ' + JSON.stringify(data));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error', 'Error de conexión con el servidor');
    });
}

// Función auxiliar para obtener cookie CSRF
function getCookie(name) {
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


    // Obtener nombre legible del rol
    function getUserRoleName(role) {
        const roleNames = {
            'administrador': 'Administrador',
            'residente': 'Residente',
            'guardia': 'Guardia de Seguridad',
            'tecnico': 'Personal de Mantenimiento',
            'visitante': 'Visitante'
        };

        return roleNames[role] || 'Usuario';
    }

    // Simular recuperación de contraseña (esto será reemplazado con llamada a la API)
    function simulatePasswordRecovery(email) {
        // Mostrar estado de carga
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // Simular retraso de red
        setTimeout(() => {
            // Simular respuesta exitosa
            showMessage('Token Enviado', `Se ha enviado un token de recuperación a ${email}. Por favor revisa tu bandeja de entrada.`);

            // Restaurar botón y cerrar modal
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            forgotPasswordModal.style.display = 'none';
        }, 1500);
    }
});
