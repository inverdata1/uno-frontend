# Arquitectura Backend - UNO Delivery

## Overview del Backend

El backend está construido con **FastAPI** y diseñado para manejar la complejidad del sistema multi-roles con alta performance y escalabilidad.

### Technology Stack

```python
┌─────────────────────────────────────────┐
│             BACKEND STACK               │
├─────────────────────────────────────────┤
│  FastAPI (Python 3.11+)                │
│  ├─ Modern async web framework          │
│  ├─ Automatic API documentation         │
│  └─ High performance                    │
│                                         │
│  Firebase Admin SDK                     │
│  ├─ User authentication                 │
│  ├─ Firestore database access           │
│  └─ Cloud storage                       │
│                                         │
│  Pydantic v2                           │
│  ├─ Data validation                     │
│  ├─ Serialization                       │
│  └─ Type safety                         │
│                                         │
│  Redis                                  │
│  ├─ Session management                  │
│  ├─ Caching layer                       │
│  └─ Rate limiting                       │
│                                         │
│  WebSockets                             │
│  ├─ Real-time notifications             │
│  ├─ Order status updates                │
│  └─ Role-based messaging                │
└─────────────────────────────────────────┘
```

## API Architecture

### Request Context System

```python
# core/context.py - Request context for all operations
from dataclasses import dataclass
from typing import Optional, List
from firebase_admin import auth

@dataclass
class RequestContext:
    user_id: str
    email: str
    roles: List[str]
    active_role: str
    active_business_id: Optional[str]
    active_branch_id: Optional[str]
    permissions: List[str]
    is_authenticated: bool

class ContextBuilder:
    @staticmethod
    async def from_firebase_token(token: str) -> RequestContext:
        try:
            # Verify Firebase token
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token['uid']
            email = decoded_token.get('email', '')

            # Get user from database
            user = await UserRepository.get_by_id(user_id)

            # Build permissions based on active role and business
            permissions = await PermissionService.get_user_permissions(
                user_id,
                business_id=user.role_config.get('business', {}).get('default_business_id')
            )

            return RequestContext(
                user_id=user_id,
                email=email,
                roles=user.roles,
                active_role=user.active_role,
                active_business_id=user.role_config.get('business', {}).get('default_business_id'),
                active_branch_id=user.role_config.get('business', {}).get('active_branch_id'),
                permissions=permissions,
                is_authenticated=True
            )
        except Exception as e:
            raise HTTPException(401, f"Invalid token: {str(e)}")

# Middleware to inject context
@app.middleware("http")
async def context_middleware(request: Request, call_next):
    # Extract token
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        request.state.context = None
        return await call_next(request)

    token = auth_header.split(" ")[1]
    try:
        context = await ContextBuilder.from_firebase_token(token)
        request.state.context = context
    except HTTPException:
        request.state.context = None

    return await call_next(request)
```

### API Endpoint Design

```python
# api/v1/orders.py - Context-aware endpoints
from fastapi import APIRouter, Depends, HTTPException
from core.context import RequestContext, get_context

router = APIRouter(prefix="/api/v1/orders")

@router.get("/")
async def get_orders(
    context: RequestContext = Depends(get_context),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None)
):
    """
    Get orders based on user's active role:
    - Client: Returns user's orders as customer
    - Business: Returns orders for active business
    - Delivery: Returns available/assigned deliveries
    """

    if context.active_role == "client":
        return await OrderService.get_client_orders(
            customer_id=context.user_id,
            limit=limit,
            offset=offset,
            status=status
        )

    elif context.active_role == "business":
        if not context.active_business_id:
            raise HTTPException(400, "No active business selected")

        # Check permissions
        await PermissionService.require_permission(
            context.user_id,
            "orders.view",
            business_id=context.active_business_id
        )

        return await OrderService.get_business_orders(
            business_id=context.active_business_id,
            branch_id=context.active_branch_id,
            limit=limit,
            offset=offset,
            status=status
        )

    elif context.active_role == "delivery":
        return await OrderService.get_delivery_orders(
            delivery_person_id=context.user_id,
            limit=limit,
            offset=offset
        )

    else:
        raise HTTPException(400, f"Invalid role: {context.active_role}")

@router.post("/")
async def create_order(
    order_data: CreateOrderSchema,
    context: RequestContext = Depends(get_context)
):
    """Create new order - only available in client role"""

    if context.active_role != "client":
        raise HTTPException(403, "Only clients can create orders")

    # Validate business and branch exist
    business = await BusinessRepository.get_by_id(order_data.business_id)
    if not business:
        raise HTTPException(404, "Business not found")

    branch = await BranchRepository.get_by_id(order_data.branch_id)
    if not branch or branch.business_id != order_data.business_id:
        raise HTTPException(404, "Branch not found")

    # Create order
    order = await OrderService.create_order(
        customer_id=context.user_id,
        order_data=order_data
    )

    # Send real-time notification to business
    await NotificationService.notify_new_order(
        business_id=order_data.business_id,
        order=order
    )

    return order
```

## Service Layer Architecture

### Domain Services

