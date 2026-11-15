"use client";

import { useEffect, useRef, useState } from "react";
import { graphqlRequest } from "@/lib/graphqlClient";
import type { Html5Qrcode } from "html5-qrcode";

const CHECK_IN_TICKET = `
  mutation CheckInTicket($ticketCode: String!) {
    checkInTicket(ticketCode: $ticketCode) {
      id
      ticketCode
      checkedInAt
    }
  }
`;

type CheckInResult = {
  checkInTicket: {
    id: string;
    ticketCode: string;
    checkedInAt: string | null;
  };
};

export default function OrganizerTicketCheckIn() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastTicket, setLastTicket] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef(false);
  const mountedRef = useRef(true);
  const regionId = "organizer-ticket-scanner";

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        void scanner
          .stop()
          .catch((error) => {
            console.warn("Scanner stop failed:", error);
          })
          .finally(() => {
            try {
              scanner.clear();
            } catch (error) {
              console.warn("Scanner cleanup failed:", error);
            }
          });
      }
    };
  }, []);

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        // Camera may already have stopped.
      }
      try {
        await scanner.clear();
      } catch {
        // Scanner may already be cleared.
      }
    }
    if (mountedRef.current) setScanning(false);
  };

  const verifyTicket = async (rawCode: string) => {
    const ticketCode = rawCode.trim();
    if (!ticketCode || scanLockRef.current) return;
    scanLockRef.current = true;
    setBusy(true);
    setMessage("");
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in as an organizer.");
      const result = await graphqlRequest<CheckInResult>({
        query: CHECK_IN_TICKET,
        variables: { ticketCode },
        token,
      });
      if (!mountedRef.current) return;
      setSuccess(true);
      setLastTicket(result.checkInTicket.ticketCode);
      setCode("");
      setMessage("Check-in successful. Ticket is now marked as used.");
    } catch (error) {
      if (!mountedRef.current) return;
      setMessage(
        error instanceof Error ? error.message : "Unable to check in ticket.",
      );
    } finally {
      scanLockRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  };

  const startCamera = async () => {
    if (scannerRef.current || scanning) return;
    setMessage("");
    setSuccess(false);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!mountedRef.current) return;
      setScanning(true);
      const scanner = new Html5Qrcode(regionId, false);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (scanLockRef.current) return;
          void stopCamera();
          void verifyTicket(decodedText);
        },
        () => {},
      );
      if (mountedRef.current) setScanning(true);
    } catch (error) {
      await stopCamera();
      if (mountedRef.current) {
        setMessage(
          error instanceof Error
            ? `Camera unavailable: ${error.message}. Enter the code manually instead.`
            : "Camera unavailable. Enter the code manually instead.",
        );
      }
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Ticket Check-in
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Scan an attendee’s QR code or enter their ticket code to check them
            in.
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
          Organizer access
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div
            id={regionId}
            className={
              scanning
                ? "min-h-60 overflow-hidden rounded-2xl bg-slate-900"
                : "hidden"
            }
          />
          <button
            type="button"
            onClick={() => void (scanning ? stopCamera() : startCamera())}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {scanning ? "Stop Camera" : "Scan QR Code"}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Camera scanning requires HTTPS or localhost and camera permission.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void verifyTicket(code);
          }}
          className="space-y-3"
        >
          <label
            htmlFor="checkin-ticket-code"
            className="block text-sm font-semibold text-slate-700"
          >
            Manual ticket code
          </label>
          <input
            id="checkin-ticket-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="CNCG-..."
            autoComplete="off"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            {busy ? "Checking ticket..." : "Verify & Check In"}
          </button>
          {message && (
            <div
              role="status"
              className={`rounded-xl p-4 text-sm font-medium ${success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
            >
              {message}
              {success && lastTicket && (
                <p className="mt-1 break-all font-mono text-xs">{lastTicket}</p>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
