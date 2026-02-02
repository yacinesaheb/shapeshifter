"""Classe abstraite pour les perturbations"""
from abc import ABC, abstractmethod

class BasePerturbation(ABC):
    """Classe abstraite pour toutes les perturbations"""
    
    def __init__(self, name: str):
        self.name = name
    
    @abstractmethod
    def apply(self, input_bytes: bytes, seed=None) -> bytes:
        """
        Applique la perturbation
        
        Args:
            input_bytes: bytes du fichier PE
            seed: graine aléatoire (optionnel)
            
        Returns:
            bytes du fichier modifié
        """
        pass
    
    def __str__(self):
        return self.name
