# Capacitor - Mobile App Development

<p align=center>
<a href="https://www.apple.com/at/os/ios/"><img src="../docs/pictures/iOS.png" width=150 height=150></a>
<a href="https://capacitorjs.com"><img src="../docs/pictures/Capacitor.jpeg" width=150 height=150></a>
<a href="https://www.android.com/intl/de_de/"><img src="../docs/pictures/android.png" width=150 height=150></a>
</p>

## Offical Docs

Visit [https://capacitorjs.com](https://capacitorjs.com) for offical Documentation

## Set Up

Go to the frontend folder

```sh
npm i
```

to install all packages

```sh
npm run build
```

to build the **dist** file (that is the build file in react using vite)

```sh
npx cap sync [optionaly: platform: android or ios]
```

to sync the changes to the app project

now you can either

- open the editor (**Android Studio** or **xcode**)

OR

- run the command

```sh
npx cap open [platform: android or ios]
```

now the editor will open and you can run the project

## Changes

You should not change the app in the Editor of the Mobile App (so **Android Studio** or **Xcode**)

If you make changes you should make them in the root files (frontend or backend)

Do not change the android or the ios folder on your own, only by using the capacitor commands/cli

### Live Refresh

To use Live Reload, your device must be on the same Wi-Fi network as your development computer

To find local IP adress:

```sh
ipconfig
```

(diffrent on linux)

look for this section

```sh
Drahtlos-LAN-Adapter WLAN:

   Verbindungsspezifisches DNS-Suffix: lan
   Verbindungslokale IPv6-Adresse  . : fe80::8763:e704:1516:5f41%17
   IPv4-Adresse  . . . . . . . . . . : 192.168.96.171
   Subnetzmaske  . . . . . . . . . . : 255.255.240.0
   Standardgateway . . . . . . . . . : 192.168.96.1
```

and take the IPv4-Adresse `IPv4-Adresse  . . . . . . . . . . : 192.168.96.171` (so the `192.168.96.171`)
and in the `capacitor.config.ts` modify your file like this

```ts
server:
      {
        url: "http://91.113.50.78:5173",
        cleartext: true,
      }

```

now you can use the server on your phone and have live refresh (so when changing UI, you see the changes live)

> There are some changes you will not see on the live refresh, like .env file changes or chores changes (new packages, libaries, etc.), the main use of the live refresh is to see UI Changes and JS Functionality on your phone

#### Update

You can now use Environmental Variables to use live refresh, just set a `MOBILE_REFRESH` Variable to the string _true_ and a `LOCAL_URL` with the url.

The Variables can look like this:

```env

MOBILE_REFRESH="true"
LOCAL_URL="http://192.168.0.167:5173"

```

instead of the `192.168.0.16` i used, use your ip!

In the **capacitor.config.ts**

```ts

  server:
    process.env.MOBILE_REFRESH === "true"
      ? {
          url: process.env.LOCAL_URL || "http://192.168.0.167:5173",
          cleartext: true,
        }
      : undefined,
```

> You can still just hardcode how you want it to, but using this no one has to edit the capacitor config file just his own **.env** file

### Debugging

### Android

1. Connect phone via USB
2. Enable USB-Debugging on your phone (see Google)
3. Run the App on your Physical Device (most recommanded)
4. Open Chrome: `chrome://inspect`
5. Select your device and click "inspect" (this might take a while)

Now you can see your app in the **Dev-Tools** like a web app. You can access things like the **console**, **cookies**, **network** tab, etc. Some things won't work or won't be displayed because the mobile device handles them differently than a browser (e.g. local storage), but it's **perfect** for **logging** in the **console**.

### iOS

Use Safari Developer Tools

## Command Shortcuts

These Shortcuts declared in the `package.json` help you run,open and debug your capacitor app faster, by typing one command instead of three in the cli.
Just type `npm run [command]` (for example: `npm run android` to run app on android (choosing device in cli))

### The Commands

```json
"cap:dev": "npm run build && npx cap sync && npx cap run android",
"android": "npm run build && npx cap sync && npx cap run android",
"cap:dev:android": "npm run build && npx cap sync && npx cap run android",
"cap:dev:ios": "npm run build && npx cap sync && npx cap run ios",
"ios": "npm run build && npx cap sync && npx cap run ios",
"android:open": "npm run build && npx cap sync && npx cap open android",
"ios:open": "npm run build && npx cap sync && npx cap open ios"
```

### Overview

#### Run Android App

If you want to run your app on **android** without opening **android studio** and **choosing devices via the cli** (with arrow keys), use these commands

```bash
npm run android

# or

npm run cap:dev

# or

npm run cap:dev:android

```

```json
"cap:dev": "npm run build && npx cap sync && npx cap run android",
"android": "npm run build && npx cap sync && npx cap run android",
"cap:dev:android": "npm run build && npx cap sync && npx cap run android",
```

#### Run iOS App

If you want to run your app on **iOS** without opening **XCode** and **choosing devices via the cli** (with arrow keys), use these commands

```bash
npm run ios

# or

npm run cap:dev:ios

```

```json
"cap:dev:ios": "npm run build && npx cap sync && npx cap run ios",
"ios": "npm run build && npx cap sync && npx cap run ios",
```

#### Open App in Editor

If you want to open your App in the Editor of the OS you want to test, here are the commands

```bash
npm run android:open # for android

# or

npm run ios:open # for ios
```

```json
"android:open": "npm run build && npx cap sync && npx cap open android",
"ios:open": "npm run build && npx cap sync && npx cap open ios"
```
