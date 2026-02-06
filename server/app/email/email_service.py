import os
import smtplib
from email.message import EmailMessage

def _cfg():
    host = os.getenv("SMTP_HOST", "").strip()
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "").strip()
    pw = os.getenv("SMTP_PASS", "").strip()
    mail_from = os.getenv("MAIL_FROM", user).strip()

    if not host or not user or not pw:
        raise RuntimeError("SMTP config missing (SMTP_HOST/SMTP_USER/SMTP_PASS)")

    return host, port, user, pw, mail_from

def send_email(to_email: str, subject: str, body: str) -> None:
    host, port, user, pw, mail_from = _cfg()

    msg = EmailMessage()
    msg["From"] = mail_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    with smtplib.SMTP(host, port, timeout=15) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(user, pw)
        smtp.send_message(msg)
