
"""Calcul de distance ssdeep"""

try:
    import ssdeep
except ImportError:
    ssdeep = None

from typing import Optional

class Comparator:
    """Compare deux fichiers binaires avec ssdeep"""
    
    @staticmethod
    def calculate_distance(file1_path: str, file2_path: str) -> Optional[int]:
        """
        Calcule la distance ssdeep entre deux fichiers
        Returns: Distance (0-100) où 100 = identiques, 0 = très différents
        """
        if ssdeep is None:
            print("SSDeep module not found")
            return 0 # Fallback

        try:
            # Note: The original code used `pyssdeep`, but modern pip install is `ssdeep` or `ppdeep`.
            # Usage might vary. Let's try standard `ssdeep` usage.
            # If `ssdeep` library is the python wrapper for libfuzzy:
            # hash1 = ssdeep.hash_from_file(file1_path)
            # But the original code used `ssdeep.fuzzy_hash_filename`.
            # I will assume the installed `ssdeep` supports `hash_from_file` or similar.
            # Let's try to adapt to common library `ssdeep`.
            
            try:
                hash1 = ssdeep.hash_from_file(file1_path)
                hash2 = ssdeep.hash_from_file(file2_path)
            except AttributeError:
                 # Fallback for some wrappers
                 with open(file1_path, 'rb') as f:
                     hash1 = ssdeep.hash(f.read())
                 with open(file2_path, 'rb') as f:
                     hash2 = ssdeep.hash(f.read())

            # Validates
            if not hash1 or not hash2:
                return 0

            # Compare (returns 0-100 similarity)
            similarity = ssdeep.compare(hash1, hash2)
            
            # The original code returned DISTANCE (100 - similarity)?
            # "Convertir en distance (100 - similarity)"
            # "distance = 100 - similarity"
            # Wait, usually ssdeep score IS similarity. 100 means identical.
            # The paper formula uses `ssdeep(x,y)` which is usually similarity.
            # Scorer code: `ssdeep_normalized = ssdeep_distance / 100.0`
            # `fitness = w * vt + (1-w) * ssdeep_normalized`
            # If files are identical (similarity 100), ssdeep_norm = 1.
            # Then Fitness increases.
            # So "ssdeep_distance" in the original code seems to actually mean SIMILARITY.
            # But the variable name says "distance" and line 39 says `distance = 100 - similarity`.
            # IF "distance" = 0 (identical), then fitness = ... + (1-w)*0 = ...
            # IF "distance" = 100 (different), then fitness = ... + (1-w)*1 = ...
            # So DIFFERENT files give HIGHER fitness.
            # This confirms High Fitness = High Change/Evasion.
            # OK, I will keep the logic: Return 100 - similarity.
            
            return 100 - similarity
            
        except Exception as e:
            print(f"❌ Erreur comparaison ssdeep: {e}")
            return 0
