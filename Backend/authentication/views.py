from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import uuid
import os
import json
import re
from pathlib import Path
from datetime import timedelta
import logging

@api_view(['GET'])
@permission_classes([AllowAny])
def get_captcha(request):
    """Endpoint para obtener CAPTCHA - VERSIÓN CORREGIDA"""
    try:
        from captcha.models import CaptchaStore
        from django.http import HttpResponse
        from django.urls import reverse
        
        logger.info("🔄 Solicitando nuevo CAPTCHA...")
        
        # Generar nuevo CAPTCHA
        new_key = CaptchaStore.generate_key()
        
        # Forzar la creación del CAPTCHA
        captcha = CaptchaStore.objects.get(hashkey=new_key)
        
        # Construir URL de la imagen - método más confiable
        image_url = reverse('captcha-image', kwargs={'key': new_key})
        full_image_url = f"{request.scheme}://{request.get_host()}{image_url}"
        
        logger.info(f"🔍 CAPTCHA generado - Key: {new_key}")
        logger.info(f"🖼️ Image URL: {full_image_url}")
        logger.info(f"📝 Response: {captcha.response}")
        
        return Response({
            'captcha_key': new_key,
            'captcha_image': full_image_url,
            'success': True
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Error generando CAPTCHA: {e}")
        # Fallback para desarrollo
        return Response({
            'captcha_key': 'fallback_key',
            'captcha_image': '/static/captcha/fallback.png',
            'success': True,
            'fallback': True
        }, status=status.HTTP_200_OK)

# Configurar logging
logger = logging.getLogger(__name__)

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

# =============================================
# VISTAS DE AUTENTICACIÓN Y MANEJO DE SESIÓN
# =============================================

def verify_captcha(captcha_response, captcha_key):
    """Verificar CAPTCHA"""
    try:
        captcha = CaptchaStore.objects.get(hashkey=captcha_key)
        if captcha.response == captcha_response.lower():
            captcha.delete()
            return True
        return False
    except CaptchaStore.DoesNotExist:
        return False

def record_failed_attempt(request, email):
    """Registrar intento fallido de login"""
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
    """Registro de nuevos usuarios"""
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
            
            logger.info(f"=== REGISTRO EXITOSO ===")
            logger.info(f"Usuario: {user.email}")
            logger.info(f"Teléfono: {user.phone}")
            logger.info(f"Token de verificación: {user.verification_token}")
            logger.info(f"============================")
            
            try:
                email_sent = send_verification_email(user)
            except Exception as e:
                logger.error(f"Error enviando email: {e}")
                email_sent = False
            
            response_data = {
                'message': 'Usuario registrado exitosamente. ' + 
                          ('Se ha enviado un token de verificación a tu correo.' if email_sent else 
                           'Revisa la consola del servidor para obtener el token.'),
                'verification_token': str(user.verification_token),
                'phone_verification_required': False,
                'phone': user.phone if user.phone else None,
                'user_id': str(user.id),
                'hash_info': user.password
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error en registro: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login principal para todos los usuarios"""
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
        
        logger.info(f"🔐 INTENTO DE LOGIN para: {email}, rol: {role}")
        
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
            
            # Verificación por WhatsApp para usuarios con teléfono
            if user.phone:
                whatsapp_result = whatsapp_service.send_login_code(user.phone, user.first_name)
                
                if whatsapp_result['success']:
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
                    logger.error(f"⚠ Error enviando código por WhatsApp: {whatsapp_result.get('error')}")
                    return Response({
                        'error': 'No se pudo enviar el código de verificación. Intenta más tarde.'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Login directo para usuarios sin teléfono
                login_token = LoginToken.objects.create(user=user)
                
                # ✅ GUARDAR EN SESIÓN INMEDIATAMENTE
                request.session['user_id'] = str(user.id)
                request.session['user_email'] = user.email
                request.session['user_role'] = user.role
                request.session['user_name'] = user.get_full_name()
                request.session['login_token'] = str(login_token.token)
                request.session['is_authenticated'] = True
                request.session.modified = True
                
                logger.info(f"✅ Sesión iniciada - User ID: {request.session.get('user_id')}")
                
                return Response({
                    'message': 'Login exitoso.',
                    'login_token': str(login_token.token),
                    'success': True,
                    'login_verification_required': False,
                    'session_data': {
                        'user_id': str(user.id),
                        'user_email': user.email,
                        'user_role': user.role
                    }
                }, status=status.HTTP_200_OK)
            
        except TemporaryUser.DoesNotExist:
            record_failed_attempt(request, email)
            return Response({
                'error': 'Usuario no encontrado o no verificado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def verify_login_code(request):
    """Verificar código de login enviado por WhatsApp - VERSIÓN CORREGIDA"""
    try:
        logger.info("=== INICIO verify_login_code ===")
        
        # Leer el body manualmente
        try:
            body_data = json.loads(request.body.decode('utf-8'))
            logger.info("✅ Body parseado correctamente: %s", body_data)
        except Exception as e:
            logger.error(f"❌ Error parsing body: {e}")
            return Response({
                'error': f'Error en los datos enviados: {str(e)}',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)

        user_id = body_data.get('user_id')
        verification_code = body_data.get('verification_code')
        
        logger.info(f"🔍 Datos recibidos - user_id: {user_id}, code: {verification_code}")
        
        if not user_id:
            return Response({
                'error': 'user_id es requerido',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if not verification_code:
            return Response({
                'error': 'verification_code es requerido', 
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = TemporaryUser.objects.get(id=user_id, is_verified=True)
            logger.info(f"✅ Usuario encontrado: {user.email} ({user.role})")
            
            # ✅ CORRECCIÓN CRÍTICA: Aceptar código 123456 para desarrollo
            if verification_code == '123456':
                logger.info("✅ Código de desarrollo 123456 aceptado")
                
                # Crear token de login
                login_token = LoginToken.objects.create(user=user)
                logger.info(f"✅ Token creado: {login_token.token}")
                
                # ✅ CORRECCIÓN CRÍTICA: Guardar en sesión inmediatamente
                request.session['user_id'] = str(user.id)
                request.session['user_email'] = user.email
                request.session['user_role'] = user.role
                request.session['user_name'] = user.get_full_name()
                request.session['login_token'] = str(login_token.token)
                request.session['is_authenticated'] = True
                request.session.modified = True
                
                logger.info(f"✅ Sesión guardada - User ID: {request.session.get('user_id')}")
                logger.info(f"✅ Datos de sesión: {dict(request.session)}")
                
                return Response({
                    'message': 'Código verificado correctamente',
                    'login_token': str(login_token.token),
                    'success': True,
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role
                    },
                    'session_data': {
                        'user_id': str(user.id),
                        'user_email': user.email,
                        'user_role': user.role
                    },
                    'redirect_url': f'/api/dashboard-{user.role}/?token={login_token.token}'
                }, status=status.HTTP_200_OK)
            
            # Verificación en base de datos para producción
            verification = PhoneVerification.objects.filter(
                user=user,
                verification_code=verification_code,
                is_verified=False
            ).order_by('-created_at').first()
            
            if not verification:
                logger.error("❌ Código no encontrado en la base de datos")
                return Response({
                    'error': 'Código de verificación incorrecto',
                    'success': False
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if verification.is_expired():
                logger.error("❌ Código expirado")
                return Response({
                    'error': 'Código expirado. Por favor solicita uno nuevo.',
                    'success': False
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Marcar como verificado
            verification.is_verified = True
            verification.save()
            logger.info("✅ Código marcado como verificado")
            
            # Crear token de login
            login_token = LoginToken.objects.create(user=user)
            logger.info(f"✅ Token de login creado: {login_token.token}")
            
            # ✅ GUARDAR EN SESIÓN INMEDIATAMENTE
            request.session['user_id'] = str(user.id)
            request.session['user_email'] = user.email
            request.session['user_role'] = user.role
            request.session['user_name'] = user.get_full_name()
            request.session['login_token'] = str(login_token.token)
            request.session['is_authenticated'] = True
            request.session.modified = True
            
            logger.info(f"✅ Sesión guardada - User ID: {request.session.get('user_id')}")
            
            return Response({
                'message': 'Código verificado correctamente. Login exitoso.',
                'login_token': str(login_token.token),
                'success': True,
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role
                },
                'session_data': {
                    'user_id': str(user.id),
                    'user_email': user.email,
                    'user_role': user.role
                },
                'redirect_url': f'/api/dashboard-{user.role}/?token={login_token.token}'
            }, status=status.HTTP_200_OK)
                
        except TemporaryUser.DoesNotExist:
            logger.error("❌ Usuario no encontrado")
            return Response({
                'error': 'Usuario no encontrado o no verificado',
                'success': False
            }, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"❌ ERROR in verify_login_code: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return Response({
            'error': f'Error interno del servidor: {str(e)}',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    """Verificar email de usuario"""
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
    """Verificar token de login"""
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

# =============================================
# VISTAS DE DASHBOARD - COMPLETAMENTE CORREGIDAS
# =============================================

def _get_dashboard_template(role):
    """Obtener el template del dashboard según el rol"""
    templates = {
        'administrador': 'dashboard-admin.html',
        'residente': 'dashboard-residente.html',
        'guardia': 'dashboard-guardia.html',
        'tecnico': 'dashboard-tecnico.html',
        'visitante': 'dashboard-visitante.html'
    }
    return templates.get(role, 'dashboard-residente.html')

def _setup_session_from_token(request, login_token):
    """Configurar sesión desde token"""
    try:
        token_obj = LoginToken.objects.get(token=login_token, is_used=False)
        if not token_obj.is_expired():
            user = token_obj.user
            
            # Guardar en sesión
            request.session['user_id'] = str(user.id)
            request.session['user_email'] = user.email
            request.session['user_role'] = user.role
            request.session['user_name'] = user.get_full_name()
            request.session['login_token'] = str(login_token)
            request.session['is_authenticated'] = True
            request.session.modified = True
            
            # Marcar token como usado
            token_obj.is_used = True
            token_obj.save()
            
            logger.info(f"✅ Sesión configurada desde token - User: {user.email}")
            return user
        else:
            logger.error("❌ Token expirado")
            return None
    except LoginToken.DoesNotExist:
        logger.error("❌ Token no existe o ya fue usado")
        return None

def _serve_dashboard_file(role, request):
    """Servir archivo del dashboard"""
    frontend_dir = Path(settings.BASE_DIR).parent / 'Frontend'
    template_name = _get_dashboard_template(role)
    file_path = frontend_dir / template_name
    
    if file_path.exists():
        with open(file_path, 'rb') as f:
            content = f.read()
        
        response = HttpResponse(content, content_type='text/html')
        
        # Establecer cookies para el frontend
        response.set_cookie('user_role', role, max_age=3600)
        response.set_cookie('user_email', request.session.get('user_email', ''), max_age=3600)
        response.set_cookie('is_authenticated', 'true', max_age=3600)
        response.set_cookie('session_id', request.session.session_key, max_age=3600)
        
        logger.info(f"✅ Dashboard servido: {template_name}")
        return response
    else:
        logger.error(f"❌ Archivo no encontrado: {file_path}")
        return HttpResponse("Dashboard no encontrado", status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard(request):
    """Dashboard para administradores"""
    try:
        user_id = request.session.get('user_id')
        login_token = request.GET.get('token') or request.session.get('login_token')
        
        logger.info(f"🔍 Accediendo a admin_dashboard - User ID: {user_id}, Token: {login_token}")
        logger.info(f"🔍 Sesión completa: {dict(request.session)}")
        
        # Procesar token si existe
        if login_token and not user_id:
            user = _setup_session_from_token(request, login_token)
            if user:
                user_id = str(user.id)
            else:
                return redirect('/login/')
        
        # Verificar autenticación
        if not user_id:
            logger.error("❌ No autenticado, redirigiendo a login")
            return redirect('/login/')
        
        # Verificar rol
        user_role = request.session.get('user_role')
        if user_role != 'administrador':
            logger.error(f"❌ Usuario no es administrador, es: {user_role}")
            return redirect('/login/')
        
        logger.info(f"✅ Acceso concedido a admin_dashboard: {request.session.get('user_email')}")
        return _serve_dashboard_file('administrador', request)
            
    except Exception as e:
        logger.error(f"❌ Error en admin_dashboard: {e}")
        return redirect('/login/')

@api_view(['GET'])
@permission_classes([AllowAny])
def residente_dashboard(request):
    """Dashboard para residentes"""
    try:
        user_id = request.session.get('user_id')
        login_token = request.GET.get('token') or request.session.get('login_token')
        
        logger.info(f"🔍 Accediendo a residente_dashboard - User ID: {user_id}, Token: {login_token}")
        
        # Procesar token si existe
        if login_token and not user_id:
            user = _setup_session_from_token(request, login_token)
            if user:
                user_id = str(user.id)
            else:
                return redirect('/login/')
        
        if not user_id:
            return redirect('/login/')
        
        user_role = request.session.get('user_role')
        logger.info(f"✅ Acceso concedido a residente_dashboard: {request.session.get('user_email')} - Rol: {user_role}")
        return _serve_dashboard_file('residente', request)
            
    except Exception as e:
        logger.error(f"❌ Error en residente_dashboard: {e}")
        return redirect('/login/')

@api_view(['GET'])
@permission_classes([AllowAny])
def guardia_dashboard(request):
    """Dashboard para guardias"""
    try:
        user_id = request.session.get('user_id')
        login_token = request.GET.get('token') or request.session.get('login_token')
        
        logger.info(f"🔍 Accediendo a guardia_dashboard - User ID: {user_id}, Token: {login_token}")
        
        # Procesar token si existe
        if login_token and not user_id:
            user = _setup_session_from_token(request, login_token)
            if user:
                user_id = str(user.id)
            else:
                return redirect('/login/')
        
        if not user_id:
            return redirect('/login/')
        
        user_role = request.session.get('user_role')
        logger.info(f"✅ Acceso concedido a guardia_dashboard: {request.session.get('user_email')} - Rol: {user_role}")
        return _serve_dashboard_file('guardia', request)
            
    except Exception as e:
        logger.error(f"❌ Error en guardia_dashboard: {e}")
        return redirect('/login/')

@api_view(['GET'])
@permission_classes([AllowAny])
def tecnico_dashboard(request):
    """Dashboard para técnicos"""
    try:
        user_id = request.session.get('user_id')
        login_token = request.GET.get('token') or request.session.get('login_token')
        
        logger.info(f"🔍 Accediendo a tecnico_dashboard - User ID: {user_id}, Token: {login_token}")
        
        # Procesar token si existe
        if login_token and not user_id:
            user = _setup_session_from_token(request, login_token)
            if user:
                user_id = str(user.id)
            else:
                return redirect('/login/')
        
        if not user_id:
            return redirect('/login/')
        
        user_role = request.session.get('user_role')
        logger.info(f"✅ Acceso concedido a tecnico_dashboard: {request.session.get('user_email')} - Rol: {user_role}")
        return _serve_dashboard_file('tecnico', request)
            
    except Exception as e:
        logger.error(f"❌ Error en tecnico_dashboard: {e}")
        return redirect('/login/')

@api_view(['GET'])
@permission_classes([AllowAny])
def visitante_dashboard(request):
    """Dashboard para visitantes"""
    try:
        user_id = request.session.get('user_id')
        login_token = request.GET.get('token') or request.session.get('login_token')
        
        logger.info(f"🔍 Accediendo a visitante_dashboard - User ID: {user_id}, Token: {login_token}")
        
        # Procesar token si existe
        if login_token and not user_id:
            user = _setup_session_from_token(request, login_token)
            if user:
                user_id = str(user.id)
            else:
                return redirect('/login/')
        
        if not user_id:
            return redirect('/login/')
        
        user_role = request.session.get('user_role')
        logger.info(f"✅ Acceso concedido a visitante_dashboard: {request.session.get('user_email')} - Rol: {user_role}")
        return _serve_dashboard_file('visitante', request)
            
    except Exception as e:
        logger.error(f"❌ Error en visitante_dashboard: {e}")
        return redirect('/login/')

# =============================================
# GESTIÓN DE CONTRASEÑAS
# =============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """Solicitar restablecimiento de contraseña"""
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
                
                logger.info(f"=== EMAIL DE RECUPERACIÓN ===")
                logger.info(f"Para: {user.email}")
                logger.info(f"Token: {reset_token.token}")
                logger.info(f"URL: {reset_url}")
                logger.info(f"============================")
                
                try:
                    send_password_reset_email(user, reset_token)
                except Exception as e:
                    logger.error(f"Error enviando email real: {e}")
                
                return Response({
                    'message': 'Se ha enviado un token de recuperación a tu correo.',
                    'reset_token': str(reset_token.token)
                }, status=status.HTTP_200_OK)
                
            except TemporaryUser.DoesNotExist:
                return Response({'error': 'No se encontró una cuenta verificada con este email'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error en recuperación de contraseña: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Confirmar restablecimiento de contraseña"""
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
                
                logger.info(f"=== CONTRASEÑA ACTUALIZADA ===")
                logger.info(f"Para: {user.email}")
                logger.info(f"==============================")
                
                try:
                    send_password_changed_email(user)
                except Exception as e:
                    logger.error(f"Error enviando email real: {e}")
                
                return Response({
                    'message': 'Contraseña actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.'
                }, status=status.HTTP_200_OK)
                
            except PasswordResetToken.DoesNotExist:
                return Response({'error': 'Token inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Error en confirmación de recuperación: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# =============================================
# VERIFICACIÓN DE DOS FACTORES
# =============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_2fa(request):
    """Verificar código 2FA"""
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
                    logger.error(f"Error enviando email: {e}")
                
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
    """Reenviar código 2FA"""
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

# =============================================
# GESTIÓN DE PERFIL Y USUARIO
# =============================================

@api_view(['GET'])
def user_profile(request):
    """Obtener perfil de usuario"""
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = TemporaryUser.objects.get(id=user_id, is_verified=True)
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_profile(request):
    """Actualizar perfil de usuario"""
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = TemporaryUser.objects.get(id=user_id, is_verified=True)
        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Perfil actualizado correctamente'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def change_password(request):
    """Cambiar contraseña"""
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = TemporaryUser.objects.get(id=user_id, is_verified=True)
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
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# =============================================
# ANUNCIOS Y NOTIFICACIONES
# =============================================

@api_view(['GET'])
def dashboard_stats(request):
    """Obtener estadísticas del dashboard"""
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = TemporaryUser.objects.get(id=user_id, is_verified=True)
        
        stats = {
            'total_announcements': Announcement.objects.filter(is_published=True).count(),
            'unread_notifications': UserNotification.objects.filter(user=user, is_read=False).count(),
            'pending_payments': 2,
            'active_reservations': 1,
        }
        
        return Response(stats, status=status.HTTP_200_OK)
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def announcements_list(request):
    """Listar anuncios"""
    try:
        announcements = Announcement.objects.filter(is_published=True).order_by('-publish_date')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_announcement(request):
    """Crear anuncio"""
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = TemporaryUser.objects.get(id=user_id, is_verified=True)
        if user.role != 'administrador':
            return Response({'error': 'No tienes permisos para crear anuncios'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=user)
            return Response({'message': 'Anuncio creado correctamente'}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def notifications_list(request):
    """Listar notificaciones"""
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = TemporaryUser.objects.get(id=user_id, is_verified=True)
        notifications = UserNotification.objects.filter(user=user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def mark_notification_read(request, notification_id):
    """Marcar notificación como leída"""
    try:
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = TemporaryUser.objects.get(id=user_id, is_verified=True)
        notification = UserNotification.objects.get(id=notification_id, user=user)
        notification.is_read = True
        notification.save()
        
        return Response({'message': 'Notificación marcada como leída'}, status=status.HTTP_200_OK)
    
    except UserNotification.DoesNotExist:
        return Response({'error': 'Notificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except TemporaryUser.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# =============================================
# LOGIN DE VISITANTES
# =============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def visitor_login(request):
    """Login para visitantes usando código de invitación"""
    try:
        logger.info("🔐 Iniciando login de visitante...")
        
        # Validar CAPTCHA primero
        captcha_response = request.data.get('captcha_response', '')
        captcha_key = request.data.get('captcha_key', '')
        
        if not captcha_response or not captcha_key:
            return Response({
                'error': 'CAPTCHA requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not verify_captcha(captcha_response, captcha_key):
            return Response({
                'error': 'CAPTCHA inválido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener y validar código de invitación
        invitation_code = request.data.get('invitation_code', '').strip()
        
        if not invitation_code:
            return Response({
                'error': 'El código de invitación es requerido'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar formato del código (123-ABC-456-DEF)
        invitation_pattern = re.compile(r'^\d{3}-[A-Za-z]{3}-\d{3}-[A-Za-z]{3}$')
        
        if not invitation_pattern.match(invitation_code):
            return Response({
                'error': 'Formato de código de invitación inválido. Debe ser: 123-abc-456-def'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info(f"✅ Código de invitación válido: {invitation_code}")
        
        # Simular verificación de código (en producción, verificarías en la BD)
        valid_codes = [
            '123-abc-456-def',
            '789-xyz-123-abc', 
            '456-def-789-ghi',
            '111-aaa-222-bbb',
            '333-ccc-444-ddd'
        ]
        
        if invitation_code.lower() not in valid_codes:
            return Response({
                'error': 'Código de invitación inválido o expirado'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear usuario visitante temporal
        try:
            visitor_user = TemporaryUser.objects.get(
                email=f"visitante_{invitation_code}@buildingpro.com",
                role='visitante'
            )
            logger.info(f"✅ Usuario visitante existente encontrado: {visitor_user.email}")
        except TemporaryUser.DoesNotExist:
            visitor_user = TemporaryUser.objects.create(
                email=f"visitante_{invitation_code}@buildingpro.com",
                first_name="Visitante",
                last_name=invitation_code,
                phone="000000000",
                role='visitante',
                role_code=invitation_code,
                is_verified=True,
                verification_token=uuid.uuid4()
            )
            visitor_user.set_password("Visitor123!")
            visitor_user.save()
            logger.info(f"✅ Nuevo usuario visitante creado: {visitor_user.email}")
        
        # Crear token de login para el visitante
        login_token = LoginToken.objects.create(user=visitor_user)
        
        # ✅ GUARDAR EN SESIÓN INMEDIATAMENTE
        request.session['user_id'] = str(visitor_user.id)
        request.session['user_email'] = visitor_user.email
        request.session['user_role'] = visitor_user.role
        request.session['user_name'] = visitor_user.get_full_name()
        request.session['login_token'] = str(login_token.token)
        request.session['is_authenticated'] = True
        request.session.modified = True
        
        logger.info(f"✅ Token de login creado: {login_token.token}")
        
        response_data = {
            'success': True,
            'message': 'Login de visitante exitoso',
            'login_token': str(login_token.token),
            'user': {
                'email': visitor_user.email,
                'first_name': visitor_user.first_name,
                'last_name': visitor_user.last_name,
                'role': visitor_user.role,
                'invitation_code': invitation_code
            },
            'redirect_url': f'/api/dashboard-visitante/?token={login_token.token}',
            'session_data': {
                'user_id': str(visitor_user.id),
                'user_email': visitor_user.email,
                'user_role': visitor_user.role
            }
        }
        
        logger.info(f"✅ Login de visitante completado exitosamente")
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Error en login de visitante: {str(e)}")
        return Response({
            'error': f'Error interno del servidor: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =============================================
# UTILITARIOS Y SISTEMA
# =============================================

@api_view(['GET'])
def check_session(request):
    """Verificar sesión activa"""
    try:
        user_id = request.session.get('user_id')
        if user_id:
            try:
                user = TemporaryUser.objects.get(id=user_id)
                return Response({
                    'authenticated': True,
                    'user': {
                        'id': str(user.id),
                        'email': user.email,
                        'role': user.role,
                        'first_name': user.first_name,
                        'last_name': user.last_name
                    },
                    'session_data': dict(request.session)
                }, status=status.HTTP_200_OK)
            except TemporaryUser.DoesNotExist:
                # Limpiar sesión inválida
                request.session.flush()
                return Response({'authenticated': False}, status=status.HTTP_200_OK)
        else:
            return Response({'authenticated': False}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error verificando sesión: {e}")
        return Response({
            'authenticated': False,
            'error': str(e)
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
def logout(request):
    """Cerrar sesión"""
    try:
        user_email = request.session.get('user_email')
        request.session.flush()
        logger.info(f"✅ Sesión cerrada para: {user_email}")
        return Response({'message': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error cerrando sesión: {e}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def check_password_strength(request):
    """Validar fortaleza de contraseña"""
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

@api_view(['GET'])
def dashboard_api(request):
    """API básica del dashboard"""
    return Response({'message': '¡BIENVENIDO AL SISTEMA BUILDINGPRO!'}, status=status.HTTP_200_OK)

# =============================================
# REDIRECCIÓN DE DASHBOARD
# =============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_redirect(request):
    """Redirigir al dashboard correspondiente según el rol del usuario"""
    try:
        # Obtener el token de la sesión o parámetro
        login_token = request.GET.get('token') or request.session.get('login_token')
        user_id = request.session.get('user_id')
        
        logger.info(f"🔍 Redirección de dashboard - User ID: {user_id}, Token: {login_token}")
        
        if not user_id and not login_token:
            logger.info("❌ No autenticado, redirigiendo a login")
            return redirect('/login/')
        
        # Si hay token pero no sesión, validarlo
        if login_token and not user_id:
            try:
                token_obj = LoginToken.objects.get(token=login_token, is_used=False)
                if not token_obj.is_expired():
                    user = token_obj.user
                    request.session['user_id'] = str(user.id)
                    request.session['user_email'] = user.email
                    request.session['user_role'] = user.role
                    request.session['user_name'] = user.get_full_name()
                    request.session['login_token'] = str(login_token)
                    request.session['is_authenticated'] = True
                    request.session.modified = True
                    
                    token_obj.is_used = True
                    token_obj.save()
                    
                    user_id = str(user.id)
                    user_role = user.role
                else:
                    return redirect('/login/')
            except LoginToken.DoesNotExist:
                return redirect('/login/')
        else:
            # Obtener rol del usuario desde la sesión
            user_role = request.session.get('user_role')
        
        # Mapeo de roles a dashboards
        dashboard_urls = {
            'administrador': '/api/dashboard-admin/',
            'residente': '/api/dashboard-residente/',
            'guardia': '/api/dashboard-guardia/',
            'tecnico': '/api/dashboard-tecnico/',
            'visitante': '/api/dashboard-visitante/'
        }
        
        dashboard_url = dashboard_urls.get(user_role, '/api/dashboard-residente/')
        
        logger.info(f"🎯 Redirigiendo usuario {request.session.get('user_email')} ({user_role}) a {dashboard_url}")
        
        return redirect(dashboard_url)
        
    except Exception as e:
        logger.error(f"❌ Error en redirección de dashboard: {e}")
        return redirect('/login/')


@api_view(['GET'])
@permission_classes([AllowAny])
def custom_dashboard_view(request):
    """Alias para compatibilidad - redirige a dashboard_redirect"""
    return dashboard_redirect(request)

# =============================================
# FUNCIONES DE EMAIL (AUXILIARES)
# =============================================

def send_verification_email(user):
    """Enviar email de verificación"""
    verification_url = f"http://localhost:8000/api/verify-email/{user.verification_token}/"
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
        
        if 'console' in settings.EMAIL_BACKEND:
            logger.info("📧 MODO CONSOLA - Mostrando email en consola:")
            logger.info(f"Para: {user.email}")
            logger.info(f"Asunto: Verifica tu cuenta BuildingPRO")
            logger.info(f"Token: {user.verification_token}")
            logger.info(f"URL: {verification_url}")
            logger.info(f"🔐 Hash BCrypt: {hash_info}")
            return True
        
        logger.info(f"📧 Intentando enviar email real a: {user.email}")
        
        from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
        
        email_msg = EmailMultiAlternatives(
            subject='Verifica tu cuenta BuildingPRO - Seguridad BCrypt',
            body=text_content,
            from_email=from_email,
            to=[user.email],
            reply_to=[from_email]
        )
        email_msg.attach_alternative(html_content, "text/html")
        
        import socket
        socket.setdefaulttimeout(30)
        
        result = email_msg.send(fail_silently=False)
        
        if result == 1:
            logger.info(f"✅ Email enviado exitosamente a: {user.email}")
            logger.info(f"🔐 Hash BCrypt incluido en el email: {hash_info}")
            return True
        else:
            logger.error(f"❌ No se pudo enviar el email. Resultado: {result}")
            return False
            
    except socket.timeout:
        logger.error(f"❌ TIMEOUT enviando email a {user.email}: Timeout de conexión")
        logger.info(f"📧 [FALLBACK] Token: {user.verification_token}")
        logger.info(f"🔐 [FALLBACK] Hash BCrypt: {hash_info}")
        return False
    except Exception as e:
        logger.error(f"❌ ERROR enviando email a {user.email}: {str(e)}")
        logger.info(f"📧 [FALLBACK] Información de verificación:")
        logger.info(f"   Email: {user.email}")
        logger.info(f"   Token: {user.verification_token}")
        logger.info(f"   URL: {verification_url}")
        logger.info(f"🔐 [FALLBACK] Hash BCrypt: {hash_info}")
        return False

def send_login_token_email(user, login_token):
    """Enviar email con token de login"""
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
        logger.info(f"✅ Email de login enviado a: {user.email}")
    except Exception as e:
        logger.error(f"❌ Error enviando email de login a {user.email}: {e}")

def send_password_reset_email(user, reset_token):
    """Enviar email de recuperación de contraseña"""
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
        logger.info(f"✅ Email de recuperación enviado a: {user.email}")
    except Exception as e:
        logger.error(f"❌ Error enviando email de recuperación: {e}")

def send_password_changed_email(user):
    """Enviar email de confirmación de cambio de contraseña"""
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
        logger.info(f"✅ Email de confirmación enviado a: {user.email}")
    except Exception as e:
        logger.error(f"❌ Error enviando email de confirmación: {e}")