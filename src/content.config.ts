/**
 * Content collections (CLAUDE.md §5, §6) — the single source of truth for all CV data.
 *
 * Conventions
 * - Dates: ISO `YYYY-MM` (preferred) or `YYYY`; current roles use `end: present`.
 *   Format them with `src/lib/dates.ts`, never by hand.
 * - Missing data: any text, date, enum or link field may hold a
 *   `TODO(ioannis): <what is needed>` placeholder so drafts still validate.
 * - Links: absolute `https://…` URLs, or site-relative paths such as
 *   `/documents/master-thesis.pdf` (files in `public/`). Site-relative paths MUST be
 *   rendered through `url()` from `src/lib/url.ts`.
 * - Images: paths relative to the content file, e.g. `../../assets/projects/x.png`.
 *   `images[0]` is the cover / key figure. Alt text is required.
 * - `featured: true` surfaces an entry in the Home highlights; `order` breaks ties
 *   (ascending) and orders undated lists.
 * - `anchor` is a stable, permanent id used for deep links (e.g. `/academic#master-thesis`).
 */
import { defineCollection, type ImageFunction } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* ------------------------------------------------------------------ primitives */

/** `TODO(ioannis): …` placeholder for data still missing. */
const todo = z
  .string()
  .regex(/^TODO\(ioannis\):\s*\S/, 'Placeholders must look like "TODO(ioannis): <what is needed>"');

/** YAML turns `2024` into a number and `2024-03-01` into a Date; normalise both to strings. */
function normaliseDateInput(value: unknown): unknown {
  if (typeof value === 'number') return String(value);
  if (value instanceof Date) return value.toISOString().slice(0, 7);
  return value;
}

const isoMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use ISO "YYYY-MM"');
const isoYear = z.string().regex(/^\d{4}$/, 'Use ISO "YYYY"');

/** Start / single date: `YYYY-MM`, `YYYY` or a TODO placeholder. */
const date = z.preprocess(normaliseDateInput, z.union([isoMonth, isoYear, todo]));

/** End date: as `date`, plus `present` for ongoing roles and studies. */
const endDate = z.preprocess(
  normaliseDateInput,
  z.union([isoMonth, isoYear, z.literal('present'), todo]),
);

/** Absolute http(s) URL, site-relative path (`/documents/x.pdf`), or TODO placeholder. */
const link = z.union([
  z.url({ protocol: /^https?$/ }),
  z.string().regex(/^\/(?!\/)\S*$/, 'Site-relative paths must start with a single "/"'),
  todo,
]);

/** Stable anchor id: lowercase kebab-case. */
const anchor = z.string().regex(/^[a-z][a-z0-9-]*$/, 'Anchors must be lowercase kebab-case');

/** Named links shown on cards and timeline items. All optional. */
const links = z
  .object({
    repo: link, // source code repository
    demo: link, // live demo / deployed site
    pdf: link, // PDF document (thesis, report, CV) — usually /documents/…
    credential: link, // certificate verification page
    code: link, // code for academic work, if not a full repo
    report: link, // written report
    website: link, // organisation / project homepage
  })
  .partial()
  .default({});

/** Images processed by astro:assets; `images[0]` is the cover / key figure. */
function figures(image: ImageFunction) {
  return z
    .array(z.object({ src: image(), alt: z.string().min(1), caption: z.string().optional() }))
    .default([]);
}

const common = {
  featured: z.boolean().default(false),
  order: z.number().default(0),
};

/* ------------------------------------------------------------------ collections */

/** Single entry `src/content/profile.yaml` (id: "profile"). */
const profile = defineCollection({
  loader: glob({ pattern: 'profile.yaml', base: './src/content' }),
  schema: ({ image }) => {
    const introStatus = z.enum(['todo', 'draft', 'approved']).default('todo');
    const pageSeo = z.object({
      title: z.string().min(1),
      description: z.string().min(20),
    });
    return z.object({
      name: z.string().min(1),
      headline: z.string().min(1),
      /** City / country only — never a home address. */
      location: z.string().optional(),
      /** 4–5 line first-person intros, one per page (see write-intros skill). */
      intro: z.object({
        home: z.string().min(1),
        work: z.string().min(1),
        academic: z.string().min(1),
      }),
      introStatus: z
        .object({ home: introStatus, work: introStatus, academic: introStatus })
        .default({ home: 'todo', work: 'todo', academic: 'todo' }),
      /** Per-page <title> and meta description; each page must stand on its own. */
      seo: z.object({ home: pageSeo, work: pageSeo, academic: pageSeo }),
      /** Only contact details Ioannis has explicitly approved for public display. */
      contact: z
        .object({
          email: z.union([z.email(), todo]).optional(),
        })
        .default({}),
      socials: z
        .array(
          z.object({
            label: z.string().min(1), // e.g. "GitHub"
            url: link,
            icon: z.string().optional(), // Iconify name, e.g. "simple-icons:github"
            handle: z.string().optional(),
          }),
        )
        .default([]),
      photo: z.object({ src: image(), alt: z.string().min(1) }).optional(),
      /** Downloadable CV PDFs in public/documents/. */
      cv: z.object({ work: link, academic: link }).partial().default({}),
    });
  },
});

