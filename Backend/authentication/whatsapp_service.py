import os
import random
from twilio.rest import Client
from django.conf import settings
from django.utils import timezone

class WhatsAppService:
    def __init__(self):
        # TUS CREDENCIALES REALES
        self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
        self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
        self.whatsapp_from = getattr(settings, 'TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')
        
        # Verificar si las credenciales son válidas
        self.is_test_mode = self._check_credentials()
        
        if not self.is_test_mode:
            try:
                self.client = Client(self.account_sid, self.auth_token)
                print("✅ Twilio configurado correctamente con credenciales reales")
                print(f"📱 WhatsApp From: {self.whatsapp_from}")
            except Exception as e:
                print(f"❌ Error inicializando Twilio: {e}")
                self.is_test_mode = True
                self.client = None
        else:
            self.client = None
            print("📱 Modo prueba activado - credenciales incompletas")
    
    def _check_credentials(self):
        """Verificar si las credenciales están completas"""
        if not self.account_sid or not self.auth_token:
            return True
        if 'trial' in self.account_sid.lower() or len(self.account_sid) < 20:
            return True
        return False
    
    def generate_verification_code(self):
        """Generar código de verificación de 6 dígitos"""
        return str(random.randint(100000, 999999))
    
    def send_login_code(self, to_phone, user_name):
        """NUEVO: Enviar código de verificación para login (reemplaza send_verification_code)"""
        code = self.generate_verification_code()
        message = f"""🔐 *BuildingPRO - Código de Verificación*

Hola {user_name},

Tu código de verificación para iniciar sesión es:

*{code}*

⏰ Válido por: 5 minutos

Ingresa este código en la aplicación para completar tu acceso.

_No compartas este código con nadie._"""
        
        result = self.send_whatsapp(to_phone, message)
        if result['success']:
            result['code'] = code
        
        return result
    
    def send_whatsapp(self, to_phone, message):
        """Enviar mensaje por WhatsApp usando Twilio real"""
        try:
            # Formatear número para WhatsApp
            whatsapp_to = f"whatsapp:{to_phone}" if not to_phone.startswith('whatsapp:') else to_phone
            
            if self.is_test_mode or not self.client:
                # Modo de prueba - simular envío
                code = self._extract_code_from_message(message)
                print(f"📱 [MODO PRUEBA] Simulando WhatsApp a: {whatsapp_to}")
                print(f"📱 [MENSAJE]: {message}")
                print(f"📱 [CÓDIGO]: {code}")
                return {
                    'success': True,
                    'message': 'WhatsApp simulado - modo prueba',
                    'code': code,
                    'simulated': True
                }
            
            # ENVÍO REAL CON TWILIO
            print(f"📱 Enviando WhatsApp real a: {whatsapp_to}")
            message_obj = self.client.messages.create(
                body=message,
                from_=self.whatsapp_from,
                to=whatsapp_to
            )
            
            print(f"✅ WhatsApp enviado exitosamente: {message_obj.sid}")
            return {
                'success': True,
                'message_sid': message_obj.sid,
                'status': message_obj.status,
                'simulated': False
            }
            
        except Exception as e:
            print(f"❌ Error enviando WhatsApp real: {e}")
            # Fallback a modo prueba
            code = self._extract_code_from_message(message)
            print(f"📱 [FALLBACK] Usando código: {code}")
            return {
                'success': True,  # Permitir continuar
                'error': str(e),
                'code': code,
                'simulated': True,
                'fallback': True
            }
    
    def _extract_code_from_message(self, message):
        """Extraer código del mensaje"""
        import re
        code_match = re.search(r'\*(\d{6})\*', message)
        if code_match:
            return code_match.group(1)
        
        code_match = re.search(r'\b(\d{6})\b', message)
        return code_match.group(1) if code_match else self.generate_verification_code()
    
    # MÉTODOS MANTENIDOS PARA COMPATIBILIDAD
    def send_verification_code(self, to_phone, user_name):
        """Método mantenido para compatibilidad (ahora usa send_login_code)"""
        return self.send_login_code(to_phone, user_name)
    
    def send_2fa_code(self, to_phone, user_name):
        """Método mantenido para compatibilidad (ahora usa send_login_code)"""
        return self.send_login_code(to_phone, user_name)

    def send_welcome_message(self, to_phone, user_name):
        """Mensaje de bienvenida"""
        message = f"""🎉 *¡Bienvenido a BuildingPRO, {user_name}!*

✅ Tu cuenta ha sido verificada exitosamente

Ahora puedes gestionar tu edificio inteligente de manera segura.

🔐 Autenticación de dos factores habilitada
📱 Notificaciones por WhatsApp activadas

¡Estamos aquí para ayudarte!"""
        
        return self.send_whatsapp(to_phone, message)

# Instancia global
whatsapp_service = WhatsAppService()