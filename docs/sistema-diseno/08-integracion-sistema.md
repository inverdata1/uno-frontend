# 08 - Integración del Sistema

## Overview de Integración

> ⚠️ **CÓDIGO LEGACY**: Este documento contiene ejemplos con `role_switch` endpoints y sistema de roles legacy.
>
> **Nueva implementación**: Ver **[09 - Sistema de Modos de Usuario](./09-sistema-modos-usuario.md)** para APIs context-aware con sistema de modos de usuario.

El sistema de integración maneja la comunicación entre frontend y backend, sincronización de datos, flujos de trabajo complejos y coordinación entre diferentes servicios y modos de usuario. Incluye context-aware API calls y persistent state management.

### Arquitectura de Integración

```javascript
┌─────────────────────────────────────────────────────────────┐
│                 SYSTEM INTEGRATION LAYER                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   API       │ │ WEBSOCKET   │ │ BACKGROUND  │           │
│  │   LAYER     │ │  REAL-TIME  │ │   TASKS     │           │
│  │             │ │             │ │             │           │
│  │ • REST      │ │ • Orders    │ │ • Emails    │           │
│  │ • GraphQL   │ │ • Status    │ │ • Reports   │           │
│  │ • Auth      │ │ • Chat      │ │ • Analytics │           │
│  │ • CRUD      │ │ • Location  │ │ • Cleanup   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                             │                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ PAYMENT     │ │ NOTIFICATION│ │  EXTERNAL   │           │
│  │ GATEWAY     │ │   SYSTEM    │ │ SERVICES    │           │
│  │             │ │             │ │             │           │
│  │ • Stripe    │ │ • Push      │ │ • Maps      │           │
│  │ • PayPal    │ │ • SMS       │ │ • Storage   │           │
│  │ • Local     │ │ • Email     │ │ • Analytics │           │
│  │ • Crypto    │ │ • In-App    │ │ • Monitoring│           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## API Architecture

### RESTful API Design

```python
# backend/api/routes/business.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List

router = APIRouter(prefix="/api/v1/business", tags=["business"])

@router.get("/{business_id}/orders")
async def get_business_orders(
    business_id: str,
    status: Optional[str] = Query(None),
    branch_id: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    cursor: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    permissions: dict = Depends(check_business_permissions)
):
    """Get orders for a business with pagination and filtering."""

    # Check business access permissions
    if not permissions.get('view_orders'):
        raise HTTPException(403, "Insufficient permissions")

    # Build query filters
    filters = {
        'businessId': business_id,
        'status': status,
        'branchId': branch_id
    }

    # Execute paginated query
    result = await OrderService.get_business_orders(
        filters=filters,
        limit=limit,
        cursor=cursor
    )

    return {
        'orders': result.orders,
        'pagination': {
            'hasMore': result.has_more,
            'nextCursor': result.next_cursor,
            'total': result.total
        }
    }

@router.post("/{business_id}/orders/{order_id}/status")
async def update_order_status(
    business_id: str,
    order_id: str,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    permissions: dict = Depends(check_business_permissions)
):
    """Update order status with business context."""

    if not permissions.get('update_order_status'):
        raise HTTPException(403, "Cannot update order status")

    # Validate status transition
    current_order = await OrderService.get_order(order_id)
    if not OrderService.is_valid_status_transition(
        current_order.status,
        status_update.status
    ):
        raise HTTPException(400, "Invalid status transition")

    # Update order with audit trail
    updated_order = await OrderService.update_order_status(
        order_id=order_id,
        new_status=status_update.status,
        updated_by=current_user.id,
        notes=status_update.notes
    )

    # Send real-time notifications
    await NotificationService.send_order_status_update(
        order=updated_order,
        business_id=business_id
    )

    return {'order': updated_order}

