import os
import re

src_dir = r"c:\Users\Vinicius\Desktop\vinicius\RedDash\src"

def check_imports():
    errors = []
    # Regex to find imports like: import ... from './some/Path'
    import_re = re.compile(r"from\s+['\"]([^'\"]+)['\"]")
    
    for root, dirs, files in os.walk(src_dir):
        for f in files:
            if not f.endswith(('.ts', '.tsx')):
                continue
            
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as file:
                lines = file.readlines()
                
            for line_no, line in enumerate(lines, 1):
                match = import_re.search(line)
                if match:
                    import_path = match.group(1)
                    # Ignore external npm modules (don't start with . or ..)
                    if not import_path.startswith('.'):
                        continue
                    
                    # Resolve path relative to the current file
                    current_dir = os.path.dirname(filepath)
                    target_path = os.path.normpath(os.path.join(current_dir, import_path))
                    
                    # We need to find if there is a case sensitivity mismatch.
                    # Let's break down target_path into parts and check actual casing of each part on disk.
                    parts = target_path.split(os.sep)
                    # Start from root or first drive part
                    current_check = parts[0] + os.sep if parts[0].endswith(':') else parts[0]
                    
                    for part in parts[1:]:
                        if not part:
                            continue
                        # List all items in current_check directory
                        if not os.path.exists(current_check):
                            break
                        try:
                            items = os.listdir(current_check)
                        except Exception:
                            break
                        
                        # Find matching item (case-insensitive)
                        matched = [item for item in items if item.lower() == part.lower()]
                        if not matched:
                            # File does not exist at all, handled by standard compiler
                            break
                        
                        # Check if the case matches exactly
                        actual_name = matched[0]
                        if actual_name != part:
                            # Wait, maybe it's a file extension omission (e.g. importing .ts/.tsx as file without extension)
                            # Let's check if the part is the last one and matches file without extension
                            is_last = (part == parts[-1])
                            ext_matched = False
                            if is_last:
                                for ext in ['.ts', '.tsx', '.css', '.svg']:
                                    if actual_name.lower() == (part + ext).lower():
                                        if actual_name != (part + ext):
                                            errors.append({
                                                "file": filepath,
                                                "line": line_no,
                                                "import": import_path,
                                                "actual": actual_name,
                                                "reason": f"Case mismatch on file extension: imported '{part}', actual file is '{actual_name}'"
                                            })
                                        ext_matched = True
                                        break
                            
                            if not ext_matched and not is_last:
                                errors.append({
                                    "file": filepath,
                                    "line": line_no,
                                    "import": import_path,
                                    "actual": actual_name,
                                    "reason": f"Case mismatch in directory: imported '{part}', actual is '{actual_name}'"
                                })
                            elif not ext_matched:
                                # Last part is not an extension omission, it's a real mismatch
                                errors.append({
                                    "file": filepath,
                                    "line": line_no,
                                    "import": import_path,
                                    "actual": actual_name,
                                    "reason": f"Case mismatch in filename: imported '{part}', actual is '{actual_name}'"
                                })
                        
                        current_check = os.path.join(current_check, actual_name)

    if errors:
        print(f"FOUND {len(errors)} CASE-SENSITIVITY IMPORT ERRORS:")
        for err in errors:
            print(f"- File: {err['file']}:{err['line']}")
            print(f"  Imported: '{err['import']}'")
            print(f"  Reason: {err['reason']}\n")
    else:
        print("CONGRATULATIONS! 0 CASE-SENSITIVITY IMPORT ERRORS FOUND!")

if __name__ == '__main__':
    check_imports()
