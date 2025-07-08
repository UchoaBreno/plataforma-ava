from django.db import migrations

def create_superuser(apps, schema_editor):
    User = apps.get_model('usuarios', 'Usuario')
    if not User.objects.filter(username='Breno').exists():
        User.objects.create_superuser(
            username='Breno',
            email='',
            password='qwe123!',
            is_superuser=True,
            is_staff=True,
            is_active=True
        )

class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),  # garanta que o número corresponda à sua primeira migration
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]
