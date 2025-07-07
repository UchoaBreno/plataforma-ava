from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers, viewsets
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView
)
from rest_framework.decorators import action
from rest_framework.permissions import (
    IsAuthenticated, IsAdminUser, AllowAny
)
from rest_framework.parsers import MultiPartParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import OuterRef, Exists
from django.utils.timezone import now

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
)

# ─── Entregas ──────────────────────────────
class EntregaView(ListCreateAPIView):
    serializer_class = EntregaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get_queryset(self):
        return Entrega.objects.filter(aluno=self.request.user)

    def perform_create(self, serializer):
        serializer.save(aluno=self.request.user)


class EntregaSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source="aluno.username", read_only=True)
    aula_titulo = serializers.CharField(source="aula.titulo", read_only=True)

    class Meta:
        model = Entrega
        fields = [
            "id", "aluno", "aluno_nome", "aula", "aula_titulo",
            "arquivo", "data_envio", "resposta_texto"
        ]
        extra_kwargs = {"aluno": {"read_only": True}}


# ─── Aulas ────────────────────────────────
class AulaView(ListCreateAPIView):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)


class AulaDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Aula.objects.filter(professor=self.request.user)
        return Aula.objects.none()


class AulasDisponiveisView(ListAPIView):
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Aula.objects.none()
        entregas = Entrega.objects.filter(
            aula=OuterRef('pk'), aluno=user
        )
        return Aula.objects.annotate(
            ja_entregue=Exists(entregas)
        ).filter(ja_entregue=False).order_by('-criada_em')


# ─── Quizzes ──────────────────────────────
class QuizListCreateView(ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]
    queryset = Quiz.objects.all()


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
            if alt and alt.is_correct:
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


# ─── Usuários ─────────────────────────────
class AlunoListView(ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(is_staff=False)


class UsuarioListCreateView(ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]


class UsuarioDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        usuario = Usuario.objects.filter(username=username).first()
        if not usuario:
            return Response({"error": "Usuário não encontrado"}, status=404)
        return Response(UsuarioSerializer(usuario).data)


class AtualizarFotoPerfilView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.foto_perfil = request.data.get("foto_perfil")
        user.save()
        return Response({"foto_url": user.foto_perfil.url})


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(APIView):
    def post(self, request):
        serializer = CustomLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data)
        return Response(serializer.errors, status=400)


# ─── Atividades ───────────────────────────
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


# ─── Fórum ────────────────────────────────
class ForumAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        comentarios = ComentarioForum.objects.all().order_by("-id")
        serializer = ComentarioForumSerializer(comentarios, many=True)
        return Response(serializer.data)

    def post(self, request):
        comentario = ComentarioForum.objects.create(autor=request.user, texto=request.data.get("texto"))
        return Response({"id": comentario.id})


class ResponderComentarioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        comentario = ComentarioForum.objects.filter(pk=pk).first()
        if not comentario:
            return Response({"error": "Comentário não encontrado"}, status=404)
        resposta = RespostaForum.objects.create(comentario=comentario, autor=request.user, texto=request.data.get("texto"))
        return Response({"id": resposta.id})


# ─── Desempenho ───────────────────────────
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


# ─── Solicitação de Professores ───────────
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
