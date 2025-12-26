"""
Service for managing webhooks and delivering events.
"""
import hmac
import hashlib
import time
import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
import httpx
import asyncio
from app.models.webhook import Webhook, WebhookDelivery
from app.schemas.webhook import WebhookCreate, WebhookUpdate


class WebhookService:
    """Service for webhook operations."""
    
    @staticmethod
    def create_webhook(db: Session, webhook_data: WebhookCreate, user_id: int) -> Webhook:
        """Create a new webhook configuration."""
        webhook = Webhook(
            name=webhook_data.name,
            url=webhook_data.url,
            secret=webhook_data.secret,
            events=webhook_data.events,
            headers=webhook_data.headers,
            retry_count=webhook_data.retry_count,
            timeout_seconds=webhook_data.timeout_seconds,
            created_by=user_id
        )
        
        db.add(webhook)
        db.commit()
        db.refresh(webhook)
        return webhook
    
    @staticmethod
    def get_webhooks(
        db: Session,
        user_id: Optional[int] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Webhook], int]:
        """Get webhooks with optional filters."""
        query = db.query(Webhook)
        
        if user_id is not None:
            query = query.filter(Webhook.created_by == user_id)
        
        if is_active is not None:
            query = query.filter(Webhook.is_active == is_active)
        
        total = query.count()
        webhooks = query.order_by(desc(Webhook.created_at)).offset(skip).limit(limit).all()
        
        return webhooks, total
    
    @staticmethod
    def get_webhook_by_id(db: Session, webhook_id: int) -> Optional[Webhook]:
        """Get a webhook by ID."""
        return db.query(Webhook).filter(Webhook.id == webhook_id).first()
    
    @staticmethod
    def update_webhook(
        db: Session,
        webhook_id: int,
        webhook_data: WebhookUpdate
    ) -> Optional[Webhook]:
        """Update a webhook configuration."""
        webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
        if not webhook:
            return None
        
        update_data = webhook_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(webhook, field, value)
        
        db.commit()
        db.refresh(webhook)
        return webhook
    
    @staticmethod
    def delete_webhook(db: Session, webhook_id: int) -> bool:
        """Delete a webhook."""
        webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
        if not webhook:
            return False
        
        db.delete(webhook)
        db.commit()
        return True
    
    @staticmethod
    async def trigger_webhooks(
        db: Session,
        event_type: str,
        payload: Dict[str, Any]
    ) -> int:
        """Trigger all active webhooks for a given event type."""
        # Get all active webhooks that listen to this event
        # Using .any() instead of .contains() for JSON array compatibility
        from sqlalchemy import func, cast
        from sqlalchemy.dialects.postgresql import JSONB
        
        webhooks = db.query(Webhook).filter(
            Webhook.is_active == True,
            func.jsonb_contains(
                cast(Webhook.events, JSONB),
                cast([event_type], JSONB)
            )
        ).all()
        
        triggered_count = 0
        for webhook in webhooks:
            try:
                await WebhookService._deliver_webhook(db, webhook, event_type, payload)
                triggered_count += 1
            except Exception as e:
                print(f"Error triggering webhook {webhook.id}: {str(e)}")
        
        return triggered_count
    
    @staticmethod
    async def _deliver_webhook(
        db: Session,
        webhook: Webhook,
        event_type: str,
        payload: Dict[str, Any],
        attempt_number: int = 1
    ) -> WebhookDelivery:
        """Deliver a webhook event with retry logic."""
        start_time = time.time()
        
        # Prepare headers
        headers = webhook.headers or {}
        headers['Content-Type'] = 'application/json'
        headers['User-Agent'] = 'DiagnosticCodeAssistant-Webhook/1.0'
        headers['X-Webhook-Event'] = event_type
        headers['X-Webhook-Delivery'] = str(time.time())
        
        # Add HMAC signature if secret is configured
        if webhook.secret:
            payload_bytes = json.dumps(payload, sort_keys=True).encode()
            signature = hmac.new(
                webhook.secret.encode(),
                payload_bytes,
                hashlib.sha256
            ).hexdigest()
            headers['X-Webhook-Signature'] = f'sha256={signature}'
        
        # Create delivery record
        delivery = WebhookDelivery(
            webhook_id=webhook.id,
            event_type=event_type,
            payload=payload,
            attempt_number=attempt_number
        )
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    webhook.url,
                    json=payload,
                    headers=headers,
                    timeout=webhook.timeout_seconds
                )
                
                duration_ms = int((time.time() - start_time) * 1000)
                
                delivery.status_code = response.status_code
                delivery.response_body = response.text[:1000]  # Limit to 1000 chars
                delivery.duration_ms = duration_ms
                delivery.is_success = response.status_code < 400
                delivery.delivered_at = datetime.utcnow()
                
                # Update webhook statistics
                webhook.total_triggers += 1
                webhook.last_triggered_at = datetime.utcnow()
                webhook.last_status_code = response.status_code
                
                if not delivery.is_success:
                    webhook.failed_triggers += 1
                    
                    # Retry if configured and attempts remain
                    if attempt_number < webhook.retry_count:
                        await asyncio.sleep(2 ** attempt_number)  # Exponential backoff
                        return await WebhookService._deliver_webhook(
                            db, webhook, event_type, payload, attempt_number + 1
                        )
                
        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            delivery.error_message = str(e)[:500]
            delivery.duration_ms = duration_ms
            delivery.is_success = False
            
            webhook.total_triggers += 1
            webhook.failed_triggers += 1
            webhook.last_triggered_at = datetime.utcnow()
            
            # Retry on exception
            if attempt_number < webhook.retry_count:
                await asyncio.sleep(2 ** attempt_number)
                return await WebhookService._deliver_webhook(
                    db, webhook, event_type, payload, attempt_number + 1
                )
        
        db.add(delivery)
        db.commit()
        db.refresh(delivery)
        
        return delivery
    
    @staticmethod
    def get_deliveries(
        db: Session,
        webhook_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[WebhookDelivery], int, int, int]:
        """Get delivery history for a webhook."""
        query = db.query(WebhookDelivery).filter(
            WebhookDelivery.webhook_id == webhook_id
        ).order_by(desc(WebhookDelivery.created_at))
        
        total = query.count()
        success_count = query.filter(WebhookDelivery.is_success == True).count()
        failure_count = query.filter(WebhookDelivery.is_success == False).count()
        
        deliveries = query.offset(skip).limit(limit).all()
        
        return deliveries, total, success_count, failure_count


from datetime import datetime
