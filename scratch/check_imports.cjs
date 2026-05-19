const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

function checkImports() {
    const files = walk(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
    const importRe = /from\s+['"]([^'"]+)['"]/g;
    const errors = [];

    files.forEach(filepath => {
        const content = fs.readFileSync(filepath, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, lineNo) => {
            let match;
            // Reset regex lastIndex
            importRe.lastIndex = 0;
            while ((match = importRe.exec(line)) !== null) {
                const importPath = match[1];
                if (!importPath.startsWith('.')) continue;

                const currentDir = path.dirname(filepath);
                const targetPath = path.normalize(path.join(currentDir, importPath));

                // Verify casing of each segment on disk
                const parts = targetPath.split(path.sep);
                
                // Start check from root or drive
                let currentCheck = parts[0].endsWith(':') ? parts[0] + path.sep : parts[0];
                let extMatched = false;

                for (let i = 1; i < parts.length; i++) {
                    const part = parts[i];
                    if (!part) continue;
                    if (!fs.existsSync(currentCheck)) break;

                    const items = fs.readdirSync(currentCheck);
                    const matched = items.filter(item => item.toLowerCase() === part.toLowerCase());

                    if (matched.length === 0) {
                        // Extension omission check on last part
                        if (i === parts.length - 1) {
                            const possibleFiles = items.filter(item => {
                                const base = path.basename(item, path.extname(item));
                                return base.toLowerCase() === part.toLowerCase();
                            });
                            if (possibleFiles.length > 0) {
                                const actualFile = possibleFiles[0];
                                const base = path.basename(actualFile, path.extname(actualFile));
                                if (base !== part) {
                                    errors.push({
                                        file: filepath,
                                        line: lineNo + 1,
                                        import: importPath,
                                        actual: actualFile,
                                        reason: `Case mismatch: imported '${part}', actual file is '${actualFile}'`
                                    });
                                }
                                extMatched = true;
                            }
                        }
                        break;
                    }

                    const actualName = matched[0];
                    if (actualName !== part) {
                        const isLast = (i === parts.length - 1);
                        if (isLast) {
                            // Check if last part represents a directory or file
                            const fullCheckPath = path.join(currentCheck, actualName);
                            const stat = fs.statSync(fullCheckPath);
                            if (!stat.isDirectory()) {
                                errors.push({
                                    file: filepath,
                                    line: lineNo + 1,
                                    import: importPath,
                                    actual: actualName,
                                    reason: `Case mismatch in filename: imported '${part}', actual is '${actualName}'`
                                });
                            }
                        } else {
                            errors.push({
                                file: filepath,
                                line: lineNo + 1,
                                import: importPath,
                                actual: actualName,
                                reason: `Case mismatch in directory segment: imported '${part}', actual is '${actualName}'`
                            });
                        }
                    }
                    currentCheck = path.join(currentCheck, actualName);
                }
            }
        });
    });

    if (errors.length > 0) {
        console.log(`FOUND ${errors.length} CASE-SENSITIVITY IMPORT ERRORS:`);
        errors.forEach(err => {
            console.log(`- File: ${err.file}:${err.line}`);
            console.log(`  Imported: '${err.import}'`);
            console.log(`  Reason: ${err.reason}\n`);
        });
    } else {
        console.log("CONGRATULATIONS! 0 CASE-SENSITIVITY IMPORT ERRORS FOUND!");
    }
}

checkImports();
