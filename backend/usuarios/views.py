# views.py COMPLETO
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from .serializers import AtividadeSerializer
from .models import Atividade
from rest_framework import generics
from .serializers import DesempenhoSerializer
from .models import Desempenho
from django.utils.timezone import now

from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView
)
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Usuario, Aula, Entrega, Quiz, RespostaQuiz,
    Atividade, Questao, Alternativa,
    ComentarioForum, RespostaForum
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
)


class EntregaView(ListCreateAPIView):
    serializer_class = EntregaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def get_queryset(self):
        user = self.request.user
        return Entrega.objects.all() if user.is_staff else Entrega.objects.filter(aluno=user)

    def perform_create(self, serializer):
        serializer.save(aluno=self.request.user)


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


class QuizListCreateView(ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class QuizDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.all()


class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(pk=pk)
        except Quiz.DoesNotExist:
            return Response({"error": "Quiz não encontrado"}, status=404)

        respostas = request.data.get("answers", {})
        acertos = 0

        for questao_id, alternativa_id in respostas.items():
            try:
                alternativa = Alternativa.objects.get(id=alternativa_id)
                if alternativa.is_correct:
                    acertos += 1
            except Alternativa.DoesNotExist:
                continue

        RespostaQuiz.objects.create(
            aluno=request.user,
            quiz=quiz,
            resposta=respostas,
            nota=acertos
        )

        return Response({
            "message": "Respostas enviadas com sucesso.",
            "score": acertos
        }, status=201)


class RespostaQuizView(ListAPIView):
    serializer_class = RespostaQuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RespostaQuiz.objects.filter(aluno=self.request.user)


class AlunoListView(ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(is_staff=False)


class UsuarioListCreateView(ListCreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]


class AtualizarFotoPerfilView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.foto_perfil = request.data.get("foto_perfil")
        user.save()
        return Response({"foto_url": user.foto_perfil.url})


class UsuarioDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            usuario = Usuario.objects.get(username=username)
            return Response(UsuarioSerializer(usuario).data)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuário não encontrado"}, status=404)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(APIView):
    def post(self, request):
        serializer = CustomLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AtividadeView(ListCreateAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Atividade.objects.filter(professor=user) if user.is_staff else Atividade.objects.none()

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)


class AtividadesDisponiveisView(generics.ListAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            return Atividade.objects.all().order_by("-data_entrega")
        return Atividade.objects.none()

class AtividadeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AtividadeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return Atividade.objects.filter(professor=user)
        return Atividade.objects.none()



# ---------- FORUM ----------

class ForumAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        comentarios = ComentarioForum.objects.all().order_by("-id")
        serializer = ComentarioForumSerializer(comentarios, many=True)
        return Response(serializer.data)

    def post(self, request):
        texto = request.data.get("texto")
        comentario = ComentarioForum.objects.create(autor=request.user, texto=texto)
        return Response({"id": comentario.id, "mensagem": "Comentário criado com sucesso"})

    def put(self, request, pk):
        try:
            comentario = ComentarioForum.objects.get(pk=pk, autor=request.user)
        except ComentarioForum.DoesNotExist:
            return Response({"erro": "Comentário não encontrado ou não autorizado"}, status=404)

        comentario.texto = request.data.get("texto", comentario.texto)
        comentario.save()
        return Response({"mensagem": "Comentário atualizado com sucesso"})

    def delete(self, request, pk):
        try:
            comentario = ComentarioForum.objects.get(pk=pk, autor=request.user)
        except ComentarioForum.DoesNotExist:
            return Response({"erro": "Comentário não encontrado ou não autorizado"}, status=404)

        comentario.delete()
        return Response({"mensagem": "Comentário apagado com sucesso"})


class ResponderComentarioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        texto = request.data.get("texto")
        try:
            comentario = ComentarioForum.objects.get(id=pk)
        except ComentarioForum.DoesNotExist:
            return Response({"erro": "Comentário original não encontrado"}, status=404)

        resposta = RespostaForum.objects.create(
            comentario=comentario, autor=request.user, texto=texto
        )
        return Response({"id": resposta.id, "mensagem": "Resposta enviada com sucesso"})

    def put(self, request, pk, resposta_id):
        try:
            resposta = RespostaForum.objects.get(id=resposta_id, autor=request.user)
        except RespostaForum.DoesNotExist:
            return Response({"erro": "Resposta não encontrada ou não autorizada"}, status=404)

        resposta.texto = request.data.get("texto", resposta.texto)
        resposta.save()
        return Response({"mensagem": "Resposta atualizada com sucesso"})

    def delete(self, request, pk, resposta_id):
        try:
            resposta = RespostaForum.objects.get(id=resposta_id, autor=request.user)
        except RespostaForum.DoesNotExist:
            return Response({"erro": "Resposta não encontrada ou não autorizada"}, status=404)

        resposta.delete()
        return Response({"mensagem": "Resposta apagada com sucesso"})

class DesempenhoCreateListView(ListCreateAPIView):
    queryset = Desempenho.objects.all()
    serializer_class = DesempenhoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Desempenho.objects.all()
        return Desempenho.objects.filter(aluno=user)

class DesempenhoDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Desempenho.objects.all()
    serializer_class = DesempenhoSerializer
    permission_classes = [IsAuthenticated]