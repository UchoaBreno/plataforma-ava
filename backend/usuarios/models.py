from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# ─── Usuário ───────────────────────────────────────────────────
class Usuario(AbstractUser):
    foto_perfil = models.ImageField(upload_to="fotos_perfil/", null=True, blank=True)

    def __str__(self):
        return self.username

# ─── Aulas ─────────────────────────────────────────────────────
class Aula(models.Model):
    """Modelo de Aulas Postadas por Professores"""
    titulo       = models.CharField(max_length=100)
    descricao    = models.TextField(blank=True)
    video_url    = models.URLField(blank=True)
    arquivo      = models.FileField(upload_to="aulas/", blank=True, null=True)
    data         = models.DateField()
    hora         = models.TimeField()
    professor    = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="aulas")
    criada_em    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

# ─── Entregas ──────────────────────────────────────────────────
class Entrega(models.Model):
    """Entrega de atividades pelos alunos"""
    aluno          = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    aula           = models.ForeignKey(Aula, on_delete=models.CASCADE)
    arquivo        = models.FileField(upload_to="entregas/")
    data_envio     = models.DateTimeField(auto_now_add=True)
    resposta_texto = models.TextField(blank=True)

    def __str__(self):
        return f"{self.aluno.username} - {self.aula.titulo}"

# ─── Quizzes ───────────────────────────────────────────────────
class Quiz(models.Model):
    title        = models.CharField(max_length=200)
    description  = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Questao(models.Model):
    quiz = models.ForeignKey(Quiz, related_name="questions", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return self.text

class Alternativa(models.Model):
    question   = models.ForeignKey(Questao, related_name="choices", on_delete=models.CASCADE)
    text       = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'Correta' if self.is_correct else 'Incorreta'})"

# ─── Resposta de Quiz ──────────────────────────────────────────
class RespostaQuiz(models.Model):
    aluno        = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    quiz         = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    resposta     = models.JSONField()
    nota         = models.IntegerField(null=True, blank=True)
    respondido_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.aluno.username} - Quiz {self.quiz.id}"

# ─── Atividades ────────────────────────────────────────────────
class Atividade(models.Model):
    titulo        = models.CharField(max_length=200)
    descricao     = models.TextField(blank=True)
    data_entrega  = models.DateField()
    hora_entrega  = models.TimeField()
    pontos        = models.PositiveIntegerField()
    arquivo       = models.FileField(upload_to="atividades/", null=True, blank=True)
    professor     = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="atividades")
    criada_em     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

# ─── Fórum ─────────────────────────────────────────────────────
class ComentarioForum(models.Model):
    autor      = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    texto      = models.TextField()
    criado_em  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.autor.username}: {self.texto[:30]}"

class RespostaForum(models.Model):
    comentario = models.ForeignKey(ComentarioForum, related_name="respostas", on_delete=models.CASCADE)
    autor      = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    texto      = models.TextField()
    criado_em  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.autor.username} respondeu: {self.texto[:30]}"

# ─── Desempenho ────────────────────────────────────────────────
class Desempenho(models.Model):
    titulo      = models.CharField(max_length=255)
    descricao   = models.TextField()
    nota        = models.DecimalField(max_digits=4, decimal_places=2)
    aluno       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.titulo} - {self.aluno.username}"

class SolicitacaoProfessor(models.Model):
    nome = models.CharField(max_length=150)
    sobrenome = models.CharField(max_length=150)
    email = models.EmailField()
    username = models.CharField(max_length=150, unique=True)
    senha = models.CharField(max_length=128)
    data_solicitacao = models.DateTimeField(auto_now_add=True)
    aprovado = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} - {'Aprovado' if self.aprovado else 'Pendente'}"
