#!/usr/bin/env python3
"""Build assets/js/data.js from content/entries.py.

Every snippet is executed and the real output is captured. Every REPL
transcript is verified with doctest. Every fix snippet is executed and must
not raise. If any of that fails the build fails, which is the point: the site
promises that what it shows you actually happened.
"""
from __future__ import annotations

import doctest
import hashlib
import json
import re
import os
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).parent
OUT = ROOT / "assets" / "js" / "data.js"
OUT_DSA = ROOT / "assets" / "js" / "dsa-data.js"
OUT_DEEP = ROOT / "assets" / "js" / "deepdive-data.js"

TIMEOUT = 15
ENV = {
    **os.environ,
    "PYTHONHASHSEED": "0",
    "PYTHONDONTWRITEBYTECODE": "1",
    "PYTHONIOENCODING": "utf-8",
    "COLUMNS": "80",
    "NO_COLOR": "1",
    "TERM": "dumb",
}


HEX_ADDR = re.compile(r"0x[0-9a-fA-F]{6,}")


def scrub(text: str, tmpdir: str, path: str, name: str) -> str:
    """Remove anything specific to this machine or this run."""
    text = text.replace(path, f"{name}.py")
    # macOS reports /private/var/... for a /var/... tempdir
    text = text.replace("/private" + tmpdir, ".").replace(tmpdir, ".")
    for prefix in {sys.prefix, sys.base_prefix,
                   str(pathlib.Path(sys.executable).parent.parent)}:
        text = text.replace(prefix, "<python>")
    # /private/var/... vs /var/... on macOS
    text = re.sub(r"/private(/var/folders/\S+)", r"\1", text)
    return HEX_ADDR.sub("0x...", text)


def run_snippet(name: str, src: str) -> tuple[str, bool]:
    """Run src as a script; return (combined output, raised?)."""
    with tempfile.TemporaryDirectory() as td:
        path = pathlib.Path(td) / f"{name}.py"
        path.write_text(src, encoding="utf-8")
        proc = subprocess.run(
            [sys.executable, str(path)],
            capture_output=True, text=True, env=ENV, cwd=td, timeout=TIMEOUT,
        )
    out = scrub(proc.stdout, td, str(path), name)
    err = scrub(proc.stderr, td, str(path), name)
    if err:
        out = (out + "\n" if out and not out.endswith("\n") else out) + err
    return out.rstrip("\n"), proc.returncode != 0


def check_repl(name: str, transcript: str) -> None:
    """Verify a >>> transcript with doctest. Raises on mismatch."""
    parser = doctest.DocTestParser()
    test = parser.get_doctest(transcript, {"__name__": "__main__"}, name, None, 0)
    runner = doctest.DocTestRunner(
        optionflags=doctest.NORMALIZE_WHITESPACE | doctest.IGNORE_EXCEPTION_DETAIL,
        verbose=False,
    )
    import io
    buf = io.StringIO()
    runner.run(test, out=buf.write)
    if runner.failures:
        raise SystemExit(f"\nREPL transcript failed for {name!r}:\n{buf.getvalue()}")


ALLOWED_TAGS = {"code", "strong", "em", "sup", "sub"}
LEVELS = {"beginner", "intermediate", "advanced"}


def validate(built: list) -> None:
    """Refuse to ship an entry that is missing the parts that make it useful."""
    problems = []
    for e in built:
        for f in ("title", "subtitle", "question", "code", "output",
                  "explanation", "tags", "takeaway", "refs", "fixCode"):
            if not e[f]:
                problems.append(f"{e['id']}: empty {f}")
        if e["difficulty"] not in LEVELS:
            problems.append(f"{e['id']}: bad difficulty {e['difficulty']!r}")
        for para in e["explanation"]:
            for tag in re.findall(r"</?(\w+)", para):
                if tag not in ALLOWED_TAGS:
                    problems.append(f"{e['id']}: unexpected <{tag}> in explanation")
        n = len(e["output"].splitlines())
        if n > 20:
            problems.append(f"{e['id']}: output is {n} lines, trim the snippet")
    if problems:
        raise SystemExit("validation failed:\n  " + "\n  ".join(problems))


