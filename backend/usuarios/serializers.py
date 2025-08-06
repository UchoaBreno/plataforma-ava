from django.contrib.auth import authenticate
from django.core.validators import RegexValidator
from rest_framework import serializers, viewsets
from rest_framework import generics
from .models import Entrega
from .models import (
    Usuario, Aula, Entrega, Quiz, Questao,
    Alternativa, RespostaQuiz, Atividade,
    ComentarioForum, RespostaForum, Desempenho, SolicitacaoProfessor
)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# ─── Usuário ─────────────────────────────
class UsuarioSerializer(serializers.ModelSerializer):
    foto_perfil = serializers.ImageField(required=False, allow_null=True)

    username = serializers.CharField(
        validators=[RegexValidator(
            regex=r'^[\w.@+-]+$',
            message="O nome de usuário só pode conter letras, números e os caracteres @/./+/-/_"
        )]
    )

    class Meta:
        model = Usuario
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "is_staff", "foto_perfil", "password"
        ]
        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def validate_username(self, value):
        if self.instance and self.instance.username == value:
            return value
        if Usuario.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# ─── Aula ────────────────────────────────
class AulaSerializer(serializers.ModelSerializer):
    arquivo = serializers.FileField(use_url=True, required=False)
    agendada = serializers.BooleanField(required=False)

    class Meta:
        model = Aula
        fields = "__all__"
        extra_kwargs = {
            "professor": {"read_only": True},
        }


# ─── Entrega ─────────────────────────────

class EntregaSerializer(serializers.ModelSerializer):
    arquivo = serializers.FileField(required=False)

    class Meta:
        model = Entrega
        fields = ['quiz', 'comentario', 'arquivo']

class EntregaViewSet(viewsets.ModelViewSet):
    queryset = Entrega.objects.all()
    serializer_class = EntregaSerializer

class EntregaView(generics.CreateAPIView):
    queryset = Entrega.objects.all()

    def get_serializer_class(self):
        return EntregaSerializer  # Retorna o serializer dinamicamente
    
# ─── Alternativa ─────────────────────────
class AlternativaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternativa
        fields = ["id", "text"]


# ─── Questão ─────────────────────────────
class QuestaoSerializer(serializers.ModelSerializer):
    choices = AlternativaSerializer(many=True, read_only=True)

    class Meta:
        model = Questao
        fields = ["id", "text", "choices"]


# ─── Quiz ────────────────────────────────
class QuizSerializer(serializers.ModelSerializer):
    questions = QuestaoSerializer(many=True, read_only=True)
    criador_nome = serializers.CharField(source="criador.username", read_only=True)
    pdf = serializers.FileField(required=False)

    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "created_at", "questions", "criador_nome", "pdf"]  # Adiciona o campo pdf


# ─── Resposta Quiz ───────────────────────
class RespostaQuizSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source="aluno.username", read_only=True)
    quiz_titulo = serializers.CharField(source="quiz.title", read_only=True)

    class Meta:
        model = RespostaQuiz
        fields = [
            "id", "quiz", "quiz_titulo", "aluno", "aluno_nome",
            "resposta", "nota", "respondido_em",
        ]
        extra_kwargs = {
            "aluno": {"read_only": True},
            "nota": {"read_only": True},
            "respondido_em": {"read_only": True},
        }


# ─── Custom Login Serializer ──────────────
class CustomLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if user and user.is_active:
            refresh = RefreshToken.for_user(user)
            return {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
        raise serializers.ValidationError("Credenciais inválidas")


# ─── Custom Token Serializer ──────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser
        return token


# ─── Atividade ───────────────────────────
class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        fields = "__all__"
        extra_kwargs = {"professor": {"read_only": True}}


# ─── Resposta Fórum ──────────────────────
class RespostaForumSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source="autor.username", read_only=True)
    autor_username = serializers.CharField(source="autor.username", read_only=True)

    class Meta:
        model = RespostaForum
        fields = ["id", "texto", "autor_nome", "autor_username", "criado_em"]


# ─── Comentário Fórum ────────────────────
class ComentarioForumSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source="autor.username", read_only=True)
    autor_username = serializers.CharField(source="autor.username", read_only=True)
    respostas = RespostaForumSerializer(many=True, read_only=True)

    class Meta:
        model = ComentarioForum
        fields = ["id", "texto", "autor_nome", "autor_username", "criado_em", "respostas"]


# ─── Desempenho ───────────────────────────
class DesempenhoSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source='aluno.username', read_only=True)

    class Meta:
        model = Desempenho
        fields = ['id', 'titulo', 'descricao', 'nota', 'aluno', 'aluno_nome']


# ─── Solicitação de Professores ───────────
class SolicitacaoProfessorSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = SolicitacaoProfessor
        fields = "__all__"
        read_only_fields = ["aprovado", "data_solicitacao"]


# ─── Nova Serializer para Métricas das Aulas ────────────────────
class AulaMetricsSerializer(serializers.Serializer):
    total_aulas = serializers.IntegerField()
    aulas_pendentes = serializers.IntegerField()
    aulas_concluidas = serializers.IntegerField()


# ─── Serializer para Envio de Quiz (Entrega) ────────────────────
class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.IntegerField())
    comentario = serializers.CharField(required=False, allow_blank=True)
    arquivo = serializers.FileField(required=False)

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("Você precisa responder todas as perguntas.")
        return value
