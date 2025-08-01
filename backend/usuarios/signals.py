from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SolicitacaoProfessor, Usuario

@receiver(post_save, sender=SolicitacaoProfessor)
def criar_usuario_professor(sender, instance, created, **kwargs):
    if instance.aprovado:
        try:
            user = Usuario.objects.get(username=instance.username)
        except Usuario.DoesNotExist:
            user = Usuario.objects.create_user(
                username=instance.username,
                email=instance.email,
                password=instance.senha,
                first_name=instance.nome,
                last_name=instance.sobrenome,
                is_staff=True,
                is_active=True,
            )
        else:
            user.first_name = instance.nome
            user.last_name = instance.sobrenome
            user.email = instance.email
            user.is_staff = True
            user.is_active = True
            user.set_password(instance.senha)  # 🚨 importante
            user.save()
