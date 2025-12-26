"""
Redis cache configuration and utilities.
"""
import json
from typing import Optional, Any
from redis import Redis
from app.core.config import Settings

settings = Settings()


class CacheService:
    """Service for caching operations using Redis."""

    def __init__(self):
        """Initialize Redis connection."""
        self.redis: Optional[Redis] = None
        try:
            if hasattr(settings, 'REDIS_URL') and settings.REDIS_URL:
                self.redis = Redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=5
                )
                # Test connection
                self.redis.ping()
        except Exception as e:
            print(f"Redis connection failed: {e}. Caching disabled.")
            self.redis = None

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.redis:
            return None

        try:
            value = self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None

    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with TTL (default 5 minutes)."""
        if not self.redis:
            return False

        try:
            serialized = json.dumps(value)
            return bool(self.redis.setex(key, ttl, serialized))
        except Exception as e:
            print(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        if not self.redis:
            return False

        try:
            return bool(self.redis.delete(key))
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern."""
        if not self.redis:
            return 0

        try:
            keys = self.redis.keys(pattern)
            if keys:
                return self.redis.delete(*keys)
            return 0
        except Exception as e:
            print(f"Cache delete pattern error: {e}")
            return 0

    def is_available(self) -> bool:
        """Check if Redis is available."""
        if not self.redis:
            return False

        try:
            self.redis.ping()
            return True
        except Exception:
            return False


# Global cache instance
cache = CacheService()
