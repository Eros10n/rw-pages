#!/usr/bin/env node

// console.log("rw-page")

process.argv.push("--cwd");
process.argv.push(process.cwd());
process.argv.push("--gulpfile");
process.argv.push(require.resolve(".."));

require("gulp/bin/gulp");
