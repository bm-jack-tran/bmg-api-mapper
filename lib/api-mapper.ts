import { INestApplication } from '@nestjs/common';
const getFunctionLocation = require('get-function-location');
import { RequestMethod } from "@nestjs/common/enums/request-method.enum";
import { HttpServer } from '@nestjs/common/interfaces/http/http-server.interface';

export class BMGApiMapper {

  public static apiArr = [];
  
  public static async scanApi(app: INestApplication) {
    const routesResolver = app["routesResolver"];
    const modules = routesResolver.container.getModules();
    await modules.forEach(async ({ controllers, metatype }, moduleName) => {
      const moduleMetaType = metatype;
      const modulePath = routesResolver.getModulePathMetadata(metatype);
      const globalPrefix = "";
      await controllers.forEach(async instanceWrapper => {
        const { metatype, instance } = instanceWrapper;
        const routerPaths = routesResolver.routerExplorer.extractRouterPath(metatype);
        const controllerName = metatype.name;
        const controllerVersion = routesResolver.getVersionMetadata(metatype);

        await routerPaths.forEach(async path => {
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

          const routeDefinitions = await routesResolver.routerExplorer.scanForPaths(instance);
          await (routeDefinitions || []).forEach(async routeDefinition => {
            const { path: paths, requestMethod: reqMethod, targetCallback, methodName: ctrlMethod, } = routeDefinition;

            //console.log(targetCallback.toString());
            //console.log(inspect(targetCallback, {showHidden: true, depth: 5, colors: true}))
            let targetCb = await getFunctionLocation(targetCallback);
            const { version: methodVersion } = routeDefinition;
            routePathMetadata.methodVersion = methodVersion;

            const isVersioned = (routePathMetadata.methodVersion ||
              routePathMetadata.controllerVersion) &&
              routePathMetadata.versioningOptions;
            await paths.forEach(async path => {
              routePathMetadata.methodPath = path;
              const pathsToLog = await routesResolver.routerExplorer.routePathFactory.create(Object.assign(Object.assign({}, routePathMetadata), { versioningOptions: undefined }), reqMethod);
              await pathsToLog.forEach(path => {
                if (isVersioned) {
                  //
                } else {
                  const moduleContent = moduleMetaType.toString()
                  const myModule = moduleContent.replace("class ", "").replace(" {\n}", "");
                  targetCb.source = targetCb.source.replace("file:///usr/src/app/dist/", "");
                  const api = {
                    path,
                    myModule,
                    controllerName,
                    controllerMethod: ctrlMethod,
                    requestMethod: RequestMethod[reqMethod],
                    source: targetCb["source"]
                  };
                  BMGApiMapper.apiArr.push(api);
                }
              });

            })
          });
        });
      })
    });

    BMGApiMapper.serveDocument(app.getHttpAdapter());
  }

  public static normalizeRelPath(input: string) {
    const output = input.replace(/\/\/+/g, '/');
    return output;
  }

  public static buildTable() {
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

  public static serveDocument(httpAdapter: HttpServer) {
    httpAdapter.get(this.normalizeRelPath("/api-document-json"),
      (rer, res) => {
        res.type("application/json");
        res.send(BMGApiMapper.apiArr);
      }
    )
    httpAdapter.get(this.normalizeRelPath("/api-document-html"),
      (rer, res) => {
        const html = BMGApiMapper.buildTable();
        res.type("text/html");
        res.send(html);
      }
    )
  }
}