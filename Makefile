ENV=test
REPORTER = spec
BIN = node_modules/.bin

test: jshint
	@NODE_ENV=$(ENV) $(BIN)/mocha --reporter $(REPORTER) 

.PHONY: test

jshint:
	@$(BIN)/jshint $(SRC_FILES)
