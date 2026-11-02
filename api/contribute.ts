import 'dotenv/config';
import type { IncomingMessage, ServerResponse } from 'http';
import { processContribution, ContributionResult } from '../src/api/contributeHandler.ts';

export interface VercelServerlessRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
  ip?: string;
}

export interface VercelServerlessResponse extends ServerResponse {
  status?: (statusCode: number) => VercelServerlessResponse;
  json?: (data: any) => void;
  send?: (data: any) => void;
}

function sendJsonResponse(
  res: VercelServerlessResponse,
  statusCode: number,
  data: unknown
): void {
  res.setHeader('Content-Type', 'application/json');

  if (typeof res.status === 'function') {
    res.status(statusCode);
  } else {
    res.statusCode = statusCode;
  }

  if (typeof res.json === 'function') {
    res.json(data);
  } else {
    res.end(JSON.stringify(data));
  }
}

async function parseBody(req: VercelServerlessRequest): Promise<{ parsed: any; error?: string }> {
  // If request body was already parsed (e.g. Express or Vercel Node runtime)
  if (req.body !== undefined && req.body !== null && req.body !== '') {
    if (typeof req.body === 'string') {
      try {
        return { parsed: JSON.parse(req.body) };
      } catch {
        return { parsed: null, error: 'Malformed JSON payload in request body.' };
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return { parsed: JSON.parse(req.body.toString('utf-8')) };
      } catch {
        return { parsed: null, error: 'Malformed JSON payload in request body buffer.' };
      }
    }
    if (typeof req.body === 'object') {
      return { parsed: req.body };
    }
  }

  // If streaming request (e.g. Vite connect middleware or raw http.IncomingMessage)
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw || raw.trim().length === 0) {
        resolve({ parsed: null, error: 'Request body cannot be empty.' });
        return;
      }
      try {
        resolve({ parsed: JSON.parse(raw) });
      } catch {
        resolve({ parsed: null, error: 'Invalid JSON syntax in request body.' });
      }
    });
    req.on('error', (err: any) => {
      resolve({ parsed: null, error: `Failed to read request stream: ${err?.message || 'unknown stream error'}` });
    });
  });
}

function getClientIp(req: VercelServerlessRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim().length > 0) {
    return realIp.trim();
  }
  return req.ip || req.socket?.remoteAddress || 'local';
}

export default async function handler(
  req: VercelServerlessRequest,
  res: VercelServerlessResponse
): Promise<void> {
  // Handle CORS preflight if applicable
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.statusCode = 204;
    res.end();
    return;
  }

  // Enforce HTTP POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return sendJsonResponse(res, 405, {
      success: false,
      error: `Method ${req.method || 'UNKNOWN'} Not Allowed. Only POST requests are supported.`
    });
  }

  try {
    const { parsed, error: bodyError } = await parseBody(req);
    if (bodyError || parsed === null || parsed === undefined) {
      return sendJsonResponse(res, 400, {
        success: false,
        error: bodyError || 'Request body must be a valid JSON object.'
      });
    }

    const clientIp = getClientIp(req);
    const result: ContributionResult = await processContribution(parsed, clientIp);

    const statusCode = result.success
      ? 200
      : result.error?.toLowerCase().includes('rate limit')
      ? 429
      : 400;

    return sendJsonResponse(res, statusCode, result);
  } catch (err: any) {
    console.error('[API /api/contribute] Unexpected exception:', err);
    return sendJsonResponse(res, 500, {
      success: false,
      error: err?.message || 'An unexpected server error occurred while processing the contribution.'
    });
  }
}
