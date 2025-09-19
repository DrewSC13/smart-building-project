from django.db import models
import uuid
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
import bcrypt

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
    created_at = models.DateTimeField(default=timezone.now)
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    def set_password(self, raw_password):
        # Usar bcrypt para hashing más seguro - DEBUG: Mostrar hash
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        print(f"🔐 CREANDO HASH BCrypt para {self.email}: {hashed.decode('utf-8')}")
        self.password = hashed.decode('utf-8')
    
    def check_password(self, raw_password):
        # Verificar contraseña con bcrypt - DEBUG: Mostrar verificación
        try:
            result = bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))
            print(f"🔍 VERIFICANDO contraseña para {self.email}: {result}")
            return result
        except (ValueError, TypeError) as e:
            print(f"❌ ERROR verificando contraseña: {e}")
            return False
    
    def is_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            remaining = self.locked_until - timezone.now()
            minutes = int(remaining.total_seconds() / 60) + 1
            print(f"🔒 USUARIO BLOQUEADO: {self.email} por {minutes} minutos más")
            return True
        elif self.locked_until:
            # Si el bloqueo ya expiró, resetear
            self.reset_lock()
        return False
    
    def reset_lock(self):
        print(f"🔓 RESETEANDO bloqueo para: {self.email}")
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save()
    
    def increment_failed_attempt(self):
        self.failed_login_attempts += 1
        print(f"⚠️  INTENTO FALLIDO #{self.failed_login_attempts} para: {self.email}")
        
        # Bloquear después de 3 intentos fallidos (cambié de 5 a 3 como pediste)
        if self.failed_login_attempts >= 3:
            lock_time = timezone.now() + timezone.timedelta(minutes=15)
            self.locked_until = lock_time
            print(f"🚫 BLOQUEANDO usuario {self.email} hasta {lock_time}")
        
        self.save()
        return self.failed_login_attempts

class LoginToken(models.Model):
    user = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)  # CORRECCIÓN: BooleanField en lugar de BooleanferField
    
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
        return (timezone.now() - self.created_at).total_seconds() > 3600  # 1 hora de expiración
