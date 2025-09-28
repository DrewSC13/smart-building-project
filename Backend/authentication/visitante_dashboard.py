from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    TemporaryUser, Visitante, Acceso, AreaComun, DispositivoAcceso
)

@api_view(['GET'])
def visitante_dashboard_data(request):
    """Endpoint para datos del dashboard de visitante"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'visitante':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener información de la visita actual
        try:
            visita_actual = Visitante.objects.filter(
                Q(documento=user.phone) | Q(telefono=user.phone),
                fecha_visita=timezone.now().date()
            ).latest('created_at')
        except Visitante.DoesNotExist:
            return Response({'error': 'No se encontró una visita activa'}, status=status.HTTP_404_NOT_FOUND)
        
        # Información de la visita
        info_visita = {
            'nombre_visitante': visita_actual.nombre,
            'documento': visita_actual.documento,
            'anfitrion': visita_actual.residente_anfitrion.usuario.get_full_name(),
            'departamento': f"{visita_actual.residente_anfitrion.departamento.numero} - {visita_actual.residente_anfitrion.departamento.edificio.nombre}",
            'telefono_anfitrion': visita_actual.residente_anfitrion.usuario.phone,
            'fecha_visita': visita_actual.fecha_visita.isoformat(),
            'hora_entrada': visita_actual.hora_entrada.isoformat()[:5],
            'hora_salida': visita_actual.hora_salida.isoformat()[:5],
            'qr_acceso': f"VIS-{visita_actual.id}-{visita_actual.fecha_visita.strftime('%d%m%Y')}",
            'estado': 'activa'
        }
        
        # Áreas comunes permitidas
        areas_permitidas = AreaComun.objects.filter(
            requiere_pago=False  # Solo áreas gratuitas para visitantes
        )[:10]
        
        areas_data = []
        for area in areas_permitidas:
            areas_data.append({
                'nombre': area.nombre,
                'descripcion': area.descripcion,
                'capacidad': area.capacidad,
                'disponible': True,  # Simulado - podría verificar reservas
                'horario': '8:00 - 20:00'  # Horario general
            })
        
        # Servicios disponibles
        servicios_disponibles = [
            {
                'nombre': 'WiFi Gratuito',
                'disponible': True,
                'detalles': {
                    'red': 'BuildingPRO-Visitantes',
                    'password': 'welcome2024'
                }
            },
            {
                'nombre': 'Estacionamiento',
                'disponible': True,
                'detalles': {
                    'max_tiempo': '2 horas',
                    'niveles': 'B1 y B2',
                    'tarifa': 'Gratuita'
                }
            },
            {
                'nombre': 'Área de Descanso',
                'disponible': True,
                'detalles': {
                    'ubicacion': 'Piso 3 - Sala social',
                    'servicios': 'Máquina de café, sofás'
                }
            },
            {
                'nombre': 'Piscina',
                'disponible': False,
                'detalles': {
                    'razon': 'En mantenimiento',
                    'estimado': 'Hasta 25 Enero'
                }
            }
        ]
        
        # Contactos de emergencia
        contactos_emergencia = [
            {
                'tipo': 'seguridad',
                'nombre': 'Guardia de Seguridad',
                'telefono': '+56 9 1234 5678',
                'extension': '101',
                'disponible': '24/7'
            },
            {
                'tipo': 'administracion',
                'nombre': 'Administración',
                'telefono': '+56 9 8765 4321',
                'extension': '102',
                'disponible': 'Lunes a Viernes 9:00-18:00'
            },
            {
                'tipo': 'anfitrion',
                'nombre': visita_actual.residente_anfitrion.usuario.get_full_name(),
                'telefono': visita_actual.residente_anfitrion.usuario.phone,
                'extension': f"Depto {visita_actual.residente_anfitrion.departamento.numero}",
                'disponible': 'Durante la visita'
            }
        ]
        
        # Normas de convivencia
        normas_convivencia = [
            {
                'titulo': 'Identificación',
                'descripcion': 'Presente su identificación en recepción al ingresar',
                'icono': 'id-card'
            },
            {
                'titulo': 'Áreas Restringidas',
                'descripcion': 'No ingrese a áreas marcadas como restringidas',
                'icono': 'door-closed'
            },
            {
                'titulo': 'Horario de Silencio',
                'descripcion': 'Respete el horario de silencio (22:00 - 7:00)',
                'icono': 'clock'
            },
            {
                'titulo': 'Estacionamiento',
                'descripcion': 'Estacionamiento máximo 2 horas en áreas designadas',
                'icono': 'car'
            }
        ]
        
        dashboard_data = {
            'info_visita': info_visita,
            'areas_permitidas': areas_data,
            'servicios_disponibles': servicios_disponibles,
            'contactos_emergencia': contactos_emergencia,
            'normas_convivencia': normas_convivencia,
            'timestamp': timezone.now().isoformat(),
            'tiempo_restante': self.calcular_tiempo_restante(visita_actual)
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def calcular_tiempo_restante(self, visita):
        """Calcular tiempo restante de la visita"""
        ahora = timezone.now()
        hora_salida = datetime.combine(visita.fecha_visita, visita.hora_salida)
        hora_salida = timezone.make_aware(hora_salida)
        
        if ahora >= hora_salida:
            return {
                'restante': '00:00:00',
                'estado': 'expirada',
                'minutos_restantes': 0
            }
        
        diferencia = hora_salida - ahora
        horas = diferencia.seconds // 3600
        minutos = (diferencia.seconds % 3600) // 60
        segundos = diferencia.seconds % 60
        
        return {
            'restante': f"{horas:02d}:{minutos:02d}:{segundos:02d}",
            'estado': 'activa',
            'minutos_restantes': diferencia.total_seconds() // 60
        }

@api_view(['POST'])
def solicitar_extension(request):
    """Endpoint para solicitar extensión de visita"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'visitante':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener visita actual
        try:
            visita_actual = Visitante.objects.filter(
                Q(documento=user.phone) | Q(telefono=user.phone),
                fecha_visita=timezone.now().date()
            ).latest('created_at')
        except Visitante.DoesNotExist:
            return Response({'error': 'No se encontró una visita activa'}, status=status.HTTP_404_NOT_FOUND)
        
        nueva_hora_salida = request.data.get('nueva_hora_salida')
        motivo = request.data.get('motivo', '')
        
        if not nueva_hora_salida:
            return Response({'error': 'La nueva hora de salida es requerida'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que la extensión sea razonable (máximo 2 horas adicionales)
        hora_actual_salida = visita_actual.hora_salida
        nueva_hora = datetime.strptime(nueva_hora_salida, '%H:%M').time()
        
        # Calcular diferencia en minutos
        diff_minutos = (nueva_hora.hour * 60 + nueva_hora.minute) - (hora_actual_salida.hour * 60 + hora_actual_salida.minute)
        
        if diff_minutos > 120:  # Máximo 2 horas de extensión
            return Response({'error': 'La extensión máxima permitida es de 2 horas'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear solicitud de extensión (en un sistema real, esto iría a una tabla de solicitudes)
        solicitud_data = {
            'visitante_id': visita_actual.id,
            'hora_actual_salida': hora_actual_salida.isoformat()[:5],
            'nueva_hora_salida': nueva_hora_salida,
            'motivo': motivo,
            'fecha_solicitud': timezone.now().isoformat(),
            'estado': 'pendiente'
        }
        
        # Simular envío de notificación al anfitrión
        anfitrion = visita_actual.residente_anfitrion.usuario
        
        return Response({
            'message': 'Solicitud de extensión enviada al anfitrión',
            'solicitud': solicitud_data,
            'anfitrion': anfitrion.get_full_name(),
            'telefono_anfitrion': anfitrion.phone,
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def solicitar_asistencia(request):
    """Endpoint para solicitar asistencia durante la visita"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'visitante':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        tipo_asistencia = request.data.get('tipo')
        descripcion = request.data.get('descripcion', '')
        ubicacion = request.data.get('ubicacion', '')
        
        if not tipo_asistencia:
            return Response({'error': 'El tipo de asistencia es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Tipos de asistencia posibles
        tipos_validos = ['seguridad', 'orientacion', 'medica', 'tecnica', 'otro']
        if tipo_asistencia not in tipos_validos:
            return Response({'error': f'Tipo de asistencia inválido. Válidos: {", ".join(tipos_validos)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener información de la visita para el contexto
        try:
            visita_actual = Visitante.objects.filter(
                Q(documento=user.phone) | Q(telefono=user.phone),
                fecha_visita=timezone.now().date()
            ).latest('created_at')
        except Visitante.DoesNotExist:
            visita_actual = None
        
        # Crear registro de solicitud de asistencia
        solicitud_asistencia = {
            'visitante': visita_actual.nombre if visita_actual else 'Visitante',
            'documento': visita_actual.documento if visita_actual else user.phone,
            'tipo_asistencia': tipo_asistencia,
            'descripcion': descripcion,
            'ubicacion': ubicacion,
            'fecha_solicitud': timezone.now().isoformat(),
            'estado': 'enviada'
        }
        
        # Determinar destinatario según el tipo de asistencia
        if tipo_asistencia == 'seguridad':
            destinatario = 'Guardia de Seguridad'
            prioridad = 'alta'
        elif tipo_asistencia == 'medica':
            destinatario = 'Servicios de Emergencia'
            prioridad = 'urgente'
        else:
            destinatario = 'Administración'
            prioridad = 'media'
        
        return Response({
            'message': f'Solicitud de asistencia enviada a {destinatario}',
            'solicitud': solicitud_asistencia,
            'destinatario': destinatario,
            'prioridad': prioridad,
            'tiempo_estimado_respuesta': '5 minutos' if prioridad == 'urgente' else '15 minutos',
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def finalizar_visita(request):
    """Endpoint para finalizar visita anticipadamente"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'visitante':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener visita actual
        try:
            visita_actual = Visitante.objects.filter(
                Q(documento=user.phone) | Q(telefono=user.phone),
                fecha_visita=timezone.now().date()
            ).latest('created_at')
        except Visitante.DoesNotExist:
            return Response({'error': 'No se encontró una visita activa'}, status=status.HTTP_404_NOT_FOUND)
        
        # Registrar salida anticipada
        ahora = timezone.now()
        
        # Crear registro de acceso de salida
        acceso_salida = Acceso.objects.create(
            usuario=user,
            tipo='salida',
            metodo='manual',
            puerta='Salida Visitante',
            detalle=f"Salida anticipada - Visitante: {visita_actual.nombre}"
        )
        
        # Actualizar hora de salida real (opcional, dependiendo de los requisitos)
        # visita_actual.hora_salida_real = ahora.time()
        # visita_actual.save()
        
        return Response({
            'message': 'Visita finalizada exitosamente',
            'visitante': visita_actual.nombre,
            'hora_salida': ahora.time().isoformat()[:5],
            'duracion_real': str(ahora - timezone.make_aware(datetime.combine(visita_actual.fecha_visita, visita_actual.hora_entrada))),
            'acceso_id': acceso_salida.id,
            'timestamp': ahora.isoformat()
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)