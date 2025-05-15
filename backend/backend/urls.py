#  backend/urls.py
from django.contrib import admin
from django.urls    import path
from django.conf    import settings
from django.conf.urls.static import static

from usuarios.views import (
    LoginView,
    UsuarioListCreateView,
    CustomTokenObtainPairView,
    AulaView,
    AulaDetailView,
    AtualizarFotoPerfilView,
    UsuarioDetailView,
    AlunoListView,
    EntregaView,                # ← novo
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # autenticação
    path("api/login/",  LoginView.as_view()),
    path("api/token/",  CustomTokenObtainPairView.as_view()),

    # usuários
    path("api/usuarios/",                UsuarioListCreateView.as_view()),
    path("api/usuarios/<str:username>/", UsuarioDetailView.as_view()),
    path("api/foto-perfil/",             AtualizarFotoPerfilView.as_view()),

    # alunos
    path("api/alunos/",  AlunoListView.as_view()),

    # aulas
    path("api/aulas/",         AulaView.as_view()),
    path("api/aulas/<int:pk>/", AulaDetailView.as_view()),

    # entregas
    path("api/entregas/", EntregaView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
