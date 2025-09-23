from django.db import models
import uuid
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
import bcrypt
import re

class FailedLoginAttempt(models.Model):
    email = models.EmailField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)
    
    class Meta:
        indexes = [
            models.Index(fields=['email', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
    
    def __str__(self):
        return f"Failed login attempt for {self.email} at {self.timestamp}"

class TemporaryUser(models.Model):
    ROLE_CHOICES = [
        ('administrador', 'Administrador'),
        ('residente', 'Residente'),
        ('guardia', 'Guardia de Seguridad'),
        ('tecnico', 'Personal de Mantenimiento'),
        ('visitante', 'Visitante'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    role_code = models.CharField(max_length=100)
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False)
    is_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    two_factor_enabled = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def set_password(self, raw_password):
        # Validar fortaleza de contraseña antes de hashear
        if not self.validate_password_strength(raw_password):
            raise ValueError("La contraseña no cumple con los requisitos de seguridad")
        
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        print(f"🔐 CREANDO HASH BCrypt para {self.email}: {hashed.decode('utf-8')}")
        self.password = hashed.decode('utf-8')
    
    def check_password(self, raw_password):
        try:
            result = bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))
            print(f"🔍 VERIFICANDO contraseña para {self.email}: {result}")
            return result
        except (ValueError, TypeError) as e:
            print(f"❌ ERROR verificando contraseña: {e}")
            return False
    
    def validate_password_strength(self, password):
        """Validar fortaleza de contraseña"""
        if len(password) < 8:
            return False
        if not re.search(r"[A-Z]", password):  # Al menos una mayúscula
            return False
        if not re.search(r"[a-z]", password):  # Al menos una minúscula
            return False
        if not re.search(r"\d", password):     # Al menos un número
            return False
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):  # Al menos un carácter especial
            return False
        return True
    
    def get_password_requirements(self, password):
        """Obtener estado de cada requisito de contraseña"""
        return {
            'length': len(password) >= 8,
            'uppercase': bool(re.search(r"[A-Z]", password)),
            'lowercase': bool(re.search(r"[a-z]", password)),
            'number': bool(re.search(r"\d", password)),
            'special': bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)),
            'all_met': self.validate_password_strength(password)
        }
    
    def is_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            remaining = self.locked_until - timezone.now()
            minutes = int(remaining.total_seconds() / 60) + 1
            print(f"🔒 USUARIO BLOQUEADO: {self.email} por {minutes} minutos más")
            return True
        elif self.locked_until:
            self.reset_lock()
        return False
    
    def reset_lock(self):
        print(f"🔓 RESETEANDO bloqueo para: {self.email}")
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()
    
    def increment_failed_attempt(self):
        self.failed_login_attempts += 1
        print(f"⚠  INTENTO FALLIDO #{self.failed_login_attempts} para: {self.email}")
        
        if self.failed_login_attempts >= 3:
            lock_time = timezone.now() + timezone.timedelta(minutes=15)
            self.locked_until = lock_time
            print(f"🚫 BLOQUEANDO usuario {self.email} hasta {lock_time}")
        
        self.save()
        return self.failed_login_attempts

class PhoneVerification(models.Model):
    """Modelo para verificación de teléfono (ahora se usa en login)"""
    user = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20)
    verification_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)
    is_verified = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Verificación para {self.user.email} - {self.phone}"
    
    def is_expired(self):
        return (timezone.now() - self.created_at).total_seconds() > 300  # 5 minutos

class TwoFactorCode(models.Model):
    """Modelo para códigos 2FA (ahora se usa en login)"""
    user = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"2FA para {self.user.email}"
    
    def is_expired(self):
        return (timezone.now() - self.created_at).total_seconds() > 300  # 5 minutos

class LoginToken(models.Model):
    user = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Token for {self.user.email}"
    
    def is_expired(self):
        return (timezone.now() - self.created_at).total_seconds() > 900  # 15 minutos

class PasswordResetToken(models.Model):
    user = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Password reset token for {self.user.email}"
    
    def is_expired(self):
        return (timezone.now() - self.created_at).total_seconds() > 3600  # 1 hora

class UserProfile(models.Model):
    user = models.OneToOneField(TemporaryUser, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    emergency_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Perfil de {self.user.email}"

class Announcement(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_published = models.BooleanField(default=True)
    publish_date = models.DateTimeField(default=timezone.now)
    expiration_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-publish_date']
    
    def __str__(self):
        return f"{self.title} - {self.author.email}"

class UserNotification(models.Model):
    user = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    related_url = models.URLField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notificación para {self.user.email}: {self.title}"