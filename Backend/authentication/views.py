from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.shortcuts import render
from .models import TemporaryUser, LoginToken, PasswordResetToken, FailedLoginAttempt
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
from django.http import JsonResponse

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

def record_failed_attempt(request, email):
    """Registrar un intento fallido de login"""
    client_ip = None
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Obtener IP del cliente
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(',')[0]
    else:
        client_ip = request.META.get('REMOTE_ADDR')
    
    FailedLoginAttempt.objects.create(
        email=email,
        ip_address=client_ip,
        user_agent=user_agent
    )

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
        
        print(f"🔐 INTENTO DE LOGIN para: {email}, rol: {role}")
        
        try:
            user = TemporaryUser.objects.get(email=email, role=role, is_verified=True)
            
            # Verificar si la cuenta está bloqueada
            if user.is_locked():
                remaining_time = user.locked_until - timezone.now()
                minutes = int(remaining_time.total_seconds() / 60) + 1
                return Response({
                    'error': f'Cuenta bloqueada temporalmente. Por favor, espere {minutes} minutos.',
                    'locked': True,
                    'minutes_remaining': minutes,
                    'attempts': 3,
                    'max_attempts': 3,
                    'remaining_attempts': 0
                }, status=status.HTTP_423_LOCKED)
            
            # Verificar contraseña con el nuevo método bcrypt
            if not user.check_password(password):
                # Registrar intento fallido
                record_failed_attempt(request, email)
                attempts = user.increment_failed_attempt()
                remaining_attempts = 3 - attempts
                
                print(f"❌ CONTRASEÑA INCORRECTA. Intentos: {attempts}/3")
                
                response_data = {
                    'error': 'Credenciales inválidas',
                    'remaining_attempts': max(0, remaining_attempts),
                    'attempts': attempts,
                    'max_attempts': 3,
                    'locked': remaining_attempts <= 0
                }
                
                # Si se bloqueará después de este intento
                if remaining_attempts <= 0:
                    response_data['error'] = 'Demasiados intentos fallidos. Su cuenta ha sido bloqueada por 15 minutos.'
                
                return Response(response_data, status=status.HTTP_401_UNAUTHORIZED)
            
            # Verificar código de rol si es necesario
            if role != 'visitante' and user.role_code != role_code:
                record_failed_attempt(request, email)
                attempts = user.increment_failed_attempt()
                remaining_attempts = 3 - attempts
                
                print(f"❌ CÓDIGO DE ROL INCORRECTO. Intentos: {attempts}/3")
                
                response_data = {
                    'error': 'Código de acceso inválido',
                    'remaining_attempts': max(0, remaining_attempts),
                    'attempts': attempts,
                    'max_attempts': 3,
                    'locked': remaining_attempts <= 0
                }
                
                # Si se bloqueará después de este intento
                if remaining_attempts <= 0:
                    response_data['error'] = 'Demasiados intentos fallidos. Su cuenta ha sido bloqueada por 15 minutos.'
                
                return Response(response_data, status=status.HTTP_401_UNAUTHORIZED)
            
            # Resetear contador de intentos fallidos al login exitoso
            user.reset_lock()
            
            # Crear token de login
            login_token = LoginToken.objects.create(user=user)
            
            login_url = f"http://localhost:8000/api/verify-login/{login_token.token}/"
            
            print(f"✅ LOGIN EXITOSO para: {user.email}")
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
                'login_token': str(login_token.token),
                'success': True
            }, status=status.HTTP_200_OK)
            
        except TemporaryUser.DoesNotExist:
            record_failed_attempt(request, email)
            print(f"❌ USUARIO NO ENCONTRADO: {email}")
            return Response({
                'error': 'Usuario no encontrado o no verificado',
                'remaining_attempts': 3  # No revelamos info específica por seguridad
            }, status=status.HTTP_404_NOT_FOUND)
    
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
        
        # Verificar si el token expiró
        if login_token.is_expired():
            return Response({'error': 'Token de login expirado'}, status=status.HTTP_400_BAD_REQUEST)
        
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
                # Usar el nuevo método set_password con bcrypt
                user.set_password(new_password)
                user.save()
                
                reset_token.is_used = True
                reset_token.save()
                
                print(f"=== CONTRASEÑA ACTUALIZADA ===")
                print(f"Para: {user.email}")
                print(f"Hash BCrypt: {user.password}")
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
    
    # Obtener el hash bcrypt para mostrarlo en el email
    hash_info = user.password if hasattr(user, 'password') else "Hash no disponible"
    
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Verifica tu cuenta BuildingPRO</title><style>body{{font-family:Arial,sans-serif;line-height:1.6;color:#333;}}.container{{max-width:600px;margin:0 auto;padding:20px;}}.header{{background:linear-gradient(45deg,#00BFFF,#0099CC);color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;}}.content{{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px;}}.button{{background:#00BFFF;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;}}.token{{background:#eee;padding:10px;border-radius:5px;font-family:monospace;margin:10px 0;}}.hash-info{{background:#f0f8ff;padding:10px;border-radius:5px;border-left:4px solid #00BFFF;margin:15px 0;font-family:monospace;font-size:12px;word-break:break-all;}}.security-badge{{background:#e8f5e8;border:1px solid #4CAF50;padding:10px;border-radius:5px;margin:15px 0;}}</style></head><body><div class="container"><div class="header"><h1>BuildingPRO</h1><p>Sistema de Gestión de Edificios Inteligentes</p></div><div class="content"><h2>¡Bienvenido, {user.first_name}!</h2><p>Gracias por registrarte en BuildingPRO. Para completar tu registro, por favor verifica tu dirección de email.</p><p><a href="{verification_url}" class="button">Verificar Mi Cuenta</a></p><p>O copia y pega el siguiente token en la aplicación:</p><div class="token">{user.verification_token}</div><p>Si el botón no funciona, copia esta URL en tu navegador:</p><p><a href="{verification_url}">{verification_url}</a></p><div class="security-badge"><strong>🔒 Seguridad de Cuenta</strong><br>Tu contraseña ha sido protegida con encriptación BCrypt</div><div class="hash-info"><strong>Hash BCrypt de tu contraseña:</strong><br>{hash_info}</div><hr><p><strong>Detalles de tu registro:</strong></p><ul><li>Nombre: {user.first_name} {user.last_name}</li><li>Email: {user.email}</li><li>Teléfono: {user.phone}</li><li>Rol: {user.get_role_display()}</li><li>Fecha de registro: {user.created_at.strftime("%Y-%m-%d %H:%M")}</li></ul><p>Saludos,<br>El equipo de BuildingPRO</p></div></div></body></html>
    """
    
    text_content = f"""Verificación de cuenta BuildingPRO

Hola {user.first_name},

Gracias por registrarte en BuildingPRO. Para verificar tu cuenta:

URL: {verification_url}
Token: {user.verification_token}

🔒 INFORMACIÓN DE SEGURIDAD:
Tu contraseña ha sido protegida con encriptación BCrypt
Hash BCrypt: {hash_info}

Detalles de registro:
- Nombre: {user.first_name} {user.last_name}
- Email: {user.email} 
- Teléfono: {user.phone}
- Rol: {user.get_role_display()}
- Fecha: {user.created_at.strftime("%Y-%m-%d %H:%M")}

Saludos,
El equipo de BuildingPRO
"""
    
    email_msg = EmailMultiAlternatives(
        subject='Verifica tu cuenta BuildingPRO - Seguridad BCrypt',
        body=text_content,
        from_email='seguridad@buildingpro.com',
        to=[user.email],
        reply_to=['soporte@buildingpro.com']
    )
    email_msg.attach_alternative(html_content, "text/html")
    
    try:
        email_msg.send()
        print(f"✅ Email de verificación enviado a: {user.email}")
        print(f"🔐 Hash BCrypt incluido en el email: {hash_info}")
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
    # Obtener el nuevo hash bcrypt
    hash_info = user.password if hasattr(user, 'password') else "Hash no disponible"
    
    html_content = f"""
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Contraseña actualizada - BuildingPRO</title><style>body{{font-family:Arial,sans-serif;line-height:1.6;color:#333;}}.container{{max-width:600px;margin:0 auto;padding:20px;}}.header{{background:linear-gradient(45deg,#4ede7c,#2ecc71);color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;}}.content{{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px;}}.success{{background:#d4edda;border:1px solid #c3e6cb;padding:10px;border-radius:5px;color:#155724;}}.hash-info{{background:#f0f8ff;padding:10px;border-radius:5px;border-left:4px solid #00BFFF;margin:15px 0;font-family:monospace;font-size:12px;word-break:break-all;}}</style></head><body><div class="container"><div class="header"><h1>BuildingPRO</h1><p>Contraseña actualizada</p></div><div class="content"><h2>¡Hola, {user.first_name}!</h2><div class="success"><strong>✅ Éxito:</strong> Tu contraseña ha sido actualizada correctamente.</div><p>Tu cuenta ahora está protegida con tu nueva contraseña encriptada con BCrypt.</p><div class="hash-info"><strong>Nuevo Hash BCrypt:</strong><br>{hash_info}</div><hr><p><strong>Detalles de la operación:</strong></p><ul><li>Usuario: {user.email}</li><li>Nombre: {user.first_name} {user.last_name}</li><li>Rol: {user.get_role_display()}</li><li>Fecha: {timezone.now().strftime("%Y-%m-%d %H:%M")}</li><li>Método de encriptación: BCrypt</li></ul><p>Si no reconoces esta actividad, contacta a soporte inmediatamente.</p><p>Saludos,<br>El equipo de seguridad de BuildingPRO</p></div></div></body></html>
    """
    
    text_content = f"""Contraseña actualizada - BuildingPRO

Hola {user.first_name},

Tu contraseña ha sido actualizada correctamente.

✅ La operación se completó exitosamente.

🔒 INFORMACIÓN DE SEGURIDAD:
Tu nueva contraseña ha sido protegida con encriptación BCrypt
Nuevo Hash BCrypt: {hash_info}

Detalles:
- Usuario: {user.email}
- Nombre: {user.first_name} {user.last_name}
- Rol: {user.get_role_display()}
- Fecha: {timezone.now().strftime("%Y-%m-%d %H:%M")}
- Método de encriptación: BCrypt

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
        print(f"🔐 Nuevo Hash BCrypt incluido en el email: {hash_info}")
    except Exception as e:
        print(f"❌ Error enviando email de confirmación: {e}")
