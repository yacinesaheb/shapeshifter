import os
import hashlib
from django.conf import settings
from .engine.perturbations.registry import PerturbationRegistry

class MalwareMutator:
    def __init__(self):
        self.registry = PerturbationRegistry()

    def process(self, input_path, perturbation="section_append"):
        """
        Reads the input file, applies the perturbation, and saves the output.
        
        Returns:
            dict: {
                "original_md5": str,
                "variant_md5": str,
                "variant_path": str, # Relative to MEDIA_ROOT
                "variant_url": str,
                "size_diff": int
            }
        """
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"File not found: {input_path}")

        # 1. Read Original
        with open(input_path, 'rb') as f:
            original_data = f.read()

        original_md5 = hashlib.md5(original_data).hexdigest()
        original_size = len(original_data)

        # 2. Apply Perturbation
        try:
            print("DEBUG: Applying perturbation using registry...")
            modified_data = self.registry.apply(perturbation, original_data)
        except Exception as e:
            # Fallback: Simple Append (Headless/Blind)
            import traceback
            traceback.print_exc()
            print(f"ERROR: Advanced perturbation engine failed: {e}")
            print("WARNING: Switching to fallback (Simple Append).")
            
            import random
            
            # Append 20-100 random bytes
            extra = bytes([random.randint(0, 255) for _ in range(random.randint(20, 100))])
            modified_data = original_data + extra
            print("DEBUG: Fallback applied successfully.")

        variant_md5 = hashlib.md5(modified_data).hexdigest()
        variant_size = len(modified_data)

        # 3. Save Variant
        # Ensure directory exists
        variants_dir = os.path.join(settings.MEDIA_ROOT, 'uploads', 'variants')
        os.makedirs(variants_dir, exist_ok=True)

        filename = os.path.basename(input_path)
        variant_filename = f"{filename}.{perturbation}.exe"
        variant_path = os.path.join(variants_dir, variant_filename)

        with open(variant_path, 'wb') as f:
            f.write(modified_data)

        # 4. Construct Result
        # Relative path for URL construction
        relative_path = os.path.join('uploads', 'variants', variant_filename).replace('\\', '/')
        
        return {
            "original_md5": original_md5,
            "variant_md5": variant_md5,
            "variant_path": variant_path.replace('\\', '/'), # Ensure POSIX path
            "variant_url": f"{settings.MEDIA_URL}{relative_path}",
            "original_size": original_size,
            "variant_size": variant_size,
            "size_diff": variant_size - original_size
        }
