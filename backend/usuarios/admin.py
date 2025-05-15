from django.contrib import admin
from .models import Aula  # 👈 importa o model
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()

admin.site.register(User, UserAdmin)
admin.site.register(Aula)  # 👈 registra no admin