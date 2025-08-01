from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import SolicitacaoProfessor
from .models import Usuario

from .models import (
    Aula,
    Atividade,
    Entrega,
    Quiz,
    RespostaQuiz,
    ComentarioForum,
    RespostaForum,
    Desempenho,
)

User = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "is_staff", "is_active")
    list_filter = ("is_staff", "is_superuser", "is_active")
    search_fields = ("username", "email")


@admin.register(Aula)
class AulaAdmin(admin.ModelAdmin):
    list_display = ("id", "titulo")  # usa apenas campos existentes
    search_fields = ("titulo",)


@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    list_display = ("id", "titulo")
    search_fields = ("titulo",)


@admin.register(Entrega)
class EntregaAdmin(admin.ModelAdmin):
    list_display = ("id",)  # mínimo garantido


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "id")  # não sei os campos reais
    # ajuste conforme necessário


@admin.register(RespostaQuiz)
class RespostaQuizAdmin(admin.ModelAdmin):
    list_display = ("id",)


@admin.register(ComentarioForum)
class ComentarioForumAdmin(admin.ModelAdmin):
    list_display = ("id",)


@admin.register(RespostaForum)
class RespostaForumAdmin(admin.ModelAdmin):
    list_display = ("id",)


@admin.register(Desempenho)
class DesempenhoAdmin(admin.ModelAdmin):
    list_display = ("id",)

@admin.register(SolicitacaoProfessor)
class SolicitacaoProfessorAdmin(admin.ModelAdmin):
    list_display = ["username", "email", "data_solicitacao", "aprovado"]
    actions = ["aprovar_solicitacao"]

    def aprovar_solicitacao(self, request, queryset):
        for solicitacao in queryset:
            if not solicitacao.aprovado:
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
        self.message_user(request, "Solicitações aprovadas e usuários criados.")
    aprovar_solicitacao.short_description = "Aprovar solicitações selecionadas"