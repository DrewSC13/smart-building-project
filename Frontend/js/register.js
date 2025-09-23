document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const registerForm = document.getElementById('registerForm');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsLink = document.getElementById('termsLink');
    const privacyLink = document.getElementById('privacyLink');
    const termsModal = document.getElementById('termsModal');
    const privacyModal = document.getElementById('privacyModal');
    const messageModal = document.getElementById('messageModal');
    const closeButtons = document.querySelectorAll('.close');
    const acceptTerms = document.getElementById('acceptTerms');
    const acceptPrivacy = document.getElementById('acceptPrivacy');
    const termsCheckbox = document.getElementById('terms');
    const userTypeSelect = document.getElementById('userType');
    const additionalFieldContainer = document.getElementById('additionalFieldContainer');
    const additionalFieldLabel = document.getElementById('additionalFieldLabel');
    const additionalField = document.getElementById('additionalField');
    const additionalFieldIcon = document.getElementById('additionalFieldIcon');
    const additionalFieldHelp = document.getElementById('additionalFieldHelp');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    const captchaImage = document.getElementById('captchaImage');
    const captchaInput = document.getElementById('captchaInput');
    const captchaKey = document.getElementById('captchaKey');
    const passwordMatchIndicator = document.getElementById('passwordMatch');

    // Mapeo de tipos de usuario a campos adicionales
    const userTypeFieldMapping = {
        'administrador': {
            label: 'Clave de Administrador',
            placeholder: 'Ingresa la clave de administrador proporcionada',
            icon: 'bx bx-key',
            help: 'Debes obtener esta clave del administrador principal del sistema.'
        },
        'residente': {
            label: 'Código de Residente',
            placeholder: 'Ingresa tu código de residente',
            icon: 'bx bx-id-card',
            help: 'Este código te fue proporcionado al adquirir tu departamento.'
        },
        'guardia': {
            label: 'Código de Guardia',
            placeholder: 'Ingresa tu código de guardia',
            icon: 'bx bx-shield',
            help: 'Este código te fue asignado por el administrador de seguridad.'
        },
        'tecnico': {
            label: 'Código de Técnico',
            placeholder: 'Ingresa tu código de técnico',
            icon: 'bx bx-wrench',
            help: 'Este código te fue proporcionado por el coordinador de mantenimiento.'
        }
    };

    // Cargar CAPTCHA al iniciar
    loadCaptcha();

    // Manejar cambio de tipo de usuario
    userTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;

        if (selectedType && userTypeFieldMapping[selectedType]) {
            const fieldConfig = userTypeFieldMapping[selectedType];

            // Mostrar campo adicional
            additionalFieldLabel.textContent = fieldConfig.label;
            additionalField.placeholder = fieldConfig.placeholder;
            additionalFieldIcon.className = fieldConfig.icon;
            additionalFieldHelp.textContent = fieldConfig.help;
            additionalFieldContainer.style.display = 'block';

            // Hacer el campo requerido
            additionalField.required = true;
        } else {
            // Ocultar campo adicional si no hay tipo seleccionado
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

    // Alternar visibilidad de la confirmación de contraseña
    toggleConfirmPassword.addEventListener('click', function() {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);

        // Cambiar icono
        const icon = this.querySelector('i');
        icon.classList.toggle('bx-hide');
        icon.classList.toggle('bx-show');
    });

    // Recargar CAPTCHA
    refreshCaptchaBtn.addEventListener('click', loadCaptcha);

    // Validar fortaleza de la contraseña en tiempo real
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
        checkPasswordMatch();
    });

    // Validar coincidencia de contraseñas en tiempo real
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    // Abrir modal de Términos y Condiciones
    termsLink.addEventListener('click', function(e) {
        e.preventDefault();
        termsModal.style.display = 'flex';
    });

    // Abrir modal de Política de Privacidad
    privacyLink.addEventListener('click', function(e) {
        e.preventDefault();
        privacyModal.style.display = 'flex';
    });

    // Aceptar términos y condiciones
    acceptTerms.addEventListener('click', function() {
        termsModal.style.display = 'none';
        termsCheckbox.checked = true;
    });

    // Aceptar política de privacidad
    acceptPrivacy.addEventListener('click', function() {
        privacyModal.style.display = 'none';
        termsCheckbox.checked = true;
    });

    // Manejar envío del formulario de registro
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const userType = document.getElementById('userType').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const additionalFieldValue = document.getElementById('additionalField').value;
        const terms = document.getElementById('terms').checked;
        const captchaResponse = document.getElementById('captchaInput').value;
        const captchaKeyValue = document.getElementById('captchaKey').value;

        // Validaciones
        if (!userType) {
            showMessage('❌ Error', 'Por favor selecciona un tipo de usuario.');
            return;
        }

        if (!validateName(firstName)) {
            showMessage('❌ Error', 'Por favor ingresa un nombre válido (solo letras y espacios).');
            return;
        }

        if (!validateName(lastName)) {
            showMessage('❌ Error', 'Por favor ingresa apellidos válidos (solo letras y espacios).');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('❌ Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!validatePhone(phone)) {
            showMessage('❌ Error', 'Por favor ingresa un número de teléfono válido.');
            return;
        }

        // Validar requisitos de contraseña
        const passwordRequirements = checkPasswordRequirements(password);
        if (!passwordRequirements.allMet) {
            showMessage('❌ Error', 'La contraseña no cumple con todos los requisitos de seguridad.');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('❌ Error', 'Las contraseñas no coinciden.');
            return;
        }

        // Validar CAPTCHA
        if (!captchaResponse) {
            showMessage('❌ Error', 'Por favor completa la verificación de seguridad (CAPTCHA).');
            return;
        }

        // Validar campo adicional según el tipo de usuario
        if (additionalFieldContainer.style.display === 'block' && !additionalFieldValue) {
            const fieldName = additionalFieldLabel.textContent;
            showMessage('❌ Error', `Por favor ingresa tu ${fieldName.toLowerCase()}.`);
            return;
        }

        if (!terms) {
            showMessage('❌ Error', 'Debes aceptar los términos y condiciones para continuar.');
            return;
        }

        // Realizar registro
        performRegistration(userType, firstName, lastName, email, phone, password, additionalFieldValue, captchaResponse, captchaKeyValue);
    });

    // Cerrar modales
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            termsModal.style.display = 'none';
            privacyModal.style.display = 'none';
            messageModal.style.display = 'none';
        });
    });

    // Cerrar modales al hacer clic fuera del contenido
    window.addEventListener('click', function(e) {
        if (e.target === termsModal) {
            termsModal.style.display = 'none';
        }
        if (e.target === privacyModal) {
            privacyModal.style.display = 'none';
        }
        if (e.target === messageModal) {
            messageModal.style.display = 'none';
        }
    });

    // Función para cargar CAPTCHA
    async function loadCaptcha() {
        try {
            const response = await fetch('/api/captcha/');
            const data = await response.json();

            captchaImage.src = data.captcha_image;
            captchaKey.value = data.captcha_key;
            captchaInput.value = ''; // Limpiar input
        } catch (error) {
            console.error('Error loading CAPTCHA:', error);
            showMessage('❌ Error', 'No se pudo cargar la verificación de seguridad. Por favor recarga la página.');
        }
    }

    // Función para validar email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Función para validar nombres (solo letras y espacios)
    function validateName(name) {
        const re = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return re.test(name) && name.length >= 2;
    }

    // Función para validar teléfono
    function validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    // Función para verificar requisitos de contraseña
    function checkPasswordRequirements(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        requirements.allMet = requirements.length && requirements.uppercase && 
                            requirements.lowercase && requirements.number && requirements.special;

        return requirements;
    }

    // Función para verificar fortaleza de contraseña con indicadores visuales
    function checkPasswordStrength(password) {
        const requirements = checkPasswordRequirements(password);
        
        // Actualizar cada indicador individual
        updateRequirementIndicator('length', requirements.length);
        updateRequirementIndicator('uppercase', requirements.uppercase);
        updateRequirementIndicator('lowercase', requirements.lowercase);
        updateRequirementIndicator('number', requirements.number);
        updateRequirementIndicator('special', requirements.special);

        // Actualizar barra de fortaleza general
        updateStrengthBar(password, requirements);
    }

    // Función para actualizar indicador individual de requisito
    function updateRequirementIndicator(requirementId, isValid) {
        const requirementElement = document.getElementById(`req-${requirementId}`);
        if (requirementElement) {
            if (isValid) {
                requirementElement.classList.add('valid');
                requirementElement.classList.remove('invalid');
            } else {
                requirementElement.classList.add('invalid');
                requirementElement.classList.remove('valid');
            }
        }
    }

    // Función para actualizar barra de fortaleza
    function updateStrengthBar(password, requirements) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const passwordContainer = document.querySelector('.form-group:has(#password)');

        // Reset classes
        passwordContainer.classList.remove('password-weak', 'password-medium', 'password-strong', 'password-very-strong');

        let strength = 0;
        let text = 'Muy débil';

        if (requirements.length) strength++;
        if (requirements.uppercase) strength++;
        if (requirements.lowercase) strength++;
        if (requirements.number) strength++;
        if (requirements.special) strength++;

        switch(strength) {
            case 0:
            case 1:
                text = 'Muy débil';
                passwordContainer.classList.add('password-weak');
                break;
            case 2:
                text = 'Débil';
                passwordContainer.classList.add('password-weak');
                break;
            case 3:
                text = 'Media';
                passwordContainer.classList.add('password-medium');
                break;
            case 4:
                text = 'Fuerte';
                passwordContainer.classList.add('password-strong');
                break;
            case 5:
                text = 'Muy fuerte';
                passwordContainer.classList.add('password-very-strong');
                break;
        }

        strengthText.textContent = `Seguridad: ${text}`;
    }

    // Función para verificar coincidencia de contraseñas
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (password && confirmPassword) {
            if (password === confirmPassword) {
                passwordMatchIndicator.classList.add('valid', 'visible');
                passwordMatchIndicator.classList.remove('invalid');
                passwordMatchIndicator.innerHTML = '<i class=\'bx bx-check\'></i><span>Las contraseñas coinciden</span>';
            } else {
                passwordMatchIndicator.classList.add('invalid', 'visible');
                passwordMatchIndicator.classList.remove('valid');
                passwordMatchIndicator.innerHTML = '<i class=\'bx bx-x\'></i><span>Las contraseñas no coinciden</span>';
            }
        } else {
            passwordMatchIndicator.classList.remove('visible');
        }
    }

    // Función para mostrar mensajes
    function showMessage(title, text) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        messageModal.style.display = 'flex';
    }

    // Función para realizar registro
    async function performRegistration(userType, firstName, lastName, email, phone, password, additionalField, captchaResponse, captchaKeyValue) {
        // Mostrar estado de carga
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;

        // Datos para enviar al backend
        const formData = {
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            password: password,
            password_confirm: password,
            role: userType,
            role_code: additionalField || '',
            captcha_response: captchaResponse,
            captcha_key: captchaKeyValue
        };

        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                let message = `✅ ${data.message}`;
                
                // Mostrar información de seguridad si está disponible
                if (data.verification_token) {
                    message += `\n\n🔐 Token de verificación: ${data.verification_token}`;
                }
                
                if (data.hash_info) {
                    message += `\n\n🔒 Hash BCrypt de tu contraseña:\n${data.hash_info}`;
                }

                message += `\n\n📧 Se ha enviado un email de verificación a ${email}`;
                message += `\n\n⚠️ Guarda esta información en un lugar seguro.`;

                showMessage('✅ Registro Exitoso', message);

                // Recargar CAPTCHA después del éxito
                loadCaptcha();
                
                // Redirigir después de éxito (dar tiempo para copiar información)
                setTimeout(() => {
                    window.location.href = '/login/';
                }, 10000);
            } else {
                showMessage('❌ Error', data.error || 'Error en el registro');
                // Recargar CAPTCHA si hay error
                loadCaptcha();
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('❌ Error de Conexión', 'Error de conexión con el servidor. Verifica tu conexión a internet.');
            // Recargar CAPTCHA si hay error
            loadCaptcha();
        } finally {
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Obtener nombre legible del tipo de usuario
    function getUserTypeName(userType) {
        const typeNames = {
            'administrador': 'Administrador',
            'residente': 'Residente',
            'guardia': 'Guardia de Seguridad',
            'tecnico': 'Personal de Mantenimiento'
        };

        return typeNames[userType] || 'Usuario';
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
});