import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { EnrollmentRepository, PgEnrollmentRepository } from '../../../src/modules/enrollments/enrollments.repository';

const date = new Date()

interface IFakeRow {
    studentRa: number,
    courseId: number,
    enrolledAt: Date
}

interface Iinput {
    studentRa: number,
    courseId: number,
}

let mockDb: { query: jest.Mock<(...args: any[]) => Promise<any>> }; //Unico jeito q consegui fazer os tipos funcionarem
let repository: EnrollmentRepository;

beforeEach(() => {
    mockDb = { query: jest.fn() };
    repository = new PgEnrollmentRepository(mockDb as any);
});

describe("PgEnrollmentRepository", () => {
    it("deve inserir uma matrícula no banco e retornar o registro criado", async () => {
        const fakeRow: IFakeRow = { studentRa: 123, courseId: 7, enrolledAt: date };
        const input: Iinput = { studentRa: 123, courseId: 7 }
        mockDb.query.mockResolvedValue({ rows: [fakeRow] });

        const result = await repository.create(input.studentRa, input.courseId);

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            `INSERT INTO enrollments (student_ra, course_id) VALUES ($1, $2)
         RETURNING student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"`,
            [123, 7]
        );
    });


    it("deve retornar todas as matriculas registradas no banco", async () => {
        const fakeRow: IFakeRow[] = [{ studentRa: 123, courseId: 7, enrolledAt: date }, { studentRa: 132, courseId: 2, enrolledAt: date }];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findAll();

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            `SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"
         FROM enrollments ORDER BY student_ra, course_id`
        );
    });

    it("deve retornar um array vazio quando rows é [] e se chama o findAll", async () => {
        const fakeRow: IFakeRow[] = [];
        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findAll();

        expect(result).toEqual(fakeRow);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            `SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"
         FROM enrollments ORDER BY student_ra, course_id`
        );
    });

    it("deve retornar apenas o primeiro registro do banco", async () => {
        const fakeRow: IFakeRow[] = [{ studentRa: 123, courseId: 7, enrolledAt: date }, { studentRa: 132, courseId: 2, enrolledAt: date }];
        mockDb.query.mockResolvedValue({ rows: [fakeRow[0]] });

        const result = await repository.findOne(123, 7);

        expect(result).toEqual(fakeRow[0]);
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            `SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"
         FROM enrollments WHERE student_ra = $1 AND course_id = $2`,
            [123, 7]
        );
    });

    it("deve retornar undefined quando rows é [] e se chama findOne", async () => {
        const fakeRow: IFakeRow[] = [];

        mockDb.query.mockResolvedValue({ rows: fakeRow });

        const result = await repository.findOne(123, 7);

        expect(result).toBeUndefined();
        expect(mockDb.query).toHaveBeenCalledTimes(1);
        expect(mockDb.query).toHaveBeenCalledWith(
            `SELECT student_ra AS "studentRa", course_id AS "courseId", enrolled_at AS "enrolledAt"
         FROM enrollments WHERE student_ra = $1 AND course_id = $2`,
            [123, 7]
        );
    });

    it.each([
        ["findAll", () => repository.findAll()],
        ["findOne", () => repository.findOne(123, 7)],
        ["create", () => repository.create(123, 1)]
    ])(
        "deve propagar a mesma instância de erro lançada por db.query no método %s",
        async (nomeMetodo, executarMetodo) => {
            const error = new Error("Erro");
            mockDb.query.mockRejectedValue(error);

            await expect(executarMetodo()).rejects.toBe(error);
        }
    );
});