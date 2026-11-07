import { describe, it, expect } from "@jest/globals";
import { positiveInteger, parseId, validateName, validateBody } from '../src/validation';

describe("positiveInteger", () => {
  it("deve retornar o número se for válido", () => {
    expect(positiveInteger(1, "RA")).toBe(1);
    expect(positiveInteger(2147483647, "RA")).toBe(2147483647);
  });
  it.each([0, -1, 1.5, NaN, Infinity, 2147483648, "Eloah", null, undefined])(
    "deve rejeitar a entrada inválida: %p",
    (entradaInvalida) => {
      expect(() => positiveInteger(entradaInvalida, "RA")).toThrow(
        expect.objectContaining({
          statusCode: 400,
          message: "RA deve ser um inteiro positivo de até 2147483647.",
        })
      );
    }
  );
});

describe("parseId", () => {
  it("deve retornar o número se for válido", () => {
    expect(parseId("1", "RA")).toBe(1);
    expect(parseId("2147483647", "RA")).toBe(2147483647);
  });
  it.each(["1abc", "1.2", "1e2", "", "-1", 123])(
    "deve rejeitar a entrada inválida: %p",
    (entradaInvalida) => {
      expect(() => parseId(entradaInvalida, "RA")).toThrow(
        expect.objectContaining({
          statusCode: 400,
          message: "RA deve ser um inteiro positivo.",
        })
      );
    }
  );
  it.each(["0", "2147483648"])(
    "deve rejeitar a entrada inválida: %p",
    (entradaInvalida) => {
      expect(() => parseId(entradaInvalida, "RA")).toThrow(
        expect.objectContaining({
          statusCode: 400,
          message: "RA deve ser um inteiro positivo de até 2147483647.",
        })
      );
    }
  );
});

describe("validateName", () => {
  const a100 = "a".repeat(100);
  it("deve retornar o nome se for válido", () => {
    expect(validateName("Ana")).toBe("Ana");
    expect(validateName(a100)).toBe(a100);
  });
  const a101 = "a".repeat(101);
  it.each(["", "ab", " ", " a ", a101, 123, null, undefined])(
    "deve rejeitar a entrada inválida: %p",
    (entradaInvalida) => {
      expect(() => validateName(entradaInvalida)).toThrow(
        expect.objectContaining({
          statusCode: 400,
          message: "O nome deve ter no máximo 100 caracteres e pelo menos 3 caracteres sem contar espaços nas extremidades.",
        })
      );
    }
  );
});

describe("validateBody", () => {
  it("deve retornar o objeto se for válido", () => {
    const object = Object.freeze({ name: "Ana" });
    expect(validateBody(object)).toBe(object);
  });
  it.each([null, undefined, [], "Ana", 12])(
    "deve rejeitar a entrada inválida: %p",
    (entradaInvalida) => {
      expect(() => validateBody(entradaInvalida)).toThrow(
        expect.objectContaining({
          statusCode: 400,
          message: "O corpo deve ser um objeto JSON.",
        })
      );
    }
  );
  it("deve retornar o objeto se for válido, aceitando campos extras", () => {
    const object = { name: "Ana", extra: true };
    expect(validateBody(object)).toBe(object);
  });
});