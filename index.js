const fs = require("fs");
const fse = require('fs-extra');

const dryRun = false;
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
    ];

    const rename = (src, dst) => {
        if(fs.existsSync(dst))
            return rename(src, dst + '_');

        fse.move(src, dst);
    }

    await traversePath({
        onFile: f => {
            arrayRegex.forEach(r => {
                const newName = f.replace(r.pattern, r.replacement);
                if(f === newName)
                    return;

                console.log(`detected\n${f}\n${newName}`);
                if(dryRun)
                    return;

                rename(f, newName);
            })
            arrayRegex.forEach(r => {
                const replacement = r.replacement.replace(/\s+/, '');
                const redundant = new RegExp(`${replacement} ?\\(${replacement}\\)`, 'i');
                const newName = f.replace(redundant, replacement);
                if(f === newName)
                    return;

                console.log(`redundant\n${f}\n${newName}`);
                if(dryRun)
                    return;

                rename(f, newName);
            })
        },
    });
})();
