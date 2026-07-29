"""Firebase Setup Helper for PlaceX
Run this script AFTER creating your Firebase project.

Steps:
1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Enable Authentication → Sign-in method → Email/Password
4. Go to Project Settings → Service Accounts → Generate new private key
5. Save the JSON file as 'firebase-credentials.json' in the backend/ folder

For the frontend:
6. Go to Project Settings → General → Your apps → Add app → Web
7. Copy the config values and update frontend/.env
"""

import json
import os

CREDENTIALS_PATH = "firebase-credentials.json"
ENV_FRONTEND_PATH = os.path.join("..", "frontend", ".env")


def check_credentials():
    if os.path.exists(CREDENTIALS_PATH):
        print(f"[OK] Firebase credentials found at {CREDENTIALS_PATH}")
        with open(CREDENTIALS_PATH) as f:
            data = json.load(f)
            print(f"      Project ID: {data.get('project_id', 'N/A')}")
            print(f"      Client Email: {data.get('client_email', 'N/A')}")
        return True
    else:
        print(f"[!] Firebase credentials NOT found at {CREDENTIALS_PATH}")
        print("    Steps to create:")
        print("    1. Go to https://console.firebase.google.com")
        print("    2. Project Settings → Service Accounts")
        print("    3. 'Generate new private key' button")
        print("    4. Save as 'firebase-credentials.json' in backend/")
        return False


def guide_frontend():
    print("\n--- Frontend Firebase Setup ---")
    print("To enable Firebase Auth in the frontend, update frontend/.env:")
    print("""
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
    VITE_FIREBASE_MSG_SENDER_ID=123456789
    VITE_FIREBASE_APP_ID=1:123456789:web:abc123
    """)
    print("  Get these values from:")
    print("  Firebase Console → Project Settings → General → Your apps → Web app")


def guide_admin_user():
    print("\n--- Creating Admin User ---")
    print("After Firebase is set up, create an admin in Firebase Auth:")
    print("  1. Firebase Console → Authentication → Users → Add User")
    print("  2. Email: admin@placex.com, Password: any password")
    print("  3. Then register in PlaceX at /register")
    print("\n  Or use the seed data admin (works with dev mode):")
    print("  Email: admin@placex.com (already in database)")


if __name__ == "__main__":
    print("=" * 50)
    print("   PlaceX Firebase Setup Helper")
    print("=" * 50)
    print()
    check_credentials()
    guide_frontend()
    guide_admin_user()
    print()
    print("NOTE: PlaceX runs in DEV MODE without Firebase.")
    print("Auth uses local tokens. Firebase is optional for development.")
    print("Add Firebase credentials when ready for production/deployment.")
