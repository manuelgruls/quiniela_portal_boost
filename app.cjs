// app.cjs wrapper
const app = require("./dist/server/index.cjs");
module.exports = app.default || app;
