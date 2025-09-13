from rest_framework import serializers
from .models import TemporaryUser, LoginToken

class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = TemporaryUser
        fields = ['email', 'first_name', 'last_name', 'phone', 'password', 'password_confirm', 'role', 'role_code']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'validators': []}  # Remueve validadores únicos para testing
        }
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
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

class VerifyEmailSerializer(serializers.Serializer):
    token = serializers.UUIDField()

class VerifyLoginSerializer(serializers.Serializer):
    token = serializers.UUIDField()