from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Q
from .models import (
    TemporaryUser, Acceso, Visitante, DispositivoAcceso, 
    EventoIoT, Incidencia
)

@api_view(['GET'])
def guardia_dashboard_data(request):
    """Endpoint para datos del dashboard de guardia"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'guardia':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Estadísticas del turno actual (últimas 8 horas)
        turno_inicio = timezone.now() - timedelta(hours=8)
        
        # Accesos durante el turno
        accesos_turno = Acceso.objects.filter(
            fecha_hora__gte=turno_inicio
        ).count()
        
        # Visitantes registrados
        visitantes_turno = Visitante.objects.filter(
            created_at__gte=turno_inicio
        ).count()
        
        # Alertas activas
        alertas_activas = EventoIoT.objects.filter(
            fecha_hora__gte=timezone.now() - timedelta(hours=1),
            tipo='seguridad'
        ).count()
        
        # Estado de dispositivos
        dispositivos_totales = DispositivoAcceso.objects.count()
        dispositivos_activos = DispositivoAcceso.objects.filter(estado='activo').count()
        
        estadisticas_turno = {
            'accesos_registrados': accesos_turno,
            'visitantes_registrados': visitantes_turno,
            'alertas_activas': alertas_activas,
            'dispositivos_activos': f'{dispositivos_activos}/{dispositivos_totales}',
            'inicio_turno': turno_inicio.isoformat()
        }
        
        # Accesos recientes (últimos 30 minutos)
        accesos_recientes = Acceso.objects.filter(
            fecha_hora__gte=timezone.now() - timedelta(minutes=30)
        ).order_by('-fecha_hora')[:10]
        
        accesos_data = []
        for acceso in accesos_recientes:
            accesos_data.append({
                'usuario': acceso.usuario.get_full_name(),
                'tipo_usuario': acceso.usuario.role,
                'tipo_acceso': acceso.tipo,
                'metodo': acceso.metodo,
                'puerta': acceso.puerta,
                'fecha_hora': acceso.fecha_hora.isoformat(),
                'detalle': acceso.detalle
            })
        
        # Alertas de seguridad recientes
        alertas_recientes = EventoIoT.objects.filter(
            tipo='seguridad',
            fecha_hora__gte=timezone.now() - timedelta(hours=24)
        ).order_by('-fecha_hora')[:10]
        
        alertas_data = []
        for alerta in alertas_recientes:
            alertas_data.append({
                'dispositivo': alerta.dispositivo,
                'mensaje': alerta.mensaje,
                'fecha_hora': alerta.fecha_hora.isoformat(),
                'valor': float(alerta.valor) if alerta.valor else None
            })
        
        # Visitantes pendientes de registro
        visitantes_pendientes = Visitante.objects.filter(
            fecha_visita=timezone.now().date(),
            hora_entrada__lte=timezone.now().time()
        ).exclude(
            Q(acceso__fecha_hora__date=timezone.now().date())
        )[:5]
        
        visitantes_data = []
        for visitante in visitantes_pendientes:
            visitantes_data.append({
                'nombre': visitante.nombre,
                'documento': visitante.documento,
                'anfitrion': visitante.residente_anfitrion.usuario.get_full_name(),
                'departamento': visitante.residente_anfitrion.departamento.numero,
                'hora_esperada': visitante.hora_entrada.isoformat()[:5],
                'estado': 'pendiente'
            })
        
        # Rondas programadas para hoy
        rondas_hoy = [
            {
                'ronda': 'Ronda matutina',
                'hora': '08:00',
                'estado': 'completada',
                'responsable': user.get_full_name()
            },
            {
                'ronda': 'Ronda vespertina', 
                'hora': '14:00',
                'estado': 'pendiente',
                'responsable': user.get_full_name()
            },
            {
                'ronda': 'Ronda nocturna',
                'hora': '22:00',
                'estado': 'pendiente',
                'responsable': user.get_full_name()
            }
        ]
        
        dashboard_data = {
            'estadisticas_turno': estadisticas_turno,
            'accesos_recientes': accesos_data,
            'alertas_recientes': alertas_data,
            'visitantes_pendientes': visitantes_data,
            'rondas_programadas': rondas_hoy,
            'timestamp': timezone.now().isoformat()
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def registrar_acceso_manual(request):
    """Endpoint para registro manual de accesos"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'guardia':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        nombre = request.data.get('nombre')
        documento = request.data.get('documento')
        tipo_acceso = request.data.get('tipo', 'entrada')
        puerta = request.data.get('puerta', 'Manual')
        detalle = request.data.get('detalle', '')
        
        if not nombre or not documento:
            return Response({'error': 'Nombre y documento son requeridos'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear acceso manual
        acceso = Acceso.objects.create(
            usuario=user,  # El guardia como usuario registrante
            tipo=tipo_acceso,
            metodo='manual',
            puerta=puerta,
            detalle=f"Registro manual: {nombre} - {documento}. {detalle}"
        )
        
        return Response({
            'message': 'Acceso registrado exitosamente',
            'acceso_id': acceso.id,
            'timestamp': acceso.fecha_hora.isoformat()
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def registrar_incidente(request):
    """Endpoint para registro de incidentes de seguridad"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'guardia':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        titulo = request.data.get('titulo')
        descripcion = request.data.get('descripcion')
        ubicacion = request.data.get('ubicacion')
        gravedad = request.data.get('gravedad', 'media')
        
        if not titulo or not descripcion:
            return Response({'error': 'Título y descripción son requeridos'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear incidencia de seguridad
        incidencia = Incidencia.objects.create(
            residente=None,  # Incidencia del sistema, no asociada a residente
            titulo=f"[SEGURIDAD] {titulo}",
            descripcion=f"Ubicación: {ubicacion}\nReportado por: {user.get_full_name()}\n\n{descripcion}",
            prioridad=gravedad,
            estado='reportada'
        )
        
        # Crear evento IoT asociado
        evento = EventoIoT.objects.create(
            dispositivo='Sistema de Guardia',
            tipo='seguridad',
            mensaje=f'Incidente reportado: {titulo}',
            valor=None
        )
        
        return Response({
            'message': 'Incidente registrado exitosamente',
            'incidente_id': incidencia.id,
            'numero_reporte': f'INC-{incidencia.id:04d}',
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def estado_dispositivos(request):
    """Estado de todos los dispositivos de seguridad"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'guardia':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        dispositivos = DispositivoAcceso.objects.all()
        
        dispositivos_data = []
        for dispositivo in dispositivos:
            # Verificar última actividad (simulada)
            ultima_actividad = Acceso.objects.filter(
                puerta=dispositivo.ubicacion
            ).order_by('-fecha_hora').first()
            
            dispositivos_data.append({
                'nombre': dispositivo.nombre,
                'ubicacion': dispositivo.ubicacion,
                'tipo': dispositivo.tipo,
                'estado': dispositivo.estado,
                'ultima_actividad': ultima_actividad.fecha_hora.isoformat() if ultima_actividad else None,
                'ultima_revision': dispositivo.ultima_revision.isoformat() if dispositivo.ultima_revision else None
            })
        
        return Response({
            'dispositivos': dispositivos_data,
            'total': len(dispositivos_data),
            'activos': len([d for d in dispositivos_data if d['estado'] == 'activo']),
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)