#  usuarios/views.py
from rest_framework.views            import APIView
from rest_framework.response         import Response
from rest_framework                  import status
from rest_framework.permissions      import IsAuthenticated
from rest_framework.parsers          import MultiPartParser
from rest_framework.generics         import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    ListAPIView,
)
from rest_framework_simplejwt.views  import TokenObtainPairView

from .models      import Usuario, Aula, Entrega
from .serializers import (
    CustomLoginSerializer,
    UsuarioSerializer,
    AulaSerializer,
    EntregaSerializer,
    CustomTokenObtainPairSerializer,
)

# ─── Entregas ──────────────────────────────────────────────────
class EntregaView(ListCreateAPIView):
    serializer_class   = EntregaSerializer
    permission_classes = [IsAuthenticated]
    parser_classes     = [MultiPartParser]

    def get_queryset(self):
        user = self.request.user
        return Entrega.objects.all() if user.is_staff else Entrega.objects.filter(aluno=user)

    def perform_create(self, serializer):
        serializer.save(aluno=self.request.user)


# ─── Aulas ─────────────────────────────────────────────────────
class AulaView(ListCreateAPIView):
    queryset           = Aula.objects.all()
    serializer_class   = AulaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(professor=self.request.user)


class AulaDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class   = AulaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Aula.objects.filter(professor=self.request.user) if self.request.user.is_staff else Aula.objects.none()


# ─── Alunos ────────────────────────────────────────────────────
class AlunoListView(ListAPIView):
    serializer_class   = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(is_staff=False)


# ─── Usuários (listar / criar) ─────────────────────────────────
class UsuarioListCreateView(ListCreateAPIView):
    queryset           = Usuario.objects.all()
    serializer_class   = UsuarioSerializer
    permission_classes = [IsAuthenticated]


class AtualizarFotoPerfilView(APIView):
    parser_classes     = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.foto_perfil = request.data.get("foto_perfil")
        user.save()
        return Response({"foto_url": user.foto_perfil.url})


class UsuarioDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            usuario = Usuario.objects.get(username=username)
            return Response(UsuarioSerializer(usuario).data)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuário não encontrado"}, status=404)


# ─── Autenticação ──────────────────────────────────────────────
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class LoginView(APIView):
    def post(self, request):
        serializer = CustomLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
