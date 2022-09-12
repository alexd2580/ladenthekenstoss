install:
    npm i

build:
    rm -rf dist/*
    npx tsc

mts path *args:
    node --loader ts-node/esm {{path}} {{args}}

_dev:
    npx tsc
    just mts src/server/main.mts

dev: (mts "watch.mts" "-p" "src" "-c" "just" "_dev" "-v")
