---
name: ingest-source-material
description: Extract Ioannis's real CV data (jobs, degrees, theses, certifications, skills, projects) from files in source-material/ and produce a structured inventory plus a list of gaps. Use when new files are added to source-material/ or before populating src/content/.
argument-hint: "[optional file or subfolder in source-material/]"
---

# Ingest source material

Goal: turn raw documents into a **verified fact inventory** that the `content-curator`
agent (or the `add-content-entry` skill) can safely turn into content files.
Follow the content rules in `CLAUDE.md` §6 — **never invent or infer facts**.

Scope: `$ARGUMENTS` if given, otherwise everything in `source-material/`.

## Steps

1. **List files** in scope (`source-material/**`). Group them: CVs, theses, certificates,
   transcripts, photos, notes, other.
2. **Read each file**:
   - PDF → use the Read tool directly (it reads PDFs; use `pages` for long theses —
     for a thesis read the title page, abstract, table of contents and conclusions).
   - `.docx` → `python -m pip install python-docx` if needed, then
     `python -c "import docx,sys;print('\n'.join(p.text for p in docx.Document(sys.argv[1]).paragraphs))" <file>`.
     If Python is unavailable, ask Ioannis to export it as PDF.
   - Images of certificates → read them with the Read tool and transcribe name, issuer,
     date, credential ID.
   - `.md` / `.txt` notes → read directly.
3. **Build the inventory** in `source-material/_inventory.md` (overwrite on each run) with
   one table per collection, and a **Source** column pointing to file + page for every fact:
   - Experience: role · organisation · location · start · end · key responsibilities/achievements · tech
   - Education: degree · institution · programme · start · end · grade · focus
   - Theses: level · title · supervisor · institution · year · abstract (verbatim excerpt) · methods · tools
   - Certifications: name · issuer · date · credential ID · verify URL
   - Skills: skill · evidence (where it was used)
   - Academic work / projects: title · type · method · tools · link
   - Personal: interests, hobbies, languages (only if written by Ioannis)
4. **Conflicts**: if two documents disagree (e.g. different end dates), list both with
   sources under "Conflicts — needs Ioannis". Never pick one silently.
5. **Gaps**: list every required item from `CLAUDE.md` §2 that has no source yet, phrased
   as a concrete question for Ioannis.

## Output to the user

A short summary: files read, number of facts per collection, conflicts, and the list of
questions. Do not write to `src/content/` in this skill — that is `add-content-entry`'s job.

`_inventory.md` contains personal data; remind Ioannis that `source-material/` should be
git-ignored if the repository is public.