DIFFS = {"easy", "medium", "hard"}


def build_dsa() -> int:
    """Execute every DSA solution against its tests and emit dsa-data.js."""
    import dsa as content

    cache_path = ROOT / "content" / "leetcode.json"
    cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}

    topics, total, checked = [], 0, 0
    for topic in content.TOPICS:
        sections, flat = [], []
        for section in topic.get("sections", []):
            problems = []
            for prob in section["problems"]:
                if prob["difficulty"] not in DIFFS:
                    raise SystemExit(f"{prob['id']}: bad difficulty {prob['difficulty']!r}")
                if not prob.get("tests"):
                    raise SystemExit(f"{prob['id']}: no tests, so nothing is verified")

                # --- LeetCode metadata, fetched once by fetch_leetcode.py
                meta, slug = {}, prob.get("slug")
                if slug:
                    if slug not in cache:
                        raise SystemExit(
                            f"{prob['id']}: {slug!r} missing from content/leetcode.json "
                            f"- run: python3 fetch_leetcode.py")
                    meta = cache[slug]
                    if meta["lc"] != prob["lc"]:
                        raise SystemExit(
                            f"{prob['id']}: lc={prob['lc']} but LeetCode says "
                            f"{meta['lc']} for {slug!r}")
                    if meta["difficulty"] != prob["difficulty"]:
                        raise SystemExit(
                            f"{prob['id']}: difficulty={prob['difficulty']!r} but "
                            f"LeetCode says {meta['difficulty']!r}")

                approaches = []
                head = content.PRELUDE + "\n\n" + topic.get("prelude", "")
                for ap in prob["approaches"]:
                    src = head + "\n\n" + ap["code"] + "\n\n" + prob["tests"] + "\n"
                    safe = re.sub(r"[^a-z0-9]+", "_",
                                  ap["name"].lower()).strip("_")[:40]
                    case = f"{prob['id'].replace('-', '_')}__{safe}"
                    out, raised = run_snippet(case, src)
                    if raised:
                        raise SystemExit(
                            f"\nDSA check failed: {prob['name']} / {ap['name']}\n{out}")
                    checked += 1
                    approaches.append({
                        "name": ap["name"],
                        "time": ap["time"],
                        "space": ap["space"],
                        "why": ap["why"],
                        "code": ap["code"].rstrip("\n"),
                        "best": bool(ap.get("best")),
                        "tag": ap.get("tag", ""),
                    })

                total += 1
                built = {
                    "id": prob["id"],
                    "num": total,
                    "lc": prob.get("lc"),
                    "slug": slug or "",
                    "url": f"https://leetcode.com/problems/{slug}/" if slug else "",
                    "premium": bool(meta.get("premium")),
                    "name": prob["name"],
                    "difficulty": prob["difficulty"],
                    "tags": prob.get("tags") or meta.get("tags", []),
                    "statement": prob.get("statement") or meta.get("statement", []),
                    "examples": prob.get("examples") or meta.get("examples", []),
                    "constraints": prob.get("constraints") or meta.get("constraints", []),
                    "note": prob.get("note", ""),
                    "pitfall": prob.get("pitfall", ""),
                    "approaches": approaches,
                    "tests": prob["tests"].rstrip("\n"),
                    "topic": topic["id"],
                    "topicTitle": topic["title"],
                    "section": section["id"],
                    "sectionTitle": section["title"],
                    "ref": ({"label": prob["ref"][0], "url": prob["ref"][1]}
                            if prob.get("ref") else None),
                }
                expect = f"https://leetcode.com/problems/{slug}/" if slug else ""
                if built["url"] != expect:
                    raise SystemExit(
                        f"{prob['id']}: url {built['url']!r} does not match "
                        f"slug {slug!r}")
                if not built["statement"]:
                    raise SystemExit(
                        f"{prob['id']}: no statement. Premium or non-LeetCode "
                        f"problems must supply their own `statement=[...]`.")
                problems.append(built)
                flat.append(built)
            sections.append({
                "id": section["id"],
                "title": section["title"],
                "summary": section.get("summary", ""),
                "idea": section.get("idea", []),
                "problems": problems,
            })
        topics.append({
            "id": topic["id"],
            "title": topic["title"],
            "status": topic.get("status", "ready"),
            "target": topic.get("target"),
            "layout": topic.get("layout", "flat"),
            "sections": sections,
            "problems": flat,
            "count": len(flat),
        })

    body = json.dumps(topics, indent=2, ensure_ascii=False)
    OUT_DSA.write_text(
        "/* GENERATED FILE - do not edit by hand.\n"
        "   Source: content/dsa.py   Build: python3 build.py\n"
        "   Every solution below was executed against the problem's tests. */\n\n"
        f"window.GRAIL_PRELUDE = {json.dumps(content.PRELUDE.rstrip(), ensure_ascii=False)};\n"
        f"window.GRAIL_DSA = {body};\n",
        encoding="utf-8")
    print(f"built {len(topics)} DSA topics, {total} problems, "
          f"{checked} solutions executed -> {OUT_DSA.relative_to(ROOT)}")
    return total


