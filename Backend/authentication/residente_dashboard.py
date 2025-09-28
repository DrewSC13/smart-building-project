from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from .models import (
    TemporaryUser, Residente, Factura, Pago, Departamento,
    ReservaArea, AreaComun, Incidencia, Consumo, Announcement
)

@api_view(['GET'])
def residente_dashboard_data(request):
    """Endpoint para datos del dashboard de residente"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'residente':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        # Obtener información del residente
        try:
            residente = Residente.objects.get(usuario=user)
            departamento = residente.departamento
        except Residente.DoesNotExist:
            return Response({'error': 'Perfil de residente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        # Información personal
        info_personal = {
            'nombre_completo': user.get_full_name(),
            'departamento': departamento.numero,
            'piso': departamento.piso,
            'torre': departamento.edificio.nombre,
            'metros_cuadrados': float(departamento.metros_cuadrados),
            'fecha_ingreso': residente.fecha_ingreso.isoformat(),
            'contrato_activo': residente.contrato_activo,
            'estado_contrato': 'Vigente' if residente.contrato_activo else 'Finalizado'
        }
        
        # Próximos vencimientos (facturas pendientes)
        vencimientos = []
        facturas_pendientes = Factura.objects.filter(
            residente=residente,
            estado='pendiente',
            fecha_vencimiento__gte=timezone.now().date()
        ).order_by('fecha_vencimiento')[:5]
        
        for factura in facturas_pendientes:
            vencimientos.append({
                'concepto': f'Factura {factura.numero}',
                'monto': float(factura.monto_total),
                'fecha_vencimiento': factura.fecha_vencimiento.isoformat(),
                'dias_restantes': (factura.fecha_vencimiento - timezone.now().date()).days
            })
        
        # Reservas activas
        reservas_activas = []
        reservas = ReservaArea.objects.filter(
            residente=residente,
            estado__in=['confirmada', 'pendiente'],
            fecha_inicio__gte=timezone.now()
        ).order_by('fecha_inicio')[:5]
        
        for reserva in reservas:
            reservas_activas.append({
                'area': reserva.area.nombre,
                'fecha': reserva.fecha_inicio.date().isoformat(),
                'hora_inicio': reserva.fecha_inicio.time().isoformat()[:5],
                'hora_fin': reserva.fecha_fin.time().isoformat()[:5],
                'estado': reserva.estado,
                'capacidad': reserva.area.capacidad
            })
        
        # Alertas personales
        alertas_personales = []
        
        # Alertas de mantenimiento programado
        mantenimientos_programados = Incidencia.objects.filter(
            residente=residente,
            estado='asignada'
        )[:3]
        
        for incidencia in mantenimientos_programados:
            alertas_personales.append({
                'tipo': 'mantenimiento',
                'mensaje': incidencia.titulo,
                'fecha': incidencia.created_at.date().isoformat(),
                'importante': incidencia.prioridad in ['alta', 'urgente']
            })
        
        # Alertas de vencimientos próximos
        vencimientos_proximos = Factura.objects.filter(
            residente=residente,
            estado='pendiente',
            fecha_vencimiento__lte=timezone.now().date() + timedelta(days=3)
        )
        
        for factura in vencimientos_proximos:
            alertas_personales.append({
                'tipo': 'pago',
                'mensaje': f'Vencimiento próximo: Factura {factura.numero}',
                'fecha': factura.fecha_vencimiento.isoformat(),
                'importante': True
            })
        
        # Consumo de servicios
        consumo_servicios = {}
        consumos_recientes = Consumo.objects.filter(
            departamento=departamento,
            periodo__month=timezone.now().month
        )
        
        for consumo in consumos_recientes:
            consumo_servicios[consumo.tipo] = {
                'consumo_actual': float(consumo.lectura_actual),
                'consumo_anterior': float(consumo.lectura_anterior),
                'unidad': 'm³' if consumo.tipo == 'agua' else 'kWh'
            }
        
        # Calcular promedios del edificio (simulado)
        for servicio in consumo_servicios:
            consumo_servicios[servicio]['promedio_vecinos'] = round(
                consumo_servicios[servicio]['consumo_actual'] * 0.85, 1
            )
        
        # Comunicaciones recientes
        comunicaciones_recientes = []
        anuncios = Announcement.objects.filter(
            is_published=True,
            publish_date__gte=timezone.now() - timedelta(days=30)
        ).order_by('-publish_date')[:5]
        
        for anuncio in anuncios:
            comunicaciones_recientes.append({
                'tipo': 'anuncio',
                'titulo': anuncio.title,
                'fecha': anuncio.publish_date.date().isoformat(),
                'contenido': anuncio.content[:100] + '...' if len(anuncio.content) > 100 else anuncio.content
            })
        
        dashboard_data = {
            'info_personal': info_personal,
            'vencimientos': vencimientos,
            'reservas_activas': reservas_activas,
            'alertas_personales': alertas_personales,
            'consumo_servicios': consumo_servicios,
            'comunicaciones_recientes': comunicaciones_recientes,
            'timestamp': timezone.now().isoformat()
        }
        
        return Response(dashboard_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def residente_finanzas(request):
    """Datos financieros detallados del residente"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'residente':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        residente = Residente.objects.get(usuario=user)
        
        # Facturas del último año
        facturas = Factura.objects.filter(
            residente=residente,
            fecha_emision__gte=timezone.now() - timedelta(days=365)
        ).order_by('-fecha_emision')
        
        facturas_data = []
        for factura in facturas:
            facturas_data.append({
                'numero': factura.numero,
                'fecha_emision': factura.fecha_emision.isoformat(),
                'fecha_vencimiento': factura.fecha_vencimiento.isoformat(),
                'monto_total': float(factura.monto_total),
                'estado': factura.estado,
                'detalles': [
                    {
                        'concepto': detalle.concepto,
                        'monto': float(detalle.monto)
                    } for detalle in factura.detallefactura_set.all()
                ]
            })
        
        # Historial de pagos
        pagos = Pago.objects.filter(
            factura__residente=residente
        ).order_by('-fecha_pago')[:20]
        
        pagos_data = []
        for pago in pagos:
            pagos_data.append({
                'fecha_pago': pago.fecha_pago.isoformat(),
                'monto': float(pago.monto),
                'metodo': pago.metodo,
                'referencia': pago.referencia,
                'factura_numero': pago.factura.numero
            })
        
        # Resumen financiero
        total_pagado = Pago.objects.filter(
            factura__residente=residente
        ).aggregate(total=Sum('monto'))['total'] or 0
        
        pendiente = Factura.objects.filter(
            residente=residente,
            estado='pendiente'
        ).aggregate(total=Sum('monto_total'))['total'] or 0
        
        resumen = {
            'total_pagado': float(total_pagado),
            'pendiente': float(pendiente),
            'facturas_totales': facturas.count(),
            'facturas_pendientes': facturas.filter(estado='pendiente').count()
        }
        
        return Response({
            'resumen': resumen,
            'facturas': facturas_data,
            'pagos': pagos_data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def reportar_problema(request):
    """Endpoint para que residentes reporten problemas"""
    try:
        user = request.user
        if not user.is_authenticated or user.role != 'residente':
            return Response({'error': 'Acceso no autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        residente = Residente.objects.get(usuario=user)
        
        titulo = request.data.get('titulo')
        descripcion = request.data.get('descripcion')
        prioridad = request.data.get('prioridad', 'media')
        
        if not titulo or not descripcion:
            return Response({'error': 'Título y descripción son requeridos'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Crear incidencia
        incidencia = Incidencia.objects.create(
            residente=residente,
            titulo=titulo,
            descripcion=descripcion,
            prioridad=prioridad,
            estado='reportada'
        )
        
        return Response({
            'message': 'Problema reportado exitosamente',
            'incidencia_id': incidencia.id,
            'numero_ticket': f'INC-{incidencia.id:04d}'
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)