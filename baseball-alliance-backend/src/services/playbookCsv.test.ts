import { describe, expect, it } from "vitest";
import { parsePlaybookCsv } from "./playbookCsv.js";

describe("parsePlaybookCsv", () => {
  it("parses email and full name headers", () => {
    const csv = `Email,Full Name,Grad Year
alice@example.com,Alice Smith,2027`;
    const { rows, errors } = parsePlaybookCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("alice@example.com");
    expect(rows[0].fullName).toBe("Alice Smith");
    expect(rows[0].gradYear).toBe("2027");
  });

  it("parses first and last name columns", () => {
    const csv = `E-mail,First Name,Last Name
bob@test.org,Bob,Jones`;
    const { rows } = parsePlaybookCsv(csv);
    expect(rows[0].fullName).toBe("Bob Jones");
  });

  it("requires email column", () => {
    const { rows, errors } = parsePlaybookCsv("Name\nBob");
    expect(rows).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("parses Playbook player export with Account Email and Grad Year - HS", () => {
    const csv = `ID,First Name,Last Name,DOB,Account First Na,Account Last Na,Account Phone,Account Email,Gender,Shirt Size,Grad Year - HS
12,The,Kid,09/25/2007,Janice,STFU,512-743-9272,gunnarsmith05@gmail.com,,AL,2026`;
    const { rows, errors } = parsePlaybookCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("gunnarsmith05@gmail.com");
    expect(rows[0].fullName).toBe("The Kid");
    expect(rows[0].gradYear).toBe("2026");
    expect(rows[0].phone).toBe("512-743-9272");
    expect(rows[0].playbookId).toBe("12");
  });

  it("parses membership column", () => {
    const csv = `Email,Full Name,Membership
a@example.com,Alice Smith,bams-premium`;
    const { rows, errors } = parsePlaybookCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0].membership).toBe("BAMS_PREMIUM");
  });

  it("rejects invalid membership values", () => {
    const csv = `Email,Full Name,Membership
a@example.com,Alice Smith,gold`;
    const { rows, errors } = parsePlaybookCsv(csv);
    expect(rows).toHaveLength(0);
    expect(errors[0]?.message).toContain("Invalid membership");
  });
});
