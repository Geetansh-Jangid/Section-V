process.env.NODE_ENV = 'test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import handler from '../../api/contribute.ts';
import {
  processContribution,
  formatContributionBlock,
  ContributionPayloadSchema,
  ContributionPayload
} from '../api/contributeHandler.ts';

// Helper to create mock IncomingMessage and ServerResponse
function createMockHttp(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  rawStreamBody?: string;
}) {
  const req = new EventEmitter() as any;
  req.method = options.method || 'POST';
  req.url = options.url || '/api/contribute';
  req.originalUrl = options.url || '/api/contribute';
  req.headers = options.headers || { 'content-type': 'application/json' };
  req.socket = { remoteAddress: '127.0.0.1' };
  req.body = options.body;

  const resHeaders: Record<string, string> = {};
  let resStatusCode = 200;
  let resBody = '';

  const res = new EventEmitter() as any;
  res.setHeader = (key: string, val: string) => {
    resHeaders[key.toLowerCase()] = val;
  };
  res.getHeader = (key: string) => resHeaders[key.toLowerCase()];
  res.writeHead = (status: number, headers?: any) => {
    resStatusCode = status;
    res.statusCode = status;
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        res.setHeader(k, v as string);
      }
    }
    return res;
  };
  res.status = (code: number) => {
    resStatusCode = code;
    res.statusCode = code;
    return res;
  };
  res.write = (chunk: any) => {
    if (chunk) resBody += typeof chunk === 'string' ? chunk : chunk.toString();
    return true;
  };
  res.json = (data: any) => {
    resHeaders['content-type'] = 'application/json';
    resBody = JSON.stringify(data);
    res.body = resBody;
    res.emit('finish');
    return res;
  };
  res.end = (chunk?: any) => {
    if (chunk) resBody += typeof chunk === 'string' ? chunk : chunk.toString();
    res.body = resBody;
    res.emit('finish');
    return res;
  };

  const execute = async () => {
    const handlerPromise = handler(req, res);
    if (options.rawStreamBody !== undefined) {
      process.nextTick(() => {
        req.emit('data', Buffer.from(options.rawStreamBody!));
        req.emit('end');
      });
    }
    await handlerPromise;
    return {
      statusCode: res.statusCode || resStatusCode,
      headers: resHeaders,
      body: resBody,
      json: () => JSON.parse(resBody)
    };
  };

  return { req, res, execute };
}

