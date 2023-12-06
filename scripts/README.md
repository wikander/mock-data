# Scripts

## Generate
Script for generating "realistic" and GDPR-compliant mock data for test, debugging and development.

### Run script
Run the scripts locally by:

#### Installing [Deno](https://deno.land/#installation)

```
brew install deno
```

#### Create blueprint
Create a .blueprint.json-file in analogy with the test blueprint [generate-test.blueprint.json](./generate/generate-test.blueprint.json). E.g.: 

```
/path/to/mock/mock.blueprint.json
```

#### Run
In the scripts/generate directory run:

```
deno run --allow-read --allow-write index.ts ../../path/to/mock/mock.blueprint.json
```

The output will be found in /path/to/mock/mock.json.

#### Push
Push your new files (including the blueprint) to master branch.

# Mockserver
For local development purposes you can use the mockserver by running in the scripts dir:
```
  deno run --unstable --allow-net --allow-read mockserver.ts
```