# Role switching endpoint
@router.post("/switch-role")
async def switch_role(
    role_switch: RoleSwitchRequest,
    current_user: User = Depends(get_current_user)
):
    """Switch user's active role with validation."""

    # Validate user has access to requested role
    if not await UserService.has_role(current_user.id, role_switch.role):
        raise HTTPException(403, "User doesn't have access to this role")

    # Validate business context if switching to business role
    if role_switch.role == 'business':
        if not role_switch.business_id:
            raise HTTPException(400, "Business ID required for business role")

        # Check business access
        business_access = await BusinessService.get_user_business_access(
            user_id=current_user.id,
            business_id=role_switch.business_id
        )

        if not business_access:
            raise HTTPException(403, "No access to specified business")

    # Update user's active role
    updated_user = await UserService.switch_role(
        user_id=current_user.id,
        new_role=role_switch.role,
        business_id=role_switch.business_id,
        branch_id=role_switch.branch_id
    )

    # Generate new JWT with role context
    access_token = create_access_token(
        data={
            "sub": updated_user.id,
            "role": role_switch.role,
            "business_id": role_switch.business_id,
            "branch_id": role_switch.branch_id
        }
    )

    return {
        'user': updated_user,
        'access_token': access_token,
        'context': {
            'role': role_switch.role,
            'business_id': role_switch.business_id,
            'branch_id': role_switch.branch_id
        }
    }
```

### GraphQL for Complex Queries

```python
# backend/graphql/schema.py
import strawberry
from typing import List, Optional

@strawberry.type
class Business:
    id: str
    name: str
    category: str
    rating: float
    is_open: bool
    distance: Optional[float] = None

@strawberry.type
class Product:
    id: str
    name: str
    description: str
    price: float
    is_available: bool
    customizations: List['ProductCustomization']

@strawberry.type
class Order:
    id: str
    order_number: str
    status: str
    total: float
    items: List['OrderItem']
    customer: 'User'
    business: 'Business'

@strawberry.type
class Query:
    @strawberry.field
    async def business_dashboard(
        self,
        business_id: str,
        info: strawberry.Info
    ) -> 'BusinessDashboard':
        """Get complete business dashboard data in a single query."""

        # Check permissions
        current_user = info.context["user"]
        permissions = await check_business_permissions(current_user, business_id)

        # Parallel data fetching
        orders_task = get_recent_orders(business_id, limit=10)
        metrics_task = get_business_metrics(business_id)
        products_task = get_top_products(business_id)

        orders, metrics, products = await asyncio.gather(
            orders_task, metrics_task, products_task
        )

        return BusinessDashboard(
            recent_orders=orders,
            metrics=metrics,
            top_products=products
        )

    @strawberry.field
    async def nearby_businesses(
        self,
        latitude: float,
        longitude: float,
        radius: float = 10.0,
        category: Optional[str] = None,
        limit: int = 20
    ) -> List[Business]:
        """Find businesses near user location."""

        return await BusinessService.find_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            category=category,
            limit=limit
        )

# GraphQL client integration
# shared/api/graphql-client.js
import { GraphQLClient } from 'graphql-request';

const endpoint = `${API_URL}/graphql`;

export const createGraphQLClient = (token) => {
  return new GraphQLClient(endpoint, {
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });
};

// GraphQL queries
export const BUSINESS_DASHBOARD_QUERY = gql`
  query BusinessDashboard($businessId: String!) {
    businessDashboard(businessId: $businessId) {
      recentOrders {
        id
        orderNumber
        status
        total
        customer {
          name
          phone
        }
        createdAt
      }
      metrics {
        todayOrders
        todayRevenue
        averageOrderValue
        pendingOrders
      }
      topProducts {
        id
        name
        orderCount
        revenue
      }
    }
  }
`;

