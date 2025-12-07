import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { renderWithRouter } from "../utils/test/renderWithRouter";
import userEvent from "@testing-library/user-event";
import Register from "./Register";
import Login from "./Login";
import { fillField, type InfoField, expectValidationMessage } from "../utils/test/input";
import { validationMessages } from "../content/auth/validationMessages";

describe("Login Page", () => {
  let email: HTMLElement;
  let password: HTMLElement;
  let loginButton: HTMLElement;
  let inputs: InfoField[] = [];

  beforeEach(() => {
    renderWithRouter(<Login />, "/login", [
      { path: "/register", element: <Register /> },
    ]);

    email = screen.getByTestId(/email/i);
    password = screen.getByTestId("password");
    loginButton = screen.getByTestId("login");

    inputs = [
      {
        field: email,
        value: "Laimer@gmail.com",
        wrongValue: "Laimer@",
        validationMessage: validationMessages.login.email.invalid,
      },
      {
        field: password,
        value: "Laimer+123",
        wrongValue: "123s",
        validationMessage: validationMessages.login.password.invalidFormat,
      },
    ];
  });

  // -----------------------------
  // Test 1: Enable login button when correct data is entered
  // -----------------------------
  it("enables login button when valid data is entered", async () => {
    expect(loginButton).toBeDisabled();

    for (let i = 0; i < inputs.length; i++) {
      await fillField(inputs[i].field, inputs[i].value);
      await userEvent.tab(); // trigger blur/validation

      if (i < inputs.length - 1) {
        expect(loginButton).toBeDisabled();
      }
    }

    await waitFor(() => {
      expect(loginButton).toBeEnabled();
    });
  });

  // -----------------------------
  // Test 2: Keep login button disabled with invalid data and show validation messages
  // -----------------------------
  it("keeps login button disabled when invalid data is entered", async () => {
    expect(loginButton).toBeDisabled();

    for (let i = 0; i < inputs.length; i++) {
      await fillField(inputs[i].field, inputs[i].wrongValue);
      await userEvent.tab();

      // Check validation message
      expectValidationMessage(inputs[i].validationMessage as string);

      if (i < inputs.length - 1) {
        expect(loginButton).toBeDisabled();
      }
    }

    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });
  });

  // -----------------------------
  // Test 3: Navigation to Register Page
  // -----------------------------
  it("navigates to register page when clicking 'Switch to Register' link", async () => {
    await userEvent.click(screen.getByTestId("registerLink"));

    await waitFor(() => {
      expect(screen.queryByTestId("login")).not.toBeInTheDocument();
      expect(screen.queryByTestId("register")).toBeInTheDocument();
    });
  });
});
