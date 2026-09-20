### Section-V OS Contribution Request

Thank you for contributing to Section-V OS! Please ensure your contribution satisfies our Git-driven integrity standards before requesting a merge.

---

#### 1. Type of Change
- [ ] 📚 **Notes / Study Material** (Added unit notes, PYQs, lecture slides)
- [ ] ⏰ **Timetable Update** (Rescheduled lecture, room change, faculty replacement)
- [ ] 📢 **Urgent Class Announcement** (Exam date, lab viva, assignment deadline)
- [ ] 👨‍🏫 **Faculty Directory Correction** (Cabin relocation, updated email/office hours)
- [ ] 🐛 **Bug Fix / Improvement** (UI polish, calculation fix, shortcut addition)

---

#### 2. Modified Files Checklist
- [ ] Validated schema locally via `npm run validate` (or `npx tsx src/scripts/validate.ts`)
- [ ] Timetable slots adhere to Section V format (`HH:MM` 24h or AM/PM, valid room codes like `LH-302`, `LAB-4`)
- [ ] Notes markdown contains required frontmatter (`subject`, `title`, `unit`, `driveUrl`)
- [ ] No dummy/placeholder content or broken URLs included

---

#### 3. Brief Summary of Changes
> *Explain what was modified or added (e.g. "Updated Thursday slot 3 from OS to DBMS lab proxy").*

---

#### 4. Verification Proof
- [ ] Tested locally on web dashboard
- [ ] CI pipeline passes `Validate Section-V Data Integrity`
