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

    topics, total, checked = [], 0, 0
    for topic in content.TOPICS:
        sections = []
        for section in topic.get("sections", []):
            problems = []
            for prob in section["problems"]:
                if prob["difficulty"] not in DIFFS:
                    raise SystemExit(f"{prob['id']}: bad difficulty {prob['difficulty']!r}")
                if not prob.get("tests"):
                    raise SystemExit(f"{prob['id']}: no tests, so nothing is verified")

                approaches = []
                for ap in prob["approaches"]:
                    src = content.PRELUDE + "\n\n" + ap["code"] + "\n\n" + prob["tests"] + "\n"
                    slug = f"{prob['id'].replace('-', '_')}__{ap['name'].split(',')[0].strip().lower().replace(' ', '_')}"
                    out, raised = run_snippet(slug, src)
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
                problems.append({
                    "id": prob["id"],
                    "num": total,
                    "lc": prob["lc"],
                    "slug": prob["slug"],
                    "url": f"https://leetcode.com/problems/{prob['slug']}/",
                    "name": prob["name"],
                    "difficulty": prob["difficulty"],
                    "framing": prob["framing"],
                    "pitfall": prob.get("pitfall", ""),
                    "approaches": approaches,
                    "tests": prob["tests"].rstrip("\n"),
                    "topic": topic["id"],
                    "topicTitle": topic["title"],
                    "section": section["id"],
                    "sectionTitle": section["title"],
                })
            sections.append({
                "id": section["id"],
                "title": section["title"],
                "idea": section["idea"],
                "problems": problems,
            })
        topics.append({
            "id": topic["id"],
            "title": topic["title"],
            "subtitle": topic["subtitle"],
            "blurb": topic.get("blurb", []),
            "convention": topic.get("convention", []),
            "status": topic.get("status", "ready"),
            "target": topic.get("target"),
            "sections": sections,
            "count": sum(len(s["problems"]) for s in sections),
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


def stamp_assets() -> str:
    """Append a content hash to the stylesheet link so browsers cannot serve
    a stale style.css after a rebuild."""
    css = ROOT / "assets" / "css" / "style.css"
    digest = hashlib.sha256(css.read_bytes()).hexdigest()[:8]
    pattern = re.compile(r'(href="assets/css/style\.css)(\?v=[0-9a-f]+)?(")')
    touched = 0
    for page in sorted(ROOT.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        new = pattern.sub(rf'\1?v={digest}\3', text)
        if new != text:
            page.write_text(new, encoding="utf-8")
            touched += 1
    print(f"stamped style.css?v={digest} into {touched} page(s)")
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
    stamp_assets()


if __name__ == "__main__":
    main()
