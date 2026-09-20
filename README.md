# Section V

> **An all-in-one academic dashboard for Section V — built to keep your college life in one place.**

**Section V** is a student-focused academic platform designed for **Section V (AI & DS)**. It brings timetables, faculty information, study notes, announcements, tasks, class representatives, useful portals, and other academic resources into a single interface.

🌐 **Live:** https://section.vercel.app/  
📦 **Repository:** https://github.com/Geetansh-Jangid/Section-V

---

## ✨ Features

### 📅 Timetable
- Weekly class schedule
- Subject, faculty and room information
- Slot-based timetable structure
- Support for theory and practical classes
- Section/batch-specific scheduling

### 📚 Study Notes
- Subject-wise notes
- Unit and topic organization
- Previous-year question papers
- Google Drive resources
- Subject metadata including credits, semester and faculty

### 👨‍🏫 Faculty Directory
- Faculty profiles
- Department and designation
- Contact information
- Office hours
- Subjects taught
- Research interests

### 📢 Announcements
- Centralized announcements feed
- Categories and priorities
- Dates and authors
- Tags for easier organization

### ✅ Tasks
- Academic task tracking
- Subject association
- Due dates
- Priority levels
- Assignment information

### 👥 Class Representatives
- CR directory
- Section and role information
- Responsibilities
- Contact and social links
- Office hours

### 🔗 Useful Links
- Campus portals
- Google Drive resources
- WhatsApp community
- GitHub repository
- Other frequently used academic resources

### 🧮 Attendance
- Attendance calculation tools
- Helps determine current attendance status and requirements

---

## 🧠 Data-Driven Architecture

One of the core ideas behind Section V is keeping **content separate from the application UI**.

Instead of hardcoding academic information throughout React components, the project stores editable content in structured text files under `content/`.

The build process then converts those files into validated JSON consumed by the application.

```text
content/
├── announcements/
├── cr/
├── faculty/
├── links/
├── notes/
├── tasks/
└── timetable/

          ↓

   generate-data.ts

          ↓

src/data/
├── announcements.json
├── cr.json
├── faculty.json
├── links.json
├── notes.json
├── tasks.json
└── timetable.json

          ↓

       React App
```

This makes updating academic information possible without modifying the actual UI components.

---

## 🛠️ Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Zod** — runtime data validation
- **Zustand** — state management
- **Motion** — animations
- **Lucide React** — icons
- **Express**
- **tsx**
- **Vercel** — deployment

---

## 📂 Project Structure

```text
Section-V/
├── content/
│   ├── announcements/
│   ├── cr/
│   ├── faculty/
│   ├── links/
│   ├── notes/
│   ├── tasks/
│   └── timetable/
│
├── src/
│   ├── data/
│   ├── lib/
│   ├── scripts/
│   └── ...
│
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- [Node.js](https://nodejs.org/) installed
- npm, pnpm or another compatible package manager

### Clone the repository

```bash
git clone https://github.com/Geetansh-Jangid/Section-V.git
cd Section-V
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:3000
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate data and create a production build |
| `npm run preview` | Preview the production build |
| `npm run generate` | Generate JSON data from content files |
| `npm run validate` | Validate generated data against Zod schemas |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove generated build/server files |

### Build pipeline

The production build automatically runs the data generator before Vite builds the application:

```bash
npm run build
```

is effectively:

```text
Content TXT files
       ↓
generate-data.ts
       ↓
Validated JSON
       ↓
Vite build
       ↓
Production application
```

---

## ✍️ Updating Content

Most academic information can be changed without touching the React code.

For example, subject information lives inside:

```text
content/notes/
```

Faculty information:

```text
content/faculty/faculty.txt
```

Announcements:

```text
content/announcements/announcements.txt
```

Timetable:

```text
content/timetable/timetable.txt
```

After modifying content, regenerate the structured data:

```bash
npm run generate
```

Then validate it:

```bash
npm run validate
```

If everything is valid, build the project:

```bash
npm run build
```

---

## 🧩 Why This Exists

College information tends to end up scattered across:

- WhatsApp groups
- Google Drive
- PDFs
- Random links
- Messages from faculty
- Personal notes
- Different student groups

Section V is an attempt to put that information behind **one organized interface**.

Instead of asking:

> *"Bhai timetable kaha hai?"*

you should just open Section V.

---

## 🤝 Contributing

Contributions, improvements and bug reports are welcome.

1. Fork the repository
2. Create a branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Validate the project

```bash
npm run validate
npm run lint
```

5. Commit your changes

```bash
git commit -m "feat: add your feature"
```

6. Push your branch

```bash
git push origin feature/your-feature
```

7. Open a pull request

---

## 📌 Project Status

Section V is actively being developed and refined.

The project is publicly available on GitHub.

---

## 👨‍💻 Author

**Geetansh Jangid**

Built for **Section V — AI & DS**.

[GitHub](https://github.com/Geetansh-Jangid)

---

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.