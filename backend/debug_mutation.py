
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from evasion.services import MalwareMutator
from django.conf import settings

def test():
    print("--- STARTING DEBUG TEST ---")
    
    # Create dummy file
    test_file_path = os.path.join(settings.BASE_DIR, 'debug_test.exe')
    with open(test_file_path, 'wb') as f:
        f.write(b"MZ" + b"\x00" * 100)
    print(f"Created test file at: {test_file_path}")

    try:
        mutator = MalwareMutator()
        print("Mutator initialized.")
        
        print("Running process()...")
        result = mutator.process(test_file_path)
        
        print("SUCCESS!")
        print(f"Result: {result}")
        
    except Exception as e:
        print("FAILURE!")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test()
