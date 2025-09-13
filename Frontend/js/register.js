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

    // Validar fortaleza de la contraseña en tiempo real
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });

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
    registerForm.addEventListener('submit', function(e) {
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

        // Validaciones
        if (!userType) {
            showMessage('Error', 'Por favor selecciona un tipo de usuario.');
            return;
        }

        if (!validateName(firstName)) {
            showMessage('Error', 'Por favor ingresa un nombre válido (solo letras y espacios).');
            return;
        }

        if (!validateName(lastName)) {
            showMessage('Error', 'Por favor ingresa apellidos válidos (solo letras y espacios).');
            return;
        }

        if (!validateEmail(email)) {
            showMessage('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (!validatePhone(phone)) {
            showMessage('Error', 'Por favor ingresa un número de teléfono válido.');
            return;
        }

        if (password.length < 8) {
            showMessage('Error', 'La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Error', 'Las contraseñas no coinciden.');
            return;
        }

        // Validar campo adicional según el tipo de usuario
        if (additionalFieldContainer.style.display === 'block' && !additionalFieldValue) {
            const fieldName = additionalFieldLabel.textContent;
            showMessage('Error', `Por favor ingresa tu ${fieldName.toLowerCase()}.`);
            return;
        }

        if (!terms) {
            showMessage('Error', 'Debes aceptar los términos y condiciones para continuar.');
            return;
        }

        // Simular registro (esto se conectará con el backend después)
        simulateRegistration(userType, firstName, lastName, email, phone, password, additionalFieldValue);
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

    // Función para verificar fortaleza de contraseña
    function checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const passwordContainer = document.querySelector('.form-group:has(#password)');

        // Reset classes
        passwordContainer.classList.remove('password-weak', 'password-medium', 'password-strong', 'password-very-strong');

        let strength = 0;
        let text = 'Muy débil';

        if (password.length >= 8) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength++;

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

    // Función para mostrar mensajes
    function showMessage(title, text) {
        document.getElementById('messageTitle').textContent = title;
        document.getElementById('messageText').textContent = text;
        messageModal.style.display = 'flex';
    }

    // Simular registro (esto será reemplazado con llamada a la API)
    function simulateRegistration(userType, firstName, lastName, email, phone, password, additionalField) {
        // Mostrar estado de carga
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creando cuenta...';
        submitBtn.disabled = true;

        // Simular retraso de red
        setTimeout(() => {
            // Simular respuesta exitosa
            const userTypeName = getUserTypeName(userType);
            showMessage('Éxito', `Cuenta de ${userTypeName} creada correctamente. Se ha enviado un token de verificación a ${email}. Por favor revisa tu bandeja de entrada para activar tu cuenta.`);

            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Aquí redirigiríamos al login después de un registro exitoso
            // setTimeout(() => { window.location.href = 'login.html'; }, 3000);
        }, 2000);
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
});
