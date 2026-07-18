export interface IIntelligenceModule {
    name: string;
    execute(context: any): Promise<any>;
}

export class IntelligencePipeline {
    private modules: IIntelligenceModule[] = [];

    registerModule(module: IIntelligenceModule) {
        this.modules.push(module);
    }

    async process(initialContext: any): Promise<any> {
        let currentContext = { ...initialContext };
        for (const module of this.modules) {
            console.log(`[IntelligencePipeline] Executing: ${module.name}`);
            currentContext = await module.execute(currentContext);
        }
        return currentContext;
    }
}

export const intelligencePipeline = new IntelligencePipeline();
