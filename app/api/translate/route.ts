import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter: IP -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export type TranslationItem = {
  id: string; // e.g. "headline" or "aboutKey[0].label"
  values?: Partial<Record<string, string>>;
  sourceLang?: string;
  sourceText?: string;
  targetLangs?: string[];
};

const SUPPORTED_LOCALES = ["id", "en", "ja", "fr", "de", "it"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

type DetectedMove = {
  id: string;
  from: Locale;
  to: Locale;
  detectedLanguage: Locale;
};

function setCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin || "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";
  const res = new NextResponse(null, { status: 204 });
  return setCorsHeaders(res, origin);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "";

  // 1. Rate limiting check
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown-ip";
  if (isRateLimited(ip)) {
    const res = NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." }, { status: 429 });
    return setCorsHeaders(res, origin);
  }

  // 2. Check Google Cloud Translation API key
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    const res = NextResponse.json(
      { error: "GOOGLE_TRANSLATE_API_KEY belum dikonfigurasi di environment variables (.env.local / Vercel)." },
      { status: 500 }
    );
    return setCorsHeaders(res, origin);
  }

  // 3. Security/Origin check
  const referer = request.headers.get("referer") || "";
  const isAllowedOrigin =
    !origin && !referer ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.includes("sanity.studio") ||
    origin.includes("linnorea") ||
    referer.includes("localhost") ||
    referer.includes("127.0.0.1") ||
    referer.includes("sanity.studio") ||
    referer.includes("linnorea");

  if (!isAllowedOrigin) {
    const res = NextResponse.json({ error: "Akses ditolak: request harus berasal dari Sanity Studio atau domain resmi." }, { status: 403 });
    return setCorsHeaders(res, origin);
  }

  try {
    const body = await request.json();
    const items: TranslationItem[] = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      const res = NextResponse.json({ translations: {} });
      return setCorsHeaders(res, origin);
    }

    const translations: Record<string, Record<string, string>> = {};
    const moves: DetectedMove[] = [];
    const sources: Record<string, { sourceLang: Locale; sourceText: string }> = {};

    for (const item of items) {
      const values: Partial<Record<Locale, string>> = {};
      if (item.values) {
        for (const locale of SUPPORTED_LOCALES) {
          const value = item.values[locale];
          if (typeof value === "string" && value.trim()) values[locale] = value.trim();
        }
      } else if (
        item.sourceLang &&
        SUPPORTED_LOCALES.includes(item.sourceLang as Locale) &&
        typeof item.sourceText === "string" &&
        item.sourceText.trim()
      ) {
        values[item.sourceLang as Locale] = item.sourceText.trim();
      }

      const entries = Object.entries(values) as [Locale, string][];
      if (entries.length === 0) continue;

      const detectResponse = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: entries.map(([, text]) => text) }),
        }
      );
      if (!detectResponse.ok) {
        const errorText = await detectResponse.text();
        console.error("Google Translate detect API error:", errorText);
        const res = NextResponse.json({ error: `Google Translation detect error (${detectResponse.status}): ${errorText}` }, { status: detectResponse.status });
        return setCorsHeaders(res, origin);
      }

      const detectData = await detectResponse.json();
      const detections = detectData.data?.detections ?? [];
      for (let index = 0; index < entries.length; index++) {
        const [enteredLocale] = entries[index];
        const detectedCode = String(detections[index]?.[0]?.language || "").toLowerCase().split("-")[0];
        if (
          SUPPORTED_LOCALES.includes(detectedCode as Locale) &&
          detectedCode !== enteredLocale &&
          !values[detectedCode as Locale]
        ) {
          const detectedLocale = detectedCode as Locale;
          values[detectedLocale] = values[enteredLocale];
          delete values[enteredLocale];
          moves.push({ id: item.id, from: enteredLocale, to: detectedLocale, detectedLanguage: detectedLocale });
        }
      }

      const priority: Locale[] = ["en", "id", "ja", "fr", "de", "it"];
      const sourceLang = priority.find((locale) => values[locale]);
      if (!sourceLang) continue;
      const sourceText = values[sourceLang] as string;
      sources[item.id] = { sourceLang, sourceText };

      const requestedTargets = SUPPORTED_LOCALES.filter(
        (locale) => locale !== sourceLang && !values[locale]
      );

      if (requestedTargets.length === 0) continue;
      translations[item.id] = {};
      for (const target of requestedTargets) {
        const translateResponse = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              q: sourceText,
              source: sourceLang,
              target,
              format: "text",
            }),
          }
        );
        if (!translateResponse.ok) {
          const errorText = await translateResponse.text();
          console.error("Google Translate API error:", errorText);
          const res = NextResponse.json({ error: `Google Translation error (${translateResponse.status}): ${errorText}` }, { status: translateResponse.status });
          return setCorsHeaders(res, origin);
        }
        const translateData = await translateResponse.json();
        const translatedText = translateData.data?.translations?.[0]?.translatedText;
        if (typeof translatedText === "string" && translatedText.trim()) {
          translations[item.id][target] = translatedText.trim();
        }
      }
    }

    const res = NextResponse.json({ translations, moves, sources });
    return setCorsHeaders(res, origin);
  } catch (err: unknown) {
    console.error("Translation API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    const res = NextResponse.json({ error: message }, { status: 500 });
    return setCorsHeaders(res, origin);
  }
}
