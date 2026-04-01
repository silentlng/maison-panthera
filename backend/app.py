from __future__ import annotations

import json
import mimetypes
import os
import re
import smtplib
import ssl
import time
from email.message import EmailMessage
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Dict, List
from urllib.parse import unquote, urlparse


HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8080"))
MAX_BODY_BYTES = int(os.getenv("MAX_BODY_BYTES", "20000"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "300"))
RATE_LIMIT_MAX = int(os.getenv("RATE_LIMIT_MAX", "8"))
ALLOWED_ORIGINS = {
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:4173").split(",")
    if origin.strip()
}

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER or "no-reply@maisonpanthera.local")
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "true").lower() == "true"
CONTACT_TO = os.getenv("CONTACT_TO", "maisonpanthera@outlook.com")
REVIEWS_TO = os.getenv("REVIEWS_TO", CONTACT_TO)
STATIC_ROOT = Path(__file__).resolve().parent.parent

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[0-9+\s().-]{6,40}$")
RATE_LIMIT_BUCKET: Dict[str, List[float]] = {}
DATA_DIR = Path(__file__).with_name("data")
DATA_DIR.mkdir(exist_ok=True)


def json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_security_headers()
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def normalize_text(value: str, max_len: int) -> str:
    return " ".join((value or "").strip().split())[:max_len]


def read_json_body(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length", "0"))
    if length <= 0 or length > MAX_BODY_BYTES:
      raise ValueError("Invalid payload size")
    raw = handler.rfile.read(length)
    return json.loads(raw.decode("utf-8"))


def get_request_origin(handler: BaseHTTPRequestHandler) -> str:
    return handler.headers.get("Origin", "").strip()


def is_origin_allowed(origin: str) -> bool:
    if not origin:
        return True
    return origin in ALLOWED_ORIGINS


def get_client_ip(handler: BaseHTTPRequestHandler) -> str:
    forwarded = handler.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return handler.client_address[0]


def rate_limit_ok(ip: str) -> bool:
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    timestamps = [ts for ts in RATE_LIMIT_BUCKET.get(ip, []) if ts >= window_start]
    if len(timestamps) >= RATE_LIMIT_MAX:
        RATE_LIMIT_BUCKET[ip] = timestamps
        return False
    timestamps.append(now)
    RATE_LIMIT_BUCKET[ip] = timestamps
    return True


def store_submission(kind: str, payload: dict) -> None:
    path = DATA_DIR / f"{kind}.log"
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(payload, ensure_ascii=False) + "\n")


def send_email(subject: str, body: str, recipient: str) -> str:
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS):
        return "stored"

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = SMTP_FROM
    message["To"] = recipient
    message.set_content(body)

    if SMTP_USE_SSL:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ssl.create_default_context()) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(message)
    else:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=ssl.create_default_context())
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(message)

    return "sent"


def resolve_static_path(request_path: str) -> Path | None:
    path = unquote(urlparse(request_path).path)
    if path in {"", "/"}:
        return STATIC_ROOT / "index.html"

    aliases = {
        "/services": "services.html",
        "/about": "about.html",
        "/contact": "contact.html",
    }
    if path in aliases:
        return STATIC_ROOT / aliases[path]

    relative = path.lstrip("/")
    candidate = (STATIC_ROOT / relative).resolve()
    try:
        candidate.relative_to(STATIC_ROOT.resolve())
    except ValueError:
        return None

    if candidate.is_dir():
        candidate = candidate / "index.html"
    return candidate


def validate_contact(payload: dict) -> dict:
    website = normalize_text(payload.get("website", ""), 100)
    if website:
        raise ValueError("Spam detected")

    nom = normalize_text(payload.get("nom", ""), 120)
    email = normalize_text(payload.get("email", ""), 160)
    telephone = normalize_text(payload.get("telephone", ""), 40)
    service = normalize_text(payload.get("service", ""), 140)
    message = (payload.get("message", "") or "").strip()[:2000]

    if len(nom) < 2:
        raise ValueError("Nom invalide")
    if not EMAIL_RE.match(email):
        raise ValueError("Email invalide")
    if telephone and not PHONE_RE.match(telephone):
        raise ValueError("Téléphone invalide")
    if len(message) < 10:
        raise ValueError("Message trop court")

    return {
        "nom": nom,
        "email": email,
        "telephone": telephone,
        "service": service,
        "message": message,
    }


