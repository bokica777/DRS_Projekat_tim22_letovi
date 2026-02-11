import os
import smtplib
from email.message import EmailMessage
from typing import List, Optional, Tuple


Attachment = Tuple[str, bytes, str] 


def _cfg():
    host = os.getenv("SMTP_HOST", "").strip()
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "").strip()
    pw = os.getenv("SMTP_PASS", "").strip()
    mail_from = os.getenv("MAIL_FROM", user).strip()

    return host, port, user, pw, mail_from


def send_email(
    to_email: str,
    subject: str,
    body: str,
    attachments: Optional[List[Attachment]] = None
) -> bool:
    """
    Šalje email (opciono sa attachment-ima).
    Vraća True ako je poslato, False ako nije (npr. fali SMTP config).
    Ne baca exception (da ne ruši backend).
    """
    host, port, user, pw, mail_from = _cfg()

    if not host or not user or not pw:
        print("[MAIL] SMTP config missing (SMTP_HOST/SMTP_USER/SMTP_PASS). Email not sent.")
        return False

    msg = EmailMessage()
    msg["From"] = mail_from or user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    if attachments:
        for filename, content, mime in attachments:
            maintype, subtype = (mime.split("/", 1) + ["octet-stream"])[:2]
            msg.add_attachment(
                content,
                maintype=maintype,
                subtype=subtype,
                filename=filename
            )

    try:
        with smtplib.SMTP(host, port, timeout=15) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(user, pw)
            smtp.send_message(msg)
        return True
    except Exception as e:
        print("[MAIL] failed:", e)
        return False