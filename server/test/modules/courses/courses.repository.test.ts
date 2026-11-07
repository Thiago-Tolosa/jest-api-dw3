import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CourseRepository, PgCourseRepository } from '../../../src/modules/courses/courses.repository';

interface IFakeRow {
    id: number,
    name: string
}
let mockDb: { query: jest.Mock<(...args: any[]) => Promise<any>> }; //Unico jeito q consegui fazer os tipos funcionarem
let repository: CourseRepository;

beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new PgCourseRepository(mockDb as any);
});

describe("PgCourseRepository", () => {
    it("deve inserir um curso no banco e retornar o registro criado", async () => {
        const fakeRow: IFakeRow = { id: 1, name: "Qualidade" };
        mockDb.query.mockResolvedValue({ rows: [fakeRow] });

        const result = await repository.create({ name: "Qualidade" });

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "INSERT INTO courses (name) VALUES ($1) RETURNING id, name",
            ["Qualidade"]
        );
    });

    it("deve retornar todos os cursos registrados no banco", async () => {
        const fakeRow: IFakeRow[] = [{ id: 1, name: "Qualidade" }, { id: 2, name: "Outra Qualidade" }];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findAll();

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT id, name FROM courses ORDER BY id"
        );
    });

    it("deve retornar um array vazio quando rows é [] e se chama findAll", async () => {
        const fakeRow: IFakeRow[] = [];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findAll();

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT id, name FROM courses ORDER BY id"
        );
    });

    it("deve retornar apenas o primeiro registro do banco", async () => {
        const fakeRow: IFakeRow[] = [{ id: 7, name: "Qualidade" }, { id: 2, name: "Outra Qualidade" }];
        mockDb.query.mockResolvedValue({ rows: [fakeRow[0]] });

        const result = await repository.findOne(7);

        expect(result).toEqual(fakeRow[0]);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT id, name FROM courses WHERE id = $1",
            [7]
        );
    });

    it("deve retornar undefined vazio quando rows é [] e se chama findOne", async () => {
        const fakeRow: IFakeRow[] = [];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findOne(7);

        expect(result).toEqual(undefined);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            "SELECT id, name FROM courses WHERE id = $1",
            [7]
        );
    });

    it.each([
        ["findAll", () => repository.findAll()],
        ["findOne", () => repository.findOne(7)],
        ["create", () => repository.create({ name: "Qualidade" })]
    ])(
        "deve propagar a mesma instância de erro lançada por db.query no método %s",
        async (nomeMetodo, executarMetodo) => {
            const error = new Error("Erro");
            mockDb.query.mockRejectedValue(error);

            await expect(executarMetodo()).rejects.toBe(error);
        }
    );
});