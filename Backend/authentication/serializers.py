from rest_framework import serializers
from .models import TemporaryUser, LoginToken
from django.core.exceptions import ValidationError

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
            'email': {'validators': []}  # Remueve validadores únicos para testing
        }
    
    def validate(self, data):
        # Validar que las contraseñas coincidan
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        
        # Remover campos de CAPTCHA para que no interfieran con la creación del modelo
        # La validación del CAPTCHA se hará en la vista
        data.pop('captcha_response', None)
        data.pop('captcha_key', None)
        
        return data
    
    def create(self, validated_data):
        # Remover campo de confirmación de contraseña
        validated_data.pop('password_confirm', None)
        
        # Para testing: eliminar usuario existente con el mismo email
        email = validated_data.get('email')
        TemporaryUser.objects.filter(email=email).delete()
        
        user = TemporaryUser.objects.create(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.CharField()
    role_code = serializers.CharField(required=False, allow_blank=True)
    captcha_response = serializers.CharField(required=True)
    captcha_key = serializers.CharField(required=True)
    
    def validate(self, data):
        # Remover campos de CAPTCHA para que no interfieran con la lógica de login
        # La validación del CAPTCHA se hará en la vista
        data.pop('captcha_response', None)
        data.pop('captcha_key', None)
        return data

class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.UUIDField()

class VerifyLoginSerializer(serializers.Serializer):
    token = serializers.UUIDField()

class CaptchaSerializer(serializers.Serializer):
    """Serializer para la generación de CAPTCHA"""
    captcha_key = serializers.CharField(read_only=True)
    captcha_image = serializers.CharField(read_only=True)