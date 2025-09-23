from rest_framework import serializers
from .models import TemporaryUser, LoginToken, PasswordResetToken, FailedLoginAttempt
from .models import UserProfile, Announcement, UserNotification, PhoneVerification, TwoFactorCode
from django.core.exceptions import ValidationError
import bcrypt
import re

class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    captcha_response = serializers.CharField(write_only=True, required=True)
    captcha_key = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = TemporaryUser
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'password', 
            'password_confirm', 'role', 'role_code', 'captcha_response', 'captcha_key'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'validators': []}
        }
    
    def validate(self, data):
        # Validar que las contraseñas coincidan
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        
        # Validar fortaleza de contraseña usando el método del modelo
        password = data['password']
        temp_user = TemporaryUser()  # Instancia temporal para usar el método de validación
        
        if not temp_user.validate_password_strength(password):
            raise serializers.ValidationError(
                "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, "
                "una minúscula, un número y un carácter especial"
            )
        
        # Validar formato de teléfono
        phone = data.get('phone', '')
        if phone and not re.match(r'^\+?[\d\s\-\(\)]{10,}$', phone):
            raise serializers.ValidationError("Formato de teléfono inválido")
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        validated_data.pop('captcha_response', None)
        validated_data.pop('captcha_key', None)
        
        password = validated_data.pop('password')
        user = TemporaryUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PasswordStrengthSerializer(serializers.Serializer):
    """Serializer para validar fortaleza de contraseña en tiempo real"""
    password = serializers.CharField(required=True)
    
    def validate_password(self, value):
        temp_user = TemporaryUser()
        requirements = temp_user.get_password_requirements(value)
        
        # Devolver el estado de cada requisito
        return {
            'password': value,
            'requirements': requirements,
            'is_valid': requirements['all_met']
        }

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.CharField()
    role_code = serializers.CharField(required=False, allow_blank=True)
    captcha_response = serializers.CharField(required=True)
    captcha_key = serializers.CharField(required=True)

class LoginVerifySerializer(serializers.Serializer):
    """Serializer para verificación de código de login por WhatsApp"""
    user_id = serializers.UUIDField(required=True)
    verification_code = serializers.CharField(
        required=True, 
        min_length=6, 
        max_length=6,
        help_text="Código de 6 dígitos enviado por WhatsApp"
    )
    
    def validate_verification_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("El código debe contener solo números")
        return value

class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.UUIDField()

class VerifyLoginSerializer(serializers.Serializer):
    token = serializers.UUIDField()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    captcha_response = serializers.CharField(required=True)
    captcha_key = serializers.CharField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(min_length=6)
    confirm_password = serializers.CharField(min_length=6)
    identification_number = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        
        # Validar fortaleza de la nueva contraseña
        password = data['new_password']
        temp_user = TemporaryUser()
        
        if not temp_user.validate_password_strength(password):
            raise serializers.ValidationError(
                "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, "
                "una minúscula, un número y un carácter especial"
            )
        
        return data

class TwoFactorVerifySerializer(serializers.Serializer):
    """Serializer para verificación 2FA"""
    user_id = serializers.UUIDField(required=True)
    two_factor_code = serializers.CharField(
        required=True, 
        min_length=6, 
        max_length=6,
        help_text="Código 2FA de 6 dígitos enviado por SMS"
    )
    
    def validate_two_factor_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("El código 2FA debe contener solo números")
        return value

class PhoneUpdateSerializer(serializers.Serializer):
    """Serializer para actualizar teléfono"""
    phone = serializers.CharField(required=True, max_length=20)
    
    def validate_phone(self, value):
        if not re.match(r'^\+?[\d\s\-\(\)]{10,}$', value):
            raise serializers.ValidationError("Formato de teléfono inválido")
        return value

class TwoFactorToggleSerializer(serializers.Serializer):
    """Serializer para habilitar/deshabilitar 2FA"""
    enabled = serializers.BooleanField(required=True)

class CaptchaSerializer(serializers.Serializer):
    captcha_key = serializers.CharField(read_only=True)
    captcha_image = serializers.CharField(read_only=True)

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    phone_verified = serializers.BooleanField(source='user.phone_verified', read_only=True)
    two_factor_enabled = serializers.BooleanField(source='user.two_factor_enabled', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'phone', 
                 'phone_verified', 'two_factor_enabled', 'profile_picture', 
                 'address', 'date_of_birth', 'emergency_contact', 
                 'emergency_phone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    
    class Meta:
        model = UserProfile
        fields = ['first_name', 'last_name', 'phone', 'address', 
                 'date_of_birth', 'emergency_contact', 'emergency_phone']
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            user = instance.user
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden"})
        
        password = data['new_password']
        temp_user = TemporaryUser()
        
        if not temp_user.validate_password_strength(password):
            raise serializers.ValidationError({
                "new_password": "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial"
            })
        
        return data

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField(read_only=True)
    author_role = serializers.CharField(source='author.role', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'author', 'author_name', 'author_role',
                 'priority', 'is_published', 'publish_date', 'expiration_date',
                 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def get_author_name(self, obj):
        return obj.author.get_full_name()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = ['id', 'title', 'message', 'is_read', 'created_at', 'related_url']
        read_only_fields = ['created_at']

class DashboardStatsSerializer(serializers.Serializer):
    total_announcements = serializers.IntegerField(default=0)
    unread_notifications = serializers.IntegerField(default=0)
    pending_payments = serializers.IntegerField(default=0)
    active_reservations = serializers.IntegerField(default=0)
    recent_announcements = AnnouncementSerializer(many=True, read_only=True)
    recent_notifications = NotificationSerializer(many=True, read_only=True)

class UserBasicInfoSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TemporaryUser
        fields = ['id', 'email', 'full_name', 'role', 'phone', 'phone_verified', 'two_factor_enabled']
        read_only_fields = fields
    
    def get_full_name(self, obj):
        return obj.get_full_name()

class AnnouncementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['title', 'content', 'priority', 'expiration_date']
    
    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("El título debe tener al menos 5 caracteres")
        return value
    
    def validate_content(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("El contenido debe tener al menos 10 caracteres")
        return value

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = ['title', 'message', 'related_url']
    
    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("El título debe tener al menos 5 caracteres")
        return value

class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_picture']
    
    def validate_profile_picture(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("La imagen no puede ser mayor a 5MB")
        
        import os
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        if ext not in valid_extensions:
            raise serializers.ValidationError("Formato de imagen no válido. Use JPG, PNG o GIF")
        
        return value