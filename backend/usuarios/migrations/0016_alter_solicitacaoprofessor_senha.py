# Generated by Django 5.2 on 2025-07-07 14:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0015_solicitacaoprofessor'),
    ]

    operations = [
        migrations.AlterField(
            model_name='solicitacaoprofessor',
            name='senha',
            field=models.CharField(help_text='Senha em texto puro, será criptografada ao aprovar.', max_length=128),
        ),
    ]
