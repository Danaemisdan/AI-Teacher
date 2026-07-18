export interface ISubsystemExecutor {
    initialize(): void;
    execute(): void;
    cancel(): void;
    dispose(): void;
}