```python
# services/user_service.py - Multi-role user management
class UserService:
    @staticmethod
    async def switch_user_role(
        user_id: str,
        new_role: str,
        business_id: Optional[str] = None,
        branch_id: Optional[str] = None
    ) -> dict:
        """Switch user's active role with validation"""

        user = await UserRepository.get_by_id(user_id)
        if not user:
            raise HTTPException(404, "User not found")

        # Validate user has the requested role
        if new_role not in user.roles:
            raise HTTPException(403, f"User doesn't have {new_role} role")

        # Business role requires business_id
        if new_role == "business":
            if not business_id:
                raise HTTPException(400, "business_id required for business role")

            # Verify user has access to the business
            business_role = await UserBusinessRoleRepository.get_user_role(
                user_id, business_id
            )
            if not business_role or business_role.status != "active":
                raise HTTPException(403, "No access to specified business")

            # Get branches if branch_id not provided
            if not branch_id:
                branches = await BranchRepository.get_by_business_id(business_id)
                branch_id = branches[0].id if branches else None

        # Update user's active role
        update_data = {
            "active_role": new_role,
            "role_config": {
                **user.role_config,
                new_role: {
                    **(user.role_config.get(new_role, {})),
                    **({
                        "default_business_id": business_id,
                        "active_branch_id": branch_id
                    } if new_role == "business" else {})
                }
            },
            "updated_at": datetime.utcnow()
        }

        await UserRepository.update(user_id, update_data)

        # Return new context
        return {
            "active_role": new_role,
            "active_business_id": business_id,
            "active_branch_id": branch_id,
            "permissions": await PermissionService.get_user_permissions(
                user_id, business_id=business_id
            )
        }

# services/business_service.py - Multi-branch business management
class BusinessService:
    @staticmethod
    async def create_business_with_default_branch(
        owner_id: str,
        business_data: CreateBusinessSchema
    ) -> dict:
        """Create business and its default branch"""

        # Create business
        business_id = await BusinessRepository.create({
            "owner_id": owner_id,
            "business_name": business_data.business_name,
            "category": business_data.category,
            "branch_config": {
                "allow_multiple_branches": True,
                "total_branches": 1
            },
            "status": "active"
        })

        # Create default branch
        branch_id = await BranchRepository.create({
            "business_id": business_id,
            "branch_name": f"{business_data.business_name} - Principal",
            "branch_code": "MAIN-001",
            "address": business_data.address,
            "contact": business_data.contact,
            "status": "active"
        })

        # Update business with default branch
        await BusinessRepository.update(business_id, {
            "branch_config.default_branch_id": branch_id
        })

        # Create owner role
        await UserBusinessRoleRepository.create({
            "user_id": owner_id,
            "business_id": business_id,
            "role": "owner",
            "permissions": OWNER_PERMISSIONS,
            "status": "active"
        })

        # Update user roles
        user = await UserRepository.get_by_id(owner_id)
        new_roles = list(set(user.roles + ["business"]))

        await UserRepository.update(owner_id, {
            "roles": new_roles,
            "role_config.business": {
                "default_business_id": business_id,
                "active_branch_id": branch_id
            }
        })

        return {
            "business_id": business_id,
            "branch_id": branch_id,
            "message": "Business created successfully"
        }

# services/permission_service.py - RBAC implementation
class PermissionService:
    @staticmethod
    async def get_user_permissions(
        user_id: str,
        business_id: Optional[str] = None
    ) -> List[str]:
        """Get all permissions for user in given context"""

        user = await UserRepository.get_by_id(user_id)
        if not user:
            return []

        # System-level permissions based on roles
        system_permissions = []
        for role in user.roles:
            system_permissions.extend(SYSTEM_ROLE_PERMISSIONS.get(role, []))

        # Business-specific permissions
        business_permissions = []
        if business_id:
            user_business_role = await UserBusinessRoleRepository.get_user_role(
                user_id, business_id
            )
            if user_business_role and user_business_role.status == "active":
                business_permissions.extend(
                    BUSINESS_ROLE_PERMISSIONS.get(user_business_role.role, [])
                )
                business_permissions.extend(user_business_role.permissions or [])

        return list(set(system_permissions + business_permissions))

    @staticmethod
    async def check_permission(
        user_id: str,
        permission: str,
        business_id: Optional[str] = None
    ) -> bool:
        """Check if user has specific permission"""
        permissions = await PermissionService.get_user_permissions(
            user_id, business_id
        )
        return permission in permissions

    @staticmethod
    async def require_permission(
        user_id: str,
        permission: str,
        business_id: Optional[str] = None
    ):
        """Require permission or raise 403"""
        has_permission = await PermissionService.check_permission(
            user_id, permission, business_id
        )
        if not has_permission:
            raise HTTPException(403, f"Missing permission: {permission}")
```

## Real-time System

### WebSocket Management

