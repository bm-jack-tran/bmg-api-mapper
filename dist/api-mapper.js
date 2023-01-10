"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BMGApiMapper = void 0;
const getFunctionLocation = require('get-function-location');
const request_method_enum_1 = require("@nestjs/common/enums/request-method.enum");
class BMGApiMapper {
    static scanApi(app) {
        return __awaiter(this, void 0, void 0, function* () {
            const routesResolver = app["routesResolver"];
            const modules = routesResolver.container.getModules();
            yield modules.forEach(({ controllers, metatype }, moduleName) => __awaiter(this, void 0, void 0, function* () {
                const moduleMetaType = metatype;
                const modulePath = routesResolver.getModulePathMetadata(metatype);
                const globalPrefix = "";
                yield controllers.forEach((instanceWrapper) => __awaiter(this, void 0, void 0, function* () {
                    const { metatype, instance } = instanceWrapper;
                    const routerPaths = routesResolver.routerExplorer.extractRouterPath(metatype);
                    const controllerName = metatype.name;
                    const controllerVersion = routesResolver.getVersionMetadata(metatype);
                    yield routerPaths.forEach((path) => __awaiter(this, void 0, void 0, function* () {
                        const versioningOptions = routesResolver.applicationConfig.getVersioning();
                        const routePathMetadata = {
                            ctrlPath: path,
                            modulePath,
                            globalPrefix,
                            controllerVersion,
                            versioningOptions,
                            methodVersion: null,
                            methodPath: ""
                        };
                        const routeDefinitions = yield routesResolver.routerExplorer.scanForPaths(instance);
                        yield (routeDefinitions || []).forEach((routeDefinition) => __awaiter(this, void 0, void 0, function* () {
                            const { path: paths, requestMethod: reqMethod, targetCallback, methodName: ctrlMethod, } = routeDefinition;
                            let targetCb = yield getFunctionLocation(targetCallback);
                            const { version: methodVersion } = routeDefinition;
                            routePathMetadata.methodVersion = methodVersion;
                            const isVersioned = (routePathMetadata.methodVersion ||
                                routePathMetadata.controllerVersion) &&
                                routePathMetadata.versioningOptions;
                            yield paths.forEach((path) => __awaiter(this, void 0, void 0, function* () {
                                routePathMetadata.methodPath = path;
                                const pathsToLog = yield routesResolver.routerExplorer.routePathFactory.create(Object.assign(Object.assign({}, routePathMetadata), { versioningOptions: undefined }), reqMethod);
                                yield pathsToLog.forEach(path => {
                                    if (isVersioned) {
                                    }
                                    else {
                                        const moduleContent = moduleMetaType.toString();
                                        const myModule = moduleContent.replace("class ", "").replace(" {\n}", "");
                                        targetCb.source = targetCb.source.replace("file:///usr/src/app/dist/", "");
                                        const api = {
                                            path,
                                            myModule,
                                            controllerName,
                                            controllerMethod: ctrlMethod,
                                            requestMethod: request_method_enum_1.RequestMethod[reqMethod],
                                            source: targetCb["source"]
                                        };
                                        BMGApiMapper.apiArr.push(api);
                                    }
                                });
                            }));
                        }));
                    }));
                }));
            }));
            BMGApiMapper.serveDocument(app.getHttpAdapter());
        });
    }
    static normalizeRelPath(input) {
        const output = input.replace(/\/\/+/g, '/');
        return output;
    }
    static buildTable() {
        const data = BMGApiMapper.apiArr;
        let html = "<table border=1 cellspacing=0 cellpadding=10 width='100%'>";
        html += `<tr>
          <th>API</th>\
          <th>Request Method</th>\
          <th>Module Name</th>\
          <th>Controller Name</th>\
          <th>Controller Method</th>\
          <th>Source</th>\
        </tr>`;
        for (let idx in data) {
            html += `<tr>
          <td>${data[idx]["path"]}</td>\
          <td>${data[idx]["requestMethod"]}</td>\
          <td>${data[idx]["myModule"]}</td>\
          <td>${data[idx]["controllerName"]}</td>\
          <td>${data[idx]["controllerMethod"]}</td>\
          <td>${data[idx]["source"]}</td>\
        </tr>`;
        }
        html += "</table>";
        return html;
    }
    static serveDocument(httpAdapter) {
        httpAdapter.get(this.normalizeRelPath("/api-document-json"), (rer, res) => {
            res.type("application/json");
            res.send(BMGApiMapper.apiArr);
        });
        httpAdapter.get(this.normalizeRelPath("/api-document-html"), (rer, res) => {
            const html = BMGApiMapper.buildTable();
            res.type("text/html");
            res.send(html);
        });
    }
}
exports.BMGApiMapper = BMGApiMapper;
BMGApiMapper.apiArr = [];
