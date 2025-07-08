from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from django.urls import path, include

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
    AtividadeDetailView,
    AtividadesDisponiveisView,
    ForumAPIView,
    ResponderComentarioAPIView,
    DesempenhoCreateListView,
    DesempenhoDetailView,
    AulasDisponiveisView,
    SolicitacaoProfessorCreateView,
    SolicitacaoProfessorAdminViewSet,
)

router = DefaultRouter()
router.register(
    r"api/admin/solicitacoes-professor",
    SolicitacaoProfessorAdminViewSet,
    basename="admin-solicitacoes-professor",
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Autenticação
    path("api/login/", LoginView.as_view()),
    path("api/token/", CustomTokenObtainPairView.as_view()),

    path('api/', include('djoser.urls')),
    path('api/', include('djoser.urls.jwt')),
    
    # Usuários
    path("api/usuarios/", UsuarioListCreateView.as_view()),
    path("api/usuarios/<str:username>/", UsuarioDetailView.as_view()),
    path("api/foto-perfil/", AtualizarFotoPerfilView.as_view()),

    # Alunos
    path("api/alunos/", AlunoListView.as_view()),

    # Aulas
    path("api/aulas/", AulaView.as_view()),
    path("api/aulas/<int:pk>/", AulaDetailView.as_view()),
    path("api/aulas-aluno/", AulasDisponiveisView.as_view()),

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
    path("api/atividades/<int:pk>/", AtividadeDetailView.as_view()),
    path("api/atividades-aluno/", AtividadesDisponiveisView.as_view()),

    # Fórum
    path("api/forum/", ForumAPIView.as_view()),
    path("api/forum/<int:pk>/", ForumAPIView.as_view()),
    path("api/forum/<int:pk>/responder/", ResponderComentarioAPIView.as_view()),
    path(
        "api/forum/<int:pk>/resposta/<int:resposta_id>/",
        ResponderComentarioAPIView.as_view(),
    ),

    # Desempenho
    path("api/desempenhos/", DesempenhoCreateListView.as_view()),
    path("api/desempenhos/<int:pk>/", DesempenhoDetailView.as_view()),

    # Solicitação pública de professor
    path("api/solicitacoes-professor/", SolicitacaoProfessorCreateView.as_view()),
]

urlpatterns += router.urls

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