/** One file per role: `src/content/experience/<yyyy>-<org>-<role>.md`. */
const experience = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/experience' }),
  schema: ({ image }) =>
    z.object({
      role: z.string().min(1),
      organisation: z.string().min(1),
      location: z.string().optional(),
      employmentType: z
        .union([
          z.enum([
            'Full-time',
            'Part-time',
            'Contract',
            'Freelance',
            'Internship',
            'Traineeship',
            'Volunteer',
          ]),
          todo,
        ])
        .optional(),
      start: date,
      end: endDate,
      summary: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      tech: z.array(z.string()).default([]),
      links,
      images: figures(image),
      ...common,
    }),
});

/** Degrees and other qualifications: `src/content/education/<yyyy>-<level>-<institution>.md`. */
const education = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/education' }),
  schema: ({ image }) =>
    z.object({
      level: z.enum(['bachelor', 'master', 'phd', 'other']),
      degree: z.string().min(1),
      institution: z.string().min(1),
      location: z.string().optional(),
      start: date,
      end: endDate,
      /** Only if Ioannis wants it shown. */
      grade: z.string().optional(),
      summary: z.string().optional(),
      focus: z.array(z.string()).default([]),
      keyCourses: z.array(z.string()).default([]),
      highlights: z.array(z.string()).default([]),
      tech: z.array(z.string()).default([]),
      /** e.g. "bachelor-degree", "master-degree" on /academic. */
      anchor: anchor.optional(),
      links,
      images: figures(image),
      ...common,
    }),
});

/** `src/content/theses/bachelor.mdx`, `master.mdx`. */
const theses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/theses' }),
  schema: ({ image }) =>
    z.object({
      level: z.enum(['bachelor', 'master', 'phd', 'other']),
      title: z.string().min(1),
      supervisor: z.string().min(1),
      coSupervisors: z.array(z.string()).default([]),
      institution: z.string().min(1),
      department: z.string().optional(),
      start: date.optional(),
      /** Completion / submission date. */
      end: endDate,
      grade: z.string().optional(),
      /** ≤ 120-word faithful summary of the original abstract. */
      abstract: z.string().min(1),
      methods: z.array(z.string()).default([]),
      tech: z.array(z.string()).default([]),
      keyResult: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      /** "bachelor-thesis" | "master-thesis" on /academic. */
      anchor: anchor,
      links,
      images: figures(image),
      ...common,
    }),
});

/** List in `src/content/certifications.yaml`; each item needs a unique `id`. */
const certifications = defineCollection({
  loader: file('src/content/certifications.yaml'),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    issuer: z.string().min(1),
    /** Issue date. */
    date: date,
    expires: date.nullish(),
    credentialId: z.string().nullish(),
    summary: z.string().optional(),
    tech: z.array(z.string()).default([]),
    links,
    ...common,
  }),
});

/** Curated professional / GitHub projects: `src/content/projects/<slug>.mdx`. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      /** One line: the problem it solves. */
      tagline: z.string().min(1),
      summary: z.string().optional(),
      start: date.optional(),
      end: endDate.optional(),
      highlights: z.array(z.string()).default([]),
      tech: z.array(z.string()).default([]),
      links,
      images: figures(image),
      ...common,
    }),
});

/** Exercises, assignments, projects & simulations: `src/content/academic-work/<slug>.mdx`. */
const academicWork = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/academic-work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      type: z.union([
        z.enum([
          'exercise',
          'assignment',
          'project',
          'simulation',
          'seminar',
          'report',
          'talk',
          'poster',
          'other',
        ]),
        todo,
      ]),
      course: z.string().optional(),
      institution: z.string().optional(),
      start: date.optional(),
      end: endDate.optional(),
      /** The physical / technical question it addresses. */
      summary: z.string().min(1),
      methods: z.array(z.string()).default([]),
      tech: z.array(z.string()).default([]),
      highlights: z.array(z.string()).default([]),
      links,
      images: figures(image),
      ...common,
    }),
});

/** Grouped skills with context of use — no ratings or percentages (CLAUDE.md §4). */
const skills = defineCollection({
  loader: file('src/content/skills.yaml'),
  schema: z.object({
    id: z.string().min(1),
    group: z.string().min(1),
    items: z
      .array(
        z.object({
          name: z.string().min(1),
          /** e.g. "numerical simulation, data analysis, automation". */
          context: z.string().optional(),
          icon: z.string().optional(), // Iconify name, e.g. "simple-icons:python"
        }),
      )
      .default([]),
    order: z.number().default(0),
  }),
});

/** Hobbies and interests for Home: `src/content/interests.yaml`. */
const interests = defineCollection({
  loader: file('src/content/interests.yaml'),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    note: z.string().optional(),
    icon: z.string().optional(), // Iconify name, e.g. "lucide:mountain"
    order: z.number().default(0),
  }),
});

export const collections = {
  profile,
  experience,
  education,
  theses,
  certifications,
  projects,
  academicWork,
  skills,
  interests,
};
