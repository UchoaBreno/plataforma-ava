#  usuarios/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Usuario, Aula, Entrega


# ─── Aulas ─────────────────────────────────────────────────────
class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Aula
        fields = "__all__"
        extra_kwargs = {"professor": {"read_only": True}}


# ─── Entregas ──────────────────────────────────────────────────
class EntregaSerializer(serializers.ModelSerializer):
    aluno_nome  = serializers.CharField(source="aluno.username", read_only=True)
    aula_titulo = serializers.CharField(source="aula.titulo",  read_only=True)

    class Meta:
        model  = Entrega
        fields = [
            "id",
            "aluno",
            "aluno_nome",
            "aula",
            "aula_titulo",
            "arquivo",
            "enviado_em",
        ]
        extra_kwargs = {"aluno": {"read_only": True}}


# ─── Login ─────────────────────────────────────────────────────
class CustomLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if user and user.is_active:
            refresh = RefreshToken.for_user(user)
            return {
                "refresh":  str(refresh),
                "access":   str(refresh.access_token),
                "username": user.username,
                "is_staff": user.is_staff,
            }
        raise serializers.ValidationError("Credenciais inválidas")


# ─── Usuário (cadastro / detalhes) ─────────────────────────────
class UsuarioSerializer(serializers.ModelSerializer):
    foto_perfil = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model  = Usuario
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


# ─── Token JWT com extras ──────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        return token
