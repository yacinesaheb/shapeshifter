
"""Parser pour extraire signatures depuis fichier Excel"""
import pandas as pd
from typing import Set, Dict, List

class ExcelBehaviorParser:
    """Extrait les signatures comportementales depuis un rapport Excel"""
    
    @staticmethod
    def extract_signatures(excel_path: str) -> Set[str]:
        signatures = set()
        
        try:
            excel_file = pd.ExcelFile(excel_path)
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_path, sheet_name=sheet_name)
                signatures.update(
                    ExcelBehaviorParser._extract_from_dataframe(df, sheet_name)
                )
            return signatures
            
        except Exception as e:
            print(f"Error reading Excel: {e}")
            return set()
    
    @staticmethod
    def _extract_from_dataframe(df: pd.DataFrame, sheet_name: str) -> Set[str]:
        signatures = set()
        df.columns = df.columns.str.lower().str.strip()
        
        # MITRE ATT&CK
        if 'technique_id' in df.columns:
            for val in df['technique_id'].dropna():
                sig = str(val).strip()
                if sig and sig != 'nan':
                    if '-' in sig:
                        sig = sig.split('-')[-1]
                    if sig.startswith('T'):
                        signatures.add(f"mitre-{sig}")
        
        # Direct Columns
        signature_cols = ['signature', 'behavior', 'behaviour', 'action', 'event']
        for col in signature_cols:
            if col in df.columns:
                for val in df[col].dropna():
                    sig = str(val).strip()
                    if sig and sig != 'nan':
                        if '-' in sig and sig.count('-') > 1:
                            parts = sig.split('-')
                            if len(parts) >= 2 and parts[-1].startswith('T'):
                                sig = f"mitre-{parts[-1]}"
                        signatures.add(sig)
        
        # Category + Action
        if 'category' in df.columns and 'action' in df.columns:
            for _, row in df.iterrows():
                cat = str(row.get('category', '')).strip()
                act = str(row.get('action', '')).strip()
                if cat and cat != 'nan' and act and act != 'nan':
                    signatures.add(f"{cat}-{act}")
        
        # Auto-detect first column
        if not signatures and len(df.columns) > 0:
            first_col = df.columns[0]
            for val in df[first_col].dropna():
                sig = str(val).strip()
                if sig and sig != 'nan':
                    if '-' in sig and sig.count('-') > 1:
                        parts = sig.split('-')
                        if len(parts) >= 2 and parts[-1].startswith('T'):
                            sig = f"mitre-{parts[-1]}"
                    else:
                        sig = f"{sheet_name}-{sig}"
                    signatures.add(sig)
        
        return signatures
