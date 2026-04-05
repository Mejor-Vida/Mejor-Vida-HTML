"""
Use certifi's CA bundle for HTTPS (fixes SSL: CERTIFICATE_VERIFY_FAILED on many
macOS Python installs when the system store isn't wired to ssl).
"""
from __future__ import annotations

import ssl


def get_ssl_context() -> ssl.SSLContext:
    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()
