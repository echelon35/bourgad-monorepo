export function csvJSONArray(csv: string): Array<Record<string, string>> {
    const lines = csv.split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim());
    const result: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue; // Ignore les lignes vides

        const currentLine = parseLine(lines[i]);
        const obj: Record<string, string> = {};

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : '';
        }

        result.push(obj);
    }

    return result;
}

function parseLine(line: string){
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Guillemet échappé : on l'ajoute au champ et on saute le prochain guillemet
                currentField += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }

    // Ajoute le dernier champ
    result.push(currentField.trim());
    return result;
}