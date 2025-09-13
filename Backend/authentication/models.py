from django.db import models
import uuid
from django.utils import timezone

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
    
    def __str__(self):
        return f"{self.email} ({self.role})"

class LoginToken(models.Model):
    user = models.ForeignKey(TemporaryUser, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Token for {self.user.email}"