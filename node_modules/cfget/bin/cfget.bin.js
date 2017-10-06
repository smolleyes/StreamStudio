#!/usr/bin/env node
try {
  require('../cfget')();
} catch (e) {
  process.exit(1);
}
