
"""Perturbation: section_append"""
try:
    import lief
except ImportError:
    lief = None

import random
import tempfile
import os
from .base import BasePerturbation


class SectionAppend(BasePerturbation):
    """Ajoute des bytes à une section existante"""

    def __init__(self):
        super().__init__("section_append")

    def apply(self, input_bytes: bytes, seed=None) -> bytes:
        """Applique section_append"""
        if lief is None:
            raise ImportError("LIEF library not installed")

        random.seed(seed)

        # Parser le PE
        pe = lief.PE.parse(list(input_bytes))
        if pe is None:
            raise ValueError("Impossible de parser le fichier PE")

        # Sections à ignorer
        IGNORE_SECTIONS = {".tls", ".reloc", ".rsrc", ".idata", ".debug"}
        # Sections préférées
        PREFERRED = [".data", ".rdata", ".text"]

        suitable_sections = []
        for s in pe.sections:
            name = s.name.rstrip("\x00")
            if name in IGNORE_SECTIONS:
                continue
            # Lief behavior: virtual_size vs size of raw data
            available = (s.size if s.size else s.virtual_size) - len(s.content)
            if available >= 10:
                suitable_sections.append((s, available))

        # Sélection de la section cible
        target_section, available = None, 0
        for pref in PREFERRED:
            for s, avail in suitable_sections:
                if s.name.rstrip("\x00") == pref:
                    target_section, available = s, avail
                    break
            if target_section:
                break

        if not target_section:
            if suitable_sections:
                target_section, available = max(suitable_sections, key=lambda x: x[1])
            else:
                # Aucune section sûre, création d'une nouvelle
                new_name = ".junk"
                new_section = lief.PE.Section(new_name)
                new_size = 0x200  # 512 bytes
                new_section.content = [random.randint(0, 255) for _ in range(new_size)]
                new_section.virtual_size = new_size
                new_section.characteristics = (
                    lief.PE.SECTION_CHARACTERISTICS.MEM_READ |
                    lief.PE.SECTION_CHARACTERISTICS.MEM_WRITE
                )
                pe.add_section(new_section, lief.PE.SECTION_TYPES.DATA)
                target_section = new_section
                available = new_size

        # Calcul du nombre de bytes à ajouter
        bytes_to_add = min(available - 5, random.randint(10, 50))
        bytes_to_add = max(0, bytes_to_add)

        # Ajouter des bytes aléatoires
        content = list(target_section.content)
        for _ in range(bytes_to_add):
            content.append(random.randint(0, 255))
        target_section.content = content

        # Écriture dans un fichier temporaire
        with tempfile.NamedTemporaryFile(delete=False, suffix=".exe") as tmp_file:
            temp_path = tmp_file.name

        try:
            pe.write(temp_path)
            with open(temp_path, "rb") as f:
                modified_bytes = f.read()
        finally:
            try:
                os.unlink(temp_path)
            except Exception:
                pass

        return modified_bytes
