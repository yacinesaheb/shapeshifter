from django.urls import path
from .views_auth import register, login
from .views import FileListCreateAPIView

urlpatterns = [
    path("register/", register),
    path("login/", login),
    path("files/", FileListCreateAPIView.as_view()),
]
