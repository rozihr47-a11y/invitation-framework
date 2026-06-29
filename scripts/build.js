const fs = require("fs");
const path = require("path");

const files = [

    // Core
    "js/core/bootstrap.js",
    "js/core/config.js",
    "js/core/state.js",
    "js/core/utils.js",
    "js/core/dom.js",
    "js/core/init.js",

    // Debug
    "js/debug/flags.js",
    "js/debug/logger.js",

    // Main
    "js/main.js"

];

let output = "";

// Header
output += "/**\n";
output += " * Invitation Framework\n";
output += " * Generated File\n";
output += " * Do NOT edit directly.\n";
output += " */\n\n";

files.forEach(file => {

    output += "\n";
    output += "// ======================================\n";
    output += "// " + file + "\n";
    output += "// ======================================\n\n";

    output += fs.readFileSync(
        path.join(__dirname, "..", file),
        "utf8"
    );

    output += "\n\n";

});

fs.mkdirSync(
    path.join(__dirname, "..", "build"),
    { recursive: true }
);

fs.writeFileSync(

    path.join(
        __dirname,
        "..",
        "build",
        "main.js"
    ),

    output

);

console.log("✅ build/main.js generated");