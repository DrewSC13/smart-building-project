document.addEventListener('DOMContentLoaded', function() {
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
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    const captchaImage = document.getElementById('captchaImage');
    const captchaInput = document.getElementById('captchaInput');
    const captchaKey = document.getElementById('captchaKey');
    const refreshRecoveryCaptchaBtn = document.getElementById('refreshRecoveryCaptcha');
    const recoveryCaptchaImage = document.getElementById('recoveryCaptchaImage');
    const recoveryCaptchaInput = document.getElementById('recoveryCaptchaInput');
    const recoveryCaptchaKey = document.getElementById('recoveryCaptchaKey');

    // Elementos para mostrar intentos
    const attemptsContainer = document.createElement('div');
    attemptsContainer.id = 'attemptsContainer';
    attemptsContainer.style.cssText = 'margin: 15px 0; padding: 10px; border-radius: 5px; display: none;';
    loginForm.insertBefore(attemptsContainer, loginForm.querySelector('.remember-forgot'));

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

    // Cargar CAPTCHAs al iniciar
    loadCaptcha();
    loadRecoveryCaptcha();

    userRoleSelect.addEventListener('change', function() {
        const selectedRole = this.value;

        if (selectedRole && roleFieldMapping[selectedRole]) {
            const fieldConfig = roleFieldMapping[selectedRole];

            additionalFieldLabel.textContent = fieldConfig.label;
            additionalField.placeholder = fieldConfig.placeholder;
            additionalFieldIcon.className = fieldConfig.icon;
            additionalFieldContainer.style.display = 'block';
            additionalField.required = true;
        } else {
            additionalFieldContainer.style.display = 'none';
            additionalField.required = false;
            additionalField.value = ''; // Limpiar el campo cuando se oculta
        }
    });

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const icon = this.querySelector('i');
        icon.classList.toggle('bx-hide');
        icon.classList.toggle('bx-show');
    });

    refreshCaptchaBtn.addEventListener('click', loadCaptcha);
    refreshRecoveryCaptchaBtn.addEventListener('click', loadRecoveryCaptcha);

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const userRole = document.getElementById('userRole').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const additionalFieldValue = document.getElementById('additionalField').value;
        const remember = document.getElementById('remember').checked;
        const captchaResponse = document.getElementById('captchaInput').value;
        const captchaKeyValue = document.getElementById('captchaKey').value;

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

        if (!captchaResponse) {
            showMessage('Error', 'Por favor completa la verificación de seguridad (CAPTCHA).');
            return;
        }

        // Validar campo adicional solo si está visible y es requerido
        if (additionalFieldContainer.style.display === 'block') {
            if (!additionalFieldValue) {
                const fieldName = additionalFieldLabel.textContent;
                showMessage('Error', `Por favor ingresa tu ${fieldName.toLowerCase()}.`);
                return;
            }
        }

        performLogin(userRole, email, password, additionalFieldValue, remember, captchaResponse, captchaKeyValue);
    });

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.style.display = 'flex';
        // Recargar CAPTCHA de recuperación cuando se abre el modal
        loadRecoveryCaptcha();
    });

    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('recoveryEmail').value;
        const captchaResponse = document.getElementById('recoveryCaptchaInput').value;
        const captchaKeyValue = document.getElementById('recoveryCaptchaKey').value;

        if (!validateEmail(email)) {
            showMessage('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!captchaResponse) {
            showMessage('Error', 'Por favor completa la verificación de seguridad (CAPTCHA).');
            return;
        }

        await performPasswordRecovery(email, captchaResponse, captchaKeyValue);
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            forgotPasswordModal.style.display = 'none';
            messageModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
        if (e.target === messageModal) {
            messageModal.style.display = 'none';
        }
    });

    async function loadCaptcha() {
        try {
            const response = await fetch('/api/captcha/');
            const data = await response.json();

            captchaImage.src = data.captcha_image;
            captchaKey.value = data.captcha_key;
            captchaInput.value = '';
        } catch (error) {
            console.error('Error loading CAPTCHA:', error);
            showMessage('Error', 'No se pudo cargar la verificación de seguridad. Por favor recarga la página.');
        }
    }

    async function loadRecoveryCaptcha() {
        try {
            const response = await fetch('/api/captcha/');
            const data = await response.json();

            recoveryCaptchaImage.src = data.captcha_image;
            recoveryCaptchaKey.value = data.captcha_key;
            recoveryCaptchaInput.value = '';
        } catch (error) {
            console.error('Error loading recovery CAPTCHA:', error);
            showMessage('Error', 'No se pudo cargar la verificación de seguridad. Por favor recarga la página.');
        }
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showMessage(title, text) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        messageModal.style.display = 'flex';
    }

    function updateAttemptsDisplay(attempts, remaining, locked = false, minutes = 0) {
        if (locked) {
            attemptsContainer.style.display = 'block';
            attemptsContainer.style.background = '#ffebee';
            attemptsContainer.style.border = '1px solid #f44336';
            attemptsContainer.innerHTML = `
                <div style="color: #d32f2f; font-weight: bold;">
                    🔒 Cuenta bloqueada temporalmente
                </div>
                <div style="font-size: 14px; margin-top: 5px;">
                    Demasiados intentos fallidos. Por favor, espere ${minutes} minutos.
                </div>
            `;
        } else if (attempts > 0) {
            attemptsContainer.style.display = 'block';
            attemptsContainer.style.background = '#fff3cd';
            attemptsContainer.style.border = '1px solid #ffc107';
            attemptsContainer.innerHTML = `
                <div style="color: #856404; font-weight: bold;">
                    ⚠️ Intentos fallidos: ${attempts}/3
                </div>
                <div style="font-size: 14px; margin-top: 5px;">
                    Intentos restantes: ${remaining}
                </div>
            `;
        } else {
            attemptsContainer.style.display = 'none';
        }
    }

    async function performLogin(userRole, email, password, additionalField, remember, captchaResponse, captchaKeyValue) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Iniciando sesión...';
        submitBtn.disabled = true;

        // Preparar datos para enviar - solo incluir role_code si hay un valor
        const formData = {
            email: email,
            password: password,
            role: userRole,
            captcha_response: captchaResponse,
            captcha_key: captchaKeyValue
        };

        // Solo agregar role_code si el campo adicional está visible y tiene valor
        if (additionalFieldContainer.style.display === 'block' && additionalField) {
            formData.role_code = additionalField;
        }

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Éxito', `${data.message} Token de login: ${data.login_token}`);
                attemptsContainer.style.display = 'none'; // Ocultar intentos en éxito

                setTimeout(() => {
                    verifyLoginToken(data.login_token);
                }, 2000);
            } else {
                // Mostrar información de intentos fallidos
                if (data.attempts !== undefined) {
                    updateAttemptsDisplay(
                        data.attempts, 
                        data.remaining_attempts, 
                        data.locked,
                        data.minutes_remaining
                    );
                }
                
                showMessage('Error', data.error || 'Error en el login');
                // Recargar CAPTCHA si hay error
                loadCaptcha();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
            // Recargar CAPTCHA si hay error
            loadCaptcha();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async function verifyLoginToken(token) {
        try {
            const response = await fetch(`/api/verify-login/${token}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Login Exitoso', 'Redirigiendo al dashboard...');

                setTimeout(() => {
                    window.location.href = `/dashboard/?email=${encodeURIComponent(data.user.email)}&role=${encodeURIComponent(data.user.role)}`;
                }, 2000);
            } else {
                showMessage('Error', data.error || 'Error en la verificación');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
        }
    }

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

    async function performPasswordRecovery(email, captchaResponse, captchaKeyValue) {
        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/password-reset-request/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    email: email,
                    captcha_response: captchaResponse,
                    captcha_key: captchaKeyValue
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Token Enviado', `Se ha enviado un token de recuperación a ${email}. Por favor revisa tu bandeja de entrada.`);
                forgotPasswordModal.style.display = 'none';
                // Limpiar formulario
                document.getElementById('recoveryEmail').value = '';
                recoveryCaptchaInput.value = '';
                loadRecoveryCaptcha();
            } else {
                showMessage('Error', data.error || 'Error al enviar el token de recuperación');
                // Recargar CAPTCHA si hay error
                loadRecoveryCaptcha();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error', 'Error de conexión con el servidor');
            // Recargar CAPTCHA si hay error
            loadRecoveryCaptcha();
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
});
