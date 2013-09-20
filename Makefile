REPORTER = spec

test:
	@./node_modules/.bin/mocha --reporter $(REPORTER) $(T) $(TESTS)

.PHONY: test
