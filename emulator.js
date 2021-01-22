const exec = require("child_process").exec
const fs = require("fs");
const path = require("path");

let commandToRun = "";

function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

function runEmulator() {
    commandToRun = "npm run emulator";
}

setInterval(() => {
    if (commandToRun != "") {
        console.log("Change detected, Sending to emulator.")
        exec(commandToRun, (_err, stdout, stderr) => {
            console.log("Emulator responed with:\n", stdout, stderr)
        })
    };
    commandToRun = "";
}, 1000);

runEmulator();
walk("public", (err, res) => {
    if (err) {
        throw err;
    }

    for (const file of res) {
        fs.watchFile(file, {}, runEmulator);
    }
})

// for (const file of walk("public")) {
//     console.log(file);
// }