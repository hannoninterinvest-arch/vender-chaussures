import { reportServerError } from "./error-diagnostics";

describe("safe server diagnostics", () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [
      new Error(
        'Postgres package has not been found installed. Please run "npm install pg".',
      ),
      "POSTGRES_DRIVER_MISSING",
    ],
    [new Error("DATABASE_URL est obligatoire"), "DATABASE_URL_MISSING"],
    [new Error("DATABASE_URL invalide"), "DATABASE_URL_INVALID"],
    [
      new Error("JWT_SECRET est obligatoire en production"),
      "JWT_SECRET_MISSING",
    ],
    [{ driverError: { code: "42P01" } }, "42P01"],
    [{ cause: { code: "28P01" } }, "28P01"],
    [new AggregateError([{ code: "ECONNREFUSED" }]), "ECONNREFUSED"],
    [new Error("Connection terminated due to connection timeout"), "ETIMEDOUT"],
  ])("classifies a failure without logging its raw contents", (error, code) => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const errorId = reportServerError(error, "POST", "auth/login");
    expect(log).toHaveBeenCalledWith(
      "API request failed",
      expect.objectContaining({ errorId, code, route: "auth/login" }),
    );
    expect(errorId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("never logs secrets, SQL, or arbitrary messages even in nested exceptions", () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const secret = "private-test-value-do-not-log";
    reportServerError(
      {
        message: secret,
        query: `SELECT '${secret}'`,
        driverError: { code: "28P01", detail: secret },
        stack: secret,
      },
      "POST",
      "auth/login",
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain(secret);
    reportServerError(new Error(secret), "POST", "auth/login");
    expect(JSON.stringify(log.mock.calls)).not.toContain(secret);
    expect(log.mock.calls[1][1].code).toBe("UNEXPECTED_SERVER_ERROR");
  });
});
