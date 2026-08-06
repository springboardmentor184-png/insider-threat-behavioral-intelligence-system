"""
CLI Script to test SMTP configuration and send a test email.
Run with: python -m backend.utils.test_smtp
"""

import asyncio
import sys
from backend.services.email_service import EmailService


async def main():
    print("=" * 60)
    print("ITBIS SMTP CONFIGURATION DIAGNOSTIC")
    print("=" * 60)

    result = await EmailService.verify_smtp_connection()
    print(f"Status  : {result.get('status', 'unknown').upper()}")
    print(f"Message : {result.get('message')}")
    if "config" in result:
        print("Config  :")
        for k, v in result["config"].items():
            print(f"  - {k}: {v if v else '(empty)'}")
    print("=" * 60)

    if result.get("status") == "success":
        target = input("Enter email address to send a test email (or press Enter to skip): ").strip()
        if target:
            print(f"Sending test email to {target}...")
            sent = await EmailService.send_email(
                recipient_emails=[target],
                subject="[ITBIS SMTP TEST] Verification Email",
                body_text="Congratulations! Your SMTP settings are correctly configured for ITBIS automated threat notifications."
            )
            if sent:
                print("[SUCCESS] Test email dispatched successfully!")
            else:
                print("[FAILED] Failed to send test email. Check SMTP server response.")


if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
