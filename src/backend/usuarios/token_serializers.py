from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        """
        Adiciona informações extras ao payload do token JWT.
        """
        token = super().get_token(user)
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        return token

    def validate(self, attrs):
        """
        Adiciona as mesmas informações extras também na resposta imediata,
        além do access/refresh.
        """
        data = super().validate(attrs)
        data['username'] = self.user.username
        data['is_staff'] = self.user.is_staff
        data['is_superuser'] = self.user.is_superuser
        return data
