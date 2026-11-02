import { z } from 'zod';

export const NotesContribSchema = z.object({
  category: z.literal('notes'),
  subjectCode: z.string().min(1).max(10),
  resourceType: z.enum(['unit', 'folder', 'pyq']),
  title: z.string().min(2).max(150),
  driveUrl: z.string().url(),
  author: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  unitNumber: z.string().max(10).optional(),
  year: z.string().max(30).optional()
});

export const TimetableContribSchema = z.object({
  category: z.literal('timetable'),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
  slotPeriod: z.string().min(1).max(10),
  subjectCode: z.string().min(1).max(15),
  subjectName: z.string().min(2).max(100),
  faculty: z.string().min(1).max(100),
  room: z.string().min(1).max(50),
  type: z.enum(['Theory', 'Lab', 'Tutorial']),
  batch: z.enum(['Both', 'V1', 'V2']),
  author: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

export const FacultyContribSchema = z.object({
  category: z.literal('faculty'),
  name: z.string().min(2).max(100),
  designation: z.string().min(2).max(100),
  department: z.string().min(2).max(100),
  cabin: z.string().min(1).max(100),
  email: z.string().email(),
  officeHours: z.string().min(2).max(150),
  author: z.string().min(1).max(100),
  description: z.string().max(500).optional()
});

export const AnnouncementContribSchema = z.object({
  category: z.literal('announcements'),
  title: z.string().min(3).max(150),
  announcementCategory: z.enum(['Academic', 'Exam', 'Placement', 'Event', 'Circular', 'General']),
  priority: z.enum(['normal', 'high', 'urgent']),
  authority: z.string().min(2).max(100),
  summary: z.string().min(5).max(1000),
  author: z.string().min(1).max(100)
});

export const LinksContribSchema = z.object({
  category: z.literal('links'),
  title: z.string().min(2).max(100),
  url: z.string().url(),
  description: z.string().min(2).max(300),
  linkType: z.enum(['Portal', 'Community', 'Academic', 'Document']),
  author: z.string().min(1).max(100)
});

export const ContributionPayloadSchema = z.discriminatedUnion('category', [
  NotesContribSchema,
  TimetableContribSchema,
  FacultyContribSchema,
  AnnouncementContribSchema,
  LinksContribSchema
]);

export type ContributionPayload = z.infer<typeof ContributionPayloadSchema>;

export interface ContributionResult {
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  message?: string;
  isSimulation?: boolean;
  formattedSnippet?: string;
  targetFile?: string;
  error?: string;
}

// In-memory simple rate limiting
const ipRequestTimestamps: Record<string, number[]> = {};

export function checkRateLimit(clientIp: string = 'client', limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  if (!ipRequestTimestamps[clientIp]) {
    ipRequestTimestamps[clientIp] = [];
  }
  ipRequestTimestamps[clientIp] = ipRequestTimestamps[clientIp].filter((t) => now - t < windowMs);
  if (ipRequestTimestamps[clientIp].length >= limit) {
    return false;
  }
  ipRequestTimestamps[clientIp].push(now);
  return true;
}

export function formatContributionBlock(payload: ContributionPayload): { targetFile: string; block: string } {
  switch (payload.category) {
    case 'notes': {
      const targetFile = `content/notes/${payload.subjectCode.toLowerCase()}.txt`;
      if (payload.resourceType === 'pyq') {
        const block = `\n[PYQ]
Year: ${payload.year || payload.title}
Exam Type: Mid-Sem
File Size: 1.5 MB
Drive Link: ${payload.driveUrl}
Contributor: ${payload.author}
Notes: ${payload.description || 'Verified past question paper'}\n`;
        return { targetFile, block };
      }
      if (payload.resourceType === 'folder') {
        const block = `\n# Additional Drive Folder by ${payload.author}:
# Folder Title: ${payload.title}
# Drive Folder URL: ${payload.driveUrl}
# Description: ${payload.description || 'Complete Subject Folder'}\n`;
        return { targetFile, block };
      }
      const block = `\n[UNIT]
Unit Number: ${payload.unitNumber || '1'}
Title: ${payload.title}
Topics: ${payload.description || 'Unit lecture slides & student notes'}
Drive Link: ${payload.driveUrl}
Contributor: ${payload.author}\n`;
      return { targetFile, block };
    }

    case 'timetable': {
      const targetFile = 'content/timetable/timetable.txt';
      const block = `\n# Schedule Update for ${payload.day} (Submitted by ${payload.author}):
# Slot: ${payload.slotPeriod} | Code: ${payload.subjectCode} | Name: ${payload.subjectName} | Faculty: ${payload.faculty} | Room: ${payload.room} | Type: ${payload.type} | Batch: ${payload.batch}\n`;
      return { targetFile, block };
    }

    case 'faculty': {
      const targetFile = 'content/faculty/faculty.txt';
      const slug = payload.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
      const block = `\n[FACULTY]
ID: fac-${slug}
Name: ${payload.name}
Designation: ${payload.designation}
Department: ${payload.department}
Cabin: ${payload.cabin}
Email: ${payload.email}
Office Hours: ${payload.officeHours}
Notes: Contributed by ${payload.author} - ${payload.description || ''}\n`;
      return { targetFile, block };
    }

    case 'announcements': {
      const targetFile = 'content/announcements/announcements.txt';
      const dateStr = new Date().toISOString().slice(0, 10);
      const slug = payload.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
      const block = `\n[ANNOUNCEMENT]
ID: notice-${dateStr}-${slug}
Title: ${payload.title}
Author: ${payload.authority}
Date: ${dateStr}
Priority: ${payload.priority}
Category: ${payload.announcementCategory}
Tags: ${payload.announcementCategory}, Contributed
Summary: ${payload.summary}
Contributor: ${payload.author}\n`;
      return { targetFile, block };
    }

    case 'links': {
      const targetFile = 'content/links/links.txt';
      const slug = payload.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
      const block = `\n[PORTAL]
ID: portal-${slug}
Title: ${payload.title}
Description: ${payload.description}
URL: ${payload.url}
Icon: ExternalLink
Contributor: ${payload.author}\n`;
      return { targetFile, block };
    }
  }
}

async function extractGitHubErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const errData = await res.json();
    if (errData && typeof errData.message === 'string') {
      return `${fallback}: ${errData.message}`;
    }
  } catch {
    // Ignore JSON parsing errors for error payload
  }
  return `${fallback}: ${res.statusText || res.status}`;
}

