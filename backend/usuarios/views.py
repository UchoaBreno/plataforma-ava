from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.db.models import Exists, OuterRef, Q
from django.utils.timezone import now

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from rest_framework import status, viewsets, generics, permissions
from rest_framework.decorators import action
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView
)
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import (
    IsAuthenticated, IsAdminUser, AllowAny
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Usuario, Aula, Entrega, Quiz, RespostaQuiz,
    Atividade, Alternativa,
    ComentarioForum, RespostaForum, Desempenho,
    SolicitacaoProfessor
)

from .serializers import (
    CustomLoginSerializer,
    UsuarioSerializer,
    AulaSerializer,
    EntregaSerializer,
    QuizSerializer,
    RespostaQuizSerializer,
    CustomTokenObtainPairSerializer,
    AtividadeSerializer,
    ComentarioForumSerializer,
    DesempenhoSerializer,
    SolicitacaoProfessorSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()
token_generator = PasswordResetTokenGenerator()

# ───────────────────────────────────────────────────────────────
# ENTREGAS
# ───────────────────────────────────────────────────────────────
class EntregaView(ListCreateAPIView):
    serializer_class = EntregaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get_queryset(self):
        return Entrega.objects.filter(aluno=self.request.user)

    def perform_create(self, serializer):
        serializer.save(aluno=self.request.user)


# ───────────────────────────────────────────────────────────────
# MÉTRICAS DA HOME
# ───────────────────────────────────────────────────────────────
class HomeMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        aluno = request.user

        # Total de aulas “atribuídas” para o fluxo atual: como não há vínculo explícito,
        # mantemos a contagem por professor==aluno (modelo original do seu código).
        total_aulas = Aula.objects.filter(professor=aluno).count()

        entregas = Entrega.objects.filter(aluno=aluno)
        aulas_concluidas_ids = entregas.values_list('aula', flat=True)
        aulas_concluidas = len(aulas_concluidas_ids)
        aulas_pendentes = max(total_aulas - aulas_concluidas, 0)

        total_quizzes = Quiz.objects.count()
        quizzes_respondidos = RespostaQuiz.objects.filter(aluno=aluno).values_list("quiz_id", flat=True).distinct().count()
        quizzes_pendentes = max(total_quizzes - quizzes_respondidos, 0)

        total_atividades = Atividade.objects.filter(professor=aluno).count()
        atividades_entregues = entregas.filter(aula__atividade__isnull=False).count()
        atividades_pendentes = max(total_atividades - atividades_entregues, 0)

        return Response({
            "total_aulas": total_aulas,
            "aulas_pendentes": aulas_pendentes,
            "aulas_concluidas": aulas_concluidas,
            "total_quizzes": total_quizzes,
            "quizzes_pendentes": quizzes_pendentes,
            "total_atividades": total_atividades,
            "atividades_pendentes": atividades_pendentes,
        })


# ───────────────────────────────────────────────────────────────
# MÉTRICAS DAS AULAS
# ───────────────────────────────────────────────────────────────
class AulaMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_aulas = Aula.objects.filter(professor=request.user).count()
        entregas = Entrega.objects.filter(aluno=request.user)
        aulas_concluidas_ids = entregas.values_list('aula', flat=True)
        aulas_concluidas = len(aulas_concluidas_ids)
        aulas_pendentes = max(total_aulas - aulas_concluidas, 0)

        return Response({
            "total_aulas": total_aulas,
            "aulas_pendentes": aulas_pendentes,
            "aulas_concluidas": aulas_concluidas
        })


# ───────────────────────────────────────────────────────────────
# AULAS
# ───────────────────────────────────────────────────────────────
class AulaView(ListCreateAPIView):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def perform_create(self, serializer):
        agendada = str(self.request.data.get("agendada", "false")).lower() == "true"
        serializer.save(professor=self.request.user, agendada=agendada)


class AulaDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Aula.objects.filter(professor=user)
        return Aula.objects.none()


class AulasDisponiveisView(ListAPIView):
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Aula.objects.none()

        agora = timezone.localtime()
        entregas = Entrega.objects.filter(aula=OuterRef('pk'), aluno=user)

        return (Aula.objects
                .annotate(ja_entregue=Exists(entregas))
                .filter(ja_entregue=False)
                .filter(
                    Q(agendada=False) |
                    Q(agendada=True, data__lt=agora.date()) |
                    Q(agendada=True, data=agora.date(), hora__lte=agora.time())
                ))


# ───────────────────────────────────────────────────────────────
# QUIZZES
# ───────────────────────────────────────────────────────────────
class QuizListCreateView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all().order_by('-created_at')
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(criador=self.request.user)


class QuizDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    queryset = Quiz.objects.all()


class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        quiz = Quiz.objects.filter(pk=pk).first()
        if not quiz:
            return Response({"error": "Quiz não encontrado"}, status=404)

        respostas = request.data.get("answers", {})
        acertos = 0
        for _, alternativa_id in respostas.items():
            alt = Alternativa.objects.filter(id=alternativa_id).first()
            if alt and getattr(alt, "is_correct", False):
                acertos += 1

        RespostaQuiz.objects.create(
            aluno=request.user, quiz=quiz, resposta=respostas, nota=acertos
        )
        return Response({"message": "Respostas enviadas.", "score": acertos})


class RespostaQuizView(ListAPIView):
    serializer_class = RespostaQuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RespostaQuiz.objects.filter(aluno=self.request.user)


# ───────────────────────────────────────────────────────────────
# USUÁRIOS
# ───────────────────────────────────────────────────────────────
class AlunoListView(ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(is_staff=False, is_active=True)


class UsuarioListCreateView(ListCreateAPIView):
    queryset = Usuario.objects.filter(is_active=True)
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("🚨 Erros de validação no cadastro:", serializer.errors)
            return Response(serializer.errors, status=400)
        self.perform_create(serializer)
        return Response(serializer.data, status=201)


class UsuarioDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        usuario = self.get_object()
        usuario.is_active = False
        usuario.save()
        return Response({"detail": "Usuário desativado"}, status=204)


class ChangePasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not username or not old_password or not new_password:
            return Response({"detail": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if not user.check_password(old_password):
            return Response({"detail": "Senha antiga incorreta."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Senha alterada com sucesso!"}, status=status.HTTP_200_OK)


# ───────────────────────────────────────────────────────────────
# FOTO DE PERFIL
# ───────────────────────────────────────────────────────────────
class AtualizarFotoPerfilView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        file = request.data.get("foto_perfil")
        if not file:
            return Response({"detail": "Envie o arquivo 'foto_perfil'."}, status=400)
        user.foto_perfil = file
        user.save()
        url = getattr(user.foto_perfil, "url", None)
        return Response({"foto_url": url})


# ───────────────────────────────────────────────────────────────
# LOGIN / TOKENS
# ───────────────────────────────────────────────────────────────
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(APIView):
    def post(self, request):
        serializer = CustomLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data)
        return Response(serializer.errors, status=400)


# ───────────────────────────────────────────────────────────────
# ATIVIDADES
# ───────────────────────────────────────────────────────────────
class AtividadeView(ListCreateAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Atividade.objects.filter(professor=user) if user.is_staff else Atividade.objects.none()

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)


class AtividadesDisponiveisView(ListAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            return Atividade.objects.filter(data_entrega__gte=now()).order_by("data_entrega")
        return Atividade.objects.none()


class AtividadeDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Atividade.objects.filter(professor=user) if user.is_staff else Atividade.objects.all()


# ───────────────────────────────────────────────────────────────
# FÓRUM
# ───────────────────────────────────────────────────────────────
class ForumAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        comentarios = ComentarioForum.objects.all().order_by("-id")
        serializer = ComentarioForumSerializer(comentarios, many=True)
        return Response(serializer.data)

    def post(self, request):
        comentario = ComentarioForum.objects.create(
            autor=request.user, texto=request.data.get("texto")
        )
        return Response({"id": comentario.id})

    def put(self, request, pk):
        comentario = get_object_or_404(ComentarioForum, pk=pk, autor=request.user)
        comentario.texto = request.data.get("texto", comentario.texto)
        comentario.save()
        return Response({"detail": "Comentário atualizado"})

    def delete(self, request, pk):
        comentario = get_object_or_404(ComentarioForum, pk=pk, autor=request.user)
        comentario.delete()
        return Response({"detail": "Comentário apagado"})


class ResponderComentarioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comentario = ComentarioForum.objects.filter(pk=pk).first()
        if not comentario:
            return Response({"error": "Comentário não encontrado"}, status=404)
        resposta = RespostaForum.objects.create(
            comentario=comentario, autor=request.user, texto=request.data.get("texto")
        )
        return Response({"id": resposta.id})


class RespostaComentarioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        resposta = get_object_or_404(RespostaForum, pk=pk, autor=request.user)
        resposta.texto = request.data.get("texto", resposta.texto)
        resposta.save()
        return Response({"detail": "Resposta atualizada"})

    def delete(self, request, pk):
        resposta = get_object_or_404(RespostaForum, pk=pk, autor=request.user)
        resposta.delete()
        return Response({"detail": "Resposta apagada"})


# ───────────────────────────────────────────────────────────────
# DESEMPENHO
# ───────────────────────────────────────────────────────────────
class DesempenhoCreateListView(ListCreateAPIView):
    serializer_class = DesempenhoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Desempenho.objects.all() if user.is_staff else Desempenho.objects.filter(aluno=user)


class DesempenhoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Desempenho.objects.all()
    serializer_class = DesempenhoSerializer
    permission_classes = [IsAuthenticated]


# ───────────────────────────────────────────────────────────────
# SOLICITAÇÃO DE PROFESSORES
# ───────────────────────────────────────────────────────────────
class SolicitacaoProfessorCreateView(ListCreateAPIView):
    queryset = SolicitacaoProfessor.objects.all()
    serializer_class = SolicitacaoProfessorSerializer
    permission_classes = [AllowAny]


class SolicitacaoProfessorAdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        queryset = SolicitacaoProfessor.objects.all()
        serializer = SolicitacaoProfessorSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def aprovar(self, request, pk=None):
        solicitacao = SolicitacaoProfessor.objects.filter(pk=pk).first()
        if not solicitacao:
            return Response({"detail": "Não encontrada"}, status=404)
        if solicitacao.aprovado:
            return Response({"detail": "Já aprovada"}, status=400)

        Usuario.objects.create_user(
            username=solicitacao.username,
            password=solicitacao.senha,
            email=solicitacao.email,
            first_name=solicitacao.nome,
            last_name=solicitacao.sobrenome,
            is_staff=True,
            is_active=True,
        )
        solicitacao.aprovado = True
        solicitacao.save()
        return Response({"detail": "Aprovada"})

    @action(detail=True, methods=["post"])
    def rejeitar(self, request, pk=None):
        solicitacao = SolicitacaoProfessor.objects.filter(pk=pk).first()
        if not solicitacao:
            return Response({"detail": "Não encontrada"}, status=404)
        solicitacao.delete()
        return Response({"detail": "Rejeitada"})


# ───────────────────────────────────────────────────────────────
# 🔐 ESQUECI MINHA SENHA — NOVO
# ───────────────────────────────────────────────────────────────
class PasswordResetRequestView(APIView):
    """
    POST: { "identifier": "<username ou email>" }
    Envia e-mail com link para redefinição: FRONTEND_RESET_URL?uid=<uidb64>&token=<token>
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user  # definido pelo serializer
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)

        # Monta link para o frontend
        base_url = getattr(settings, "FRONTEND_RESET_URL", "").rstrip("/")
        if not base_url:
            return Response(
                {"detail": "FRONTEND_RESET_URL não configurada no settings."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        reset_link = f"{base_url}?uid={uidb64}&token={token}"

        subject = "Redefinição de senha — Plataforma AVA"
        message = (
            f"Olá, {user.get_full_name() or user.username}!\n\n"
            f"Você (ou alguém) solicitou redefinir sua senha na Plataforma AVA.\n"
            f"Para continuar, acesse o link abaixo:\n\n{reset_link}\n\n"
            "Se você não solicitou, pode ignorar este e‑mail.\n\n"
            "Atenciosamente,\nEquipe Plataforma AVA"
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                recipient_list=[user.email] if user.email else [],
                fail_silently=False,
            )
        except Exception as e:
            return Response(
                {"detail": f"Falha ao enviar e‑mail: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"detail": "E‑mail de redefinição enviado com sucesso."}, status=200)


class PasswordResetConfirmView(APIView):
    """
    POST: { "uid": "<uidb64>", "token": "<token>", "new_password": "<nova senha>" }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uidb64 = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Link inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, token):
            return Response({"detail": "Token inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)

        # Define a nova senha usando os validadores do Django (já validados no serializer)
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Senha redefinida com sucesso."}, status=200)
