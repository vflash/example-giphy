PATH := ./node_modules/.bin:${PATH}
SCMOD_MAX = -min

all: npm pack build

watch:
	NODE_ENV=development ./node_modules/.bin/webpack -w

pack-dev:
	NODE_ENV=development ./node_modules/.bin/webpack

pack:
	./node_modules/.bin/webpack

npm:
	npm install ./ ;

build:
	./bin/build-create $(build-number)

clear:
	find ./ -name "*..css" -delete;
	find ./ -name "*..js" -delete;

