import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { StudentRepository, PgStudentRepository } from '../../../src/modules/students/students.repository';

interface IFakeRow {
    ra: number,
    name: string
}
let mockDb: { query: jest.Mock<(...args: any[]) => Promise<any>> }; //Unico jeito q consegui fazer os tipos funcionarem
let repository: StudentRepository;

beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new PgStudentRepository(mockDb as any);
});

describe("PgCourseRepository", () => {
    it("deve inserir um aluno no banco e retornar o registro criado", async () => {
        const fakeRow: IFakeRow = { ra: 123, name: "Eloah" };
        mockDb.query.mockResolvedValue({ rows: [fakeRow] });

        const result = await repository.create({ ra: 123, name: "Eloah" });

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "INSERT INTO students (ra, name) VALUES ($1, $2) RETURNING ra, name",
            [123, "Eloah"]
        );
    });

    it("deve retornar todos os alunos registrados no banco", async () => {
        const fakeRow: IFakeRow[] = [{ ra: 123, name: "Eloah" }, { ra: 132, name: "Thiago" }];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findAll();

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT ra, name FROM students ORDER BY name"
        );
    });

    it("deve retornar um array vazio quando rows é [] e se chama findAll", async () => {
        const fakeRow: IFakeRow[] = [];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findAll();

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT ra, name FROM students ORDER BY name"
        );
    });

    it("deve retornar apenas o primeiro registro do banco", async () => {
        const fakeRow: IFakeRow[] = [{ ra: 123, name: "Eloah" }, { ra: 132, name: "Thiago" }];
        mockDb.query.mockResolvedValue({ rows: [fakeRow[0]] });

        const result = await repository.findOne(123);

        expect(result).toEqual(fakeRow[0]);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT ra, name FROM students WHERE ra = $1",
            [123]
        );
    });

    it("deve retornar undefined vazio quando rows é [] e se chama findOne", async () => {
        const fakeRow: IFakeRow[] = [];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findOne(123);

        expect(result).toEqual(undefined);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT ra, name FROM students WHERE ra = $1",
            [123]
        );
    });

    it.each([
        ["findAll", () => repository.findAll()],
        ["findOne", () => repository.findOne(123)],
        ["create", () => repository.create({ ra: 123, name: "Eloah" })]
    ])(
        "deve propagar a mesma instância de erro lançada por db.query no método %s",
        async (nomeMetodo, executarMetodo) => {
            const error = new Error("Erro");
            mockDb.query.mockRejectedValue(error);

            await expect(executarMetodo()).rejects.toBe(error);
        }
    );
});