from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import os
from django.conf import settings
from users.models import UserFile
from .services import MalwareMutator


class MutatePayloadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)


    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Save original file temporarily
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', 'original')
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, file_obj.name)
        
        try:
            print(f"DEBUG: Processing file {file_path}")
            with open(file_path, 'wb+') as destination:
                for chunk in file_obj.chunks():
                    destination.write(chunk)

            print("DEBUG: Starting mutation...")
            mutator = MalwareMutator()
            result = mutator.process(file_path)
            print(f"DEBUG: Mutation success: {result}")

            # Save to Database for History using UserFile (users app)
            relative_db_path = os.path.relpath(result['variant_path'], settings.MEDIA_ROOT).replace('\\', '/')
            print(f"DEBUG: Saving to DB: {relative_db_path}")

            UserFile.objects.create(
                user=request.user,
                file=relative_db_path
            )
            print("DEBUG: DB Save success")
            
            return Response(result, status=status.HTTP_200_OK)


        except Exception as e:
            print(f"ERROR in MutatePayloadView: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
