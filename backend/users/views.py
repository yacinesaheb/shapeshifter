from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from .models import UserFile
from .serializers import UserFileSerializer


class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key})

class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": UserSerializer(user).data, "token": token.key})

# File upload
class UserFileUploadView(generics.ListCreateAPIView):
    serializer_class = UserFileSerializer
    permission_classes = [permissions.IsAuthenticated]  # Only logged-in users allowed

    # This method controls which files the user can see (only their own)
    def get_queryset(self):
        return UserFile.objects.filter(user=self.request.user)

    # This method automatically attaches the current user when saving a new file
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import UserFile
from rest_framework.response import Response



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Return user profile info for dashboard"""
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "joined": user.date_joined.strftime("%Y-%m-%d"),
        "plan": "Free Plan",
        "is_admin": user.is_staff,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_uploads(request):
    """Return last 5 uploaded files for the logged-in user"""
    files = UserFile.objects.filter(user=request.user).order_by("-uploaded_at")[:5]
    data = [
        {
            "name": f.file.name.split("/")[-1],
            "size": f.file.size,
            "date": f.uploaded_at.strftime("%Y-%m-%d %H:%M"),
        }
        for f in files
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def storage_usage(request):
    """Return total storage used + percentage"""
    files = UserFile.objects.filter(user=request.user)
    used = sum([f.file.size for f in files])
    total = 10 * 1024 * 1024 * 1024  # 10 GB total plan
    percent = (used / total) * 100 if total > 0 else 0
    return Response({
        "used": used,
        "total": total,
        "percentage": percent,
        "file_count": files.count(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_stats(request):
    """Return global stats for dashboard"""
    from django.contrib.auth.models import User
    from .models import UserFile

    total_users = User.objects.count()
    total_files = UserFile.objects.count()
    uptime = 99  # You can replace with dynamic later if you want

    return Response({
        "users": total_users,
        "files": total_files,
        "uptime": uptime,
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_files(request):
    """Return ALL files for admin dashboard with user info"""
    files = UserFile.objects.all().order_by("-uploaded_at")
    data = [
        {
            "id": f.id,
            "filename": f.file.name.split("/")[-1],
            "url": f.file.url,
            "uploaded_at": f.uploaded_at.strftime("%Y-%m-%d %H:%M"),
            "owner_username": f.user.username,
            "owner_email": f.user.email,
        }
        for f in files
    ]
    return Response(data)


# Google Auth
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests # ✅ Import requests for fetching userinfo
from rest_framework.views import APIView
from rest_framework import status
import random
import string

from rest_framework import permissions # make sure this is imported or available
from django.contrib.auth.models import User # ✅ Import User model
from rest_framework.authtoken.models import Token # ✅ Ensure Token is imported (it is at top, but just to be safe if I moved things)
from .serializers import UserSerializer # ✅ Ensure Serializer is imported

class GoogleLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_str = request.data.get('token')
        print(f"DEBUG: Received Google Token (Access Token): {token_str[:20]}...") 
        
        if not token_str:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # New Logic: Verify Access Token by calling Google UserInfo API
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            response = requests.get(user_info_url, params={'access_token': token_str})
            
            if not response.ok:
                raise ValueError("Failed to obtain user info from Google")
            
            id_info = response.json()
            print(f"DEBUG: Google User Info: {id_info}")

            email = id_info.get('email')
            if not email:
                 raise ValueError("Google account has no email")

            # Check if user exists
            user = User.objects.filter(email=email).first()
            
            if user:
                print(f"DEBUG: User found: {user.username}")
            else:
                print("DEBUG: Creating new user.")
                # Create user
                username = email
                if User.objects.filter(username=username).exists():
                     username = f"{email}_{''.join(random.choices(string.digits, k=4))}"

                password = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
                user = User.objects.create_user(username=username, email=email, password=password)
            
            # Generate token
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({"user": UserSerializer(user).data, "token": token.key})
            
        except Exception as e:
            print(f"DEBUG: Error: {e}")
            return Response({'error': f'Auth Failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"DEBUG: Unexpected Error: {e}")
            return Response({'error': f'Server Error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
