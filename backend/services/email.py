"""
Email service — Resend integration.
Handles deadline reminders, welcome emails, and weekly digests.
"""
import logging
from dataclasses import dataclass
from datetime import date

import resend

from core.config import settings

logger = logging.getLogger(__name__)

# ── Helpers ───────────────────────────────────────────────────────────────────

def _urgency_color(days: int) -> str:
    if days <= 7:  return "#ef4444"   # red
    if days <= 14: return "#f59e0b"   # amber
    return "#10b981"                  # green


def _urgency_label(days: int, lang: str) -> str:
    if days == 0: return "Aujourd'hui" if lang == "fr" else "Today"
    if days == 1: return "Demain"      if lang == "fr" else "Tomorrow"
    return f"Dans {days} jours" if lang == "fr" else f"In {days} days"


# ── Email templates ───────────────────────────────────────────────────────────

_BASE_HTML = """\
<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 16px 40px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 16px;margin-bottom:12px;">
        <span style="color:white;font-size:20px;font-weight:800;letter-spacing:-0.5px;">Agent SMB</span>
      </div>
      <p style="color:rgba(255,255,255,0.75);margin:0;font-size:13px;">{tagline}</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      {body}

      <!-- CTA -->
      <div style="margin-top:32px;text-align:center;">
        <a href="{app_url}/dashboard"
           style="background:linear-gradient(135deg,#6366f1,#4f46e5);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;box-shadow:0 4px 12px rgba(99,102,241,0.3);">
          {cta_label}
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;">
        <p style="color:#94a3b8;font-size:11px;margin:0;">
          Agent SMB &middot;
          <a href="{app_url}/privacy" style="color:#6366f1;text-decoration:none;">Politique de confidentialité</a>
          &middot;
          <a href="{app_url}/settings" style="color:#6366f1;text-decoration:none;">{unsubscribe_label}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
"""


@dataclass
class DeadlineInfo:
    title: str
    title_fr: str
    days_until: int
    authority: str
    deadline_date: str


def _deadline_row(d: DeadlineInfo, lang: str) -> str:
    color = _urgency_color(d.days_until)
    label = _urgency_label(d.days_until, lang)
    title = d.title_fr if lang == "fr" else d.title
    return f"""
    <div style="border-left:4px solid {color};padding:12px 16px;margin:12px 0;background:#fafafa;border-radius:0 8px 8px 0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <p style="font-weight:600;color:#0f172a;margin:0 0 4px;font-size:14px;">{title}</p>
          <p style="color:#64748b;font-size:12px;margin:0;">{d.authority} &middot; {d.deadline_date}</p>
        </div>
        <span style="color:{color};font-weight:700;font-size:13px;white-space:nowrap;margin-left:12px;">{label}</span>
      </div>
    </div>"""


def send_deadline_reminder(
    to_email: str,
    business_name: str,
    deadlines: list[DeadlineInfo],
    language: str = "fr",
) -> bool:
    if not settings.resend_api_key or not deadlines:
        return False

    t = language == "en"
    subject = (
        f"Rappel : {len(deadlines)} échéance(s) à venir — {business_name}"
        if not t else
        f"Reminder: {len(deadlines)} upcoming deadline(s) — {business_name}"
    )
    greeting = (
        f"Bonjour {business_name}," if not t else f"Hi {business_name},"
    )
    intro = (
        "Voici vos prochaines échéances fiscales et réglementaires :"
        if not t else
        "Here are your upcoming tax and compliance deadlines:"
    )
    rows = "".join(_deadline_row(d, language) for d in deadlines)

    body = f"""
      <h2 style="color:#0f172a;font-size:18px;margin:0 0 4px;">🗓️ {"Rappel d'échéances" if not t else "Deadline Reminder"}</h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">{greeting}</p>
      <p style="color:#475569;font-size:14px;margin:0 0 16px;">{intro}</p>
      {rows}
      <p style="color:#64748b;font-size:12px;margin:20px 0 0;line-height:1.6;">
        {"Ces rappels sont basés sur votre profil (province, type de déclarant). Consultez un comptable pour votre situation spécifique."
         if not t else
         "These reminders are based on your profile (province, filer type). Consult a CPA for your specific situation."}
      </p>
    """

    html = _BASE_HTML.format(
        lang=language,
        subject=subject,
        tagline="Votre conseiller d'affaires IA · Canada" if not t else "Your AI Business Advisor · Canada",
        body=body,
        app_url=settings.app_url,
        cta_label="Voir mon tableau de bord →" if not t else "View my dashboard →",
        unsubscribe_label="Gérer les notifications" if not t else "Manage notifications",
    )

    try:
        client = resend.Resend(api_key=settings.resend_api_key)
        client.emails.send({
            "from": settings.from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
        })
        logger.info(f"[email] Deadline reminder sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[email] Failed to send deadline reminder: {e}")
        return False


