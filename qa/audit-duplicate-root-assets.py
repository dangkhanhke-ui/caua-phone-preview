#!/usr/bin/env python3
"""Conservative, read-only report for duplicate root uploads.
Keep canonical assets/* paths. Do NOT delete from this script.
"""
import collections
import json
import os
import re
import subprocess
from pathlib import Path

TEXT_SUFFIXES = {".html", ".css", ".js", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml", ".py", ".txt", ".svg", ".xml", ".webmanifest"}

def tracked_blobs():
    raw = subprocess.check_output(["git", "ls-tree", "-r", "-z", "HEAD"])
    entries = []
    for item in raw.split(b"\x00"):
        if not item:
            continue
        meta, path = item.split(b"\t", 1)
        mode, kind, sha = meta.decode("ascii").split()
        if kind == "blob":
            entries.append((os.fsdecode(path), sha))
    return entries

def path_context(text, needle):
    """Distinguish ./root.jpg from assets/photos/root.jpg.
    Return actual references, conservatively including uncertain mentions.
    """
    positions = []
    offset = 0
    while True:
        pos = text.find(needle, offset)
        if pos < 0:
            break
        offset = pos + 1
        end = pos + len(needle)
        if end < len(text) and (text[end].isalnum() or text[end] in "._-"):
            continue
        before = text[max(0, pos - 240):pos]
        match = re.search(r'''[^\s'"()<>{}\[\],;:=]+$''', before)
        prefix = match.group() if match else ""
        if prefix in ("", "/", "./", "../") or "\\" in prefix:
            positions.append((pos, prefix))
        elif prefix.startswith("./assets/") or prefix.startswith("assets/") or prefix.startswith("/assets/"):
            continue
        elif "/" not in prefix:
            positions.append((pos, prefix))
    return positions

def run():
    tree = tracked_blobs()
    groups = collections.defaultdict(list)
    for name, sha in tree:
        groups[sha].append(name)
    roots = {}
    for group in groups.values():
        if len(group) <= 1 or not any(x.startswith("assets/") for x in group):
            continue
        for name in group:
            if "/" not in name:
                roots[name] = {"bytes": Path(name).stat().st_size, "canonical": [x for x in group if x.startswith("assets/")]}
    texts = {}
    for path, _ in tree:
        if Path(path).suffix.lower() in TEXT_SUFFIXES:
            try:
                texts[path] = Path(path).read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
    kept = {}
    candidates = {}
    for root, info in roots.items():
        hits = []
        for source, text in texts.items():
            if root not in text:
                continue
            for pos, prefix in path_context(text, root):
                hits.append({"source": source, "prefix": prefix, "offset": pos})
                if len(hits) >= 8:
                    break
            if len(hits) >= 8:
                break
        if hits:
            kept[root] = {**info, "references": hits}
        else:
            candidates[root] = info
    summary = {
        "tracked_file_count": len(tree),
        "duplicate_groups": sum(len(v) > 1 for v in groups.values()),
        "duplicate_root_aliases": len(roots),
        "candidate_count": len(candidates),
        "candidate_bytes": sum(v["bytes"] for v in candidates.values()),
        "candidate_mb": round(sum(v["bytes"] for v in candidates.values()) / 1048576, 2),
        "referenced_root_count": len(kept),
        "referenced_roots": kept,
        "safe_to_delete": candidates,
    }
    print("DUPLICATE_ASSET_AUDIT_JSON=" + json.dumps(summary, ensure_ascii=False, separators=(",", ":")))
    with open("/tmp/caua-asset-dedupe-report.json", "w", encoding="utf-8") as out:
        json.dump(summary, out, ensure_ascii=False, indent=2)
    print("DUPLICATE_ASSET_AUDIT_SUMMARY candidate_files=%d candidate_MiB=%.2f protected_root_aliases=%d" %
          (len(candidates), summary["candidate_mb"], len(kept)))

if __name__ == "__main__":
    run()
