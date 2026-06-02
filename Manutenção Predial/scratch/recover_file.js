const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\Instrutor\\.gemini\\antigravity\\brain\\7e07d288-9874-4086-94e8-eb9e588f6b5d\\.system_generated\\logs\\transcript.jsonl';
const targetFile = 'corretivas.php';

async function processTranscript() {
    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let linesMap = new Map();

    for await (const line of rl) {
        if (!line.trim()) continue;
        try {
            const entry = JSON.parse(line);
            if (entry.type === 'TOOL_CALL_RESULT' && entry.content && entry.content.includes(targetFile)) {
                // Parse the view_file output
                const contentLines = entry.content.split('\n');
                let capturing = false;
                for (const cLine of contentLines) {
                    if (cLine.startsWith('The following code has been modified')) {
                        capturing = true;
                        continue;
                    }
                    if (cLine.startsWith('The above content does NOT show')) {
                        capturing = false;
                        continue;
                    }
                    if (capturing) {
                        const match = cLine.match(/^(\d+):\s(.*)$/);
                        if (match) {
                            const lineNum = parseInt(match[1]);
                            const lineText = match[2];
                            linesMap.set(lineNum, lineText);
                        }
                    }
                }
            }
        } catch (e) {
            // ignore
        }
    }

    const maxLine = Math.max(...Array.from(linesMap.keys()));
    let output = '';
    for (let i = 1; i <= maxLine; i++) {
        output += (linesMap.has(i) ? linesMap.get(i) : `// MISSING LINE ${i}`) + '\n';
    }

    fs.writeFileSync('C:\\Users\\Instrutor\\OneDrive - SESISENAISP - Corporativo\\PESSOAL\\Documents\\ANTIGRAVITY\\Manutenção Predial\\public\\views\\corretivas.php', output);
    console.log(`Recovered ${maxLine} lines. Saved to corretivas.php`);
}

processTranscript();
