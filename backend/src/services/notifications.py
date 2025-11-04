"""Notification provider abstraction for ride status updates."""
from __future__ import annotations

import json
import smtplib
from abc import ABC, abstractmethod
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Any, Dict, Optional

import requests
from flask import current_app

from src.models.ride import Ride


class BaseEmailProvider(ABC):
    """Contract for sending email notifications."""

    @abstractmethod
    def send(self, to_email: str, subject: str, body: str) -> None:  # pragma: no cover - interface
        raise NotImplementedError


class BaseSMSProvider(ABC):
    """Contract for sending SMS notifications."""

    @abstractmethod
    def send(self, to_number: str, message: str) -> None:  # pragma: no cover - interface
        raise NotImplementedError


class ConsoleEmailProvider(BaseEmailProvider):
    """Fallback provider that logs emails to the application logger."""

    def send(self, to_email: str, subject: str, body: str) -> None:
        current_app.logger.info(
            "[EMAIL] To: %s | Subject: %s | Body: %s", to_email, subject, body
        )


class SMTPEmailProvider(BaseEmailProvider):
    """Simple SMTP provider using configuration from the Flask app."""

    def __init__(self, host: str, port: int, username: Optional[str], password: Optional[str], default_from: str) -> None:
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.default_from = default_from

    def send(self, to_email: str, subject: str, body: str) -> None:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = self.default_from
        message["To"] = to_email
        message.set_content(body)

        with smtplib.SMTP(self.host, self.port) as smtp:
            smtp.starttls()
            if self.username and self.password:
                smtp.login(self.username, self.password)
            smtp.send_message(message)


class ConsoleSMSProvider(BaseSMSProvider):
    """Fallback provider that logs SMS messages."""

    def send(self, to_number: str, message: str) -> None:
        current_app.logger.info("[SMS] To: %s | Message: %s", to_number, message)


class WebhookSMSProvider(BaseSMSProvider):
    """Provider that POSTs SMS payloads to a configured webhook."""

    def __init__(self, url: str, token: Optional[str], sender: str) -> None:
        self.url = url
        self.token = token
        self.sender = sender

    def send(self, to_number: str, message: str) -> None:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        payload = {"to": to_number, "from": self.sender, "message": message}
        response = requests.post(self.url, headers=headers, data=json.dumps(payload), timeout=10)
        response.raise_for_status()


@dataclass
class NotificationProviders:
    email: Optional[BaseEmailProvider]
    sms: Optional[BaseSMSProvider]


class NotificationService:
    """Dispatch ride status notifications via configured providers."""

    def __init__(self, providers: NotificationProviders) -> None:
        self.providers = providers

    def notify_ride_status(self, ride: Ride, status: str, context: Optional[Dict[str, Any]] = None) -> None:
        """Send ride status change notifications if contact information is present."""

        subject = f"Kos Taxi ride {status.replace('_', ' ')}"
        message_lines = [
            f"Status: {status}",
            f"Pickup: {ride.pickup_address}",
            f"Drop-off: {ride.dest_address}",
        ]
        if ride.scheduled_time:
            message_lines.append(f"Scheduled for: {ride.scheduled_time.isoformat()}")
        if context and context.get("estimate"):
            estimate = context["estimate"]
            message_lines.append(
                f"Estimated fare: €{estimate.get('fare')} | Duration: {estimate.get('durationMinutes')} mins"
            )
        if context and context.get("payment"):
            payment = context["payment"]
            message_lines.append(
                f"Payment status: {payment.get('status')} | Amount: €{payment.get('amount_eur')}"
            )
        body = "\n".join(message_lines)

        if ride.user_email and self.providers.email:
            try:
                self.providers.email.send(ride.user_email, subject, body)
            except Exception as exc:  # pragma: no cover - log and continue
                current_app.logger.exception("Failed to send email notification: %s", exc)

        if ride.user_phone and self.providers.sms:
            try:
                self.providers.sms.send(ride.user_phone, body)
            except Exception as exc:  # pragma: no cover - log and continue
                current_app.logger.exception("Failed to send SMS notification: %s", exc)


def _build_email_provider() -> Optional[BaseEmailProvider]:
    app = current_app
    provider = (app.config.get("NOTIFICATIONS_EMAIL_PROVIDER") or "console").lower()
    if provider == "disabled":
        return None
    if provider == "smtp":
        host = app.config.get("SMTP_HOST")
        from_email = app.config.get("NOTIFICATIONS_FROM_EMAIL")
        if not host or not from_email:
            app.logger.warning("SMTP provider selected but SMTP_HOST or NOTIFICATIONS_FROM_EMAIL missing")
            return None
        return SMTPEmailProvider(
            host=host,
            port=int(app.config.get("SMTP_PORT", 587)),
            username=app.config.get("SMTP_USERNAME"),
            password=app.config.get("SMTP_PASSWORD"),
            default_from=from_email,
        )
    return ConsoleEmailProvider()


def _build_sms_provider() -> Optional[BaseSMSProvider]:
    app = current_app
    provider = (app.config.get("NOTIFICATIONS_SMS_PROVIDER") or "console").lower()
    if provider == "disabled":
        return None
    if provider == "webhook":
        url = app.config.get("NOTIFICATIONS_SMS_WEBHOOK_URL")
        if not url:
            app.logger.warning("Webhook SMS provider selected but NOTIFICATIONS_SMS_WEBHOOK_URL missing")
            return None
        return WebhookSMSProvider(
            url=url,
            token=app.config.get("NOTIFICATIONS_SMS_WEBHOOK_TOKEN"),
            sender=app.config.get("NOTIFICATIONS_DEFAULT_SMS_SENDER", "KosTaxi"),
        )
    return ConsoleSMSProvider()


def get_notification_service() -> NotificationService:
    """Return a cached notification service instance bound to the current app."""

    app = current_app._get_current_object()
    service: Optional[NotificationService] = app.extensions.get("notifications_service")  # type: ignore[assignment]
    if service is None:
        service = NotificationService(
            NotificationProviders(email=_build_email_provider(), sms=_build_sms_provider())
        )
        app.extensions["notifications_service"] = service
    return service


__all__ = [
    "NotificationService",
    "get_notification_service",
]