```python
# websocket/connection_manager.py
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str, context: RequestContext):
        await websocket.accept()
        self.active_connections[user_id] = websocket

        # Subscribe to role-based channels
        await self.subscribe_user_to_channels(user_id, context)

    async def subscribe_user_to_channels(self, user_id: str, context: RequestContext):
        """Subscribe user to relevant channels based on their context"""
        channels = set()

        # Personal channel
        channels.add(f"user:{user_id}")

        # Role-based channels
        if context.active_role == "business" and context.active_business_id:
            channels.add(f"business:{context.active_business_id}")

            if context.active_branch_id:
                channels.add(f"branch:{context.active_branch_id}")

        elif context.active_role == "delivery":
            channels.add("delivery:available_orders")

        self.user_subscriptions[user_id] = channels

    async def broadcast_to_business(self, business_id: str, message: dict):
        """Send message to all users subscribed to business"""
        channel = f"business:{business_id}"

        for user_id, subscriptions in self.user_subscriptions.items():
            if channel in subscriptions and user_id in self.active_connections:
                websocket = self.active_connections[user_id]
                try:
                    await websocket.send_json(message)
                except ConnectionClosedOK:
                    # Clean up closed connections
                    await self.disconnect(user_id)

    async def notify_order_status_change(self, order: dict):
        """Notify relevant parties about order status change"""
        # Notify customer
        await self.send_to_user(order["customer_id"], {
            "type": "ORDER_STATUS_CHANGED",
            "order_id": order["id"],
            "status": order["status"],
            "message": f"Tu pedido está {ORDER_STATUS_MESSAGES[order['status']]}"
        })

        # Notify business
        await self.broadcast_to_business(order["business_id"], {
            "type": "ORDER_STATUS_CHANGED",
            "order_id": order["id"],
            "status": order["status"]
        })

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    connection_manager: ConnectionManager = Depends(get_connection_manager)
):
    try:
        # Authenticate user
        context = await ContextBuilder.from_firebase_token(token)

        # Connect and manage subscription
        await connection_manager.connect(websocket, context.user_id, context)

        # Keep connection alive and handle messages
        while True:
            try:
                # Wait for messages from client
                message = await websocket.receive_json()
                await handle_websocket_message(context.user_id, message, connection_manager)
            except WebSocketDisconnect:
                break

    except Exception as e:
        await websocket.close(code=1008, reason=str(e))
    finally:
        await connection_manager.disconnect(context.user_id)
```

## Data Repository Layer

### Repository Pattern Implementation

```python
# repositories/base_repository.py
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from firebase_admin import firestore

class BaseRepository(ABC):
    def __init__(self, collection_name: str):
        self.db = firestore.client()
        self.collection = self.db.collection(collection_name)

    async def get_by_id(self, doc_id: str) -> Optional[Dict]:
        doc = self.collection.document(doc_id).get()
        return doc.to_dict() if doc.exists else None

    async def create(self, data: Dict) -> str:
        doc_ref = self.collection.document()
        doc_ref.set({
            **data,
            "id": doc_ref.id,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        return doc_ref.id

    async def update(self, doc_id: str, data: Dict) -> bool:
        try:
            self.collection.document(doc_id).update({
                **data,
                "updated_at": firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception:
            return False

# repositories/order_repository.py - Context-aware queries
class OrderRepository(BaseRepository):
    def __init__(self):
        super().__init__("Orders")

    async def get_client_orders(
        self,
        customer_id: str,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict]:
        """Get orders for a client"""
        query = self.collection.where("customer_id", "==", customer_id)

        if status:
            query = query.where("status", "==", status)

        query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
        query = query.limit(limit).offset(offset)

        docs = query.get()
        return [doc.to_dict() for doc in docs]

    async def get_business_orders(
        self,
        business_id: str,
        branch_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict]:
        """Get orders for a business, optionally filtered by branch"""
        query = self.collection.where("business_id", "==", business_id)

        if branch_id:
            query = query.where("branch_id", "==", branch_id)

        if status:
            query = query.where("status", "==", status)

        query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
        query = query.limit(limit).offset(offset)

        docs = query.get()
        return [doc.to_dict() for doc in docs]
```

## Caching Strategy

### Redis Integration

```python
# cache/redis_client.py
import redis.asyncio as redis
from typing import Any, Optional
import json
from datetime import timedelta

class CacheClient:
    def __init__(self):
        self.redis = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )

    async def get(self, key: str) -> Optional[Any]:
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set(
        self,
        key: str,
        value: Any,
        expire: Optional[timedelta] = None
    ):
        data = json.dumps(value, default=str)
        await self.redis.set(key, data, ex=expire)

    async def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching pattern"""
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)

# Caching decorators
def cache_result(key_prefix: str, expire_minutes: int = 5):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Build cache key from function args
            cache_key = f"{key_prefix}:{hash(str(args) + str(kwargs))}"

            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result:
                return cached_result

            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(
                cache_key,
                result,
                expire=timedelta(minutes=expire_minutes)
            )

            return result
        return wrapper
    return decorator

# Usage in services
@cache_result("business_products", expire_minutes=10)
async def get_business_products(business_id: str, branch_id: str):
    return await ProductRepository.get_by_business_and_branch(
        business_id, branch_id
    )
```

Esta arquitectura backend proporciona una base sólida y escalable para el sistema multi-roles, con énfasis en performance, seguridad y mantenibilidad.