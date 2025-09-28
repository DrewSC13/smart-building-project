from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.shortcuts import render
from .models import (
    TemporaryUser, LoginToken, PasswordResetToken, FailedLoginAttempt,
    PhoneVerification, TwoFactorCode, UserProfile, Announcement, UserNotification
)
from .serializers import (
    RegisterSerializer, LoginSerializer, VerifyEmailSerializer, 
    VerifyLoginSerializer, PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer, LoginVerifySerializer,
    TwoFactorVerifySerializer, UserProfileSerializer, ProfileUpdateSerializer,
    PasswordChangeSerializer, AnnouncementSerializer, NotificationSerializer,
    PasswordStrengthSerializer
)
from .whatsapp_service import whatsapp_service
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

@api_view(['POST'])
@permission_classes([AllowAny])
def check_password_strength(request):
    """Endpoint para validar fortaleza de contraseña en tiempo real"""
    serializer = PasswordStrengthSerializer(data=request.data)
    if serializer.is_valid():
        password = serializer.validated_data['password']
        temp_user = TemporaryUser()
        requirements = temp_user.get_password_requirements(password)
        
        return Response({
            'password': password,
            'requirements': requirements,
            'is_valid': requirements['all_met']
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    client_ip = None
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
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
            
            # NO enviar WhatsApp al registrarse, solo enviar email de verificación
            verification_url = f"http://localhost:8000/api/verify-email/{user.verification_token}/"
            
            print(f"=== REGISTRO EXITOSO ===")
            print(f"Usuario: {user.email}")
            print(f"Teléfono: {user.phone}")
            print(f"Token de verificación: {user.verification_token}")
            print(f"Hash BCrypt: {user.password}")
            print(f"============================")
            
            try:
                email_sent = send_verification_email(user)
            except Exception as e:
                print(f"Error enviando email: {e}")
                email_sent = False
            
            response_data = {
                'message': 'Usuario registrado exitosamente. ' + 
                          ('Se ha enviado un token de verificación a tu correo.' if email_sent else 
                           'Revisa la consola del servidor para obtener el token.'),
                'verification_token': str(user.verification_token),
                'phone_verification_required': False,
                'phone': user.phone if user.phone else None,
                'user_id': str(user.id),
                'hash_info': user.password  # Incluir el hash en la respuesta
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
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
            
            if user.is_locked():
                remaining_time = user.locked_until - timezone.now()
                minutes = int(remaining_time.total_seconds() / 60) + 1
                return Response({
                    'error': f'Cuenta bloqueada. Espere {minutes} minutos.',
                    'locked': True,
                    'minutes_remaining': minutes,
                    'attempts': 3,
                    'max_attempts': 3,
                    'remaining_attempts': 0
                }, status=status.HTTP_423_LOCKED)
            
            if not user.check_password(password):
                record_failed_attempt(request, email)
                attempts = user.increment_failed_attempt()
                remaining_attempts = 3 - attempts
                
                response_data = {
                    'error': 'Credenciales inválidas',
                    'remaining_attempts': max(0, remaining_attempts),
                    'attempts': attempts,
                    'max_attempts': 3,
                    'locked': remaining_attempts <= 0
                }
                
                if remaining_attempts <= 0:
                    response_data['error'] = 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.'
                
                return Response(response_data, status=status.HTTP_401_UNAUTHORIZED)
            
            if role != 'visitante' and user.role_code != role_code:
                record_failed_attempt(request, email)
                attempts = user.increment_failed_attempt()
                remaining_attempts = 3 - attempts
                
                response_data = {
                    'error': 'Código de acceso inválido',
                    'remaining_attempts': max(0, remaining_attempts),
                    'attempts': attempts,
                    'max_attempts': 3,
                    'locked': remaining_attempts <= 0
                }
                
                if remaining_attempts <= 0:
                    response_data['error'] = 'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.'
                
                return Response(response_data, status=status.HTTP_401_UNAUTHORIZED)
            
            user.reset_lock()
            
            # AHORA enviar código por WhatsApp al iniciar sesión
            if user.phone:
                # Enviar código de verificación por WhatsApp
                whatsapp_result = whatsapp_service.send_login_code(user.phone, user.first_name)
                
                if whatsapp_result['success']:
                    # Crear registro de verificación de login
                    PhoneVerification.objects.create(
                        user=user,
                        phone=user.phone,
                        verification_code=whatsapp_result['code']
                    )
                    
                    return Response({
                        'message': 'Código de verificación enviado a tu WhatsApp.',
                        'login_verification_required': True,
                        'user_id': str(user.id),
                        'phone': user.phone[-4:],
                        'channel': 'whatsapp',
                        'simulated': whatsapp_result.get('simulated', False)
                    }, status=status.HTTP_200_OK)
                else:
                    print(f"⚠  Error enviando código por WhatsApp: {whatsapp_result.get('error')}")
                    # Continuar sin verificación por WhatsApp
                    return Response({
                        'error': 'No se pudo enviar el código de verificación. Intenta más tarde.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Usuario sin teléfono, continuar sin verificación WhatsApp
                login_token = LoginToken.objects.create(user=user)
                return Response({
                    'message': 'Login exitoso.',
                    'login_token': str(login_token.token),
                    'success': True,
                    'login_verification_required': False
                }, status=status.HTTP_200_OK)
            
        except TemporaryUser.DoesNotExist:
            record_failed_attempt(request, email)
            return Response({
                'error': 'Usuario no encontrado o no verificado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_login_code(request):
    """Verificar código de login enviado por WhatsApp"""
    try:
        serializer = LoginVerifySerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            verification_code = serializer.validated_data['verification_code']
            
            try:
                user = TemporaryUser.objects.get(id=user_id, is_verified=True)
                
                verification = PhoneVerification.objects.filter(
                    user=user,
                    verification_code=verification_code,
                    is_verified=False
                ).order_by('-created_at').first()
                
                if not verification:
                    return Response({'error': 'Código inválido'}, status=status.HTTP_400_BAD_REQUEST)
                
                if verification.is_expired():
                    return Response({'error': 'Código expirado'}, status=status.HTTP_400_BAD_REQUEST)
                
                verification.is_verified = True
                verification.save()
                
                # Crear token de login exitoso
                login_token = LoginToken.objects.create(user=user)
                
                return Response({
                    'message': 'Código verificado correctamente. Login exitoso.',
                    'login_token': str(login_token.token),
                    'success': True,
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role
                    }
                }, status=status.HTTP_200_OK)
                
            except TemporaryUser.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_login_code(request):
    """Reenviar código de login por WhatsApp"""
    try:
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'ID de usuario requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = TemporaryUser.objects.get(id=user_id, is_verified=True)
            
            if not user.phone:
                return Response({'error': 'No hay teléfono registrado'}, status=status.HTTP_400_BAD_REQUEST)
            
            whatsapp_result = whatsapp_service.send_login_code(user.phone, user.first_name)
            
            if whatsapp_result['success']:
                PhoneVerification.objects.create(
                    user=user,
                    phone=user.phone,
                    verification_code=whatsapp_result['code']
                )
                
                return Response({
                    'message': 'Se ha enviado un nuevo código de verificación a tu WhatsApp.',
                    'phone': user.phone[-4:],
                    'channel': 'whatsapp'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'No se pudo enviar el código de verificación. Intenta más tarde.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except TemporaryUser.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, token):
    try:
        user = TemporaryUser.objects.get(verification_token=token, is_verified=False)
        user.is_verified = True
        user.save()
        
        return Response({'message': 'Email verificado correctamente.'}, status=status.HTTP_200_OK)
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Token inválido o ya utilizado'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_login(request, token):
    try:
        login_token = LoginToken.objects.get(token=token, is_used=False)
        
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
        return Response({'error': 'Token inválido o ya utilizado'}, status=status.HTTP_400_BAD_REQUEST)

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
            confirm_password = serializer.validated_data['confirm_password']
            identification_number = serializer.validated_data['identification_number']
            
            if new_password != confirm_password:
                return Response({'error': 'Las contraseñas no coinciden'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                reset_token = PasswordResetToken.objects.get(
                    token=token, 
                    is_used=False
                )
                
                if reset_token.user.role_code != identification_number:
                    return Response({'error': 'Número de identificación incorrecto'}, status=status.HTTP_400_BAD_REQUEST)
                
                if reset_token.is_expired():
                    return Response({'error': 'El token ha expirado'}, status=status.HTTP_400_BAD_REQUEST)
                
                user = reset_token.user
                user.set_password(new_password)
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
                return Response({'error': 'Token inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(f"Error en confirmación de recuperación: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa(request):
    try:
        serializer = TwoFactorVerifySerializer(data=request.data)
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            two_factor_code = serializer.validated_data['two_factor_code']
            
            try:
                user = TemporaryUser.objects.get(id=user_id, is_verified=True)
                
                code_obj = TwoFactorCode.objects.filter(
                    user=user,
                    code=two_factor_code,
                    is_used=False
                ).order_by('-created_at').first()
                
                if not code_obj:
                    return Response({'error': 'Código 2FA inválido'}, status=status.HTTP_400_BAD_REQUEST)
                
                if code_obj.is_expired():
                    return Response({'error': 'Código 2FA expirado'}, status=status.HTTP_400_BAD_REQUEST)
                
                code_obj.is_used = True
                code_obj.save()
                
                login_token = LoginToken.objects.create(user=user)
                
                try:
                    send_login_token_email(user, login_token)
                except Exception as e:
                    print(f"Error enviando email: {e}")
                
                return Response({
                    'message': '2FA verificado. Token enviado a tu correo.',
                    'login_token': str(login_token.token),
                    'success': True
                }, status=status.HTTP_200_OK)
                
            except TemporaryUser.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_2fa_code(request):
    try:
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'ID de usuario requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = TemporaryUser.objects.get(id=user_id, is_verified=True)
            
            if not user.phone or not user.phone_verified:
                return Response({'error': 'Teléfono no verificado'}, status=status.HTTP_400_BAD_REQUEST)
            
            whatsapp_result = whatsapp_service.send_2fa_code(user.phone, user.first_name)
            
            if whatsapp_result['success']:
                TwoFactorCode.objects.create(
                    user=user,
                    code=whatsapp_result['code']
                )
                
                return Response({
                    'message': 'Se ha enviado un nuevo código 2FA a tu WhatsApp.',
                    'phone': user.phone[-4:],
                    'channel': 'whatsapp'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'No se pudo enviar el código 2FA.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except TemporaryUser.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def send_verification_email(user):
    verification_url = f"http://localhost:8000/api/verify-email/{user.verification_token}/"
    
    # Obtener el hash BCrypt para mostrarlo en el email
    hash_info = user.password if hasattr(user, 'password') else "Hash no disponible"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verifica tu cuenta BuildingPRO</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(45deg, #00BFFF, #0099CC); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }}
            .button {{ background: #00BFFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; }}
            .token {{ background: #eee; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }}
            .hash-info {{ background: #f0f8ff; padding: 10px; border-radius: 5px; border-left: 4px solid #00BFFF; margin: 15px 0; font-family: monospace; font-size: 12px; word-break: break-all; }}
            .security-badge {{ background: #e8f5e8; border: 1px solid #4CAF50; padding: 10px; border-radius: 5px; margin: 15px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>BuildingPRO</h1>
                <p>Sistema de Gestión de Edificios Inteligentes</p>
            </div>
            <div class="content">
                <h2>¡Bienvenido, {user.first_name}!</h2>
                <p>Gracias por registrarte en BuildingPRO. Para completar tu registro, verifica tu email.</p>
                <p><a href="{verification_url}" class="button">Verificar Mi Cuenta</a></p>
                <p>O usa este token: <strong>{user.verification_token}</strong></p>
                
                <div class="security-badge">
                    <strong>🔒 Seguridad de Cuenta</strong><br>
                    Tu contraseña ha sido protegida con encriptación BCrypt
                </div>
                
                <div class="hash-info">
                    <strong>Hash BCrypt de tu contraseña:</strong><br>
                    {hash_info}
                </div>
                
                <p><strong>Nota:</strong> Al iniciar sesión se te enviará un código de verificación por WhatsApp.</p>
                
                <hr>
                <p><strong>Detalles de tu registro:</strong></p>
                <ul>
                    <li>Nombre: {user.first_name} {user.last_name}</li>
                    <li>Email: {user.email}</li>
                    <li>Teléfono: {user.phone}</li>
                    <li>Rol: {user.get_role_display()}</li>
                    <li>Fecha de registro: {user.created_at.strftime("%Y-%m-%d %H:%M")}</li>
                </ul>
                
                <p>Saludos,<br>El equipo de BuildingPRO</p>
            </div>
        </div>
    </body>
    </html>
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

Nota: Al iniciar sesión se te enviará un código de verificación por WhatsApp.

Saludos,
El equipo de BuildingPRO
"""
    
    try:
        from django.conf import settings
        
        # Verificar si estamos usando consola o SMTP real
        if 'console' in settings.EMAIL_BACKEND:
            print("📧 MODO CONSOLA - Mostrando email en consola:")
            print(f"Para: {user.email}")
            print(f"Asunto: Verifica tu cuenta BuildingPRO")
            print(f"Token: {user.verification_token}")
            print(f"URL: {verification_url}")
            print(f"🔐 Hash BCrypt: {hash_info}")
            return True
        
        # Envío real por SMTP con manejo mejorado de errores
        print(f"📧 Intentando enviar email real a: {user.email}")
        
        # Usar el mismo email como remitente
        from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
        
        email_msg = EmailMultiAlternatives(
            subject='Verifica tu cuenta BuildingPRO - Seguridad BCrypt',
            body=text_content,
            from_email=from_email,
            to=[user.email],
            reply_to=[from_email]
        )
        email_msg.attach_alternative(html_content, "text/html")
        
        # Enviar con timeout
        import socket
        socket.setdefaulttimeout(30)  # 30 segundos timeout
        
        result = email_msg.send(fail_silently=False)
        
        if result == 1:
            print(f"✅ Email enviado exitosamente a: {user.email}")
            print(f"🔐 Hash BCrypt incluido en el email: {hash_info}")
            return True
        else:
            print(f"❌ No se pudo enviar el email. Resultado: {result}")
            return False
            
    except socket.timeout:
        print(f"❌ TIMEOUT enviando email a {user.email}: Timeout de conexión")
        # Fallback a consola
        print(f"📧 [FALLBACK] Token: {user.verification_token}")
        print(f"🔐 [FALLBACK] Hash BCrypt: {hash_info}")
        return False
    except Exception as e:
        print(f"❌ ERROR enviando email a {user.email}: {str(e)}")
        
        # Fallback detallado
        print(f"📧 [FALLBACK] Información de verificación:")
        print(f"   Email: {user.email}")
        print(f"   Token: {user.verification_token}")
        print(f"   URL: {verification_url}")
        print(f"🔐 [FALLBACK] Hash BCrypt: {hash_info}")
        
        return False

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
        subject='Token de acceso BuildingPRO - Verificación de Seguridad',
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
    <!DOCTYPE html><html><head><meta charset="utf-8"><title>Contraseña actualizada - BuildingPRO</title><style>body{{font-family:Arial,sans-serif;line-height:1.6;color:#333;}}.container{{max-width:600px;margin:0 auto;padding:20px;}}.header{{background:linear-gradient(45deg,#4ede7c,#2ecc71);color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0;}}.content{{background:#f9f9f9;padding:20px;border-radius:0 0 10px 10px;}}.success{{background:#d4edda;border:1px solid #c3e6cb;padding:10px;border-radius:5px;color:#155724;}}</style></head><body><div class="container"><div class="header"><h1>BuildingPRO</h1><p>Contraseña actualizada</p></div><div class="content"><h2>¡Hola, {user.first_name}!</h2><div class="success"><strong>✅ Éxito:</strong> Tu contraseña ha sido actualizada correctamente.</div><p>Tu cuenta ahora está protegida con tu nueva contraseña encriptada con BCrypt.</p><hr><p><strong>Detalles de la operación:</strong></p><ul><li>Usuario: {user.email}</li><li>Nombre: {user.first_name} {user.last_name}</li><li>Rol: {user.get_role_display()}</li><li>Fecha: {timezone.now().strftime("%Y-%m-%d %H:%M")}</li><li>Método de encriptación: BCrypt</li></ul><p>Si no reconoces esta actividad, contacta a soporte inmediatamente.</p><p>Saludos,<br>El equipo de seguridad de BuildingPRO</p></div></div></body></html>
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
    except Exception as e:
        print(f"❌ Error enviando email de confirmación: {e}")

@api_view(['POST'])
@permission_classes([AllowAny])
def send_welcome_message(request):
    try:
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'error': 'ID de usuario requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = TemporaryUser.objects.get(id=user_id, is_verified=True, phone_verified=True)
            
            if not user.phone:
                return Response({'error': 'Usuario no tiene teléfono registrado'}, status=status.HTTP_400_BAD_REQUEST)
            
            result = whatsapp_service.send_welcome_message(user.phone, user.first_name)
            
            if result['success']:
                return Response({
                    'message': 'Mensaje de bienvenida enviado por WhatsApp.',
                    'whatsapp_sent': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'No se pudo enviar el mensaje de bienvenida.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except TemporaryUser.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def custom_dashboard_view(request):
    """Redirige al dashboard correspondiente según el rol del usuario"""
    try:
        # Verificar si el usuario está autenticado
        user = request.user
        if not user.is_authenticated:
            return redirect('/login/')
        
        # Mapeo de roles a dashboards
        role_dashboards = {
            'administrador': '/dashboard-admin/',
            'residente': '/dashboard-residente/', 
            'guardia': '/dashboard-guardia/',
            'tecnico': '/dashboard-tecnico/',
            'visitante': '/dashboard-visitante/'
        }
        
        dashboard_url = role_dashboards.get(user.role, '/dashboard-residente/')
        return redirect(dashboard_url)
    
    except Exception as e:
        print(f"Error en redirección de dashboard: {e}")
        return redirect('/login/')


@api_view(['GET'])
def dashboard_api(request):
    return Response({'message': '¡BIENVENIDO AL SISTEMA BUILDINGPRO!'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def user_profile(request):
    try:
        user = TemporaryUser.objects.filter(is_verified=True).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_profile(request):
    try:
        user = TemporaryUser.objects.filter(is_verified=True).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Perfil actualizado correctamente'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def change_password(request):
    try:
        user = TemporaryUser.objects.filter(is_verified=True).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            current_password = serializer.validated_data['current_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(current_password):
                return Response({'error': 'Contraseña actual incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Contraseña cambiada correctamente'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def dashboard_stats(request):
    try:
        user = TemporaryUser.objects.filter(is_verified=True).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        stats = {
            'total_announcements': Announcement.objects.filter(is_published=True).count(),
            'unread_notifications': UserNotification.objects.filter(user=user, is_read=False).count(),
            'pending_payments': 2,
            'active_reservations': 1,
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def announcements_list(request):
    try:
        announcements = Announcement.objects.filter(is_published=True).order_by('-publish_date')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_announcement(request):
    try:
        user = TemporaryUser.objects.filter(is_verified=True).first()
        if not user or user.role != 'administrador':
            return Response({'error': 'No tienes permisos para crear anuncios'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=user)
            return Response({'message': 'Anuncio creado correctamente'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def notifications_list(request):
    try:
        user = TemporaryUser.objects.filter(is_verified=True).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        notifications = UserNotification.objects.filter(user=user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def mark_notification_read(request, notification_id):
    try:
        user = TemporaryUser.objects.filter(is_verified=True).first()
        if not user:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        notification = UserNotification.objects.get(id=notification_id, user=user)
        notification.is_read = True
        notification.save()
        
        return Response({'message': 'Notificación marcada como leída'}, status=status.HTTP_200_OK)
    
    except UserNotification.DoesNotExist:
        return Response({'error': 'Notificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)