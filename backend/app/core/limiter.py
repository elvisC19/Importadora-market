import sys
import os
from slowapi import Limiter
from slowapi.util import get_remote_address

# Detect testing environment to disable rate limiter
testing = "pytest" in sys.modules or os.getenv("TESTING", "").lower() == "true"

# Dedicated Limiter instance to avoid circular imports between app.main and endpoints
limiter = Limiter(key_func=get_remote_address, enabled=not testing)
