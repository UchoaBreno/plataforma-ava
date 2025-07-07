from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.core.validators import RegexValidator

from .models import (
    Usuario, Aula, Entrega, Quiz, Questao,
    Alternativa, RespostaQuiz, Atividade,
    ComentarioForum, RespostaForum, Desempenho, SolicitacaoProfessor
)


class UsuarioSerializer(serializers.ModelSerializer):
    foto_perfil = serializers.ImageField(required=False, allow_null=True)

    username = serializers.CharField(
        validators=[
            RegexValidator(
                regex=r'^[\w.@+-]+$',
                message="O nome de usuário só pode conter letras, números e os caracteres @/./+/-/_"
            )
        ]
    )

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "is_staff",
            "foto_perfil",
            "password",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "is_staff": {"read_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = "__all__"
        extra_kwargs = {"professor": {"read_only": True}}


class EntregaSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source="aluno.username", read_only=True)
    aula_titulo = serializers.CharField(source="aula.titulo", read_only=True)

    class Meta:
        model = Entrega
        fields = [
            "id", "aluno", "aluno_nome", "aula", "aula_titulo",
            "arquivo", "data_envio", "resposta_texto",
        ]
        extra_kwargs = {"aluno": {"read_only": True}}


class AlternativaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternativa
        fields = ["id", "text"]


class QuestaoSerializer(serializers.ModelSerializer):
    choices = AlternativaSerializer(many=True, read_only=True)

    class Meta:
        model = Questao
        fields = ["id", "text", "choices"]


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestaoSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "created_at", "questions"]


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
            }
        raise serializers.ValidationError("Credenciais inválidas")


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        return token


class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        fields = "__all__"
        extra_kwargs = {"professor": {"read_only": True}}


class RespostaForumSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source="autor.username", read_only=True)

    class Meta:
        model = RespostaForum
        fields = ["id", "texto", "autor_nome", "criado_em"]


class ComentarioForumSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source="autor.username", read_only=True)
    respostas = RespostaForumSerializer(many=True, read_only=True)

    class Meta:
        model = ComentarioForum
        fields = ["id", "texto", "autor_nome", "criado_em", "respostas"]


class DesempenhoSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source='aluno.username', read_only=True)

    class Meta:
        model = Desempenho
        fields = ['id', 'titulo', 'descricao', 'nota', 'aluno', 'aluno_nome']


class SolicitacaoProfessorSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = SolicitacaoProfessor
        fields = "__all__"
        read_only_fields = ["aprovado", "data_solicitacao"]
