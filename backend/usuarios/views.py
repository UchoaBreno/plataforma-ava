from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.response import Response
from django.db.models import Exists, OuterRef, Q
from rest_framework.parsers import MultiPartParser
from rest_framework import serializers
from .models import Quiz
from rest_framework import status
from .serializers import QuizSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets, generics, permissions
from .serializers import AulaSerializer, EntregaSerializer
from .models import Usuario, Entrega, Aula  # Adicione o modelo Usuario e Aula
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
class EntregaView(generics.CreateAPIView):
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer

    def perform_create(self, serializer):
        # Adiciona o aluno à entrega antes de salvar
        serializer.save(aluno=self.request.user)

# ─── Aulas ────────────────────────────────

class HomeMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        aluno = self.request.user

        # Contagem de aulas pendentes e concluídas
        total_aulas = Aula.objects.filter(professor=aluno).count()
        entregas = Entrega.objects.filter(aluno=aluno)
        aulas_concluidas_ids = entregas.values_list('aula', flat=True)
        aulas_pendentes = total_aulas - len(aulas_concluidas_ids)
        aulas_concluidas = len(aulas_concluidas_ids)

        # Contagem de quizzes pendentes e totais
        total_quizzes = Quiz.objects.count()
        quizzes_pendentes = total_quizzes - len(entregas.filter(aula__quiz__isnull=False))

        # Contagem de atividades pendentes e totais
        total_atividades = Atividade.objects.filter(professor=aluno).count()
        atividades_pendentes = total_atividades - len(entregas.filter(aula__atividade__isnull=False))

        return Response({
            "total_aulas": total_aulas,
            "aulas_pendentes": aulas_pendentes,
            "aulas_concluidas": aulas_concluidas,
            "total_quizzes": total_quizzes,
            "quizzes_pendentes": quizzes_pendentes,
            "total_atividades": total_atividades,
            "atividades_pendentes": atividades_pendentes,
        })

# ─── Nova View para Métricas das Aulas ─────────────────────────
class AulaMetricsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Contagem de aulas total
        total_aulas = Aula.objects.filter(professor=request.user).count()

        # Aulas pendentes (aulas que ainda não foram entregues)
        entregas = Entrega.objects.filter(aluno=request.user)
        aulas_concluidas_ids = entregas.values_list('aula', flat=True)
        aulas_pendentes = total_aulas - len(aulas_concluidas_ids)

        # Aulas concluídas
        aulas_concluidas = len(aulas_concluidas_ids)

        return Response({
            "total_aulas": total_aulas,
            "aulas_pendentes": aulas_pendentes,
            "aulas_concluidas": aulas_concluidas
        })
    

class AulaView(ListCreateAPIView):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def perform_create(self, serializer):
        agendada = self.request.data.get("agendada", "false").lower() == "true"
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


# ─── Aulas Disponíveis ─────────────────────
class AulasDisponiveisView(ListAPIView):
    serializer_class = AulaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Aula.objects.none()

        agora = timezone.localtime()
        entregas = Entrega.objects.filter(aula=OuterRef('pk'), aluno=user)

        return Aula.objects.annotate(
            ja_entregue=Exists(entregas)
        ).filter(
            ja_entregue=False
        ).filter(
            Q(agendada=False) |
            Q(agendada=True, data__lt=agora.date()) |
            Q(agendada=True, data=agora.date(), hora__lte=agora.time())
        )



# ─── Quizzes ──────────────────────────────
class QuizListCreateView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all().order_by('-created_at')
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Salva o criador do quiz como o usuário autenticado
        pdf_file = self.request.FILES.get("pdf")
        if pdf_file:
            # Verifique se o arquivo é válido antes de salvar
            serializer.save(criador=self.request.user, pdf=pdf_file)
        else:
            serializer.save(criador=self.request.user)

class QuizListView(APIView):
    def get(self, request):
        quizzes = Quiz.objects.all()  # Pega todos os quizzes
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Quiz.objects.all()

    def get_permissions(self):
        if self.request.method in ['PUT', 'DELETE']:
            if not self.request.user == self.get_object().criador and not self.request.user.is_staff:
                return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

class RespostaQuizView(ListAPIView):
    serializer_class = RespostaQuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RespostaQuiz.objects.filter(aluno=self.request.user)


# ─── Quizzes ──────────────────────────────
class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        quiz = Quiz.objects.filter(pk=pk).first()
        if not quiz:
            return Response({"error": "Quiz não encontrado"}, status=404)

        respostas = request.data.get("answers", {})
        comentario = request.data.get("comentario", "")
        arquivo = request.FILES.get("arquivo")  # Verificar o arquivo
        acertos = 0
        for question_id, alternativa_id in respostas.items():
            try:
                alt = Alternativa.objects.get(id=alternativa_id, question__id=question_id)
                if alt.is_correct:
                    acertos += 1
            except Alternativa.DoesNotExist:
                continue  # Caso a alternativa não exista, ignore essa pergunta

        # Cria a entrega de quiz
        entrega = Entrega.objects.create(
            aluno=request.user,
            quiz=quiz,
            arquivo=arquivo,  # Salva o arquivo enviado
            comentario=comentario  # Salva o comentário
        )

        # Salva as respostas enviadas e a nota
        RespostaQuiz.objects.create(
            aluno=request.user, quiz=quiz, resposta=respostas, nota=acertos
        )

        return Response({"message": "Respostas enviadas.", "score": acertos})

# ─── Quiz Listar e Criar ─────────────────────────
class QuizListCreateView(ListCreateAPIView):
    queryset = Quiz.objects.all().order_by('-created_at')
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        # Salva o criador do quiz como o usuário autenticado
        pdf_file = self.request.FILES.get("pdf")
        if pdf_file:
            # Verifique se o arquivo é válido antes de salvar
            serializer.save(criador=self.request.user, pdf=pdf_file)
        else:
            serializer.save(criador=self.request.user)



class RespostaQuizView(ListAPIView):
    serializer_class = RespostaQuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RespostaQuiz.objects.filter(aluno=self.request.user)

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'created_at', 'pdf']  # Adiciona o campo pdf
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


# ─── Atividade View ───────────────────────────────────
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
    

class EnviarAtividadeView(APIView):
    def post(self, request, *args, **kwargs):
        # Verifica se o arquivo foi enviado
        if 'arquivo' not in request.FILES:
            return Response({"detail": "Arquivo é necessário!"}, status=status.HTTP_400_BAD_REQUEST)

        arquivo = request.FILES['arquivo']
        # Pega o quiz e outros dados
        quiz = request.data.get('quiz')
        comentario = request.data.get('comentario')

        # Adicionar validação ou lógica para salvar o envio no banco de dados
        entrega = Entrega.objects.create(
            quiz_id=quiz,
            comentario=comentario,
            arquivo=arquivo,  # Salva o arquivo enviado
        )

        return Response({"message": "Atividade recebida!"}, status=status.HTTP_200_OK)
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
    serializer_class = SolicitacaoProfessorSerializer
    permission_classes = [AllowAny]

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
