import os
import json
from typing import Any, Optional
import redis


_client: Optional[redis.Redis] = None


def _redis_url() -> str:
    return (os.getenv("REDIS_URL") or "").strip()


def get_client() -> Optional[redis.Redis]:
    global _client
    url = _redis_url()
    if not url:
        return None
    if _client is None:
        _client = redis.from_url(url, decode_responses=False)
    return _client


def get_json(key: str) -> Optional[Any]:
    r = get_client()
    if not r:
        return None
    try:
        raw = r.get(key)
        if not raw:
            return None
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8", errors="ignore")
        return json.loads(raw)
    except Exception:
        return None


def set_json(key: str, value: Any, ttl_seconds: int) -> None:
    r = get_client()
    if not r:
        return
    try:
        payload = json.dumps(value, ensure_ascii=False)
        r.setex(key, ttl_seconds, payload.encode("utf-8"))
    except Exception:
        return


def delete_prefix(prefix: str) -> None:
    r = get_client()
    if not r:
        return
    try:
        cursor = 0
        pattern = f"{prefix}*"
        while True:
            cursor, keys = r.scan(cursor=cursor, match=pattern, count=200)
            if keys:
                r.delete(*keys)
            if cursor == 0:
                break
    except Exception:
        return