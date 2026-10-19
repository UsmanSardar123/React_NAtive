Profile

Name: Usman Ayaz
Role: Software Engineering Intern
Focus: React Native / JavaScript

UI Goal

The goal of this project is to build a simple, clean, and user-friendly React Native interface. The UI will focus on reusable components, a clear layout, and a straightforward user experience.

## Running the app

From the repository root, start the Express API in the first terminal (it reads `MONGODB_URI` from `backend/.env`):

```powershell
cd backend
npm start
```

In a second terminal opened at the repository root, start Expo and open the Android emulator:

```powershell
npx expo start
```

Press `a` in the Expo terminal to open the Android emulator. This project is pinned to Expo SDK 57 with React Native 0.86.3. Expo Go must use SDK 57 too. If the emulator has a different Expo Go SDK, Expo CLI prompts to install the matching Android build.

To download the matching Expo Go APK for Android, run this from the repository root:

```powershell
npx expo-go download android 57
```

Install the downloaded APK on the emulator (for example, with `adb install -r .\path\to\downloaded.apk` after checking the downloaded filename), then restart the project with `npx expo start -c`. Keep the Expo SDK 57 package versions aligned unless intentionally upgrading the project SDK. Expo Go is maintained separately from this repository, so no project setting can force the emulator's installed Expo Go version to stay matched forever; installing a compatible APK or using a project development build is required when the installed app changes.

The posts API is `/api/posts` on port `5000`. On Android, the app uses the active Metro host when available (Expo Go exposes it through the development bundle URL), which works for this emulator; it falls back to `http://10.0.2.2:5000` for a native emulator build. Other platforms use `http://localhost:5000`.
