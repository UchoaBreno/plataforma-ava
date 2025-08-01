from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets, generics, permissions
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


# ─── Aulas ────────────────────────────────
class AulaView(ListCreateAPIView):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)


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
        entregas = Entrega.objects.filter(aula=OuterRef('pk'), aluno=user)
        return Aula.objects.annotate(ja_entregue=Exists(entregas)).filter(ja_entregue=False).order_by('-criada_em')


# ─── Quizzes ──────────────────────────────
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


# ─── Foto Perfil ──────────────────────────
class AtualizarFotoPerfilView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.foto_perfil = request.data.get("foto_perfil")
        user.save()
        return Response({"foto_url": user.foto_perfil.url})


# ─── Login/Token ──────────────────────────
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
