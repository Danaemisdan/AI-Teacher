export interface IContentProvider {
    /**
     * Initialize the provider (e.g., loading weights, establishing connection).
     */
    init(): Promise<void>;

    /**
     * Generate a response from the LLM.
     * @param messages The chat history/prompt.
     * @param onUpdate Optional callback for streaming responses.
     */
    generateResponse(
        messages: { role: string; content: string }[],
        onUpdate?: (chunk: string) => void
    ): Promise<string>;

    /**
     * Interrupt an ongoing generation request.
     */
    interrupt(): void;

    /**
     * Flag indicating if the provider is fully loaded and ready.
     */
    isLoaded: boolean;
    
    /**
     * Flag indicating if the provider is currently initializing.
     */
    isLoading: boolean;

    /**
     * Current status or progress text (useful for local models downloading).
     */
    progressText: string;

    /**
     * Loading progress percentage 0-1 (useful for local models).
     */
    progress: number;
}
