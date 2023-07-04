const fs = require("fs");
const fse = require('fs-extra');

const dryRun = true;
const verbose = true;

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
};

(async () => {
    // noinspection SpellCheckingInspection
    const arrayRegex = [
        {pattern: /  +/, replacement: ' '},
        {pattern: /헤이즈/, replacement: 'Heize'},
        {pattern: /아이브/, replacement: 'IVE'},
        {pattern: /아이유/, replacement: 'IU'},
        {pattern: /있지/, replacement: 'Itzy'},
        {pattern: /테이\s/, replacement: 'Tei '},
        {pattern: /어반 ?자카파/, replacement: 'Urban Zakapa'},
        {pattern: /멜로망스/, replacement: 'MeloMance'},
        {pattern: /르세라핌/, replacement: 'LE SSERAFIM'},
    ];

    const rename = (src, dst) => {
        if(fs.existsSync(dst))
            return rename(src, dst + '_');

        fse.move(src, dst);
    }

    await traversePath({
        onFile: pathFile => {
            arrayRegex.forEach(r => {
                const newName = pathFile.replace(r.pattern, r.replacement);
                if(pathFile === newName)
                    return;

                console.log(`detected\n${pathFile}\n${newName}`);
                if(dryRun)
                    return;

                rename(pathFile, newName);
            })
            arrayRegex.forEach(r => {
                // workaround for
                //    /\b테이\b/gu
                //    테이 스테이 스테이크 테이크 a테이 테이A 테이 테이
                //    테이 노노노 노노노노 노노노 n노노 노노A 테이 테이
                const pathFileReplaced = pathFile.replaceAll(new RegExp(`(?<=^|\\P{L})${r.replacement}(?=\\P{L}|$) ?\\(${r.replacement}\\)`, 'gu'), r.replacement)
                if(pathFile === pathFileReplaced)
                    return;

                console.log(`--------\n${pathFile}\n${pathFileReplaced}`);
                if(dryRun)
                    return;

                rename(pathFile, pathFileReplaced);
            })
        },
    });
})();
