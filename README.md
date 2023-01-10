# BRICKMATE GROUP - API MAPPER

## Description

> This package is writen for help developer generate api map in table format.
> 
> It is used for develop environment only and use with NestJS only.
> 
> When you update source code, it will generate instantly.
> 
> Developer can copy result and paste to notion.


## Requirements

> get-function-location
> 
> NestJS
> 
> Disable webpack in nest-cli.json
```
  {
    ...
    "compilerOptions": {
      "webpack": false
    }
  }
```

## How to use

1. Install package
```bash
npm i --save-dev get-function-location @brickmate/api-mapper
```

2. Emplement
  
> Edit file `src/main.ts`

```typescript
import { BMGApiMapper } from '@brickmate/api-mapper';

async function bootstrap() {

  ...

  if (process.env.NODE_ENV === 'development') {

    ...

    await BMGApiMapper.scanApi(app);
    
  }

  ...
}
```
3. Get report in table format

```
http://localhost:3000/api-document-html
```
![Table format](https://raw.githubusercontent.com/bm-jack-tran/bmg-api-mapper/main/html.png)

1. Get detail in JSON

```
http://localhost:3000/api-document-json
```
![Json format](https://raw.githubusercontent.com/bm-jack-tran/bmg-api-mapper/main/json.png)

## Author
```Jack Tran BMG```

