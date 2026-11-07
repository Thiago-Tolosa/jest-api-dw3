import { describe, it, expect } from "@jest/globals";
import { isForeignKeyViolation } from '../../src/database/foreign-key-violation';

describe("isForeignKeyViolation", () => {
    it("deve retornar true se for válido", () => {
        expect(isForeignKeyViolation({ code: "23503" })).toBe(true);
    })
    it.each([null, undefined, "23505", 23503, {}, { code: "outro" }])(
        "deve rejeitar a entrada inválida: %p",
        (entradaInvalida) => {
            expect(isForeignKeyViolation(entradaInvalida)).toBe(false);
        }
    );
});