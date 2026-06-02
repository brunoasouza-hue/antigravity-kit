import json

log_path = r"C:\Users\Instrutor\.gemini\antigravity\brain\7e07d288-9874-4086-94e8-eb9e588f6b5d\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

count = 0
for idx in range(len(lines) - 1, -1, -1):
    line = lines[idx]
    if "corretivas.php" in line.lower() and "view_file" in line.lower():
        try:
            data = json.loads(line)
            step_index = data.get("step_index", 0)
            step_type = data.get("type", "")
            content = data.get("content", "")
            
            # Avoid step files by checking the path in metadata
            metadata_str = str(data.get("metadata", {})).lower()
            if "step_" in metadata_str or "session_step_" in metadata_str or "back_step_" in metadata_str:
                continue
                
            if step_type == "VIEW_FILE":
                print(f"Index {idx} (Step {step_index}): type={step_type}, content_len={len(content)}")
                print(f"  Snippet: {content[:300]}")
                
                # Save it
                out_path = f"scratch/back_step_{step_index}.txt"
                with open(out_path, 'w', encoding='utf-8') as out:
                    out.write(content)
                print(f"  -> Dumped to {out_path}")
                
                count += 1
                if count >= 15:
                    break
        except Exception as e:
            pass
print("Scan finished.")
