import { describe, it, expect } from "@jest/globals";
import { isUniqueViolation } from '../../src/database/unique-violation';

describe("isUniqueViolation", () => {
    it("deve retornar true se for válido", () => {
        expect(isUniqueViolation({ code: "23505" })).toBe(true);
    })
    it.each([null, undefined, "23505", 23503, {}, { code: "outro" }])(
        "deve rejeitar a entrada inválida: %p",
        (entradaInvalida) => {
            expect(isUniqueViolation(entradaInvalida)).toBe(false);
        }
    );
});