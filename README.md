# Section V

Academic dashboard for **Section V (AI & DS), B.Tech**. It keeps the timetable, attendance, tasks, notes, faculty/CR contacts, announcements, and campus links in one place.

Academic data is stored as plain text under `content/`. A generation script validates it with Zod and writes the JSON files the React app imports. No database or login is required.

- Live: https://v.geetansh.tech/
- Repository: https://github.com/Geetansh-Jangid/Section-V

## Features

| Area | What it does |
|---|---|
| Dashboard | Current class, attendance summary, pending tasks, latest announcement, quick links |
| Timetable | Weekly schedule with V1/V2 batch filtering; holidays and replacement days from the academic calendar; temporary proxy, room change, and cancellation overrides |
| Attendance | Per-subject counters, configurable target percentage, and "how many can I miss / need to attend" projection |
| Tasks | Official tasks from `content/tasks/tasks.txt` plus personal tasks, with section, status, priority, and search filters |
| Notes | Subject syllabus units, topics, Drive links, NotebookLM links, and previous-year papers |
| Faculty & CRs | Faculty directory with cabins, contacts, subjects, office hours; class representative contacts |
| Links | Campus portals, WhatsApp community, and shared Drive folders |
| Contributions | In-app form that validates an entry and opens a GitHub pull request against the content files |

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, Zod, Express, and Vercel serverless functions.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
git clone https://github.com/Geetansh-Jangid/Section-V.git
cd Section-V
npm install
npm run dev
```

Open http://localhost:3000. `npm run dev` generates the JSON data first, then starts Vite. While the dev server is running, changes to `content/**/*.txt` are regenerated and the page reloads automatically.

## Environment variables

The app runs without these. They are only needed for the in-app contribution flow to create real GitHub pull requests.

```bash
cp .env.example .env
```

```ini
GITHUB_TOKEN=ghp_...
GITHUB_REPO=Geetansh-Jangid/Section-V
GITHUB_BASE_BRANCH=v2
```

- `GITHUB_TOKEN`: a personal access token with permission to write contents and open pull requests on `GITHUB_REPO`. For a classic token, use the `repo` scope.
- `GITHUB_REPO`: `owner/repo` that receives the contribution.
- `GITHUB_BASE_BRANCH`: branch the pull request targets.

If `GITHUB_TOKEN` is missing, the form still validates the entry and returns the formatted text block; it just does not open a PR.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Generate data and start Vite on port 3000 |
| `npm run build` | Generate data and build the production app into `dist/` |
| `npm run preview` | Serve the built app with Vite (static only; no contribution API) |
| `npm run generate` | Rebuild `src/data/*.json` from `content/` |
| `npm run validate` | Validate the generated JSON against the Zod schemas |
| `npm run lint` | Run TypeScript type checking |
| `npm run test` | Run the contribution-system and optional-field test scripts |
| `npm run clean` | Remove `dist/` |

## How content works

```text
content/*.txt
    |
    v
src/scripts/generate-data.ts   (parse + Zod validation)
    |
    v
src/data/*.json                (generated; imported by the UI)
    |
    v
React app
```

`content/` is the source of truth. Do not edit files in `src/data/` by hand; they are overwritten on the next generation.

After changing content:

```bash
npm run generate
npm run validate
```

Commit both the `content/` change and the regenerated files in `src/data/`, because validation and CI read the generated JSON.

## Content file reference

All files use `Key: Value` lines. Lines starting with `#` are comments. Each record starts with the block marker shown below.

| File | Block marker | Required fields |
|---|---|---|
| `content/notes/*.txt` | none for subject; `[UNIT]`, `[PYQ]` | `Subject Code`, `Subject Name` |
| `content/timetable/timetable.txt` | `[Monday]` ... `[Saturday]` | `Slot` and `Code` on each `Slot:` line |
| `content/faculty/faculty.txt` | `[FACULTY]` | `ID`, `Name`, `Designation`, `Subjects`, `Avatar` |
| `content/cr/cr.txt` | `[CR]` | `ID`, `Name`, `Section`, `Avatar` |
| `content/announcements/announcements.txt` | `[ANNOUNCEMENT]` | `ID`, `Title`, `Priority`, `Category` |
| `content/tasks/tasks.txt` | `[TASK]` | `ID`, `Title`, `Subject` |
| `content/links/links.txt` | `[PORTAL]` | `ID`, `Title`, `Description`, `URL`, `Icon` |
| `content/calendar/calendar.txt` | `[EVENT]` | `Title`, `Date`, `Type` |

### Notes example

```text
Subject Code: M
Subject Name: Mathematics
Faculty: Prof. G.C. Sharma (GC)
Credits: 4
Semester: 1
Drive Folder URL: https://drive.google.com/drive/folders/...
Tags: Calculus, Matrices
Last Updated: 2026-11-02

[UNIT]
Unit Number: 1
Title: Matrix Algebra
Topics: Rank, Eigenvalues, Cayley-Hamilton theorem, Diagonalization
Drive Link: https://drive.google.com/file/d/...

[PYQ]
Year: 2025 Mid-Sem
Exam Type: Mid-Sem
Drive Link: https://drive.google.com/file/d/...
```

`Topics` is comma-separated. `Drive Folder URL` and unit `Drive Link` may be left blank; a `[PYQ]` without a link is still listed. Each `[UNIT]` needs a `Title`, and each `[PYQ]` needs a `Year`.

Subject-level optional fields: `Drive Folder URL`, `PYQ Drive URL`, `Notes URL`. A `[UNIT]` also accepts `Notes`, `Slides`, and `NotebookLM` keys.

Other field formats:

- Faculty `Subjects`: `CODE: Name; CODE2: Name2`
- Announcement `Priority`: `normal`, `high`, or `urgent`
- Task `Priority`: `urgent`, `medium`, or `low`; `Section`: `All`, `V1`, or `V2`
- Link `Icon`: a [Lucide](https://lucide.dev/icons/) icon name such as `GraduationCap` or `BookOpen`

### Timetable example

```text
[Monday]
Slot: 1 | Code: M | Name: Mathematics | Faculty: GC | Room: CT-12 | Type: Theory | Batch: Both | Color: #84cc16
Slot: 6 | Code: CSK LAB | Name: Communication Skills Lab | Faculty: RR | Room: CS-22 | Type: Lab | Batch: V1
```

`Batch` is `Both`, `V1`, or `V2`. `Type` is normally `Theory`, `Lab`, or `Tutorial`. If `Room`, `Faculty`, `Type`, or `Batch` is omitted, the generator applies defaults.

Note: `[SECTION_META]` and `[TIME_SLOTS]` in the timetable file are currently ignored. The semester metadata and the seven time slots are defined in `src/scripts/generate-data.ts`; change them there if the schedule format changes.

### Calendar example

```text
[EVENT]
ID: cal-2026-11-06
Title: Diwali Break
Date: 2026-11-06
End Date: 2026-11-12
Type: college_holiday
Description: Regular classes suspended
Batch: All
Classes Suspended: true
```

Valid `Type` values: `public_holiday`, `college_holiday`, `exam`, `special_working_day`, `timetable_exception`, `event`. Valid `Batch` values: `All`, `V1`, `V2`. To run a Monday timetable on another day, set `Type: special_working_day`, `Classes Suspended: false`, and `Replacement Day: Monday`.

Starter files for each content type are in `content/templates/`.

## Contribution flow

The "Contribute" form in the app accepts notes, timetable changes, faculty entries, announcements, and links. On submit:

1. The payload is validated with Zod and rate-limited (10 requests per minute per IP).
2. The server formats the entry as a content block.
3. If a GitHub token is configured, it creates a branch, commits the updated file, and opens a pull request against `GITHUB_BASE_BRANCH`.

The endpoint is `/api/contribute` (POST). It is available through the Vite dev server, the Vercel function in `api/contribute.ts`, and `server.js` when self-hosting. `npm run preview` does not serve this endpoint.

## Deployment

### Vercel

Import the repository, set the environment variables above, and use the default settings:

- Build command: `npm run build`
- Output directory: `dist`

`vercel.json` rewrites `/api/*` to the serverless function and all other routes to `index.html`.

### Self-hosted

```bash
npm ci
npm run build
npx tsx server.js
```

`server.js` serves `dist/` and the contribution endpoint. The port defaults to `3000` and can be changed with `PORT`.

## Local-only data

Attendance, personal tasks, theme, selected batch, and timetable overrides are stored in the browser's `localStorage`. There is no account system or server sync, so this data does not follow the user across devices and clearing site data resets it.

- App state key: `section-v-portal-storage-v2`
- Official task checkmarks: `section-v-completed-official-tasks`

## Project structure

```text
content/                 Plain-text academic data and templates
src/app/                 Dashboard, timetable, tasks, attendance, notes, faculty pages
src/components/          UI components for those pages
src/data/                Generated JSON consumed by the app
src/lib/                 Zod schemas, Zustand store, timetable/attendance/calendar helpers
src/scripts/             Data generation, validation, and tests
src/api/                 Contribution formatting and GitHub PR logic
api/contribute.ts        Vercel serverless entry point
server.js                Optional Express server for self-hosting
```

## CI and validation

`npm run validate` checks every generated JSON file against its Zod schema. The GitHub Actions workflow `.github/workflows/validate-data.yml` runs the same validation on pushes and pull requests to `main` that touch `content/` or `src/data/`.

Validation reads `src/data/`, not `content/` directly. Run `npm run generate` before `npm run validate` after editing content.

## License

MIT. See [LICENSE](LICENSE).
