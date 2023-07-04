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
    ].concat([
        {from: '헤이즈', to: 'Heize'},
        {from: '아이브', to: 'IVE'},
        {from: '아이유', to: 'IU'},
        {from: '있지', to: 'Itzy'},
        {from: '테이', to: 'Tei'},
        {from: '어반 ?자카파', to: 'Urban Zakapa'},
        {from: '멜로망스', to: 'MeloMance'},
        {from: '르 ?세라핌', to: 'LE SSERAFIM'},
        {from: '지코', to: 'Zico'},
        {from: '스테이씨', to: 'STAYC'},
    ].map(fromTo => ({
        pattern: new RegExp(`(?<=^|\\P{L})${fromTo.from}(?=\\P{L}|$)`, 'gui'),
        replacement: fromTo.to,
    })));

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
                //    /\b테이\b/gui
                //    테이 스테이 스테이크 테이크 a테이 테이A 테이 테이
                //    테이 노노노 노노노노 노노노 n노노 노노A 테이 테이
                const pathFileReplaced = pathFile.replaceAll(new RegExp(`(?<=^|\\P{L})${r.replacement}(?=\\P{L}|$) ?\\(${r.replacement}\\)`, 'gui'), r.replacement)
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
