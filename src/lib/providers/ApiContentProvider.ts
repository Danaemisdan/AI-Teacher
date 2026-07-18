import { IContentProvider } from './IContentProvider';

export class ApiContentProvider implements IContentProvider {
    public isLoaded = true;
    public isLoading = false;
    public progressText = "Ready";
    public progress = 1;
    
    private abortController: AbortController | null = null;

    async init(): Promise<void> {
        // Nothing to init for backend API
        this.isLoaded = true;
        this.isLoading = false;
    }

    async generateResponse(
        messages: { role: string; content: string }[],
        onUpdate?: (chunk: string) => void
    ): Promise<string> {
        this.abortController = new AbortController();
        
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages }),
                signal: this.abortController.signal
            });

            if (!res.ok) {
                throw new Error("Backend generation failed");
            }

            if (onUpdate && res.body) {
                const reader = res.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let fullText = "";
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    fullText += chunk;
                    onUpdate(fullText);
                }
                return fullText;
            } else {
                const data = await res.json();
                if (onUpdate) onUpdate(data.reply);
                return data.reply;
            }
        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.log("Generation interrupted");
                return "";
            }
            throw e;
        } finally {
            this.abortController = null;
        }
    }

    interrupt(): void {
        if (this.abortController) {
            this.abortController.abort();
        }
    }
}
