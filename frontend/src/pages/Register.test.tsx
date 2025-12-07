import { screen, waitFor } from "@testing-library/react";
import Register from "./Register";
import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderWithRouter } from "../utils/test/renderWithRouter";
import userEvent from "@testing-library/user-event";
import Login from "./Login";
import { expectValidationMessage, fillField, type InfoField } from "../utils/test/input";
import { validationMessages } from "../content/auth/validationMessages";

describe("Register Page", () => {
  let name: HTMLElement;
  let sirName: HTMLElement;
  let email: HTMLElement;
  let telefon: HTMLElement;
  let fn: HTMLElement;
  let atu: HTMLElement;
  let password: HTMLElement;
  let confirmPassword: HTMLElement;
  let registerButton: HTMLElement;

  let info: InfoField[] = [];
  let auth: InfoField[] = [];

  /**
   * Helper function to assert validation messages.
   * It uses includes() to avoid strict text matching issues.
   */

  beforeEach(() => {
    renderWithRouter(<Register />, "/register", [
      { path: "/login", element: <Login /> },
    ]);

    // Get all input elements
    name = screen.getByTestId(/vorname/i);
    sirName = screen.getByTestId(/nachname/i);
    email = screen.getByTestId(/email/i);
    telefon = screen.getByTestId(/telefonnummer/i);
    fn = screen.getByTestId(/FirmenBuchNummer/i);
    atu = screen.getByTestId(/atu/i);

    password = screen.getByTestId("password");
    confirmPassword = screen.getByTestId("confirmPassword");

    registerButton = screen.getByTestId("register");

    const err = validationMessages.register;

    // Info fields for testing invalid and valid inputs
    info = [
      { field: name, value: "Thomas", wrongValue: "", validationMessage: err.vorname.required },
      { field: sirName, value: "Laimer", wrongValue: "", validationMessage: err.nachname.required },
      { field: email, value: "Laimer@gmail.com", wrongValue: "Laimer@", validationMessage: err.email.invalid },
      { field: telefon, value: "+43 222 45452", wrongValue: "452", validationMessage: err.phone.invalid },
      { field: fn, value: "FN123456a", wrongValue: "F6a", validationMessage: err.fn.invalid },
      { field: atu, value: "ATU123334455", wrongValue: "A55", validationMessage: err.atu.invalid },
    ];

    auth = [
      {
        field: password,
        value: "Laimer+123",
        wrongValue: "123s",
        validationMessage: err.password.tooShort,
      },
      {
        field: confirmPassword,
        value: "Laimer+123",
        wrongValue: "13s",
        validationMessage: err.confirmPassword.invalid,
      },
    ];
  });

  // -----------------------------
  // Test 1: Enable register button with valid data
  // -----------------------------
  it("enables register button when valid data is entered", async () => {
    expect(registerButton).toBeDisabled();

    for (let i = 0; i < info.length; i++) {
      await fillField(info[i].field, info[i].value);
      await userEvent.tab(); // trigger validation
    }

    for (let i = 0; i < auth.length; i++) {
      await fillField(auth[i].field, auth[i].value);
      await userEvent.tab(); // trigger validation
    }

    await waitFor(() => {
      expect(registerButton).toBeEnabled();
    });
  });

  // -----------------------------
  // Test 2: Keep register button disabled with invalid data
  // -----------------------------
  it("keeps register button disabled when invalid data is entered", async () => {
    expect(registerButton).toBeDisabled();

    for (let i = 0; i < info.length; i++) {
      await fillField(info[i].field, info[i].wrongValue);
      await userEvent.tab();
      await expectValidationMessage(info[i].validationMessage as string);
    }

    // Password field invalid
    await fillField(password, "123s");
    await userEvent.tab();
    await expectValidationMessage(validationMessages.register.password.tooShort);

    // Confirm password mismatch
    await fillField(confirmPassword, "13s");
    await userEvent.tab();
    await expectValidationMessage(validationMessages.register.confirmPassword.invalid);

    await waitFor(() => {
      expect(registerButton).toBeDisabled();
    });
  });

  // -----------------------------
  // Test 3: Password missing number
  // -----------------------------
  it("shows password error: missing number", async () => {
    await fillField(password, "Laimer+"); // contains symbol but no number
    await userEvent.tab();

    await expectValidationMessage(validationMessages.register.password.missingNumber);
  });

  // -----------------------------
  // Test 4: Password missing symbol
  // -----------------------------
  it("shows password error: missing symbol", async () => {
    await fillField(password, "Laimer123"); // contains number but no symbol
    await userEvent.tab();

    await expectValidationMessage(validationMessages.register.password.missingSymbol);
  });

  // -----------------------------
  // Test 5: Password mismatch
  // -----------------------------
  it("shows password mismatch error", async () => {
    await fillField(password, "Laimer+123");
    await userEvent.tab();
    await fillField(confirmPassword, "Laimer+1234");
    await userEvent.tab();

    await expectValidationMessage(validationMessages.register.confirmPassword.invalid);
  });

  // -----------------------------
  // Test 6: Navigation to login page
  // -----------------------------
  it("navigates to login page when clicking login link", async () => {
    await userEvent.click(screen.getByTestId("loginLink"));

    await waitFor(() => {
      expect(screen.queryByTestId("register")).not.toBeInTheDocument();
      expect(screen.queryByTestId("login")).toBeInTheDocument();
    });
  });
});