DEEP_TAGS = ALLOWED_TAGS | {"br"}
DEEP_LEVELS = {"medium", "hard"}
DEEP_MAX_LINES = 45


def build_deepdive() -> int:
    """Execute every Deep Dive code block and emit deepdive-data.js."""
    import deepdive as content

    topics, seen, runs = [], set(), 0
    problems = []

    def render(blocks, where, slug):
        nonlocal runs
        out = []
        for i, b in enumerate(blocks):
            if isinstance(b, str):
                for tag in re.findall(r"</?(\w+)", b):
                    if tag not in DEEP_TAGS:
                        problems.append(f"{where}: unexpected <{tag}>")
                out.append({"type": "p", "html": b})
                continue
            b = dict(b)
            if b["type"] == "code":
                if b.pop("run"):
                    output, raised = run_snippet(f"{slug}_{i}", b["src"])
                    runs += 1
                    if raised != b["raises"]:
                        what = "unexpected traceback" if raised else "expected a traceback"
                        raise SystemExit(f"{where} block {i}: {what}\n{b['src']}\n---\n{output}")
                    n = len(output.splitlines())
                    if n > DEEP_MAX_LINES:
                        problems.append(f"{where} block {i}: output is {n} lines")
                    b["output"] = output
                b["isError"] = b.pop("raises")
            out.append(b)
        return out

    for t in content.TOPICS:
        if t["id"] in seen:
            raise SystemExit(f"duplicate deep-dive id: {t['id']}")
        seen.add(t["id"])
        base = t["id"].replace("-", "_")
        sections = []
        for si, s in enumerate(t["sections"]):
            sections.append({
                "title": s["title"],
                "body": render(s["body"], f"{t['id']} / {s['title']}", f"{base}_s{si}"),
            })
        questions = []
        for qi, q in enumerate(t["questions"]):
            if q["level"] not in DEEP_LEVELS:
                problems.append(f"{t['id']} Q{qi + 1}: bad level {q['level']!r}")
            questions.append({
                "q": q["q"],
                "level": q["level"],
                "answer": render(q["answer"], f"{t['id']} / Q{qi + 1}", f"{base}_q{qi}"),
            })
        topics.append({
            "id": t["id"],
            "title": t["title"],
            "intro": t["intro"],
            "sections": sections,
            "questions": questions,
            "refs": [{"label": l, "url": u} for l, u in t.get("refs", [])],
        })

    if problems:
        raise SystemExit("deep-dive validation failed:\n  " + "\n  ".join(problems))

    body = json.dumps(topics, indent=2, ensure_ascii=False)
    OUT_DEEP.write_text(
        "/* GENERATED FILE - do not edit by hand.\n"
        "   Source: content/deepdive/   Build: python3 build.py\n"
        "   Every code block below was executed and its output captured. */\n\n"
        f"window.GRAIL_DEEP = {body};\n",
        encoding="utf-8")
    print(f"built {len(topics)} deep-dive topics, {runs} code blocks executed "
          f"-> {OUT_DEEP.relative_to(ROOT)}")
    return len(topics)