// Hook for GraphQL queries
export const useBusinessDashboard = (businessId) => {
  const { session } = useAuthStore();
  const client = createGraphQLClient(session?.access_token);

  return useQuery({
    queryKey: ['businessDashboard', businessId],
    queryFn: async () => {
      return await client.request(BUSINESS_DASHBOARD_QUERY, { businessId });
    },
    enabled: Boolean(businessId && session),
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};
```

## Real-time Communication

### WebSocket Integration

```python
# backend/websocket/connection_manager.py
from fastapi import WebSocket
from typing import Dict, List, Set
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # User connections: user_id -> List[WebSocket]
        self.user_connections: Dict[str, List[WebSocket]] = {}

        # Business connections: business_id -> List[WebSocket]
        self.business_connections: Dict[str, List[WebSocket]] = {}

        # Role-based connections
        self.role_connections: Dict[str, Set[WebSocket]] = {
            'client': set(),
            'business': set(),
            'delivery': set()
        }

    async def connect(self, websocket: WebSocket, user_id: str, role: str, business_id: str = None):
        await websocket.accept()

        # Add to user connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

        # Add to role connections
        self.role_connections[role].add(websocket)

        # Add to business connections if business role
        if role == 'business' and business_id:
            if business_id not in self.business_connections:
                self.business_connections[business_id] = []
            self.business_connections[business_id].append(websocket)

        # Send connection confirmation
        await self.send_personal_message({
            'type': 'CONNECTION_ESTABLISHED',
            'role': role,
            'business_id': business_id
        }, websocket)

    async def disconnect(self, websocket: WebSocket, user_id: str, role: str, business_id: str = None):
        # Remove from all connection lists
        if user_id in self.user_connections:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

        self.role_connections[role].discard(websocket)

        if business_id and business_id in self.business_connections:
            self.business_connections[business_id].remove(websocket)
            if not self.business_connections[business_id]:
                del self.business_connections[business_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except:
            # Connection closed, remove it
            pass

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            for websocket in self.user_connections[user_id]:
                await self.send_personal_message(message, websocket)

    async def send_to_business(self, business_id: str, message: dict):
        if business_id in self.business_connections:
            for websocket in self.business_connections[business_id]:
                await self.send_personal_message(message, websocket)

    async def send_to_role(self, role: str, message: dict):
        for websocket in self.role_connections[role]:
            await self.send_personal_message(message, websocket)

    async def broadcast_order_update(self, order: dict):
        """Broadcast order updates to relevant parties."""

        # Send to customer
        await self.send_to_user(order['customerId'], {
            'type': 'ORDER_STATUS_UPDATED',
            'order': order
        })

        # Send to business
        await self.send_to_business(order['businessId'], {
            'type': 'ORDER_STATUS_UPDATED',
            'order': order
        })

        # Send to delivery driver if assigned
        if order.get('deliveryDriverId'):
            await self.send_to_user(order['deliveryDriverId'], {
                'type': 'DELIVERY_ORDER_UPDATED',
                'order': order
            })

connection_manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    role: str = Query(...),
    business_id: str = Query(None)
):
    await connection_manager.connect(websocket, user_id, role, business_id)

    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle different message types
            if message['type'] == 'PING':
                await connection_manager.send_personal_message({
                    'type': 'PONG'
                }, websocket)

            elif message['type'] == 'LOCATION_UPDATE':
                # Handle location updates for delivery drivers
                await handle_location_update(user_id, message['data'])

    except:
        await connection_manager.disconnect(websocket, user_id, role, business_id)
```

### Frontend WebSocket Integration

```javascript
// shared/hooks/use-websocket.js
import { useRef, useEffect, useCallback } from 'react';

export const useWebSocket = () => {
  const { user, session } = useAuthStore();
  const { activeRole, activeBusiness } = useRoleStore();
  const websocketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const queryClient = useQueryClient();

  const connect = useCallback(() => {
    if (!user || !session) return;

    const wsUrl = new URL(`${WS_URL}/ws/${user.id}`);
    wsUrl.searchParams.set('role', activeRole);
    if (activeBusiness) {
      wsUrl.searchParams.set('business_id', activeBusiness);
    }

    const websocket = new WebSocket(wsUrl.toString());

    websocket.onopen = () => {
      console.log('WebSocket connected');
      websocketRef.current = websocket;

      // Clear reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      websocketRef.current = null;

      // Attempt reconnection after delay
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [user, session, activeRole, activeBusiness]);

  const handleWebSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'CONNECTION_ESTABLISHED':
        console.log('WebSocket connection established');
        break;

      case 'ORDER_STATUS_UPDATED':
        // Invalidate order queries
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Show notification based on role
        if (activeRole === 'client') {
          showNotification({
            title: 'Order Update',
            body: `Order ${message.order.orderNumber} is ${message.order.status}`,
            data: { orderId: message.order.id }
          });
        } else if (activeRole === 'business') {
          showNotification({
            title: 'New Order Update',
            body: `Order ${message.order.orderNumber} requires attention`,
            data: { orderId: message.order.id }
          });
        }
        break;

      case 'NEW_ORDER':
        if (activeRole === 'business') {
          // Invalidate business orders
          queryClient.invalidateQueries({
            queryKey: ['orders', 'business', activeBusiness]
          });

          // Show urgent notification
          showNotification({
            title: 'New Order!',
            body: `Order ${message.order.orderNumber} - $${message.order.total}`,
            data: { orderId: message.order.id },
            urgent: true
          });

          // Play notification sound
          playNotificationSound();
        }
        break;

      case 'ROLE_PERMISSIONS_CHANGED':
        // Refresh user permissions
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
        break;

      case 'BUSINESS_METRICS_UPDATED':
        if (activeRole === 'business' && message.businessId === activeBusiness) {
          queryClient.invalidateQueries({
            queryKey: ['business', 'metrics', activeBusiness]
          });
        }
        break;

      default:
        console.log('Unknown WebSocket message:', message);
    }
  }, [activeRole, activeBusiness, queryClient]);

  const sendMessage = useCallback((message) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Connect on mount and role/business changes
  useEffect(() => {
    connect();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { sendMessage };
};
```

## Background Task Processing

### Celery Task Queue

```python
# backend/tasks/celery_app.py
from celery import Celery
import os

celery_app = Celery(
    'uno_delivery',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379'),
    include=['tasks.email', 'tasks.analytics', 'tasks.notifications']
)

# Task configurations
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Caracas',
    enable_utc=True,

    # Task routing
    task_routes={
        'tasks.email.send_email': {'queue': 'emails'},
        'tasks.analytics.*': {'queue': 'analytics'},
        'tasks.notifications.*': {'queue': 'notifications'},
    },

    # Retry policies
    task_acks_late=True,
    worker_prefetch_multiplier=1,

    # Periodic tasks
    beat_schedule={
        'aggregate-daily-metrics': {
            'task': 'tasks.analytics.aggregate_daily_metrics',
            'schedule': crontab(hour=1, minute=0),  # Run at 1 AM daily
        },
        'send-order-reminders': {
            'task': 'tasks.notifications.send_order_reminders',
            'schedule': 300.0,  # Every 5 minutes
        },
    },
)

# Email tasks
@celery_app.task(bind=True, max_retries=3)
def send_order_confirmation_email(self, order_id: str):
    try:
        order = await OrderService.get_order(order_id)
        customer = await UserService.get_user(order.customer_id)

        email_content = render_template('order_confirmation.html', {
            'order': order,
            'customer': customer
        })

        await EmailService.send_email(
            to=customer.email,
            subject=f"Order Confirmation - {order.order_number}",
            html_content=email_content
        )

    except Exception as exc:
        # Retry with exponential backoff
        self.retry(countdown=60 * (2 ** self.request.retries), exc=exc)

# Analytics tasks
@celery_app.task
def aggregate_daily_metrics():
    """Aggregate daily metrics for all businesses."""
    yesterday = datetime.now() - timedelta(days=1)

    # Get all active businesses
    businesses = BusinessService.get_all_active_businesses()

    for business in businesses:
        try:
            MetricsAggregationService.aggregate_daily_metrics(
                business.id, yesterday
            )
        except Exception as e:
            logger.error(f"Failed to aggregate metrics for business {business.id}: {e}")

# Notification tasks
@celery_app.task
def send_push_notification(user_id: str, title: str, body: str, data: dict = None):
    """Send push notification to user's devices."""
    try:
        user_devices = NotificationService.get_user_devices(user_id)

        for device in user_devices:
            NotificationService.send_push_to_device(
                device_token=device.token,
                title=title,
                body=body,
                data=data
            )

    except Exception as e:
        logger.error(f"Failed to send push notification to user {user_id}: {e}")
```

## External Service Integration

### Payment Processing

```python
# backend/services/payment_service.py
from abc import ABC, abstractmethod
import stripe
from paypal import PayPalClient

class PaymentProcessor(ABC):
    @abstractmethod
    async def create_payment_intent(self, amount: float, currency: str, metadata: dict):
        pass

    @abstractmethod
    async def confirm_payment(self, payment_intent_id: str):
        pass

class StripePaymentProcessor(PaymentProcessor):
    def __init__(self, api_key: str):
        stripe.api_key = api_key

    async def create_payment_intent(self, amount: float, currency: str, metadata: dict):
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Stripe uses cents
            currency=currency.lower(),
            metadata=metadata,
            capture_method='manual'  # Capture after order confirmation
        )
        return intent

    async def confirm_payment(self, payment_intent_id: str):
        intent = stripe.PaymentIntent.confirm(payment_intent_id)
        return intent

class PaymentService:
    def __init__(self):
        self.processors = {
            'stripe': StripePaymentProcessor(os.getenv('STRIPE_SECRET_KEY')),
            'paypal': PayPalPaymentProcessor(os.getenv('PAYPAL_CLIENT_ID'))
        }

    async def process_order_payment(
        self,
        order_id: str,
        payment_method: str,
        payment_data: dict
    ):
        order = await OrderService.get_order(order_id)
        processor = self.processors.get(payment_method)

        if not processor:
            raise ValueError(f"Unsupported payment method: {payment_method}")

        try:
            # Create payment intent
            payment_intent = await processor.create_payment_intent(
                amount=order.total_amount,
                currency=order.currency,
                metadata={
                    'order_id': order_id,
                    'business_id': order.business_id,
                    'customer_id': order.customer_id
                }
            )

            # Update order with payment information
            await OrderService.update_payment_info(
                order_id=order_id,
                payment_intent_id=payment_intent.id,
                payment_method=payment_method,
                status='pending'
            )

            return payment_intent

        except Exception as e:
            # Log payment failure
            await PaymentService.log_payment_failure(
                order_id=order_id,
                error=str(e),
                payment_method=payment_method
            )
            raise

    async def handle_payment_webhook(self, payload: dict, signature: str):
        """Handle payment processor webhooks."""

        # Verify webhook signature
        if not self.verify_webhook_signature(payload, signature):
            raise HTTPException(400, "Invalid webhook signature")

        event_type = payload.get('type')

        if event_type == 'payment_intent.succeeded':
            payment_intent = payload['data']['object']
            order_id = payment_intent['metadata']['order_id']

            # Update order payment status
            await OrderService.update_payment_status(
                order_id=order_id,
                status='paid',
                transaction_id=payment_intent['id']
            )

            # Send confirmation notifications
            await NotificationService.send_payment_confirmation(order_id)

        elif event_type == 'payment_intent.payment_failed':
            payment_intent = payload['data']['object']
            order_id = payment_intent['metadata']['order_id']

            await OrderService.update_payment_status(
                order_id=order_id,
                status='failed',
                error_message=payment_intent.get('last_payment_error', {}).get('message')
            )
```

### Maps and Location Services

```javascript
// shared/services/location-service.js
export class LocationService {
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  static async geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: data.results[0].formatted_address
        };
      }

      throw new Error('Address not found');
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }

  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static async getDeliveryRoute(origin, destination) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.legs[0].distance,
          duration: route.legs[0].duration,
          polyline: route.overview_polyline.points,
          steps: route.legs[0].steps
        };
      }

      throw new Error('Route not found');
    } catch (error) {
      throw new Error(`Route calculation failed: ${error.message}`);
    }
  }
}
```

Este sistema de integración asegura comunicación eficiente, procesamiento robusto de tareas en background y conectividad confiable con servicios externos.