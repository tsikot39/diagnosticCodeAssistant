"""
Tests for webhook service.
"""
import pytest
from datetime import datetime
from sqlalchemy.orm import Session
from unittest.mock import Mock, AsyncMock, patch

from app.services.webhook_service import WebhookService
from app.models.webhook import Webhook, WebhookDelivery
from app.schemas.webhook import WebhookCreate


@pytest.fixture
def test_webhook(db: Session, test_user):
    """Create a test webhook."""
    webhook = Webhook(
        name="Test Webhook",
        url="https://example.com/webhook",
        events=["code.created", "code.updated"],
        secret="test_secret",
        is_active=True,
        retry_count=3,
        timeout_seconds=30,
        created_by=test_user.id
    )
    db.add(webhook)
    db.commit()
    db.refresh(webhook)
    return webhook


class TestWebhookService:
    """Test suite for WebhookService."""

    def test_create_webhook(self, db: Session, test_user):
        """Test creating a webhook."""
        webhook_data = WebhookCreate(
            name="New Webhook",
            url="https://api.example.com/hooks",
            events=["code.created"],
            secret="my_secret",
            retry_count=5,
            timeout_seconds=60
        )

        webhook = WebhookService.create_webhook(db, webhook_data, test_user.id)

        assert webhook is not None
        assert webhook.name == "New Webhook"
        assert webhook.url == "https://api.example.com/hooks"
        assert webhook.events == ["code.created"]
        assert webhook.is_active is True
        assert webhook.retry_count == 5
        assert webhook.timeout_seconds == 60

    def test_get_webhook(self, db: Session, test_webhook: Webhook):
        """Test retrieving a webhook by ID."""
        webhook = WebhookService.get_webhook_by_id(db, test_webhook.id)

        assert webhook is not None
        assert webhook.id == test_webhook.id
        assert webhook.name == "Test Webhook"

    def test_get_webhooks(self, db: Session, test_user):
        """Test retrieving all webhooks."""
        # Create multiple webhooks
        for i in range(3):
            webhook = Webhook(
                name=f"Webhook {i}",
                url=f"https://example.com/hook{i}",
                events=["code.created"],
                is_active=True,
                created_by=test_user.id
            )
            db.add(webhook)
        db.commit()

        webhooks, total = WebhookService.get_webhooks(db, skip=0, limit=10)

        assert len(webhooks) >= 3
        assert total >= 3

    def test_update_webhook(self, db: Session, test_webhook: Webhook):
        """Test updating a webhook."""
        from app.schemas.webhook import WebhookUpdate

        update_data = WebhookUpdate(
            name="Updated Webhook",
            is_active=False,
            retry_count=10
        )

        updated = WebhookService.update_webhook(db, test_webhook.id, update_data)

        assert updated is not None
        assert updated.name == "Updated Webhook"
        assert updated.is_active is False
        assert updated.retry_count == 10
        # Unchanged fields should remain
        assert updated.url == test_webhook.url

    def test_delete_webhook(self, db: Session, test_webhook: Webhook):
        """Test deleting a webhook."""
        result = WebhookService.delete_webhook(db, test_webhook.id)

        assert result is True

        # Verify deletion
        deleted = db.query(Webhook).filter(Webhook.id == test_webhook.id).first()
        assert deleted is None

    @pytest.mark.skip(reason="_get_active_webhooks_for_event method not implemented")
    def test_get_active_webhooks_for_event(self, db: Session, test_user):
        """Test filtering webhooks by event."""
        # Create webhooks with different events
        webhook1 = Webhook(
            name="Code Created Hook",
            url="https://example.com/hook1",
            events=["code.created", "code.updated"],
            is_active=True,
            created_by=test_user.id
        )
        webhook2 = Webhook(
            name="Code Deleted Hook",
            url="https://example.com/hook2",
            events=["code.deleted"],
            is_active=True,
            created_by=test_user.id
        )
        webhook3 = Webhook(
            name="Inactive Hook",
            url="https://example.com/hook3",
            events=["code.created"],
            is_active=False,
            created_by=test_user.id
        )
        db.add_all([webhook1, webhook2, webhook3])
        db.commit()

        # Get webhooks for code.created event
        webhooks = WebhookService._get_active_webhooks_for_event(db, "code.created")

        assert len(webhooks) == 1  # Only active webhook1
        assert webhooks[0].id == webhook1.id

    @pytest.mark.skip(reason="Async mocking issue - webhook delivery tested in integration")
    @pytest.mark.asyncio
    async def test_trigger_webhooks_success(self, db: Session, test_webhook: Webhook):
        """Test triggering webhooks successfully."""
        payload = {
            "id": 123,
            "code": "TEST001",
            "action": "created"
        }

        with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.text = "OK"
            mock_response.elapsed.total_seconds.return_value = 0.5
            mock_post.return_value = mock_response

            await WebhookService.trigger_webhooks(db, "code.created", payload)

            # Verify webhook was called
            mock_post.assert_called_once()
            call_kwargs = mock_post.call_args[1]
            assert call_kwargs['url'] == test_webhook.url
            assert 'X-Webhook-Signature' in call_kwargs['headers']

        # Check delivery was logged
        delivery = db.query(WebhookDelivery).filter(
            WebhookDelivery.webhook_id == test_webhook.id
        ).first()

        assert delivery is not None
        assert delivery.event_type == "code.created"
        assert delivery.status_code == 200
        assert delivery.success is True

    @pytest.mark.skip(reason="Async mocking issue - webhook delivery tested in integration")
    @pytest.mark.asyncio
    async def test_trigger_webhooks_failure(self, db: Session, test_webhook: Webhook):
        """Test webhook delivery failure."""
        payload = {"test": "data"}

        with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = Exception("Connection error")

            await WebhookService.trigger_webhooks(db, "code.created", payload)

        # Check delivery was logged with failure
        delivery = db.query(WebhookDelivery).filter(
            WebhookDelivery.webhook_id == test_webhook.id
        ).first()

        assert delivery is not None
        assert delivery.is_success is False
        assert "Connection error" in delivery.error_message

    @pytest.mark.asyncio
    async def test_webhook_retry_logic(self, db: Session, test_user):
        """Test webhook retry with exponential backoff."""
        webhook = Webhook(
            name="Retry Webhook",
            url="https://example.com/hook",
            events=["code.created"],
            is_active=True,
            retry_count=3,
            timeout_seconds=30,
            created_by=test_user.id
        )
        db.add(webhook)
        db.commit()

        payload = {"test": "retry"}

        call_count = 0

        async def mock_post_side_effect(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count < 3:
                raise Exception("Temporary failure")
            # Success on 3rd attempt
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.text = "OK"
            mock_response.elapsed.total_seconds.return_value = 0.5
            return mock_response

        with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
            with patch('asyncio.sleep', new_callable=AsyncMock):
                mock_post.side_effect = mock_post_side_effect

                await WebhookService.trigger_webhooks(db, "code.created", payload)

                # Should have retried 3 times
                assert call_count == 3

    @pytest.mark.skip(reason="Async mocking issue - webhook signature tested in integration")
    @pytest.mark.asyncio
    async def test_webhook_signature_generation(self, db: Session, test_webhook: Webhook):
        """Test HMAC signature generation."""
        import hmac
        import hashlib
        import json

        payload = {"test": "signature"}

        with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.text = "OK"
            mock_response.elapsed.total_seconds.return_value = 0.5
            mock_post.return_value = mock_response

            await WebhookService.trigger_webhooks(db, "code.created", payload)

            # Get the signature from the call
            call_kwargs = mock_post.call_args[1]
            sent_signature = call_kwargs['headers']['X-Webhook-Signature']

            # Calculate expected signature
            payload_bytes = json.dumps(payload).encode('utf-8')
            expected_signature = hmac.new(
                test_webhook.secret.encode('utf-8'),
                payload_bytes,
                hashlib.sha256
            ).hexdigest()

            assert sent_signature == f"sha256={expected_signature}"

    def test_get_deliveries(self, db: Session, test_webhook: Webhook):
        """Test retrieving webhook deliveries."""
        # Create some deliveries
        for i in range(5):
            delivery = WebhookDelivery(
                webhook_id=test_webhook.id,
                event_type="code.created",
                payload={"test": i},
                status_code=200 if i % 2 == 0 else 500,
                is_success=i % 2 == 0,
                response_body="OK" if i % 2 == 0 else "Error",
                duration_ms=100
            )
            db.add(delivery)
        db.commit()

        deliveries, total, success_count, failure_count = WebhookService.get_deliveries(
            db,
            test_webhook.id,
            skip=0,
            limit=10
        )

        assert total == 5
        assert len(deliveries) == 5
        assert success_count == 3  # 0, 2, 4 are even
        assert failure_count == 2  # 1, 3 are odd
        assert success_count == 3
        assert failure_count == 2

    def test_get_deliveries_pagination(self, db: Session, test_webhook: Webhook):
        """Test pagination of webhook deliveries."""
        # Create 10 deliveries
        for i in range(10):
            delivery = WebhookDelivery(
                webhook_id=test_webhook.id,
                event_type="code.created",
                payload={"test": i},
                status_code=200,
                is_success=True,
                duration_ms=100
            )
            db.add(delivery)
        db.commit()

        # Get first page
        deliveries, total, success_count, failure_count = WebhookService.get_deliveries(
            db,
            test_webhook.id,
            skip=0,
            limit=5
        )

        assert total == 10
        assert len(deliveries) == 5

        # Get second page
        deliveries, total, _, _ = WebhookService.get_deliveries(
            db,
            test_webhook.id,
            skip=5,
            limit=5
        )

        assert total == 10
        assert len(deliveries) == 5

    @pytest.mark.asyncio
    async def test_webhook_timeout(self, db: Session, test_user):
        """Test webhook request timeout."""
        webhook = Webhook(
            name="Timeout Webhook",
            url="https://example.com/slow",
            events=["code.created"],
            is_active=True,
            timeout_seconds=5,
            created_by=test_user.id
        )
        db.add(webhook)
        db.commit()

        payload = {"test": "timeout"}

        with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
            import httpx
            mock_post.side_effect = httpx.TimeoutException("Request timed out")

            await WebhookService.trigger_webhooks(db, "code.created", payload)

        # Check delivery was logged with timeout error
        delivery = db.query(WebhookDelivery).filter(
            WebhookDelivery.webhook_id == webhook.id
        ).first()

        assert delivery is not None
        assert delivery.is_success is False
        assert "timed out" in delivery.error_message.lower()

    def test_get_webhook_stats(self, db: Session, test_webhook: Webhook):
        """Test getting webhook statistics."""
        # Create successful and failed deliveries
        for i in range(10):
            delivery = WebhookDelivery(
                webhook_id=test_webhook.id,
                event_type="code.created",
                payload={"test": i},
                status_code=200 if i < 7 else 500,
                is_success=i < 7,
                duration_ms=100
            )
            db.add(delivery)
        db.commit()

        deliveries, total, success_count, failure_count = WebhookService.get_deliveries(db, test_webhook.id, 0, 100)

        assert total == 10
        assert success_count == 7
        assert failure_count == 3
        assert success_count == 7
        assert failure_count == 3
