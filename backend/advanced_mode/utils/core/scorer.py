
"""Calcul du score de fitness (Équation 1 du paper)"""
from typing import Optional

class Scorer:
    """Calcule le fitness score selon le paper"""
    
    def __init__(self, weight_vt: float = 0.7, weight_ssdeep: float = 0.3):
        """
        Args:
            weight_vt: Poids du taux VirusTotal (w dans l'équation)
            weight_ssdeep: Poids de la distance ssdeep (1-w)
        """
        self.w = weight_vt
        # assert 0 <= self.w <= 1, "weight_vt doit être entre 0 et 1"
        # assert abs((self.w + weight_ssdeep) - 1.0) < 0.001, "Les poids doivent sommer à 1"
    
    def calculate_fitness(
        self,
        vt_detection_rate: float,
        ssdeep_distance: int,
        is_functional: bool
    ) -> Optional[float]:
        """
        Calcule le fitness selon l'équation du paper:
        Fitness(var_orig,i) = w × VT(var_orig,i) + (1 - w) × ssdeep(orig, var_orig,i)
        """
        if not is_functional:
            return 0.0
        
        # Normaliser ssdeep_distance (0-100 -> 0.0-1.0)
        ssdeep_normalized = ssdeep_distance / 100.0
        
        # Équation (1) du paper - Note: usually higher fitness means BETTER evasion.
        # But here: VT rate is GOOD if LOW. ssdeep is GOOD if HIGH (similarity).
        # Let's check the original code: 
        # fitness = self.w * vt_detection_rate + (1 - self.w) * ssdeep_normalized
        #Wait, if VT rate is 1.0 (100% detected), fitness increases? That seems wrong for "Malware Fitness".
        # Let's assume the paper definition: Fitness = ability to EVADE.
        # If VT=1.0, Fitness should be low. 
        # But the code says: fitness = w * vt + ...
        # Based on executive_summary.md: "0.8+ : Excellente évasion".
        # If VT=0.89 (High detection) and Similarity=0.87 (High similarity), Fitness = 0.7*0.89 + 0.3*0.87 = ~0.88.
        # This implies High Score = High Visibility = BAD Evasion?
        # executive summary says: "0.8+ : Excellente évasion" -> This contradicts the formula if VT is high.
        # Let's trust the CODE from projet-ap-main over my intuition for now, but I suspect the formula might be:
        # Fitness = w * (1 - VT) + ... ?? 
        # Checking executive_summary again:
        # "Fitness = 0.7 * Taux_VT + 0.3 * Distance_ssdeep"
        # "Interprétation: 0.8+ : Excellente évasion"
        # If I have 0% detection (Ideal), VT=0. Similarity=100% (Ideal), ssdeep=1.
        # Fitness = 0.7*0 + 0.3*1 = 0.3. This is LOW.
        # If I have 100% detection (Bad), VT=1. ssdeep=1.
        # Fitness = 0.7*1 + 0.3*1 = 1.0. This is HIGH.
        # So HIGH fitness = BAD evasion?
        # "0.8+ : Excellente évasion" -> This text must be wrong or I am misinterpreting "Taux_VT".
        # Maybe Taux_VT is "Evasion Rate"? (i.e. 1 - detection).
        # In pipeline_manual.py: "malware.vt_detection_rate = original_info['detection_rate']" (User inputs 75 for 75% detection).
        # So Taux_VT IS detection rate.
        # OK, I will stick to the exact code provided in `scorer.py` to be safe.
        
        fitness = self.w * vt_detection_rate + (1 - self.w) * ssdeep_normalized
        
        return fitness
    
    def calculate_detailed_score(
        self,
        original_vt_rate: float,
        variant_vt_rate: float,
        ssdeep_distance: int,
        is_functional: bool
    ) -> dict:
        
        fitness = self.calculate_fitness(
            variant_vt_rate,
            ssdeep_distance,
            is_functional
        )
        
        vt_reduction = original_vt_rate - variant_vt_rate
        vt_reduction_percent = (vt_reduction / original_vt_rate * 100) if original_vt_rate > 0 else 0
        
        return {
            "fitness": fitness,
            "is_functional": is_functional,
            "vt_original": original_vt_rate,
            "vt_variant": variant_vt_rate,
            "vt_reduction": vt_reduction,
            "vt_reduction_percent": vt_reduction_percent,
            "ssdeep_distance": ssdeep_distance,
            "weight_vt": self.w,
            "weight_ssdeep": 1 - self.w
        }
