from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.shortcuts import render
from .models import TemporaryUser, LoginToken, PasswordResetToken
from .serializers import (
    RegisterSerializer, LoginSerializer, VerifyEmailSerializer, 
    VerifyLoginSerializer, PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer
)
from captcha.models import CaptchaStore
from django.urls import reverse
import uuid
from django.utils import timezone
from django.contrib.auth.hashers import check_password

@api_view(['GET'])
@permission_classes([AllowAny])
def get_captcha(request):
    new_key = CaptchaStore.generate_key()
    image_url = f"/captcha/image/{new_key}/"
    
    return Response({
        'captcha_key': new_key,
        'captcha_image': request.build_absolute_uri(image_url)
    }, status=status.HTTP_200_OK)

def verify_captcha(captcha_response, captcha_key):
    try:
        captcha = CaptchaStore.objects.get(hashkey=captcha_key)
        if captcha.response == captcha_response.lower():
            captcha.delete()
            return True
        return False
    except CaptchaStore.DoesNotExist:
        return False

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        captcha_response = request.data.get('captcha_response', '')
        captcha_key = request.data.get('captcha_key', '')
        
        if not captcha_response or not captcha_key:
            return Response({'error': 'CAPTCHA requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not verify_captcha(captcha_response, captcha_key):
            return Response({'error': 'CAPTCHA inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        email = request.data.get('email')
        if email and TemporaryUser.objects.filter(email=email).exists():
            TemporaryUser.objects.filter(email=email).delete()
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            verification_url = f"http://localhost:8000/api/verify-email/{user.verification_token}/"
            
            print(f"=== EMAIL DE VERIFICACIÓN ===")
            print(f"Para: {user.email}")
            print(f"Token: {user.verification_token}")
            print(f"URL: {verification_url}")
            print(f"============================")
            
            try:
                send_verification_email(user)
            except Exception as e:
                print(f"Error enviando email real: {e}")
            
            return Response({
                'message': 'Usuario registrado. Se ha enviado un token de verificación a tu correo.',
                'verification_token': str(user.verification_token)
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"Error en registro: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    captcha_response = request.data.get('captcha_response', '')
    captcha_key = request.data.get('captcha_key', '')
    
    if not captcha_response or not captcha_key:
        return Response({'error': 'CAPTCHA requerido'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not verify_captcha(captcha_response, captcha_key):
        return Response({'error': 'CAPTCHA inválido'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        role = serializer.validated_data['role']
        role_code = serializer.validated_data.get('role_code', '')
        
        try:
            user = TemporaryUser.objects.get(email=email, role=role, is_verified=True)
            
            # Verificar contraseña con hash
            if not check_password(password, user.password):
                return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Verificar código de rol si es necesario
            if role != 'visitante' and user.role_code != role_code:
                return Response({'error': 'Código de acceso inválido'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Crear token de login
            login_token = LoginToken.objects.create(user=user)
            
            login_url = f"http://localhost:8000/api/verify-login/{login_token.token}/"
            
            print(f"=== EMAIL DE LOGIN ===")
            print(f"Para: {user.email}")
            print(f"Token: {login_token.token}")
            print(f"URL: {login_url}")
            print(f"======================")
            
            try:
                send_login_token_email(user, login_token)
            except Exception as e:
                print(f"Error enviando email real: {e}")
            
            return Response({
                'message': 'Se ha enviado un token de inicio de sesión a tu correo.',
                'login_token': str(login_token.token)
            }, status=status.HTTP_200_OK)
            
        except TemporaryUser.DoesNotExist:
            return Response({'error': 'Usuario no encontrado o no verificado'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    try:
        user = TemporaryUser.objects.get(verification_token=token, is_verified=False)
        user.is_verified = True
        user.save()
        
        return Response({'message': 'Email verificado correctamente. Ya puedes iniciar sesión.'}, status=status.HTTP_200_OK)
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Token de verificación inválido o ya utilizado'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_login(request, token):
    try:
        login_token = LoginToken.objects.get(token=token, is_used=False)
        
        login_token.is_used = True
        login_token.save()
        
        return Response({
            'message': 'Login verificado correctamente.',
            'user': {
                'email': login_token.user.email,
                'first_name': login_token.user.first_name,
                'last_name': login_token.user.last_name,
                'role': login_token.user.role
            }
        }, status=status.HTTP_200_OK)
    
    except LoginToken.DoesNotExist:
        return Response({'error': 'Token de login inválido o ya utilizado'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    try:
        captcha_response = request.data.get('captcha_response', '')
        captcha_key = request.data.get('captcha_key', '')
        
        if not captcha_response or not captcha_key:
            return Response({'error': 'CAPTCHA requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not verify_captcha(captcha_response, captcha_key):
            return Response({'error': 'CAPTCHA inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = TemporaryUser.objects.get(email=email, is_verified=True)
                
                reset_token = PasswordResetToken.objects.create(user=user)
                
                reset_url = f"http://localhost:8000/reset-password/?token={reset_token.token}"
                
                print(f"=== EMAIL DE RECUPERACIÓN ===")
                print(f"Para: {user.email}")
                print(f"Token: {reset_token.token}")
                print(f"URL: {reset_url}")
                print(f"============================")
                
                try:
                    send_password_reset_email(user, reset_token)
                except Exception as e:
                    print(f"Error enviando email real: {e}")
                
                return Response({
                    'message': 'Se ha enviado un token de recuperación a tu correo.',
                    'reset_token': str(reset_token.token)
                }, status=status.HTTP_200_OK)
                
            except TemporaryUser.DoesNotExist:
                return Response({'error': 'No se encontró una cuenta verificada con este email'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"Error en recuperación de contraseña: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    try:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            identification_number = serializer.validated_data['identification_number']
            
            try:
                reset_token = PasswordResetToken.objects.get(
                    token=token, 
                    is_used=False,
                    user__role_code=identification_number
                )
                
                if reset_token.is_expired():
                    return Response({'error': 'El token ha expirado'}, status=status.HTTP_400_BAD_REQUEST)
                
                user = reset_token.user
                # Hashear la nueva contraseña antes de guardar
                from django.contrib.auth.hashers import make_password
                user.password = make_password(new_password)
                user.save()
                
                reset_token.is_used = True
                reset_token.save()
                
                print(f"=== CONTRASEÑA ACTUALIZADA ===")
                print(f"Para: {user.email}")
                print(f"==============================")
                
                try:
                    send_password_changed_email(user)
                except Exception as e:
                    print(f"Error enviando email real: {e}")
                
                return Response({
                    'message': 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.'
                }, status=status.HTTP_200_OK)
                
            except PasswordResetToken.DoesNotExist:
                return Response({'error': 'Token inválido o número de identificación incorrecto'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"Error en confirmación de recuperación: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def custom_dashboard_view(request):
    email = request.GET.get('email', 'usuario@ejemplo.com')
    role = request.GET.get('role', 'Usuario')
    
    context = {
        'user_email': email,
        'user_role': role,
    }
    return render(request, 'dashboard.html', context)

@api_view(['GET'])
def dashboard_api(request):
    return Response({'message': '¡BIENVENIDO AL SISTEMA BUILDINGPRO!'}, status=status.HTTP_200_OK)

def send_verification_email(user):
    verification_url = f"http://localhost:8000/api/verify-email/{user.verification_token}/"
    
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Verifica tu cuenta BuildingPRO</title><style>body{{font-family:Arial,sans-serif;line-height:1.6;color:#333;}}.container{{max-width:600px;margin:0 auto;padding:20px;}}.header{{background:linear-gradient(45deg,#00BFFF,#0099CC);color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;}}.content{{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px;}}.button{{background:#00BFFF;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;}}.token{{background:#eee;padding:10px;border-radius:5px;font-family:monospace;}}</style></head><body><div class="container"><div class="header"><h1>BuildingPRO</h1><p>Sistema de Gestión de Edificios Inteligentes</p></div><div class="content"><h2>¡Bienvenido, {user.first_name}!</h2><p>Gracias por registrarte en BuildingPRO. Para completar tu registro, por favor verifica tu dirección de email.</p><p><a href="{verification_url}" class="button">Verificar Mi Cuenta</a></p><p>O copia y pega el siguiente token en la aplicación:</p><div class="token">{user.verification_token}</div><p>Si el botón no funciona, copia esta URL en tu navegador:</p><p><a href="{verification_url}">{verification_url}</a></p><hr><p><strong>Detalles de tu registro:</strong></p><ul><li>Nombre: {user.first_name} {user.last_name}</li><li>Email: {user.email}</li><li>Teléfono: {user.phone}</li><li>Rol: {user.get_role_display()}</li></ul><p>Saludos,<br>El equipo de BuildingPRO</p></div></div></body></html>
    """
    
    text_content = f"""Verificación de cuenta BuildingPRO

Hola {user.first_name},

Gracias por registrarte in BuildingPRO. Para verificar tu cuenta:

URL: {verification_url}
Token: {user.verification_token}

Detalles de registro:
- Nombre: {user.first_name} {user.last_name}
- Email: {user.email} 
- Teléfono: {user.phone}
- Rol: {user.get_role_display()}

Saludos,
El equipo de BuildingPRO
"""
    
    email_msg = EmailMultiAlternatives(
        subject='Verifica tu cuenta BuildingPRO',
        body=text_content,
        from_email='noreply@buildingpro.com',
        to=[user.email],
        reply_to=['soporte@buildingpro.com']
    )
    email_msg.attach_alternative(html_content, "text/html")
    
    try:
        email_msg.send()
        print(f"✅ Email de verificación enviado a: {user.email}")
    except Exception as e:
        print(f"❌ Error enviando email a {user.email}: {e}")

def send_login_token_email(user, login_token):
    login_url = f"http://localhost:8000/api/verify-login/{login_token.token}/"
    
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Token de acceso BuildingPRO</title><style>body{{font-family:Arial,sans-serif;line-height:1.6;color:#333;}}.container{{max-width:600px;margin:0 auto;padding:20px;}}.header{{background:linear-gradient(45deg,#00BFFF,#0099CC);color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;}}.content{{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px;}}.button{{background:#00BFFF;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;}}.token{{background:#eee;padding:10px;border-radius:5px;font-family:monospace;}}.warning{{background:#fff3cd;border:1px solid #ffeaa7;padding:10px;border-radius:5px;color:#856404;}}</style></head><body><div class="container"><div class="header"><h1>BuildingPRO</h1><p>Token de acceso seguro</p></div><div class="content"><h2>Hola, {user.first_name}!</h2><p>Se ha solicitado un inicio de sesión en tu cuenta BuildingPRO.</p><div class="warning"><strong>⚠ Importante:</strong> No compartas este token con nadie.</div><p>Tu token de acceso único es:</p><div class="token">{login_token.token}</div><p>O haz clic en el botón para iniciar sesión automáticamente:</p><p><a href="{login_url}" class="button">Iniciar Sesión</a></p><p>Si el botón no funciona, copia esta URL en tu navegador:</p><p><a href="{login_url}">{login_url}</a></p><hr><p><strong>Detalles del acceso:</strong></p><ul><li>Usuario: {user.email}</li><li>Nombre: {user.first_name} {user.last_name}</li><li>Rol: {user.get_role_display()}</li><li>Token válido por: 15 minutos</li></ul><p>Si no solicitaste este acceso, por favor contacta a soporte inmediatamente.</p><p>Saludos,<br>El equipo de seguridad de BuildingPRO</p></div></div></body></html>
    """
    
    text_content = f"""Token de acceso BuildingPRO

Hola {user.first_name},

Se ha solicitado un inicio de sesión en tu cuenta.

TOKEN DE ACCESO: {login_token.token}
URL: {login_url}

⚠ IMPORTANTE: No compartas este token con nadie.

Detalles:
- Usuario: {user.email}
- Nombre: {user.first_name} {user.last_name} 
- Rol: {user.get_role_display()}
- Token válido por: 15 minutos

Si no solicitaste este acceso, contacta a soporte inmediatamente.

Saludos,
El equipo de seguridad de BuildingPRO
"""
    
    email_msg = EmailMultiAlternatives(
        subject='Token de acceso BuildingPRO',
        body=text_content,
        from_email='seguridad@buildingpro.com',
        to=[user.email],
        reply_to=['soporte@buildingpro.com']
    )
    email_msg.attach_alternative(html_content, "text/html")
    
    try:
        email_msg.send()
        print(f"✅ Email de login enviado a: {user.email}")
    except Exception as e:
        print(f"❌ Error enviando email de login a {user.email}: {e}")

def send_password_reset_email(user, reset_token):
    reset_url = f"http://localhost:8000/reset-password/?token={reset_token.token}"
    
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Recuperación de contraseña BuildingPRO</title><style>body{{font-family:Arial,sans-serif;line-height:1.6;color:#333;}}.container{{max-width:600px;margin:0 auto;padding:20px;}}.header{{background:linear-gradient(45deg,#00BFFF,#0099CC);color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;}}.content{{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px;}}.button{{background:#00BFFF;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;}}.token{{background:#eee;padding:10px;border-radius:5px;font-family:monospace;}}.warning{{background:#fff3cd;border:1px solid #ffeaa7;padding:10px;border-radius:5px;color:#856404;}}</style></head><body><div class="container"><div class="header"><h1>BuildingPRO</h1><p>Recuperación de contraseña</p></div><div class="content"><h2>Hola, {user.first_name}!</h2><p>Se ha solicitado la recuperación de tu contraseña en BuildingPRO.</p><div class="warning"><strong>⚠ Importante:</strong> Este token expira en 1 hora.</div><p>Tu token de recuperación es:</p><div class="token">{reset_token.token}</div><p><a href="{reset_url}" class="button">Restablecer Contraseña</a></p><p>Si el botón no funciona, copia esta URL: {reset_url}</p><hr><p><strong>Para completar la recuperación necesitarás:</strong></p><ul><li>Este token de recuperación</li><li>Tu número de identificación: <strong>{user.role_code}</strong></li><li>Tu nueva contraseña</li></ul><p>Si no solicitaste este cambio, contacta a soporte inmediatamente.</p><p>Saludos,<br>El equipo de seguridad de BuildingPRO</p></div></div></body></html>
    """
    
    text_content = f"""Recuperación de contraseña BuildingPRO

Hola {user.first_name},

Se ha solicitado la recuperación de tu contraseña.

TOKEN: {reset_token.token}
URL: {reset_url}

⚠ Este token expira en 1 hora.

Para completar la recuperación necesitas:
- Este token de recuperación
- Tu número de identificación: {user.role_code}
- Tu nueva contraseña

Si no solicitaste este cambio, contacta a soporte inmediatamente.

Saludos,
El equipo de seguridad de BuildingPRO
"""
    
    email_msg = EmailMultiAlternatives(
        subject='Recuperación de contraseña BuildingPRO',
        body=text_content,
        from_email='seguridad@buildingpro.com',
        to=[user.email],
        reply_to=['soporte@buildingpro.com']
    )
    email_msg.attach_alternative(html_content, "text/html")
    
    try:
        email_msg.send()
        print(f"✅ Email de recuperación enviado a: {user.email}")
    except Exception as e:
        print(f"❌ Error enviando email de recuperación: {e}")

def send_password_changed_email(user):
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Contraseña actualizada - BuildingPRO</title><style>body{{font-family:Arial,sans-serif;line-height:1.6;color:#333;}}.container{{max-width:600px;margin:0 auto;padding:20px;}}.header{{background:linear-gradient(45deg,#4ede7c,#2ecc71);color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;}}.content{{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px;}}.success{{background:#d4edda;border:1px solid #c3e6cb;padding:10px;border-radius:5px;color:#155724;}}</style></head><body><div class="container"><div class="header"><h1>BuildingPRO</h1><p>Contraseña actualizada</p></div><div class="content"><h2>¡Hola, {user.first_name}!</h2><div class="success"><strong>✅ Éxito:</strong> Tu contraseña ha sido actualizada correctamente.</div><p>Tu cuenta ahora está protegida con tu nueva contraseña.</p><hr><p><strong>Detalles de la operación:</strong></p><ul><li>Usuario: {user.email}</li><li>Nombre: {user.first_name} {user.last_name}</li><li>Rol: {user.get_role_display()}</li><li>Fecha: {timezone.now().strftime("%Y-%m-%d %H:%M")}</li></ul><p>Si no reconoces esta actividad, contacta a soporte inmediatamente.</p><p>Saludos,<br>El equipo de seguridad de BuildingPRO</p></div></div></body></html>
    """
    
    text_content = f"""Contraseña actualizada - BuildingPRO

Hola {user.first_name},

Tu contraseña ha sido actualizada correctamente.

✅ La operación se completó exitosamente.

Detalles:
- Usuario: {user.email}
- Nombre: {user.first_name} {user.last_name}
- Rol: {user.get_role_display()}
- Fecha: {timezone.now().strftime("%Y-%m-%d %H:%M")}

Si no reconoces esta actividad, contacta a soporte inmediatamente.

Saludos,
El equipo de seguridad de BuildingPRO
"""
    
    email_msg = EmailMultiAlternatives(
        subject='Contraseña actualizada exitosamente - BuildingPRO',
        body=text_content,
        from_email='seguridad@buildingpro.com',
        to=[user.email],
        reply_to=['soporte@buildingpro.com']
    )
    email_msg.attach_alternative(html_content, "text/html")
    
    try:
        email_msg.send()
        print(f"✅ Email de confirmación enviado a: {user.email}")
    except Exception as e:
        print(f"❌ Error enviando email de confirmación: {e}")
