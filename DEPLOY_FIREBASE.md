# WaveOn deployment (Firebase Hosting + Cloud Run)

This repo contains:

* Vite/React frontend in [`frontend/`](frontend/package.json:1)
* Spring Boot backend in [`backend/`](backend/build.gradle:1)
* PostgreSQL DB (currently via Docker Compose locally) in [`docker-compose.yaml`](docker-compose.yaml:1)

Firebase can host the **frontend** (Firebase Hosting). For the **backend** you should use **Cloud Run** (Google Cloud). For PostgreSQL, the Firebase-compatible choice is **Cloud SQL for PostgreSQL**.

## 0) Prerequisites

Install CLIs:

* Firebase CLI
  * `npm i -g firebase-tools`
* Google Cloud SDK (`gcloud`)

Login:

* `firebase login`
* `gcloud auth login`

### Windows note: `bash: firebase: command not found`

If you run commands from **Git Bash** (or another bash on Windows), global npm binaries may not be on your `PATH`.

Firebase CLI is installed under the npm prefix (usually):

* `C:\Users\<you>\AppData\Roaming\npm\firebase`

Fix options:

1) **Use Windows CMD/PowerShell** for Firebase commands (recommended for Windows):

* `firebase --version`

2) **Git Bash:** add npm global bin folder to PATH:

```bash
export PATH="$PATH:/c/Users/razva/AppData/Roaming/npm"
firebase --version
```

3) **Use `npx`** (works even when global PATH is messy):

```bash
npx firebase-tools --version
npx firebase-tools init hosting
```

## 1) Deploy the backend to Cloud Run

### 1.1 Create a Cloud SQL (PostgreSQL) instance

In Google Cloud Console:

1. Create **Cloud SQL → PostgreSQL** instance.
2. Create database: `waveondb`
3. Create user/password.

Get your **Instance connection name** (looks like `project:region:instance`).

### 1.2 Configure backend env vars

Backend reads DB config from env vars via [`backend/src/main/resources/application.yaml`](backend/src/main/resources/application.yaml:1):

* `DATABASE_URL`
* `DATABASE_USERNAME`
* `DATABASE_PASSWORD`

Also set:

* `JWT_SECRET` (min 32 chars) via [`backend/src/main/java/backend/service/JwtService.java`](backend/src/main/java/backend/service/JwtService.java:1)
* `CORS_ALLOWED_ORIGINS` (comma-separated) via [`backend/src/main/java/backend/service/SecurityConfig.java`](backend/src/main/java/backend/service/SecurityConfig.java:1)

### 1.3 Build & deploy to Cloud Run (from repo root)

1) Set your project:

```bat
gcloud config set project YOUR_GCP_PROJECT_ID
```

2) Build and push the container:

```bat
cd backend && gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/waveon-backend
```

3) Deploy:

```bat
gcloud run deploy waveon-backend ^
  --image gcr.io/YOUR_GCP_PROJECT_ID/waveon-backend ^
  --region europe-west1 ^
  --platform managed ^
  --allow-unauthenticated ^
  --set-env-vars PORT=8080,JWT_SECRET=YOUR_32+_CHAR_SECRET,CORS_ALLOWED_ORIGINS=https://YOUR_FIREBASE_PROJECT.web.app,https://YOUR_FIREBASE_PROJECT.firebaseapp.com ^
  --set-env-vars DATABASE_URL="jdbc:postgresql:///waveondb?cloudSqlInstance=YOUR_INSTANCE_CONNECTION_NAME&socketFactory=com.google.cloud.sql.postgres.SocketFactory" ^
  --set-env-vars DATABASE_USERNAME=YOUR_DB_USER,DATABASE_PASSWORD=YOUR_DB_PASSWORD ^
  --add-cloudsql-instances YOUR_INSTANCE_CONNECTION_NAME
```

Notes:

* The backend serves routes under `/api` (see [`server.servlet.context-path`](backend/src/main/resources/application.yaml:34)).
* Cloud Run injects `PORT` (now supported by [`application.yaml`](backend/src/main/resources/application.yaml:34)).

### 1.4 Important limitation: uploads/audio storage

Your app uploads audio/images via multipart. On Cloud Run the container filesystem is **ephemeral**.

If your backend currently saves uploaded files to disk, they can disappear after a scale-to-zero / restart.

Recommended production approach:

* Store uploaded files in **Google Cloud Storage**
* Store only the public URL (or signed URL) in PostgreSQL

## 2) Deploy the frontend to Firebase Hosting

### 2.1 Configure the API base URL

Frontend calls the backend using [`frontend/src/config/api.ts`](frontend/src/config/api.ts:1).

Create a production env file:

* Copy [`frontend/.env.production.example`](frontend/.env.production.example:1) → [`frontend/.env.production`](frontend/.env.production:1)
* Set `VITE_API_BASE_URL` to your Cloud Run URL + `/api`.
  Example:
  `VITE_API_BASE_URL=https://waveon-backend-xxxxx-uc.a.run.app/api`

### 2.2 Build

From repo root:

```bat
cd frontend
npm install
npm run build
```

The build output goes to `frontend/dist`, and Firebase Hosting is configured to serve it via [`firebase.json`](firebase.json:1).

### 2.3 Firebase init + deploy

From repo root:

```bat
firebase init hosting
firebase deploy --only hosting
```

When asked for the public directory, use `frontend/dist` (matches [`firebase.json`](firebase.json:1)).
Also enable “single-page app rewrite” (already configured, but keep consistent).

## 3) Windows npm “Access is denied” (esbuild/rollup/lightningcss)

On Windows, native Node modules can get locked by antivirus/Defender or by a running Node process.

Try these in order:

1. Close any running dev servers / Vite / node processes.
2. Add an antivirus exclusion for `c:\Users\razva\Desktop\ProiectColectiv\Waveon\frontend\node_modules`.
3. Reboot (clears file locks), then run:

```bat
cd frontend
rmdir /s /q node_modules
npm cache clean --force
npm install
```

4. If the repo is in a “protected” location (Desktop/OneDrive), move it to something like `C:\dev\Waveon`.

