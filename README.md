# LaunchDarkly + Contentful App

This project integrates [LaunchDarkly](https://launchdarkly.com/) feature flags with [Contentful](https://www.contentful.com/) content management, enabling experimentation and flag-driven content variations directly in Contentful.

---

## Prerequisites

- **Contentful account** with admin access to a space ([Sign up or log in](https://app.contentful.com/login))
- **LaunchDarkly account** with access to API keys and projects ([Sign up or log in](https://app.launchdarkly.com/login))
- **Node.js** (v16+ recommended) ([Download Node.js](https://nodejs.org/))
- (Optional) [Contentful CLI](https://www.contentful.com/developers/docs/cli/)
- (Optional) [ngrok](https://ngrok.com/) or similar tunneling tool for local development

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

   > **Tip:** If you need to expose your local server to Contentful (for example, if Contentful cannot reach `localhost`), use [ngrok](https://ngrok.com/):
   >
   > ```bash
   > ngrok http 3000
   > ```
   >
   > Use the generated ngrok URL as your app's URL in Contentful.

---

## 2. Installing the App in Contentful

1. **Go to the [Contentful App Marketplace](https://app.contentful.com/spaces/<your-space-id>/apps/marketplace) and select "Add app".**
   - Replace `<your-space-id>` with your actual Contentful space ID.
   - [Official guide: Installing apps](https://www.contentful.com/developers/docs/extensibility/app-framework/)

2. **For local testing:**
   - Use your local dev URL (e.g., `http://localhost:3000` or your ngrok URL) as the app's location.
   - You can also use the [Contentful CLI](https://www.contentful.com/developers/docs/cli/) to install the app for local development.

3. **Install the app** into your target Contentful space.
   - [How to install a custom app](https://www.contentful.com/developers/docs/extensibility/app-framework/install-custom-app/)

4. **Permissions:**
   - Ensure the app has access to the content types and entries you want to test with.
   - The app will need permissions to read and write entries, and to update content model settings.
   - [Contentful roles and permissions](https://www.contentful.com/developers/docs/concepts/roles-and-permissions/)

---

## 3. App Configuration (in Contentful)

1. **Open the app's Config screen** in Contentful (usually found in the sidebar under "Apps").
   - [Navigating to installed apps](https://www.contentful.com/developers/docs/extensibility/app-framework/)

2. **Enter your LaunchDarkly API key:**
   - This should be a **server-side SDK key** or a **personal access token** with at least read access to the relevant project and environment.
   - You can find or create API keys in your LaunchDarkly dashboard under [Account settings > API access](https://app.launchdarkly.com/settings#/access-tokens).
   - [LaunchDarkly API access documentation](https://docs.launchdarkly.com/home/account-security/api-access-tokens)

3. **Select your LaunchDarkly project and environment:**
   - The app will fetch available projects and environments using your API key.
   - Choose the project and environment you want to use for flag management.
   - [Managing projects and environments in LaunchDarkly](https://docs.launchdarkly.com/home/projects)

4. **Save the configuration.**

   > **Note:** The app stores these settings in Contentful and uses them for all flag-related operations.

---

## 4. Content Model Setup for QA

To test flag-driven content, you must add the app to the Entry Editor location for your content types:

1. **Go to [Content Model](https://app.contentful.com/spaces/<your-space-id>/content_model) in your Contentful space.**
   - Replace `<your-space-id>` with your actual Contentful space ID.
   - [Contentful content model documentation](https://www.contentful.com/developers/docs/concepts/data-model/)

2. For each content type you want to use with LaunchDarkly:
   - Click the content type to edit it.
   - In the sidebar, click **Appearance** ([docs](https://www.contentful.com/developers/docs/extensibility/app-framework/locations/#entry-editor)).
   - Under **Entry Editor**, click **Add app**.
   - Select **LaunchDarkly + Contentful** app from the list.
   - Click **Save** to apply the changes.

   > **Tip:** You can add the app to multiple content types if you want to test flagging across different models.

---

## 5. QA & Debugging Guide

### Testing Flags

- Open an entry of a configured content type in Contentful ([Entries view](https://app.contentful.com/spaces/<your-space-id>/entries)).
- You should see LaunchDarkly flag controls and variation mapping UI embedded in the entry editor.
- Try the following:
  - Toggle feature flags on/off and observe how the UI updates.
  - Assign different content or fields to each flag variation.
  - Save the entry and verify that the flag/content mapping persists.

### Debugging

- **Console logs:**
  - Open browser dev tools for detailed logs.
  - Key files with logs: `src/app/page.tsx`, `ConfigScreen`, and custom React hooks.
  - [How to open browser dev tools (Chrome)](https://developer.chrome.com/docs/devtools/open/)

- **Error notifications:**
  - Errors are shown in-app (via Contentful's notification system) and logged to the browser console.

- **API issues:**
  - If you see errors about missing or invalid API keys, double-check your LaunchDarkly API key in the Config screen.
  - Ensure your API key has access to the selected project and environment.
  - [LaunchDarkly API troubleshooting](https://docs.launchdarkly.com/home/account-security/api-access-tokens#troubleshooting)

- **Contentful permissions:**
  - The app needs access to read/write entries and update content models.
  - If you see permission errors, check your Contentful user role and app installation permissions.
  - [Contentful roles and permissions](https://www.contentful.com/developers/docs/concepts/roles-and-permissions/)

- **Network issues:**
  - If running locally, ensure your dev server is accessible from Contentful (use [ngrok](https://ngrok.com/) if needed).
  - If Contentful cannot reach your app, you may see blank screens or connection errors.
  - [Contentful app hosting requirements](https://www.contentful.com/developers/docs/extensibility/app-framework/hosting/)

### Common Issues & Solutions

- **Missing or invalid API key:**
  - Check the Config screen and browser console for error messages.
  - Make sure you are using a valid LaunchDarkly API key ([API key docs](https://docs.launchdarkly.com/home/account-security/api-access-tokens)).

- **No flags, projects, or environments showing up:**
  - Verify your LaunchDarkly account and API key permissions.
  - Make sure the selected project/environment actually exists in LaunchDarkly ([Projects & environments](https://docs.launchdarkly.com/home/projects)).

- **UI not appearing in Entry Editor:**
  - Ensure the app is added to the Entry Editor location for your content type (see section 4).
  - Refresh the Contentful web app after making changes ([Contentful web app](https://app.contentful.com/)).

- **App not loading or blank screen:**
  - Check the browser console for errors.
  - Make sure your local server is running and accessible.
  - If using ngrok, verify the tunnel is active and the URL is correct in Contentful ([ngrok dashboard](https://dashboard.ngrok.com/)).

---

## 6. OpenAI-Powered Features (Optional)

- Some features (such as experiment suggestions) use OpenAI APIs to provide recommendations.
- The OpenAI API key is currently hardcoded for demo/testing purposes. **Do not use this in production.**
- For production, update the API key handling to use environment variables or Contentful app parameters for security ([OpenAI API docs](https://platform.openai.com/docs/api-reference)).
- If you see errors related to OpenAI, these features are not required for core flag/content functionality and can be ignored for QA.

---

## 7. Deployment Notes

- For QA in a shared environment, deploy the app to a public host (e.g., [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), AWS, etc.).
- Use the deployed URL as the app's location in Contentful app settings ([Contentful app settings](https://app.contentful.com/spaces/<your-space-id>/apps)).
- Make sure to manage environment variables and API keys securely in production deployments ([12-factor app config](https://12factor.net/config)).
- After deployment, repeat the app installation and configuration steps in your production Contentful space.

---

## 8. Useful Scripts

- `npm run dev` — Start local dev server (hot reload enabled)
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint on the codebase ([ESLint docs](https://eslint.org/docs/latest/))

---

## 9. Resources

- [Forma 36](https://f36.contentful.com/) — Contentful's design system
- [Contentful Field Editors](https://www.contentful.com/developers/docs/extensibility/field-editors/)
- [React Apps Toolkit](https://www.contentful.com/developers/docs/extensibility/app-framework/react-apps-toolkit/)
- [Contentful App Framework Docs](https://www.contentful.com/developers/docs/extensibility/app-framework/)
- [Contentful content model docs](https://www.contentful.com/developers/docs/concepts/data-model/)
- [LaunchDarkly API Docs](https://apidocs.launchdarkly.com/)
- [LaunchDarkly projects & environments](https://docs.launchdarkly.com/home/projects)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

## 10. Troubleshooting & Support

- **Check browser console for errors.** ([How to open dev tools](https://developer.chrome.com/docs/devtools/open/))
- **Review Contentful and LaunchDarkly API permissions.** ([Contentful roles & permissions](https://www.contentful.com/developers/docs/concepts/roles-and-permissions/), [LaunchDarkly API tokens](https://docs.launchdarkly.com/home/account-security/api-access-tokens))
- **For persistent issues:**
  - Contact the project maintainer
  - Open an issue in the repository
  - Reference [Contentful documentation](https://www.contentful.com/developers/docs/) and [LaunchDarkly documentation](https://docs.launchdarkly.com/) for advanced troubleshooting

---

