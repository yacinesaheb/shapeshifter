
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import os
import json
import hashlib
from django.conf import settings
from .utils.perturbations.registry import PerturbationRegistry
from .utils.core.scorer import Scorer
from .utils.core.comparator import Comparator
from .utils.core.excel_behavior_parser import ExcelBehaviorParser

# Helpers to match 'models/malware.py' and 'models/variant.py' logic
def calculate_md5(path):
    with open(path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def calculate_size(path):
    return os.path.getsize(path)

def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'utils', 'config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except:
        return {"scorings": {"weight_vt": 0.7, "weight_ssdeep": 0.3}}

def save_uploaded_file(file_obj, subfolder):
    path = os.path.join(settings.MEDIA_ROOT, 'advanced', subfolder)
    os.makedirs(path, exist_ok=True)
    full_path = os.path.join(path, file_obj.name)
    with open(full_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)
    return full_path

class ExperimentStartView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        file_path = save_uploaded_file(file_obj, 'original')
        
        # Feature Parity: Calculate MD5 & Size immediately (Like Malware model)
        md5_hash = calculate_md5(file_path)
        size_bytes = calculate_size(file_path)

        is_exe = file_obj.name.lower().endswith('.exe')
        
        # Recommendation
        recommendation = "section_append" if is_exe else "generic_append"
        
        registry = PerturbationRegistry()
        available_perturbations = registry.list_all()

        return Response({
            "status": "success",
            "message": "File prepared.",
            "original_file_path": file_path,
            "md5": md5_hash,
            "size": size_bytes,
            "recommendation": recommendation,
            "available_perturbations": available_perturbations
        })

class ExperimentMutateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        original_path = request.data.get('original_path')
        perturbation_name = request.data.get('perturbation')
        
        if not original_path or not os.path.exists(original_path):
             return Response({"error": "Original file not found"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            with open(original_path, 'rb') as f:
                original_bytes = f.read()
            
            registry = PerturbationRegistry()
            modified_bytes = registry.apply(perturbation_name, original_bytes)
            
            # Save Variant
            filename = os.path.basename(original_path)
            variant_filename = f"{filename}.{perturbation_name}.exe"
            variant_path = os.path.join(settings.MEDIA_ROOT, 'advanced', 'variants', variant_filename)
            os.makedirs(os.path.dirname(variant_path), exist_ok=True)
            
            with open(variant_path, 'wb') as f:
                f.write(modified_bytes)
            
            # Feature Parity: Check PE Validity (Step 6 of manual pipeline)
            # We use lief to check if it parses correctly
            try:
                import lief
                pe = lief.PE.parse(variant_path)
                if pe is None or not hasattr(pe, 'optional_header') or pe.optional_header.sizeof_image == 0:
                     # If corrupt, we should warn user, but we can return it anyway with a flag
                     is_valid = False
                else:
                     is_valid = True
            except ImportError:
                is_valid = True # Assume valid if we can't check
            except Exception:
                is_valid = False

            # Calculate MD5/Size (Like Variant model)
            variant_md5 = calculate_md5(variant_path)
            variant_size = calculate_size(variant_path)
                
            relative_url = os.path.relpath(variant_path, settings.MEDIA_ROOT).replace('\\', '/')
            download_url = f"{settings.MEDIA_URL}{relative_url}"
            
            return Response({
                "status": "success",
                "variant_url": download_url,
                "variant_path": variant_path,
                "variant_md5": variant_md5,
                "variant_size": variant_size,
                "is_valid": is_valid
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ExperimentAnalyzeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        excel_original = request.FILES.get('excel_original')
        excel_variant = request.FILES.get('excel_variant')
        rate_original = float(request.data.get('rate_original', 0))
        rate_variant = float(request.data.get('rate_variant', 0))
        original_file_path = request.data.get('original_file_path')
        variant_file_path = request.data.get('variant_file_path')

        if not excel_original or not excel_variant:
             return Response({"error": "Both Excel reports are required"}, status=status.HTTP_400_BAD_REQUEST)

        path_orig_xls = save_uploaded_file(excel_original, 'reports')
        path_var_xls = save_uploaded_file(excel_variant, 'reports')
        
        parser = ExcelBehaviorParser()
        sigs_original = parser.extract_signatures(path_orig_xls)
        sigs_variant = parser.extract_signatures(path_var_xls)
        
        common = sigs_original.intersection(sigs_variant)
        total = sigs_original.union(sigs_variant)
        similarity = len(common) / len(total) if len(total) > 0 else 0
        is_functional = similarity >= 0.6
        
        ssdeep_dist = 0
        if original_file_path and variant_file_path:
            # Feature: Calculate explicit SSDeep distance
            comparator = Comparator()
            ssdeep_dist = comparator.calculate_distance(original_file_path, variant_file_path)
        
        # Load Config for weights
        config = load_config()
        weights = config.get("scorings", {"weight_vt": 0.7, "weight_ssdeep": 0.3})
        
        scorer = Scorer(weight_vt=weights["weight_vt"], weight_ssdeep=weights["weight_ssdeep"])
        score_details = scorer.calculate_detailed_score(
            original_vt_rate=rate_original / 100.0,
            variant_vt_rate=rate_variant / 100.0,
            ssdeep_distance=ssdeep_dist,
            is_functional=is_functional
        )
        
        return Response({
            "status": "success",
            "scores": score_details,
            "similarity_percent": similarity * 100,
            "signatures_original": list(sigs_original),
            "signatures_variant": list(sigs_variant)
        })
