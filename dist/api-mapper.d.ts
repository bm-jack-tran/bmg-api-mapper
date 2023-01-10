import { INestApplication } from '@nestjs/common';
import { HttpServer } from '@nestjs/common/interfaces/http/http-server.interface';
export declare class BMGApiMapper {
    static apiArr: any[];
    static scanApi(app: INestApplication): Promise<void>;
    static normalizeRelPath(input: string): string;
    static buildTable(): string;
    static serveDocument(httpAdapter: HttpServer): void;
}
