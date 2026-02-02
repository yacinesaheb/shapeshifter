from django.urls import path
from .views import RegisterAPI, LoginAPI, UserFileUploadView
from .views import (
    RegisterAPI,
    LoginAPI,
    UserFileUploadView,
    user_profile,
    recent_uploads,
    storage_usage,
    get_stats,
    GoogleLoginView, # ✅ add this line
)
from . import views
urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'), # ✅ New Google Auth Route
    path('upload/', UserFileUploadView.as_view(), name='file-upload'),  

  # Dashboard routes
    path("me/", views.user_profile, name="user_profile"),
    path("files/recent/", views.recent_uploads, name="recent_uploads"),
    path("storage/", views.storage_usage, name="storage_usage"),
    path('stats/', get_stats, name='get_stats'),
    path('files/admin/', views.admin_files, name='admin_files'),

]
