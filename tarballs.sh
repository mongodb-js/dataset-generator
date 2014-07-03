#!/bin/bash

mongo --eval "db.dropDatabase()"
node cli.js --size=1000 --schemaPath=./examples/one_to_many.json --collection=otm
node cli.js --size=1000 --schemaPath=./examples/one_to_one.json --collection=oto
node cli.js --size=1000 --schemaPath=./examples/kw_search.json --collection=ks
node cli.js --size=1000 --schemaPath=./examples/atomic_ops.json --collection=ao
mongoexport --db test --collection oto --out examples/one_to_one-sample.json
mongoexport --db test --collection otm --out examples/one_to_many-sample.json
mongoexport --db test --collection  ao --out examples/atomic_ops-sample.json
mongoexport --db test --collection  ks --out examples/kw_search-sample.json
