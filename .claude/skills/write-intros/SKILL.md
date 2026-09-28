---
name: write-intros
description: Draft or revise the three 4–5 line first-person introductions (Home personal intro, Work professional intro, Academic intro) in Ioannis's voice and store them in src/content/profile.yaml. Use when intros are missing, need rewriting, or Ioannis gives feedback on tone.
argument-hint: "[home | work | academic | all] [optional feedback]"
---

# Write the page intros

Target: `$ARGUMENTS` (default: `all`).

## What each intro must cover (CLAUDE.md §2)

| Intro | Must convey |
|---|---|
| **Home** (`intro.home`) | Personality · hobbies & interests · mentality and approach to learning · curiosity and motivation · what he enjoys outside work and academia |
| **Work** (`intro.work`) | Work ethic · analysing and solving difficult problems · adaptability · integrating effectively into different teams and working environments |
| **Academic** (`intro.academic`) | Interest in physics · computational methods · numerical simulations · using computational tools to investigate and understand physical problems |

## Voice & style

- First person, **4–5 lines** on desktop (≈ 60–90 words). Count the words.
- Professional but personal; calm confidence; concrete over abstract.
- Ground each claim in something real from `source-material/_inventory.md` or
  `src/content/` (e.g. a real field, a real kind of problem, a real hobby).
- Avoid clichés and filler: "passionate", "results-driven", "team player", "rockstar",
  "ninja", "synergy", "cutting-edge", "I am a highly motivated…", exclamation marks, emojis.
- Vary sentence openings; no more than two sentences starting with "I".
- The Work and Academic intros must each make sense to a reader who lands directly on
  that page (mention name/role context implicitly, e.g. "As a software engineer with a
  background in physics…" only if true).

## Steps

1. Read `src/content/profile.yaml`, `source-material/_inventory.md` and any notes Ioannis
   wrote about himself. If hobbies or personal traits are unknown, **ask** before writing
   the Home intro — do not invent hobbies.
2. Write **two variants** per requested intro (A: warmer, B: more concise). Show them to
   Ioannis with word counts.
3. After he chooses (or edits), write the chosen text to `profile.yaml` under
   `intro.<page>` and set `introStatus.<page>: approved`. Until then store as
   `introStatus.<page>: draft`.
4. If Ioannis edits the wording himself, keep his wording exactly.