def send_welcome_email(
    to_email: str,
    business_name: str,
    business_type: str,
    province: str,
    language: str = "fr",
) -> bool:
    if not settings.resend_api_key:
        return False

    t = language == "en"
    subject = (
        f"Bienvenue sur Agent SMB, {business_name} 🎉"
        if not t else
        f"Welcome to Agent SMB, {business_name} 🎉"
    )

    topics_fr = [
        "💰 <strong>Fiscalité</strong> — TPS/TVQ, déductions, crédits d'impôt, ARC",
        "📊 <strong>Trésorerie</strong> — flux de trésorerie, factures, dépenses",
        "🏢 <strong>Gestion d'entreprise</strong> — embauche, fournisseurs, croissance",
    ]
    topics_en = [
        "💰 <strong>Tax & Compliance</strong> — GST/HST, deductions, credits, CRA",
        "📊 <strong>Cash Flow</strong> — invoicing, expenses, financial health",
        "🏢 <strong>Business Operations</strong> — hiring, suppliers, growth",
    ]
    topics = topics_fr if not t else topics_en
    topics_html = "".join(
        f'<li style="padding:6px 0;color:#334155;font-size:14px;">{tp}</li>'
        for tp in topics
    )

    body = f"""
      <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;">
        {"Bienvenue sur Agent SMB ! 🎉" if not t else "Welcome to Agent SMB! 🎉"}
      </h2>
      <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.6;">
        {"Votre profil pour" if not t else "Your profile for"}
        <strong style="color:#0f172a;">{business_name}</strong>
        {"({province}) est maintenant configuré. Voici ce que je peux faire pour vous :"
         if not t else
         "({province}) is set up. Here's what I can help you with:"}
      </p>
      <ul style="padding:0;margin:0 0 20px;list-style:none;">{topics_html}</ul>
      <div style="background:#eef2ff;border-radius:10px;padding:16px;border-left:4px solid #6366f1;">
        <p style="color:#3730a3;font-size:13px;margin:0;font-weight:600;">
          {"💡 Pour commencer, essayez :" if not t else "💡 To get started, try asking:"}
        </p>
        <p style="color:#4338ca;font-size:13px;margin:8px 0 0;font-style:italic;">
          {"« Quelles sont mes prochaines obligations fiscales? »"
           if not t else
           "\"What are my upcoming tax obligations?\""}
        </p>
      </div>
    """

    html = _BASE_HTML.format(
        lang=language,
        subject=subject,
        tagline="Votre conseiller d'affaires IA · Canada" if not t else "Your AI Business Advisor · Canada",
        body=body,
        app_url=settings.app_url,
        cta_label="Commencer une conversation →" if not t else "Start a conversation →",
        unsubscribe_label="Paramètres" if not t else "Settings",
    )

    try:
        client = resend.Resend(api_key=settings.resend_api_key)
        client.emails.send({
            "from": settings.from_email,
            "to": [to_email],
            "subject": subject,
            "html": html,
        })
        logger.info(f"[email] Welcome email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[email] Failed to send welcome email: {e}")
        return False
