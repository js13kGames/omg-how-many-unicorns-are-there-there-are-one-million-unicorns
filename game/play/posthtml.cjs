const fs = require("fs");
const posthtml = require("posthtml");

if (process.argv.length !== 3) {
    console.log(`Usage: ${process.argv[1]} INPUT`);
    process.exit(1);
}

let content = fs.readFileSync(process.argv[2], "utf8")
    .replace('type="module" src="./index.js"', 'src="game.roadroller.js"')
    .replace('href="../play/game.css"', 'href="game.css"')
    .replace('src="./sprites/', 'src="../src/sprites/');
let processor = posthtml([
    require("posthtml-inline-assets")(),
    require("htmlnano")({
        collapseAttributeWhitespace: true,
        collapseBooleanAttributes: true,
        collapseWhitespace: "conservative",
        deduplicateAttributeValues: true,
        mergeScripts: true,
        mergeStyles: true,
        minifyCss: true,
        minifyJs: false,
        minifySvg: false,
        removeComments: "all",
        removeEmptyAttributes: true,
        removeRedundantAttributes: false,
        removeUnusedCss: false,
    }),
]);

processor
    .process(content.toString(), {
        quoteAllAttributes: false,
    })
    .then((result) => console.log(result.html))
    .catch((error) => { console.error(error); process.exitCode = 1; });
