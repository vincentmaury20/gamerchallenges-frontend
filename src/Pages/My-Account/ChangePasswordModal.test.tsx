import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangePasswordModal from "./ChangePasswordModal";
import { AuthContext } from "../../Context/AuthContext";

/**
 * Helper function to render the component with a mocked AuthContext.
 * This avoids repeating the Provider wrapper in every test.
 */
function renderWithAuth(
  ui: React.ReactElement,
  { token = "fake-token", onClose = vi.fn() } = {},
) {
  const authContextValue = {
    token,
    userId: "fake-user",
    login: vi.fn(),
    logout: vi.fn(),
    loadingAuth: false,
  };

  return {
    onClose,
    ...render(
      /**
       * The component reads the token from AuthContext.
       * We provide a minimal mock context for testing.
       */
      <AuthContext.Provider value={authContextValue}>
        {ui}
      </AuthContext.Provider>,
    ),
  };
}

describe("ChangePasswordModal", () => {
  beforeEach(() => {
    // Reset all mock functions before each test
    vi.clearAllMocks();
  });

  it("renders the modal correctly", () => {
    renderWithAuth(<ChangePasswordModal onClose={vi.fn()} />);

    // Check title
    expect(screen.getByText("Modifier mon mot de passe")).toBeInTheDocument();

    // Check input fields
    expect(
      screen.getByPlaceholderText("Ancien mot de passe"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Nouveau mot de passe"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirmer le mot de passe"),
    ).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole("button", { name: "Annuler" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Valider" })).toBeInTheDocument();
  });

  it("shows an error when passwords do not match", async () => {
    const user = userEvent.setup();

    renderWithAuth(<ChangePasswordModal onClose={vi.fn()} />);

    // Fill fields with mismatched passwords
    await user.type(
      screen.getByPlaceholderText("Ancien mot de passe"),
      "oldpass",
    );
    await user.type(
      screen.getByPlaceholderText("Nouveau mot de passe"),
      "newpass1",
    );
    await user.type(
      screen.getByPlaceholderText("Confirmer le mot de passe"),
      "newpass2",
    );

    // Submit
    await user.click(screen.getByRole("button", { name: "Valider" }));

    // Expect validation error
    expect(
      screen.getByText("Les mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
  });

  it("sends the request and closes the modal on success", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn(); // spy to check if the modal closes

    renderWithAuth(<ChangePasswordModal onClose={onClose} />);

    // Fill valid fields
    await user.type(
      screen.getByPlaceholderText("Ancien mot de passe"),
      "oldpass",
    );
    await user.type(
      screen.getByPlaceholderText("Nouveau mot de passe"),
      "newpass",
    );
    await user.type(
      screen.getByPlaceholderText("Confirmer le mot de passe"),
      "newpass",
    );

    // Submit
    await user.click(screen.getByRole("button", { name: "Valider" }));

    /**
     * MSW intercepts the request and returns { ok: true }.
     * The component then displays a success message.
     */
    await waitFor(() => {
      expect(screen.getByText("Mot de passe modifié !")).toBeInTheDocument();
    });

    /**
     * The component calls onClose() after a 1500ms timeout.
     * We wait for it naturally (no fake timers).
     */
    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
