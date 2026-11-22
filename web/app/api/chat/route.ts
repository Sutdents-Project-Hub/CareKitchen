import { NextResponse } from "next/server";
import { getChatMode, rankWithOpenAI } from "@/lib/server/openai";
import { planTurn } from "@/lib/server/planner";
import { turnSchema } from "@/lib/server/turn";

export const runtime = "nodejs";

const maxBodyBytes = 24 * 1024;
const rateWindowMs = 60_000;
const maxOpenAiRequestsPerWindow = 20;
const maxConcurrentOpenAiRequests = 3;

let windowStartedAt = 0;
let requestsInWindow = 0;
let activeOpenAiRequests = 0;

function reserveOpenAiRequest(now: number) {
  if (now - windowStartedAt >= rateWindowMs) {
    windowStartedAt = now;
    requestsInWindow = 0;
  }
  if (requestsInWindow >= maxOpenAiRequestsPerWindow || activeOpenAiRequests >= maxConcurrentOpenAiRequests) {
    return false;
  }
  requestsInWindow += 1;
  activeOpenAiRequests += 1;
  return true;
}

function json(body: object, status = 200, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function failure(message: string, status: number, headers?: HeadersInit) {
  return json({ message }, status, headers);
}

async function readJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing body");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let body = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) {
        void reader.cancel().catch(() => undefined);
        throw new RangeError("Body too large");
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

export function GET() {
  return json({ mode: getChatMode() });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const matchesHost = origin === `http://${host}` || origin === `https://${host}`;
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && !matchesHost)) {
    return failure("請從 CareKitchen 頁面送出餐點需求。", 403);
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return failure("請以餐點表單送出資料。", 415);
  }
  if (Number(request.headers.get("content-length")) > maxBodyBytes) {
    return failure("輸入內容太長，請縮短餐點需求。", 413);
  }

  let input: unknown;
  try {
    input = await readJson(request);
  } catch (error) {
    return error instanceof RangeError
      ? failure("輸入內容太長，請縮短餐點需求。", 413)
      : failure("無法讀取餐點需求，請再試一次。", 400);
  }
  const turn = turnSchema.safeParse(input);
  if (!turn.success) return failure("請確認輸入內容，以及人數、預算或採買數量，再送出。", 400);

  const mode = getChatMode();
  if (mode === "unavailable") return failure("OpenAI 尚未完成設定，您輸入的內容仍在，可以稍後重試。", 503);

  const rank = mode === "openai" ? async (...args: Parameters<typeof rankWithOpenAI>) => {
    if (!reserveOpenAiRequest(Date.now())) throw new RateLimitedError();
    try {
      return await rankWithOpenAI(...args);
    } finally {
      activeOpenAiRequests -= 1;
    }
  } : undefined;

  try {
    return json(await planTurn(turn.data, rank));
  } catch (error) {
    if (error instanceof RateLimitedError) {
      return failure("目前使用人數較多，請稍候再試。您輸入的內容仍在。", 429, { "Retry-After": "60" });
    }
    return failure(
      mode === "openai" ? "目前無法取得 OpenAI 回覆，您輸入的內容仍在，可以稍後重試。" : "目前無法完成餐點規劃，您輸入的內容仍在，可以再試一次。",
      mode === "openai" ? 503 : 500,
    );
  }
}

class RateLimitedError extends Error {}
