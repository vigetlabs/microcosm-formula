MAKEFLAGS += -j 4

build: compile min es6

compile:
	@ ./scripts/build

min:
	@ ./scripts/build --minify --out=build/min

es6:
	@ ./scripts/build --format=es --out=build/es

.PHONY: build compile min es
