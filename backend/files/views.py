from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import File
from .serializers import FileSerializer

class FileListCreateAPIView(generics.ListCreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
