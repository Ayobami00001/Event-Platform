import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { confirmPaystackBooking } from "@/lib/payments/confirmPaystackBooking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeCompare(actual: Buffer, expectedHex: string) {
  if (!/^[0-9a-f]{128}$/i.test(expectedHex)) return false;

  const expected = Buffer.from(expectedHex, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

function verifySignature(req: NextRequest, body: Buffer) {
  // Current Paystack webhook-signing mechanism.
  const signedHeader = req.headers.get("paystack-signature");

  if (signedHeader) {
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;

    if (!secret) return false;

    const parts = signedHeader.split(",").map((part) => part.trim());

    const timestampPart = parts.find((part) =>
      part.startsWith("t="),
    );

    const timestamp = timestampPart?.slice(2);

    if (!timestamp || !/^\d+$/.test(timestamp)) return false;

    const timestampSeconds = Number(timestamp);

    if (
      !Number.isSafeInteger(timestampSeconds) ||
      Math.abs(Date.now() / 1000 - timestampSeconds) > 300
    ) {
      return false;
    }

    const digest = createHmac("sha512", secret)
      .update(`${timestamp}.`)
      .update(body)
      .digest();

    return parts
      .filter((part) => part.startsWith("v1="))
      .some((part) => {
        const value = part.slice(3);
        const separator = value.indexOf(":");

        if (separator < 0) return false;

        const signature = value.slice(separator + 1);

        return safeCompare(digest, signature);
      });
  }

  // Compatibility for Paystack accounts still using the older signature.
  const legacySignature = req.headers.get("x-paystack-signature");
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!legacySignature || !secretKey) return false;

  const digest = createHmac("sha512", secretKey)
    .update(body)
    .digest();

  return safeCompare(digest, legacySignature);
}

export async function POST(req: NextRequest) {
  try {
    const body = Buffer.from(await req.arrayBuffer());

    if (!verifySignature(req, body)) {
      return NextResponse.json(
        { error: "Invalid Paystack signature." },
        { status: 401 },
      );
    }

    const payload = JSON.parse(body.toString("utf8"));

    // We only need successful payment events here.
    if (payload.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const reference = payload.data?.reference;

    if (typeof reference !== "string" || !reference) {
      return NextResponse.json(
        { error: "Missing payment reference." },
        { status: 400 },
      );
    }

    await confirmPaystackBooking(reference);

    return NextResponse.json({
      received: true,
      processed: true,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 },
    );
  }
}