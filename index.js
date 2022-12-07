const fs = require("fs");
const fse = require('fs-extra');

const verbose = false;

const traversePath = async (
    {
        path = '.',
        onPath = p => {},
        onDir = d => {},
        onFile = f => {},
        includeDotPath = false,
    }
) => {
    if(verbose) console.log(path);
    const list = await fse.readdir(path);
    list.forEach(v => {
        if (!includeDotPath && v.startsWith('.'))
            return;

        const child = `${path}/${v}`;
        const lstat = fs.lstatSync(child);
        onPath(child);


        if (lstat.isDirectory()) {
            onDir(child);
            traversePath({path: child, onPath, onDir, onFile});
        }

        if (lstat.isFile()) {
            onFile(child);
        }
    });
}

(async () => {
    const arrayRegex = [
        {pattern: /  +/, replacement: ' '},
        {pattern: /헤이즈/, replacement: 'Heize'},
        {pattern: /아이브/, replacement: 'IVE'},
    ];

    traversePath({
        onFile: f => {
            arrayRegex.forEach(r => {
                const newName = f.replace(r.pattern, r.replacement);
                if(f === newName)
                    return;

                console.log(`detected ${f} -> ${newName}`);
                fse.move(f, newName);
            })
            arrayRegex.forEach(r => {
                const redundant = new RegExp(`${r.replacement} ?\\(${r.replacement}\\)`);
                const newName = f.replace(redundant, r.replacement);
                if(f === newName)
                    return;

                console.log(`redundant ${f} -> ${newName}`);
                fse.move(f, newName);
            })
        },
    });
})();
