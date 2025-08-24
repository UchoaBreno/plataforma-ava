from pathlib import Path
import os
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ⚠️ Em produção use variável de ambiente
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-)vw9ds9egj=ov(j-=sqy!*pe4(g1wrv&dg8e082!u7*dx4wt^k')

DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'  # 🔷 Altere para False em produção!

ALLOWED_HOSTS = [
    'plataforma-ava.onrender.com',
    'www.plataforma-ava.onrender.com',
    'plataforma-ava2.onrender.com',
    'www.plataforma-ava2.onrender.com',
    '192.168.0.3',
    'localhost',
    '127.0.0.1',
]

# Se usar Render/Cloud, é recomendável configurar os domínios confiáveis para CSRF:
CSRF_TRUSTED_ORIGINS = [
    'https://plataforma-ava.onrender.com',
    'https://www.plataforma-ava.onrender.com',
    'https://plataforma-ava2.onrender.com',
    'https://www.plataforma-ava2.onrender.com',
]

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework.authtoken',  # necessário para Djoser reset com token
    'djoser',

    'usuarios',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # deve vir antes do CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Banco de dados (SQLite por padrão)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Validação de senha (boas práticas)
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Manaus'

USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Usuário customizado
AUTH_USER_MODEL = 'usuarios.Usuario'

# DRF + JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# =========================
# CORS
# =========================
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://plataforma-ava.onrender.com",
    "https://www.plataforma-ava.onrender.com",
    "https://plataforma-ava2.onrender.com",
    "https://www.plataforma-ava2.onrender.com",
    "http://localhost:3000",   # útil em desenvolvimento (React)
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# =========================
# SIMPLE JWT
# =========================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# =========================
# E-MAIL (SMTP) - necessário para "Esqueci minha senha"
# Use variáveis de ambiente em produção
# =========================
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")  # ex.: seu.email@gmail.com
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")  # ex.: app password (Gmail)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "Plataforma AVA <no-reply@plataforma-ava.com>")

# URL do frontend para compor o link de redefinição enviado por e-mail
# Ex.: https://plataforma-ava.onrender.com/reset?uid=<uidb64>&token=<token>
FRONTEND_RESET_URL = os.getenv(
    "FRONTEND_RESET_URL",
    "https://plataforma-ava.onrender.com/reset"
)

# Opcional (útil quando estiver atrás de proxy HTTPS)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# =========================
# DJOSER (mantido; você pode usar tanto Djoser quanto suas views próprias)
# =========================
DJOSER = {
    'LOGIN_FIELD': 'username',  # você já usa username para login/troca de senha
    'USER_ID_FIELD': 'id',
    'SEND_ACTIVATION_EMAIL': False,

    # Quando usar o fluxo de reset do Djoser, ele enviará e-mail com este padrão de URL
    # Você pode apontar para sua rota do Frontend que captura uid/token
    'PASSWORD_RESET_CONFIRM_URL': 'reset-password-confirm/{uid}/{token}/',
    # Se preferir usar seu próprio template de e-mail, pode sobrescrever serializers/emails do Djoser

    'SERIALIZERS': {
        # Pode customizar serializers aqui, se necessário
        # 'password_reset': 'usuarios.serializers.CustomPasswordResetSerializer',
        # 'password_reset_confirm': 'usuarios.serializers.CustomPasswordResetConfirmSerializer',
    },
}

# =========================
# Observações:
# - Para produção, defina as variáveis de ambiente:
#   DJANGO_SECRET_KEY, DJANGO_DEBUG=False,
#   EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, DEFAULT_FROM_EMAIL, FRONTEND_RESET_URL.
# - Com isso, suas views /api/password-reset/request/ e /api/password-reset/confirm/
#   (que vamos criar no app "usuarios") conseguem enviar e-mail com link contendo uid/token.
# - Se preferir, você pode usar diretamente os endpoints do Djoser para reset de senha.
# =========================
