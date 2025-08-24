from django.contrib.auth import authenticate, get_user_model
from django.core.validators import RegexValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Usuario, Aula, Entrega, Quiz, Questao,
    Alternativa, RespostaQuiz, Atividade,
    ComentarioForum, RespostaForum, Desempenho, SolicitacaoProfessor
)

User = get_user_model()

# =========================
# Usuários
# =========================

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
        # Permite manter o mesmo username no update
        if self.instance and self.instance.username == value:
            return value
        if Usuario.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Usuario(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Garante que um usuário criado sem password não fique com senha em texto puro
            user.set_unusable_password()
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


# =========================
# Aulas / Entregas
# =========================

class AulaSerializer(serializers.ModelSerializer):
    arquivo = serializers.FileField(use_url=True, required=False)
    agendada = serializers.BooleanField(required=False)

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


# =========================
# Quizzes
# =========================

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
    criador_nome = serializers.CharField(source="criador.username", read_only=True)
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'created_at', 'criador_nome', 'pdf_url']

    def get_pdf_url(self, obj):
        # Evita AttributeError caso o campo não exista no modelo
        pdf_field = getattr(obj, "pdf", None)
        if pdf_field:
            try:
                return pdf_field.url
            except Exception:
                return None
        return None


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


# =========================
# Autenticação (login / JWT)
# =========================

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


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        token["is_superuser"] = user.is_superuser
        return token


# =========================
# Atividades
# =========================

class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        fields = "__all__"
        extra_kwargs = {"professor": {"read_only": True}}


# =========================
# Fórum
# =========================

class RespostaForumSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source="autor.username", read_only=True)
    autor_username = serializers.CharField(source="autor.username", read_only=True)

    class Meta:
        model = RespostaForum
        fields = ["id", "texto", "autor_nome", "autor_username", "criado_em"]


class ComentarioForumSerializer(serializers.ModelSerializer):
    autor_nome = serializers.CharField(source="autor.username", read_only=True)
    autor_username = serializers.CharField(source="autor.username", read_only=True)
    respostas = RespostaForumSerializer(many=True, read_only=True)

    class Meta:
        model = ComentarioForum
        fields = ["id", "texto", "autor_nome", "autor_username", "criado_em", "respostas"]


# =========================
# Desempenho
# =========================

class DesempenhoSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source='aluno.username', read_only=True)

    class Meta:
        model = Desempenho
        fields = ['id', 'titulo', 'descricao', 'nota', 'aluno', 'aluno_nome']


# =========================
# Solicitação de Professor
# =========================

class SolicitacaoProfessorSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True)

    class Meta:
        model = SolicitacaoProfessor
        fields = "__all__"
        read_only_fields = ["aprovado", "data_solicitacao"]


# =========================
# Métricas
# =========================

class AulaMetricsSerializer(serializers.Serializer):
    total_aulas = serializers.IntegerField()
    aulas_pendentes = serializers.IntegerField()
    aulas_concluidas = serializers.IntegerField()


# =========================
# 🔐 Esqueci minha senha (Password Reset por e‑mail)
# =========================

class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Recebe 'identifier' (username ou e-mail).
    Valida a existência do usuário e expõe .user para a view usar.
    """
    identifier = serializers.CharField()

    def validate(self, attrs):
        identifier = attrs.get("identifier", "").strip()
        if not identifier:
            raise serializers.ValidationError({"identifier": "Informe seu usuário ou e‑mail."})

        # Procura por username exato ou e-mail case-insensitive
        user = (
            User.objects.filter(username=identifier).first()
            or User.objects.filter(email__iexact=identifier).first()
        )
        if not user:
            # Mensagem genérica para não vazar existência do usuário
            raise serializers.ValidationError({"identifier": "Usuário/e‑mail não encontrado."})

        # Armazena para a view
        self.user = user
        return attrs


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Recebe uid, token e new_password. A view faz:
      - decodificar uid
      - validar token (PasswordResetTokenGenerator)
      - set_password(new_password)
    """
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_new_password(self, value):
        # Usa validadores do Django (força de senha)
        validate_password(value)
        return value
