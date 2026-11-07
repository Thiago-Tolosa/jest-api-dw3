import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { StudentRepository } from '../../../src/modules/students/students.repository';
import { StudentsService } from '../../../src/modules/students/students.service';

let mockRepository: jest.Mocked<StudentRepository>;
let service: StudentsService;

beforeEach(() => {
    mockRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn()
    };
    service = new StudentsService(mockRepository);
});

describe("StudentsService.create", () => {

    it("deve chamar repository.create com a entrada e retorno corretos", async () => {
        const input = { ra: 123, name: "Ana" };
        mockRepository.create.mockResolvedValue({ ra: 123, name: "Ana" });
        const result = await service.create(input);
        expect(result).toEqual({ ra: 123, name: "Ana" });
        expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it("deve rejeitar a entrada com RA inválido", async () => {
        await expect(service.create({ ra: 0, name: "Ana" })).rejects.toMatchObject(
            {
                statusCode: 400
            }
        );
        expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("deve rejeitar a entrada com RA duplicado", async () => {
        mockRepository.create.mockRejectedValue({ code: "23505" });
        await expect(service.create({ ra: 123, name: "Ana" })).rejects.toMatchObject(
            {
                statusCode: 409
            }
        );
    });

    it("deve propagar a mesma instância de erro lançada pelo repository.create", async () => {
        const error = new Error("Erro");
        mockRepository.create.mockRejectedValue(error);
        await expect(service.create({ ra: 123, name: "Eloah" })).rejects.toBe(error);
    });
});


describe("StudentsService.findAll", () => {
    it("deve chamar repository.findAll e retornar o resultado", async () => {
        const estudantes = [{ ra: 123, name: "Eloah" }, { ra: 132, name: "Thiago" }];
        mockRepository.findAll.mockResolvedValue(estudantes);
        const result = await service.findAll();
        expect(result).toEqual(estudantes);
        expect(mockRepository.findAll).toHaveBeenCalledWith();
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
});

describe("StudentsService.findOne", () => {
    it("deve chamar repository.findOne com o id correto, e retornar o resultado", async () => {
        const estudante = { ra: 123, name: "Ana" };
        mockRepository.findOne.mockResolvedValue(estudante);
        const result = await service.findOne(123);
        expect(result).toEqual(estudante);
        expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
        expect(mockRepository.findOne).toHaveBeenCalledWith(123);
    });

    it("deve chamar repository.findOne, e retornar erro 404 ao receber undefined", async () => {
        mockRepository.findOne.mockResolvedValue(undefined);
        await expect(service.findOne(123)).rejects.toMatchObject({
            statusCode: 404,
            message: "Estudante com RA 123 não encontrado."
        });
    });
});
