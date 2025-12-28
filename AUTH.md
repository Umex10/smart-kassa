# Authentication System

## Overview

- JWT-based authentication
- short lived (15min) access token saved in either
  - local storage on Web
  - UserDefaults on iOS
  - SharedPreferences on Android
- long lived (30d) refresh token stored in httpOnly cookie

## Payload

Every token has a payload, which contains information/statements about the entity (typically the user)

### Refresh Token

The payload of the refresh token contains the `user.id`, that's it

### Access Token

The payload of the access token contains more information than that of the refresh token, such as:

- `user.id`
- `email`
- `name` (firstname + ' ' + lastname)

This is because the access token is being sent more often and may need additional information, where as the refresh token is only used to get a new access token

## Token Flow

User **creates a account** or **log's in** to his existing account **⟶** both tokens are being sent from the server and stored on the client side.

The server send's the **access token** via **response body** and the **refresh token** via **httpOnly cookie**. 

The user want's to do a action that requires the client to send a api request **⟶** in the request the access token is provided in the **HTTP Authorization header** as a **Bearer credential**. Then the access token is being verified on the Server and if valid (and the function used is also successfull) returns a 200 status code and the Client runs whatever functionality the User wanted (log out, delete account, etc.)

If the **access token is expired** **⟶** the Client tries to **refresh** it **via** the **refresh token**. A seperate API End Point is being used for this to send the refresh token via a httpOnly cookie, then on the server, the refresh token in being verified and if valid, a **new access token** is being sent to the Client via response body.

If unvalid **⟶** the User is pleased to log out and log in again or restart the Application because the refresh token expired and should be renewed.

![Token Flow](./docs/diagramms/AUTH%20-%20System%20_%20Smart%20Kassa-2025-12-28-212545.png)

### Accessing the App when already loged in

If the **User** is **already loged** in and tries to go to the home page (or every other page that need's the user to be loged in) and the **refresh token** is **not expired** (the user is not loged in longer than 30 days) than a request to the refresh api end point is being sent and the access token is sent to the Client via **response body**

Then the access token is being used to sent a request to the **verify** endpoint to verify the access token and if valid, the user is redirected to the home page.

If either one of the token's is invalid (rather the refresh token), than the user is being sent to the register page to either log in again or create a account.

![Auth System when accessing App when already loged in](./docs/diagramms/AUTH%20-%20System%20_%20Smart%20Kassa-2025-12-28-212203.svg)


