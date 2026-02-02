"""Registre des perturbations disponibles"""
from .section_append import SectionAppend

class PerturbationRegistry:
    """Gère toutes les perturbations disponibles"""
    
    def __init__(self):
        self._perturbations = {}
        self._register_default()
    
    def _register_default(self):
        """Enregistre les perturbations par défaut"""
        self.register(SectionAppend())
    
    def register(self, perturbation):
        """Enregistre une nouvelle perturbation"""
        self._perturbations[perturbation.name] = perturbation
    
    def get(self, name: str):
        """Récupère une perturbation par nom"""
        return self._perturbations.get(name)
    
    def list_all(self):
        """Liste toutes les perturbations disponibles"""
        return list(self._perturbations.keys())
    
    def apply(self, name: str, input_bytes: bytes, seed=None) -> bytes:
        """Applique une perturbation"""
        perturbation = self.get(name)
        if perturbation is None:
            raise ValueError(f"Perturbation '{name}' inconnue")
        return perturbation.apply(input_bytes, seed)
