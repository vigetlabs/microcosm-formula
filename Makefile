MAKEFLAGS += -j 4
SRC = $(shell find src -name '*.js*' | grep -v ".test")

rollup = node_modules/.bin/rollup
buble = node_modules/.bin/buble

build: $(SRC:src/%=lib/%)
	@ $(rollup) --output.format cjs lib/formula.js > lib/formula.min.js

lib/%.js: src/%.js
	@ mkdir -p lib
	@ $(buble) --no modules $< > $@
	@ echo "[+]" $@

.PHONY: bench