/**
 * Executes server-side PR creation via GitHub REST API.
 */
export async function processContribution(
  data: unknown,
  clientIp?: string
): Promise<ContributionResult> {
  if (!checkRateLimit(clientIp)) {
    return {
      success: false,
      error: 'Submission rate limit reached. Please wait a moment before trying again.'
    };
  }

  const parsed = ContributionPayloadSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: `Validation error: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`
    };
  }

  const payload = parsed.data;
  const { targetFile, block } = formatContributionBlock(payload);

  // Path safety enforcement
  if (!targetFile.startsWith('content/') || targetFile.includes('..')) {
    return {
      success: false,
      error: 'Invalid target file path.'
    };
  }

  const rawToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const githubToken = rawToken ? rawToken.trim() : '';
  const repo = (process.env.GITHUB_REPO || 'Geetansh-Jangid/Section-V').trim();
  const baseBranch = (process.env.GITHUB_BASE_BRANCH || 'v2').trim();

  if (!githubToken) {
    // Graceful simulation mode when GITHUB_TOKEN is not configured
    return {
      success: true,
      isSimulation: true,
      targetFile,
      formattedSnippet: block,
      message: `Contribution validated and formatted successfully! GITHUB_TOKEN is not configured on this server, so an automated Pull Request could not be opened directly. You can copy the formatted snippet or open a 1-click issue.`
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Section-V-Contributor-Bot',
      'Content-Type': 'application/json'
    };

    // 1. Get base branch commit SHA
    const baseRefRes = await fetch(`https://api.github.com/repos/${repo}/git/ref/heads/${baseBranch}`, { headers });
    if (!baseRefRes.ok) {
      throw new Error(await extractGitHubErrorMessage(baseRefRes, `Failed to fetch base branch ref (${baseBranch})`));
    }
    const baseRefData = await baseRefRes.json();
    const baseSha = baseRefData.object.sha;

    // 2. Create a new branch
    const branchName = `contrib-${payload.category}-${Date.now()}`;
    const createBranchRes = await fetch(`https://api.github.com/repos/${repo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha
      })
    });
    if (!createBranchRes.ok) {
      throw new Error(await extractGitHubErrorMessage(createBranchRes, 'Failed to create branch'));
    }

    // 3. Get existing file content & SHA
    let existingContent = '';
    let fileSha: string | undefined = undefined;

    const fileRes = await fetch(`https://api.github.com/repos/${repo}/contents/${targetFile}?ref=${branchName}`, { headers });
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      fileSha = fileData.sha;
      existingContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    }

    const updatedContent = `${existingContent.trimEnd()}\n${block}\n`;
    const encodedContent = Buffer.from(updatedContent, 'utf-8').toString('base64');

    // 4. Commit updated file to branch
    const commitRes = await fetch(`https://api.github.com/repos/${repo}/contents/${targetFile}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore(contrib): update ${targetFile} via Section V Contributor System [${payload.author}]`,
        content: encodedContent,
        sha: fileSha,
        branch: branchName
      })
    });
    if (!commitRes.ok) {
      throw new Error(await extractGitHubErrorMessage(commitRes, 'Failed to commit file to branch'));
    }

    // 5. Create Pull Request
    const title = `[Contribution]: ${payload.category.toUpperCase()} update by ${payload.author}`;
    const body = `### Section V Student Contribution

- **Category**: \`${payload.category}\`
- **Contributor**: ${payload.author}
- **Target File**: \`${targetFile}\`

#### Proposed Changes:
\`\`\`text
${block}
\`\`\`

---
*Submitted seamlessly via the Section V Public Contributor System.*`;

    const prRes = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        body,
        head: branchName,
        base: baseBranch
      })
    });

    if (!prRes.ok) {
      throw new Error(await extractGitHubErrorMessage(prRes, 'Failed to create PR'));
    }

    const prData = await prRes.json();

    return {
      success: true,
      prUrl: prData.html_url,
      prNumber: prData.number,
      targetFile,
      formattedSnippet: block,
      message: `Pull Request #${prData.number} successfully created!`
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to submit contribution to GitHub.'
    };
  }
}