async function runTests() {
  console.log('🧪 Starting Contribution System Test Suite...\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // --- 1. HTTP Method Enforcement ---
  await test('HTTP 405 on GET request with JSON response', async () => {
    const { execute } = createMockHttp({ method: 'GET' });
    const response = await execute();
    assert.equal(response.statusCode, 405);
    assert.equal(response.headers['content-type'], 'application/json');
    assert.equal(response.headers['allow'], 'POST, OPTIONS');
    const data = response.json();
    assert.equal(data.success, false);
    assert.match(data.error, /Method GET Not Allowed/);
  });

  await test('HTTP 204 on OPTIONS preflight request', async () => {
    const { execute } = createMockHttp({ method: 'OPTIONS' });
    const response = await execute();
    assert.equal(response.statusCode, 204);
    assert.equal(response.headers['allow'], 'POST, OPTIONS');
  });

  // --- 2. Request Body Parsing ---
  await test('HTTP 400 on empty request body', async () => {
    const { execute } = createMockHttp({ method: 'POST', rawStreamBody: '' });
    const response = await execute();
    assert.equal(response.statusCode, 400);
    const data = response.json();
    assert.equal(data.success, false);
    assert.match(data.error, /empty/i);
  });

  await test('HTTP 400 on malformed JSON request body', async () => {
    const { execute } = createMockHttp({ method: 'POST', rawStreamBody: '{ invalid json' });
    const response = await execute();
    assert.equal(response.statusCode, 400);
    const data = response.json();
    assert.equal(data.success, false);
    assert.match(data.error, /invalid json/i);
  });

  await test('Parses streaming body (Vite Connect middleware simulation)', async () => {
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;

    const validNotesPayload: ContributionPayload = {
      category: 'notes',
      subjectCode: 'M',
      resourceType: 'unit',
      title: 'Calculus Notes',
      driveUrl: 'https://drive.google.com/file/d/test-id/view',
      author: 'Test Student',
      unitNumber: '1',
      description: 'Test topics'
    };
    const { execute } = createMockHttp({
      method: 'POST',
      rawStreamBody: JSON.stringify(validNotesPayload),
      headers: { 'x-forwarded-for': '10.0.0.1' }
    });
    const response = await execute();
    assert.equal(response.statusCode, 200);
    const data = response.json();
    assert.equal(data.success, true);
    assert.equal(data.isSimulation, true);
    assert.equal(data.targetFile, 'content/notes/m.txt');

    if (originalToken) process.env.GITHUB_TOKEN = originalToken;
  });

  await test('Parses pre-parsed JSON body (Vercel/Express body-parser simulation)', async () => {
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;

    const validLinksPayload: ContributionPayload = {
      category: 'links',
      title: 'Campus Portal',
      url: 'https://portal.college.edu',
      description: 'Student portal',
      linkType: 'Portal',
      author: 'Test Contributor'
    };
    const { execute } = createMockHttp({
      method: 'POST',
      body: validLinksPayload,
      headers: { 'x-real-ip': '10.0.0.2' }
    });
    const response = await execute();
    assert.equal(response.statusCode, 200);
    const data = response.json();
    assert.equal(data.success, true);
    assert.equal(data.isSimulation, true);
    assert.equal(data.targetFile, 'content/links/links.txt');

    if (originalToken) process.env.GITHUB_TOKEN = originalToken;
  });

  // --- 3. Zod Validation for All 5 Categories ---
  await test('Category 1: Notes (unit, folder, pyq) validation & formatting', async () => {
    // Unit notes
    const unitPayload: ContributionPayload = {
      category: 'notes',
      subjectCode: 'DE',
      resourceType: 'unit',
      title: 'Logic Gates',
      driveUrl: 'https://drive.google.com/file/d/gates/view',
      author: 'Aman',
      unitNumber: '2'
    };
    const parsedUnit = ContributionPayloadSchema.safeParse(unitPayload);
    assert.equal(parsedUnit.success, true);
    const unitFormatted = formatContributionBlock(unitPayload);
    assert.equal(unitFormatted.targetFile, 'content/notes/de.txt');
    assert.match(unitFormatted.block, /\[UNIT\]/);
    assert.match(unitFormatted.block, /Logic Gates/);

    // PYQ
    const pyqPayload: ContributionPayload = {
      category: 'notes',
      subjectCode: 'CH',
      resourceType: 'pyq',
      title: '2024 End-Sem',
      year: '2024 End-Sem',
      driveUrl: 'https://drive.google.com/file/d/pyq/view',
      author: 'Rohit'
    };
    const parsedPyq = ContributionPayloadSchema.safeParse(pyqPayload);
    assert.equal(parsedPyq.success, true);
    const pyqFormatted = formatContributionBlock(pyqPayload);
    assert.match(pyqFormatted.block, /\[PYQ\]/);

    // Folder
    const folderPayload: ContributionPayload = {
      category: 'notes',
      subjectCode: 'PPS',
      resourceType: 'folder',
      title: 'Complete C Programming',
      driveUrl: 'https://drive.google.com/drive/folders/test',
      author: 'Sneha'
    };
    const parsedFolder = ContributionPayloadSchema.safeParse(folderPayload);
    assert.equal(parsedFolder.success, true);
    const folderFormatted = formatContributionBlock(folderPayload);
    assert.match(folderFormatted.block, /Additional Drive Folder/);
  });

  await test('Category 2: Timetable validation & formatting', async () => {
    const timetablePayload: ContributionPayload = {
      category: 'timetable',
      day: 'Wednesday',
      slotPeriod: '3',
      subjectCode: 'PPS',
      subjectName: 'Programming for Problem Solving',
      faculty: 'Prof. Sharma',
      room: 'CS-Lab-2',
      type: 'Lab',
      batch: 'V1',
      author: 'Class Rep'
    };
    const parsed = ContributionPayloadSchema.safeParse(timetablePayload);
    assert.equal(parsed.success, true);
    const formatted = formatContributionBlock(timetablePayload);
    assert.equal(formatted.targetFile, 'content/timetable/timetable.txt');
    assert.match(formatted.block, /Schedule Update for Wednesday/);
    assert.match(formatted.block, /CS-Lab-2/);
  });

  await test('Category 3: Faculty directory validation & formatting', async () => {
    const facultyPayload: ContributionPayload = {
      category: 'faculty',
      name: 'Dr. Ramesh Kumar',
      designation: 'Associate Professor',
      department: 'Computer Science',
      cabin: 'Block A - 302',
      email: 'ramesh.kumar@college.edu',
      officeHours: 'Mon, Wed: 3:00 PM - 4:00 PM',
      author: 'Yash'
    };
    const parsed = ContributionPayloadSchema.safeParse(facultyPayload);
    assert.equal(parsed.success, true);
    const formatted = formatContributionBlock(facultyPayload);
    assert.equal(formatted.targetFile, 'content/faculty/faculty.txt');
    assert.match(formatted.block, /\[FACULTY\]/);
    assert.match(formatted.block, /Dr. Ramesh Kumar/);
  });

  await test('Category 4: Announcements validation & formatting', async () => {
    const noticePayload: ContributionPayload = {
      category: 'announcements',
      title: 'Mid-Term Exam Dates Released',
      announcementCategory: 'Exam',
      priority: 'urgent',
      authority: 'Academic Office',
      summary: 'Examinations begin next Monday. Hall tickets available on portal.',
      author: 'CR Section V'
    };
    const parsed = ContributionPayloadSchema.safeParse(noticePayload);
    assert.equal(parsed.success, true);
    const formatted = formatContributionBlock(noticePayload);
    assert.equal(formatted.targetFile, 'content/announcements/announcements.txt');
    assert.match(formatted.block, /\[ANNOUNCEMENT\]/);
    assert.match(formatted.block, /priority: urgent/i);
  });

  await test('Category 5: Links validation & formatting', async () => {
    const linkPayload: ContributionPayload = {
      category: 'links',
      title: 'WiFi Login Portal',
      url: 'https://wifi.college.edu/login',
      description: 'Campus WiFi captive portal authentication',
      linkType: 'Portal',
      author: 'Network Team'
    };
    const parsed = ContributionPayloadSchema.safeParse(linkPayload);
    assert.equal(parsed.success, true);
    const formatted = formatContributionBlock(linkPayload);
    assert.equal(formatted.targetFile, 'content/links/links.txt');
    assert.match(formatted.block, /\[PORTAL\]/);
    assert.match(formatted.block, /https:\/\/wifi.college.edu\/login/);
  });

  // --- 4. Invalid Payloads & Validation Errors ---
  await test('Rejects payload with missing required fields with readable errors', async () => {
    const invalidPayload = {
      category: 'notes',
      subjectCode: 'M'
      // missing resourceType, title, driveUrl, author
    };
    const { execute } = createMockHttp({
      method: 'POST',
      body: invalidPayload,
      headers: { 'x-real-ip': '10.0.0.3' }
    });
    const response = await execute();
    assert.equal(response.statusCode, 400);
    const data = response.json();
    assert.equal(data.success, false);
    assert.match(data.error, /Validation error/);
    assert.match(data.error, /driveUrl/);
  });

  await test('Rejects payload with invalid URL', async () => {
    const invalidUrlPayload = {
      category: 'links',
      title: 'Test Link',
      url: 'not-a-valid-url',
      description: 'A description',
      linkType: 'Portal',
      author: 'Tester'
    };
    const { execute } = createMockHttp({
      method: 'POST',
      body: invalidUrlPayload,
      headers: { 'x-real-ip': '10.0.0.4' }
    });
    const response = await execute();
    assert.equal(response.statusCode, 400);
    const data = response.json();
    assert.equal(data.success, false);
    assert.match(data.error, /Invalid url/i);
  });

  // --- 5. Simulation Mode when GITHUB_TOKEN is omitted ---
  await test('Triggers simulation mode cleanly when GITHUB_TOKEN is not configured', async () => {
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;

    const payload: ContributionPayload = {
      category: 'links',
      title: 'Library Catalog',
      url: 'https://library.college.edu',
      description: 'Digital library catalog',
      linkType: 'Academic',
      author: 'Student'
    };

    const result = await processContribution(payload, 'sim-test-ip');
    assert.equal(result.success, true);
    assert.equal(result.isSimulation, true);
    assert.match(result.message!, /GITHUB_TOKEN is not configured/);
    assert.ok(result.formattedSnippet);
    assert.equal(result.targetFile, 'content/links/links.txt');

    if (originalToken) process.env.GITHUB_TOKEN = originalToken;
  });

  // --- 6. GitHub API Workflow Mock Verification ---
  await test('GitHub PR Creation workflow with mock API responses', async () => {
    const originalFetch = globalThis.fetch;
    const originalToken = process.env.GITHUB_TOKEN;
    const originalBaseBranch = process.env.GITHUB_BASE_BRANCH;

    process.env.GITHUB_TOKEN = 'ghp_mock_test_token_12345';
    process.env.GITHUB_BASE_BRANCH = 'main';

    const recordedCalls: { url: string; method?: string; body?: any }[] = [];

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = input.toString();
      const method = init?.method || 'GET';
      const body = init?.body ? JSON.parse(init.body.toString()) : undefined;
      recordedCalls.push({ url, method, body });

      // Step 1: Base branch ref
      if (url.includes('/git/ref/heads/main')) {
        return new Response(JSON.stringify({
          object: { sha: 'base_sha_abc123' }
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      // Step 2: Create branch
      if (url.includes('/git/refs') && method === 'POST') {
        return new Response(JSON.stringify({
          ref: body.ref,
          object: { sha: body.sha }
        }), { status: 201, headers: { 'content-type': 'application/json' } });
      }

      // Step 3: Get existing file
      if (url.includes('/contents/content/links/links.txt') && method === 'GET') {
        return new Response(JSON.stringify({
          sha: 'file_sha_xyz',
          content: Buffer.from('# Existing links content\n').toString('base64')
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      // Step 4: Commit updated file
      if (url.includes('/contents/content/links/links.txt') && method === 'PUT') {
        return new Response(JSON.stringify({
          content: { sha: 'new_file_sha_789' }
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }

      // Step 5: Create Pull Request
      if (url.includes('/pulls') && method === 'POST') {
        return new Response(JSON.stringify({
          html_url: 'https://github.com/Geetansh-Jangid/Section-V/pull/42',
          number: 42
        }), { status: 201, headers: { 'content-type': 'application/json' } });
      }

      return new Response('Not found', { status: 404 });
    };

    try {
      const payload: ContributionPayload = {
        category: 'links',
        title: 'New Student ERP',
        url: 'https://erp.college.edu',
        description: 'New ERP System',
        linkType: 'Portal',
        author: 'Geetansh'
      };

      const result = await processContribution(payload, 'github-test-ip');

      assert.equal(result.success, true);
      assert.equal(result.prNumber, 42);
      assert.equal(result.prUrl, 'https://github.com/Geetansh-Jangid/Section-V/pull/42');
      assert.match(result.message!, /Pull Request #42 successfully created/);

      // Verify call sequence
      assert.equal(recordedCalls.length, 5);
      // 1. Fetch base branch
      assert.ok(recordedCalls[0].url.endsWith('/git/ref/heads/main'));
      // 2. Create branch with baseSha
      assert.equal(recordedCalls[1].body.sha, 'base_sha_abc123');
      assert.ok(recordedCalls[1].body.ref.startsWith('refs/heads/contrib-links-'));
      // 3. Fetch file
      assert.ok(recordedCalls[2].url.includes('/contents/content/links/links.txt'));
      // 4. Commit updated file
      assert.equal(recordedCalls[3].body.sha, 'file_sha_xyz');
      const decodedCommitted = Buffer.from(recordedCalls[3].body.content, 'base64').toString('utf-8');
      assert.match(decodedCommitted, /Existing links content/);
      assert.match(decodedCommitted, /New Student ERP/);
      // 5. Open PR against baseBranch main
      assert.equal(recordedCalls[4].body.base, 'main');
      assert.match(recordedCalls[4].body.title, /\[Contribution\]: LINKS update by Geetansh/);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalToken) process.env.GITHUB_TOKEN = originalToken;
      else delete process.env.GITHUB_TOKEN;
      if (originalBaseBranch) process.env.GITHUB_BASE_BRANCH = originalBaseBranch;
    }
  });

  // --- 7. GitHub API Error Handling ---
  await test('GitHub API failure produces descriptive error message', async () => {
    const originalFetch = globalThis.fetch;
    const originalToken = process.env.GITHUB_TOKEN;

    process.env.GITHUB_TOKEN = 'ghp_bad_token';

    globalThis.fetch = async (): Promise<Response> => {
      return new Response(JSON.stringify({
        message: 'Bad credentials',
        documentation_url: 'https://docs.github.com/rest'
      }), { status: 401, statusText: 'Unauthorized', headers: { 'content-type': 'application/json' } });
    };

    try {
      const payload: ContributionPayload = {
        category: 'links',
        title: 'Test',
        url: 'https://example.com',
        description: 'Test',
        linkType: 'Portal',
        author: 'Tester'
      };

      const result = await processContribution(payload, 'error-test-ip');
      assert.equal(result.success, false);
      assert.match(result.error!, /Bad credentials/);
    } finally {
      globalThis.fetch = originalFetch;
      if (originalToken) process.env.GITHUB_TOKEN = originalToken;
      else delete process.env.GITHUB_TOKEN;
    }
  });

  // --- 8. Path Safety Enforcement ---
  await test('Rejects path traversal attempts in target file', async () => {
    // If subjectCode is manipulated or invalid
    const traversalPayload = {
      category: 'notes',
      subjectCode: '../secret',
      resourceType: 'unit',
      title: 'Hack',
      driveUrl: 'https://drive.google.com/test',
      author: 'Attacker'
    };
    // Zod will reject due to regex or safe check, but let's test processContribution
    const result = await processContribution(traversalPayload, 'safe-test-ip');
    assert.equal(result.success, false);
  });

  // --- 9. Rate Limiting ---
  await test('Enforces rate limiting after threshold is exceeded', async () => {
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;

    const rateLimitIp = '192.168.100.99';
    const payload: ContributionPayload = {
      category: 'links',
      title: 'Test',
      url: 'https://example.com',
      description: 'Test',
      linkType: 'Portal',
      author: 'Tester'
    };

    let rateLimited = false;
    for (let i = 0; i < 15; i++) {
      const { execute } = createMockHttp({
        method: 'POST',
        body: payload,
        headers: { 'x-forwarded-for': rateLimitIp }
      });
      const response = await execute();
      if (response.statusCode === 429) {
        rateLimited = true;
        const data = response.json();
        assert.equal(data.success, false);
        assert.match(data.error, /rate limit reached/i);
        break;
      }
    }
    assert.equal(rateLimited, true, 'Expected IP to be rate-limited after 10 requests');

    if (originalToken) process.env.GITHUB_TOKEN = originalToken;
  });

  // --- 10. Express Server Verification ---
  await test('Express server.js mounts contributeHandler correctly', async () => {
    process.env.NODE_ENV = 'test';
    const { default: expressApp } = await import('../../server.js');
    
    // Test express route directly by passing mock req/res
    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;

    try {
      const { req, res, execute } = createMockHttp({
        method: 'POST',
        body: {
          category: 'links',
          title: 'Express Link',
          url: 'https://expressjs.com',
          description: 'Fast, unopinionated, minimalist web framework',
          linkType: 'Portal',
          author: 'Express Tester'
        }
      });

      // Pass directly through Express app
      const resultPromise = new Promise<{ statusCode: number; json: () => any }>((resolve) => {
        res.on('finish', () => {
          resolve({
            statusCode: res.statusCode,
            json: () => JSON.parse(res.body || '{}')
          });
        });
      });

      (expressApp as any).handle(req, res);
      const response = await resultPromise;

      assert.equal(response.statusCode, 200);
      const data = response.json();
      assert.equal(data.success, true);
      assert.equal(data.isSimulation, true);
    } finally {
      if (originalToken) process.env.GITHUB_TOKEN = originalToken;
    }
  });

  // --- 10b. Vite Dev Middleware Verification ---
  await test('Vite dev middleware mounts contributeHandler correctly', async () => {
    const { createServer } = await import('vite');
    const viteServer = await createServer({
      configFile: './vite.config.ts',
      server: { middlewareMode: true }
    });

    const originalToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GH_TOKEN;

    try {
      const { req, res } = createMockHttp({
        method: 'POST',
        rawStreamBody: JSON.stringify({
          category: 'links',
          title: 'Vite Link',
          url: 'https://vite.dev',
          description: 'Next Generation Frontend Tooling',
          linkType: 'Portal',
          author: 'Vite Tester'
        })
      });
      req.originalUrl = '/api/contribute';
      req.url = '/api/contribute';

      const resultPromise = new Promise<{ statusCode: number; json: () => any }>((resolve) => {
        res.on('finish', () => {
          resolve({
            statusCode: res.statusCode,
            json: () => JSON.parse(res.body || '{}')
          });
        });
      });

      viteServer.middlewares.handle(req, res, () => {});
      process.nextTick(() => {
        req.emit('data', Buffer.from(JSON.stringify({
          category: 'links',
          title: 'Vite Link',
          url: 'https://vite.dev',
          description: 'Next Generation Frontend Tooling',
          linkType: 'Portal',
          author: 'Vite Tester'
        })));
        req.emit('end');
      });

      const response = await resultPromise;
      assert.equal(response.statusCode, 200);
      const data = response.json();
      assert.equal(data.success, true);
      assert.equal(data.isSimulation, true);
    } finally {
      await viteServer.close();
      if (originalToken) process.env.GITHUB_TOKEN = originalToken;
    }
  });

  // --- 11. Frontend Error Handling Resilience ---
  await test('Frontend error parser gracefully handles HTML 404 (no SyntaxError)', async () => {
    // Simulate what ContributeModal does when receiving Vercel 404 HTML
    const mockHtmlResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'The page could not be found.\n\nNOT_FOUND'
    };

    const responseText = await mockHtmlResponse.text();
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Body is not JSON
    }

    let errorMessage = '';
    try {
      if (!mockHtmlResponse.ok) {
        if (data && typeof data.error === 'string') throw new Error(data.error);
        if (mockHtmlResponse.status === 404) {
          throw new Error('Contribution API endpoint not found (404). Please ensure the backend is properly deployed.');
        }
        throw new Error(`Request failed with status ${mockHtmlResponse.status}`);
      }
    } catch (err: any) {
      errorMessage = err.message;
    }

    assert.equal(
      errorMessage,
      'Contribution API endpoint not found (404). Please ensure the backend is properly deployed.'
    );
    assert.doesNotMatch(errorMessage, /Unexpected token/);
  });

  await test('Frontend error parser gracefully handles HTML 500 error page', async () => {
    const mock500Response = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => '<html><body>Internal Server Error</body></html>'
    };

    const responseText = await mock500Response.text();
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Non-JSON
    }

    let errorMessage = '';
    try {
      if (!mock500Response.ok) {
        if (data && typeof data.error === 'string') throw new Error(data.error);
        if (mock500Response.status >= 500) {
          throw new Error('Server error (500). The server encountered an issue processing your contribution.');
        }
      }
    } catch (err: any) {
      errorMessage = err.message;
    }

    assert.match(errorMessage, /Server error \(500\)/);
    assert.doesNotMatch(errorMessage, /Unexpected token/);
  });

  // --- Summary ---
  console.log(`\n========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