def validate_review(payload: dict) -> dict:
    website = normalize_text(payload.get("website", ""), 100)
    if website:
        raise ValueError("Spam detected")

    nom = normalize_text(payload.get("nom", ""), 120)
    service = normalize_text(payload.get("service", ""), 140)
    avis = (payload.get("avis", "") or "").strip()[:1500]
    note = normalize_text(payload.get("note", ""), 10)

    if len(nom) < 2:
        raise ValueError("Nom invalide")
    if len(avis) < 8:
        raise ValueError("Avis trop court")
    if note not in {"1/5", "2/5", "3/5", "4/5", "5/5"}:
        raise ValueError("Note invalide")

    return {
        "nom": nom,
        "service": service,
        "avis": avis,
        "note": note,
    }


class AppHandler(BaseHTTPRequestHandler):
    server_version = "MaisonPanthera/1.0"

    def log_message(self, fmt: str, *args) -> None:
        return

    def send_security_headers(self) -> None:
        origin = get_request_origin(self)
        if origin and is_origin_allowed(origin):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

    def serve_static(self, head_only: bool = False) -> None:
        file_path = resolve_static_path(self.path)
        if file_path is None or not file_path.exists() or not file_path.is_file():
            json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
            return

        content_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        body = file_path.read_bytes()

        self.send_response(HTTPStatus.OK)
        self.send_security_headers()
        if file_path.suffix in {".html"}:
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header("Cache-Control", "public, max-age=3600")
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if not head_only:
            self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        origin = get_request_origin(self)
        if not is_origin_allowed(origin):
            json_response(self, HTTPStatus.FORBIDDEN, {"ok": False, "error": "Origin not allowed"})
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_security_headers()
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/health":
            json_response(self, HTTPStatus.OK, {"ok": True, "status": "healthy"})
            return
        self.serve_static()

    def do_HEAD(self) -> None:
        if self.path == "/api/health":
            self.send_response(HTTPStatus.OK)
            self.send_security_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self.serve_static(head_only=True)

    def do_POST(self) -> None:
        origin = get_request_origin(self)
        if not is_origin_allowed(origin):
            json_response(self, HTTPStatus.FORBIDDEN, {"ok": False, "error": "Origin not allowed"})
            return

        ip = get_client_ip(self)
        if not rate_limit_ok(ip):
            json_response(self, HTTPStatus.TOO_MANY_REQUESTS, {"ok": False, "error": "Too many requests"})
            return

        try:
            payload = read_json_body(self)
        except (ValueError, json.JSONDecodeError):
            json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid JSON payload"})
            return

        try:
            if self.path == "/api/contact":
                data = validate_contact(payload)
                data["created_at"] = int(time.time())
                data["ip"] = ip
                store_submission("contact", data)
                mode = send_email(
                    "Nouvelle demande — Maison Panthera",
                    (
                        f"Nom: {data['nom']}\n"
                        f"Email: {data['email']}\n"
                        f"Téléphone: {data['telephone']}\n"
                        f"Service: {data['service']}\n\n"
                        f"Message:\n{data['message']}\n"
                    ),
                    CONTACT_TO,
                )
                json_response(self, HTTPStatus.OK, {"ok": True, "mode": mode})
                return

            if self.path == "/api/reviews":
                data = validate_review(payload)
                data["created_at"] = int(time.time())
                data["ip"] = ip
                store_submission("reviews", data)
                mode = send_email(
                    "Nouvel avis client — Maison Panthera",
                    (
                        f"Nom: {data['nom']}\n"
                        f"Service: {data['service']}\n"
                        f"Note: {data['note']}\n\n"
                        f"Avis:\n{data['avis']}\n"
                    ),
                    REVIEWS_TO,
                )
                json_response(self, HTTPStatus.OK, {"ok": True, "mode": mode})
                return
        except ValueError as exc:
            json_response(self, HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
            return
        except smtplib.SMTPException:
            json_response(self, HTTPStatus.BAD_GATEWAY, {"ok": False, "error": "Email delivery failed"})
            return

        json_response(self, HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})


if __name__ == "__main__":
    server = ThreadingHTTPServer((HOST, PORT), AppHandler)
    print(f"Maison Panthera running on http://{HOST}:{PORT}")
    server.serve_forever()
