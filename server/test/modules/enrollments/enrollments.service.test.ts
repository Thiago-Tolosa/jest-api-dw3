import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { EnrollmentRepository } from '../../../src/modules/enrollments/enrollments.repository';
import { EnrollmentsService } from '../../../src/modules/enrollments/enrollments.service';

let mockRepository: jest.Mocked<EnrollmentRepository>;
let service: EnrollmentsService;
const date = new Date()

beforeEach(() => {
    mockRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn()
    };
    service = new EnrollmentsService(mockRepository);
});

describe("EnrollmentsService.create", () => {

    it("deve chamar repository.create com a entrada e retorno corretos", async () => {
        const input = { studentRa: 123, courseId: 1 };
        mockRepository.create.mockResolvedValue({ studentRa: 123, courseId: 1, enrolledAt: date });
        const result = await service.create(input);
        expect(result).toEqual({ studentRa: 123, courseId: 1, enrolledAt: date });
        expect(mockRepository.create).toHaveBeenCalledWith(input.studentRa, input.courseId);
    });

    it.each([{ studentRa: 0, courseId: 1 }, { studentRa: 123, courseId: 0 }])(
        "deve rejeitar a entrada inválida: %p com erro 400, e não chamar repository.create",
        async (entradaInvalida) => {
            await expect(service.create(entradaInvalida)).rejects.toMatchObject(
                {
                    statusCode: 400
                }
            );
            expect(mockRepository.create).not.toHaveBeenCalled();
        }
    );

    it("deve retornar erro 404 se aluno ou disciplina não existir", async () => {
        mockRepository.create.mockRejectedValue({ code: "23503" });
        await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject(
            {
                statusCode: 404
            }
        );
    });

    it("deve rejeitar a matricula com erro 409 se a matricula for duplicada", async () => {
        mockRepository.create.mockRejectedValue({ code: "23505" });
        await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject(
            {
                statusCode: 409
            }
        );
    });

    it("deve propagar a mesma instância de erro lançada pelo repository.create", async () => {
            const error = new Error("Erro");
            mockRepository.create.mockRejectedValue(error);
            await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toBe(error);
        });
});

describe("EnrollmentsService.findAll", () => {
    it("deve chamar repository.findAll e retornar o resultado", async () => {
        const estudantes = [{ studentRa: 123, courseId: 1, enrolledAt: date }, { studentRa: 132, courseId: 2, enrolledAt: date }];
        mockRepository.findAll.mockResolvedValue(estudantes);
        const result = await service.findAll();
        expect(result).toEqual(estudantes);
        expect(mockRepository.findAll).toHaveBeenCalledWith();
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
});

describe("EnrollmentsService.findOne", () => {
    it("deve chamar repository.findOne com o id correto, e retornar o resultado", async () => {
        const estudante = { studentRa: 123, courseId: 1, enrolledAt: date };
        mockRepository.findOne.mockResolvedValue(estudante);
        const result = await service.findOne(123, 1);
        expect(result).toEqual(estudante);
        expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
        expect(mockRepository.findOne).toHaveBeenCalledWith(123, 1);
    });

    it("deve chamar repository.findOne, e retornar erro 404 ao receber undefined", async () => {
        mockRepository.findOne.mockResolvedValue(undefined);
        const input: number[] = [123, 1]
        await expect(service.findOne(input[0], input[1])).rejects.toMatchObject({
            statusCode: 404,
            message: "Matrícula não encontrada."
        });
        expect(mockRepository.findOne).toHaveBeenCalledWith(input[0], input[1])
    });
});