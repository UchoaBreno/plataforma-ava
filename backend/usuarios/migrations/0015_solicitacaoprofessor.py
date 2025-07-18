# Generated by Django 5.2 on 2025-07-07 08:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0014_rename_enviado_em_entrega_data_envio_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='SolicitacaoProfessor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=150)),
                ('sobrenome', models.CharField(max_length=150)),
                ('email', models.EmailField(max_length=254)),
                ('username', models.CharField(max_length=150, unique=True)),
                ('senha', models.CharField(max_length=128)),
                ('data_solicitacao', models.DateTimeField(auto_now_add=True)),
                ('aprovado', models.BooleanField(default=False)),
            ],
        ),
    ]
