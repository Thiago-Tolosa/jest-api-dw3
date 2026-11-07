import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CourseRepository } from '../../../src/modules/courses/courses.repository';
import { CoursesService } from '../../../src/modules/courses/courses.service';

let mockRepository: jest.Mocked<CourseRepository>;
let service: CoursesService;

beforeEach(() => {
    mockRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn()
    };
    service = new CoursesService(mockRepository);
});

describe("CoursesService.create", () => {

    it("deve chamar repository.create com a entrada correta, uma única vez", async () => {
        const input = { name: "Qualidade" };
        mockRepository.create.mockResolvedValue({ id: 1, name: "Qualidade" });
        const result = await service.create(input);
        expect(result).toEqual({ id: 1, name: "Qualidade" });
        expect(mockRepository.create).toHaveBeenCalledWith(input);
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it.each([null, {}, { name: "A" }])(
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

    it("deve rejeitar a entrada com código inválido", async () => {
        mockRepository.create.mockRejectedValue({ code: "23505" });
        await expect(service.create({ name: "Qualidade" })).rejects.toMatchObject(
            {
                statusCode: 409
            }
        );
    });

    it("deve propagar a mesma instância de erro lançada pelo repository.create", async () => {
        const error = new Error("Erro");
        mockRepository.create.mockRejectedValue(error);
        await expect(service.create({ name: "Qualidade" })).rejects.toBe(error);
    });

    it("deve criar um curso aceitando campos extras, mas apenas passando 'name' para o repository", async () => {
        const input = { name: "Qualidade", extra: true };
        mockRepository.create.mockResolvedValue({ id: 1, name: "Qualidade" });
        await service.create(input);
        expect(mockRepository.create).toHaveBeenCalledWith({ name: "Qualidade" });
    });
});

describe("CoursesService.findAll", () => {
    it("deve chamar repository.findAll e retornar o resultado", async () => {
        const cursos = [{ id: 1, name: "Qualidade" }, { id: 2, name: "Gestão" }];
        mockRepository.findAll.mockResolvedValue(cursos);
        const result = await service.findAll();
        expect(result).toEqual(cursos);
        expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("deve propagar a mesma instância de erro lançada pelo repository.findAll", async () => {
        const error = new Error("Erro");
        mockRepository.findAll.mockRejectedValue(error);
        await expect(service.findAll()).rejects.toBe(error);
    }) 
});

describe("CoursesService.findOne", () => {
    it("deve chamar repository.findOne com o id correto, e retornar o resultado", async () => {
        const curso = { id: 123, name: "Qualidade" };
        mockRepository.findOne.mockResolvedValue(curso);
        const result = await service.findOne(123);
        expect(result).toEqual(curso);
        expect(mockRepository.findOne).toHaveBeenCalledWith(123);
    });

    it("deve rejeitar a entrada inválida com erro 404", async () => {
        mockRepository.findOne.mockResolvedValue(undefined);
        await expect(service.findOne(123)).rejects.toMatchObject({
            statusCode: 404
        });
    });

    it("deve rejeitar a entrada inválida com erro 400, e não chamar repository.findOne", async () => {
        await expect(service.findOne(0)).rejects.toMatchObject({
            statusCode: 400
        });
        expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it("deve propagar a mesma instância de erro lançada pelo repository.findOne", async () => {
        const error = new Error("Erro");
        mockRepository.findOne.mockRejectedValue(error);
        await expect(service.findOne(123)).rejects.toBe(error);
    })

    it("deve buscar um curso utilizando spy no método findOne do repositório e verificar se foi chamado com o id correto", async () => {
        const stubRepository = {
            create: async () => ({ id: 1, name: "Qualidade" }),
            findAll: async () => [],
            findOne: async (id: number) => ({ id, name: "Qualidade" })
        };

        const spyFindOne = jest.spyOn(stubRepository, 'findOne')
            .mockResolvedValue({ id: 1, name: "Qualidade" });

        const customService = new CoursesService(stubRepository);

        const result = await customService.findOne(1);
        expect(result).toEqual({ id: 1, name: "Qualidade" });
        expect(spyFindOne).toHaveBeenCalledWith(1);
    });
});