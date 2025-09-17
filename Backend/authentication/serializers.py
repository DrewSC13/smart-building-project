from rest_framework import serializers
from .models import TemporaryUser, LoginToken, PasswordResetToken
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password

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
        
        # Remover campos que no son del modelo
        data.pop('password_confirm', None)
        data.pop('captcha_response', None)
        data.pop('captcha_key', None)
        
        return data
    
    def create(self, validated_data):
        # Hashear la contraseña antes de guardar
        validated_data['password'] = make_password(validated_data['password'])
        
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
        data.pop('captcha_response', None)
        data.pop('captcha_key', None)
        return data

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
        return data

class CaptchaSerializer(serializers.Serializer):
    captcha_key = serializers.CharField(read_only=True)
    captcha_image = serializers.CharField(read_only=True)
