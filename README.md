# LaunchDarkly + Contentful App

This project integrates [LaunchDarkly](https://launchdarkly.com/) feature flags with [Contentful](https://www.contentful.com/) content management, enabling experimentation and flag-driven content variations directly in Contentful.

---

## Prerequisites
- **Contentful account** with admin access to a space
- **LaunchDarkly account** with access to API keys and projects
- **Node.js** (v16+ recommended)
- (Optional) [Contentful CLI](https://www.contentful.com/developers/docs/cli/)

---

## 1. Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd launchdarkly-contentful-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will run locally (default: http://localhost:3000).

---

## 2. Installing the App in Contentful

1. Go to **Contentful App Marketplace** and select "Add app" (or use the Contentful CLI for local development).
2. For local testing, use the **development URL** (e.g., `http://localhost:3000`) as the app's location.
3. Install the app into your target Contentful space.
4. **Permissions:** Ensure the app has access to the content types and entries you want to test with.

---

## 3. App Configuration (in Contentful)

1. Open the app's **Config screen** in Contentful.
2. Enter your **LaunchDarkly API key** (must have project/environment read access).
3. Select your **LaunchDarkly project** and **environment**.
4. Save the configuration.

---

## 4. Content Model Setup for QA

To test flag-driven content:
1. Go to **Content Model** in your Contentful space.
2. For each content type you want to use with LaunchDarkly:
   - Click **Appearance** in the sidebar.
   - Under **Entry Editor**, click **Add app**.
   - Select **LaunchDarkly + Contentful** app.
   - Save changes.

---

## 5. QA & Debugging Guide

- **Testing Flags:**
  - Open an entry of a configured content type.
  - You should see LaunchDarkly flag controls and variation mapping UI.
  - Toggle flags, assign content to variations, and verify the UI updates.

- **Debugging:**
  - **Console logs:** Open browser dev tools for detailed logs (especially in `src/app/page.tsx`, `ConfigScreen`, and hooks).
  - **Error notifications:** Errors are shown in-app and logged to the console.
  - **API issues:** Ensure your LaunchDarkly API key is valid and has correct permissions.
  - **Contentful permissions:** The app needs access to read/write entries and content models.
  - **Network:** If running locally, ensure your dev server is accessible from Contentful (use [ngrok](https://ngrok.com/) if needed).

- **Common Issues:**
  - Missing or invalid API key: Check the Config screen and browser console.
  - No flags/projects/environments: Verify your LaunchDarkly account and API key.
  - UI not appearing: Ensure the app is added to the Entry Editor location for your content type.

---

## 6. OpenAI-Powered Features (Optional)

- Some features (e.g., experiment suggestions) use OpenAI APIs.
- The OpenAI API key is currently hardcoded for demo/testing. For production, update the API key handling for security.
- If you see errors related to OpenAI, these features are not required for core flag/content functionality.

---

## 7. Deployment Notes

- For QA in a shared environment, deploy the app (e.g., Vercel, Netlify) and use the deployed URL in Contentful app settings.
- Ensure environment variables and API keys are managed securely in production.

---

## 8. Useful Scripts

- `npm run dev` — Start local dev server
- `npm run build` — Build for production
- `npm run start` — Start production server

---

## 9. Resources
- [Forma 36](https://f36.contentful.com/) — Contentful's design system
- [Contentful Field Editors](https://www.contentful.com/developers/docs/extensibility/field-editors/)
- [React Apps Toolkit](https://www.contentful.com/developers/docs/extensibility/app-framework/react-apps-toolkit/)
- [Contentful App Framework Docs](https://www.contentful.com/developers/docs/extensibility/app-framework/)
- [LaunchDarkly API Docs](https://apidocs.launchdarkly.com/)

---

## 10. Troubleshooting & Support
- Check browser console for errors.
- Review Contentful and LaunchDarkly API permissions.
- For persistent issues, contact the project maintainer or open an issue.
