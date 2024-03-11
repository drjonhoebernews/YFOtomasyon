const { exec } = require('child_process');

function runScript() {
    const script = exec('node YFOtomasyon.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });

    script.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
setInterval(runScript, 120000);
runScript();