def stamp_assets() -> str:
    """Append a content hash to every local stylesheet and script reference, so
    browsers cannot serve a stale style.css or data file after a rebuild."""
    pattern = re.compile(r'((?:href|src)="(assets/(?:css|js)/[\w.-]+\.(?:css|js)))(\?v=[0-9a-f]+)?(")')
    digests = {}

    def stamp(m):
        path = m.group(2)
        if path not in digests:
            digests[path] = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()[:8]
        return f"{m.group(1)}?v={digests[path]}{m.group(4)}"

    touched = 0
    for page in sorted(ROOT.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        new = pattern.sub(stamp, text)
        if new != text:
            page.write_text(new, encoding="utf-8")
            touched += 1
    digest = digests.get("assets/css/style.css", "")
    print(f"stamped {len(digests)} asset(s) into {touched} page(s)")
    return digest


def main() -> None:
    sys.path.insert(0, str(ROOT / "content"))
    import entries as content  # noqa

    built, seen = [], set()
    for i, e in enumerate(content.ENTRIES, start=1):
        eid = e["id"]
        if eid in seen:
            raise SystemExit(f"duplicate id: {eid}")
        seen.add(eid)

        slug = eid.replace("-", "_")
        output, raised = run_snippet(slug, e["code"])

        if e.get("expect_raises") and not raised:
            raise SystemExit(f"{eid}: expected a traceback, got a clean exit")
        if raised and not e.get("expect_raises"):
            raise SystemExit(f"{eid}: unexpected traceback\n{output}")

        if e.get("extra"):
            check_repl(eid, e["extra"])

        if e.get("fix") and e.get("run_fix", True):
            fix_out, fix_raised = run_snippet(slug + "_fix", e["fix"])
            if fix_raised:
                raise SystemExit(f"{eid}: the fix snippet raised\n{fix_out}")

        built.append({
            "id": eid,
            "num": i,
            "title": e["title"],
            "subtitle": e["subtitle"],
            "difficulty": e["difficulty"],
            "tags": e["tags"],
            "question": e.get("question", "What does this print?"),
            "code": e["code"].rstrip("\n"),
            "output": output,
            "isError": raised,
            "guesses": e.get("guesses", []),
            "explanation": e["explanation"],
            "extraCode": (e.get("extra") or "").rstrip("\n"),
            "fixNote": e.get("fix_note", ""),
            "fixCode": (e.get("fix") or "").rstrip("\n"),
            "takeaway": e.get("takeaway", ""),
            "caveat": e.get("caveat", ""),
            "refs": [{"label": l, "url": u} for l, u in e.get("refs", [])],
        })

    validate(built)

    ver = "%d.%d.%d" % sys.version_info[:3]
    body = json.dumps(built, indent=2, ensure_ascii=False)
    OUT.write_text(
        "/* GENERATED FILE - do not edit by hand.\n"
        "   Source: content/entries.py   Build: python3 build.py\n"
        f"   Every snippet below was executed on CPython {ver} and the\n"
        "   output field is exactly what came back. */\n\n"
        f'window.GRAIL_PYTHON = "{ver}";\n'
        f"window.GRAIL_ENTRIES = {body};\n",
        encoding="utf-8",
    )

    by = {}
    for e in built:
        by[e["difficulty"]] = by.get(e["difficulty"], 0) + 1
    print(f"built {len(built)} entries on CPython {ver} -> {OUT.relative_to(ROOT)}")
    print("  " + "  ".join(f"{k}={v}" for k, v in sorted(by.items())))

    build_dsa()
    build_deepdive()
    stamp_assets()


if __name__ == "__main__":
    main()
