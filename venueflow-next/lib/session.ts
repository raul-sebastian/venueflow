import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const sessionCookieName = "venueflow_session";
const sessionMaxAge = 60 * 60 * 24 * 7;
const sessionSecret =
  process.env.AUTH_SECRET ?? "venueflow-local-development-session-secret";

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  expiresAt: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

function signaturesMatch(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}

export async function createSessionCookie(user: Omit<SessionUser, "expiresAt">) {
  const expiresAt = Date.now() + sessionMaxAge * 1000;
  const payload = toBase64Url(JSON.stringify({ ...user, expiresAt }));
  const signature = signPayload(payload);
  const cookieStore = await cookies();

  cookieStore.set(sessionCookieName, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAge,
    path: "/",
  });
}

export async function getSessionCookie(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(sessionCookieName)?.value;

  if (!sessionValue) {
    return null;
  }

  const [payload, signature] = sessionValue.split(".");

  if (!payload || !signature || !signaturesMatch(signPayload(payload), signature)) {
    return null;
  }

  try {
    const session = JSON.parse(fromBase64Url(payload)) as SessionUser;

    if (!session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}
