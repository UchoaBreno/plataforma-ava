#  usuarios/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class Usuario(AbstractUser):                               # ← voltou!
    """
    Usuário base da plataforma.
    Basta herdar de AbstractUser e acrescentar a foto.
    """
    foto_perfil = models.ImageField(
        upload_to="profiles/", null=True, blank=True
    )

    def __str__(self):
        return self.username


class Aula(models.Model):
    professor      = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    titulo         = models.CharField(max_length=120)
    descricao      = models.TextField(blank=True)
    data_postagem  = models.DateField()
    data_agendada  = models.DateField(null=True, blank=True)
    slide          = models.FileField(upload_to="slides/", null=True, blank=True)
    link_reuniao   = models.URLField(blank=True)

    def __str__(self):
        return self.titulo


class Entrega(models.Model):
    aula       = models.ForeignKey(Aula, on_delete=models.CASCADE)
    aluno      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"is_staff": False},
    )
    arquivo    = models.FileField(upload_to="entregas/")
    enviado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-enviado_em"]

    def __str__(self):
        return f"{self.aluno.username} – {self.aula.titulo}"
