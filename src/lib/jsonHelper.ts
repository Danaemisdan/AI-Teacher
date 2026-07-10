/**
 * A robust JSON parser designed to safely parse LLM-generated JSON strings.
 * It handles common LLM formatting issues like markdown code blocks and trailing commas.
 * 
 * @param jsonString The raw string to parse.
 * @param fallback The fallback object to return if parsing completely fails.
 * @returns The parsed object or the fallback.
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
    if (!jsonString) return fallback;

    let cleanStr = jsonString.trim();

    // Remove markdown code blocks (e.g. ```json ... ``` or ``` ...)
    if (cleanStr.startsWith('```')) {
        const lines = cleanStr.split('\n');
        // Remove first line if it's the opening markdown tag
        if (lines[0].startsWith('```')) {
            lines.shift();
        }
        // Remove last line if it's the closing markdown tag
        if (lines.length > 0 && lines[lines.length - 1].trim().startsWith('```')) {
            lines.pop();
        }
        cleanStr = lines.join('\n').trim();
    }

    // Fix trailing commas in arrays and objects, a very common LLM hallucination
    cleanStr = cleanStr.replace(/,\s*([}\]])/g, '$1');

    try {
        // Try parsing cleanly first to preserve any valid formatting
        return JSON.parse(cleanStr) as T;
    } catch (e: any) {
        // If it fails, it might be due to unescaped literal newlines inside string values.
        // We apply the aggressive newline strip as a last resort.
        const flatStr = cleanStr.replace(/[\n\r\t]/g, ' ');
        try {
            return JSON.parse(flatStr) as T;
        } catch (fallbackError: any) {
            console.warn("[safeJsonParse] Failed to parse JSON safely:", e.message, "Raw string:", jsonString);
            return fallback;
        }
    }
}
