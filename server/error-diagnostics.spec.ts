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
    [
      new Error("JWT_SECRET doit contenir au moins 32 octets"),
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

  it("names the violated constraint and table, never the offending values", () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    reportServerError(
      { driverError: { code: "23503", constraint: "FK_investments_user", table: "investment_requests", detail: 'Key (id)=(secret-id) is still referenced' } },
      "DELETE",
      "staff/:id",
    );
    expect(log).toHaveBeenCalledWith(
      "API request failed",
      expect.objectContaining({ code: "23503", constraint: "FK_investments_user", table: "investment_requests" }),
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret-id");
  });

  it("identifies an unclassified database failure by structural fields only", () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    class QueryFailedError extends Error {}
    const error = new QueryFailedError("failed with secret-value");
    error.name = "QueryFailedError";
    Object.assign(error, { driverError: { code: "P0001", routine: "exec_stmt_raise", message: "secret-value" } });
    reportServerError(error, "PATCH", "staff/:id");
    expect(log.mock.calls[0][1]).toMatchObject({
      code: "UNEXPECTED_SERVER_ERROR",
      errorName: "QueryFailedError",
      sqlState: "P0001",
      routine: "exec_stmt_raise",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret-value");
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

  it("names the missing column or table without echoing the rest of the message", () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    reportServerError(
      { driverError: { code: "42703", message: 'column User.passwordHash does not exist' } },
      "POST",
      "auth/login",
    );
    expect(log.mock.calls[0][1]).toMatchObject({ code: "42703", missing: "column User.passwordHash" });
    reportServerError(
      { driverError: { code: "42P01", message: 'relation "users" does not exist at secret-value' } },
      "POST",
      "auth/login",
    );
    expect(log.mock.calls[1][1]).toMatchObject({ missing: "relation users" });
    expect(JSON.stringify(log.mock.calls)).not.toContain("secret-value");
  });
});
