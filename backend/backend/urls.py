# backend/urls.py
from django.contrib import admin
from django.urls import path
from django.conf import settings
from usuarios.views import AtividadeDetailView
from django.conf.urls.static import static
from usuarios.views import DesempenhoCreateListView, DesempenhoDetailView

from usuarios.views import (
    LoginView,
    CustomTokenObtainPairView,
    UsuarioListCreateView,
    UsuarioDetailView,
    AtualizarFotoPerfilView,
    AlunoListView,
    AulaView,
    AulaDetailView,
    EntregaView,
    QuizListCreateView,
    QuizDetailView,
    QuizSubmitView,
    RespostaQuizView,
    AtividadeView,
    AtividadesDisponiveisView,
    ForumAPIView,
    ResponderComentarioAPIView
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Autenticação
    path("api/login/", LoginView.as_view()),
    path("api/token/", CustomTokenObtainPairView.as_view()),

    # Usuários
    path("api/usuarios/", UsuarioListCreateView.as_view()),
    path("api/usuarios/<str:username>/", UsuarioDetailView.as_view()),
    path("api/foto-perfil/", AtualizarFotoPerfilView.as_view()),

    # Alunos
    path("api/alunos/", AlunoListView.as_view()),

    # Aulas
    path("api/aulas/", AulaView.as_view()),
    path("api/aulas/<int:pk>/", AulaDetailView.as_view()),

    # Entregas
    path("api/entregas/", EntregaView.as_view()),

    # Quizzes
    path("api/quizzes/", QuizListCreateView.as_view()),
    path("api/quizzes/<int:pk>/", QuizDetailView.as_view()),
    path("api/quizzes/<int:pk>/submit/", QuizSubmitView.as_view()),

    # Respostas de Quiz
    path("api/respostas/", RespostaQuizView.as_view()),

    # Atividades
    path("api/atividades/", AtividadeView.as_view()),
    path("api/atividades-aluno/", AtividadesDisponiveisView.as_view()),
    path("api/atividades/<int:pk>/", AtividadeDetailView.as_view(), name="atividade-detail"),

    # Fórum - Comentários e Respostas
    path("api/forum/", ForumAPIView.as_view()),                          # GET, POST
    path("api/forum/<int:pk>/", ForumAPIView.as_view()),                # PUT, DELETE (comentários)
    path("api/forum/<int:pk>/responder/", ResponderComentarioAPIView.as_view()),  # POST resposta
    path("api/forum/<int:pk>/resposta/<int:resposta_id>/", ResponderComentarioAPIView.as_view()),  # PUT, DELETE (respostas)
    path("api/desempenhos/", DesempenhoCreateListView.as_view()),
    path("api/desempenhos/<int:pk>/", DesempenhoDetailView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
