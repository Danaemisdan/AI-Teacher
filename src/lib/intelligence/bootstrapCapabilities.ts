import { CapabilityHealthManager } from './CapabilityHealthManager';

export function bootstrapCapabilities() {
    // Core Services
    CapabilityHealthManager.registerCapability({
        id: 'webllm', name: 'WebLLM Engine', category: 'Core', status: 'READY', healthScore: 100,
        features: { supportsCaching: true }, fallbacks: ['ollama', 'cloud-llm']
    });
    CapabilityHealthManager.registerCapability({
        id: 'knowledge-retrieval', name: 'Knowledge DB', category: 'Core', status: 'READY', healthScore: 100,
        features: { supportsCaching: true }, fallbacks: []
    });
    CapabilityHealthManager.registerCapability({
        id: 'asset-manager', name: 'Asset Manager', category: 'Core', status: 'READY', healthScore: 100,
        features: { supportsCaching: true }, fallbacks: []
    });

    // Teaching Services
    CapabilityHealthManager.registerCapability({
        id: 'topic-analyzer', name: 'Topic Analyzer', category: 'Teaching', status: 'READY', healthScore: 100,
        features: {}, fallbacks: []
    });
    CapabilityHealthManager.registerCapability({
        id: 'lesson-planner', name: 'Lesson Planner', category: 'Teaching', status: 'READY', healthScore: 100,
        features: {}, fallbacks: []
    });

    // Visualization Engines
    CapabilityHealthManager.registerCapability({
        id: 'echarts', name: 'Apache ECharts', category: 'Visualization', status: 'READY', healthScore: 100,
        features: { supportsInteraction: true, supportsHighlighting: true, supportsDisposal: true }, 
        fallbacks: ['svg-graph', 'html']
    });
    CapabilityHealthManager.registerCapability({
        id: 'threejs', name: 'ThreeJS', category: 'Visualization', status: 'READY', healthScore: 95,
        features: { supportsInteraction: true, supportsHighlighting: true, supportsDisposal: true, supportsAnimation: true }, 
        fallbacks: ['interactive-svg']
    });
    CapabilityHealthManager.registerCapability({
        id: 'mermaid', name: 'Mermaid Flowcharts', category: 'Visualization', status: 'READY', healthScore: 100,
        features: { supportsInteraction: false, supportsHighlighting: true }, 
        fallbacks: ['html']
    });
    CapabilityHealthManager.registerCapability({
        id: 'monaco-editor', name: 'Monaco Code Editor', category: 'Visualization', status: 'READY', healthScore: 100,
        features: { supportsInteraction: true, supportsHighlighting: true, supportsDisposal: true }, 
        fallbacks: ['html']
    });
    CapabilityHealthManager.registerCapability({
        id: 'katex', name: 'KaTeX Math', category: 'Visualization', status: 'READY', healthScore: 100,
        features: { supportsInteraction: false, supportsHighlighting: false }, 
        fallbacks: ['html']
    });
    CapabilityHealthManager.registerCapability({
        id: 'timeline-engine', name: 'Timeline Engine', category: 'Visualization', status: 'NOT_AVAILABLE', healthScore: 0,
        features: { supportsInteraction: true, supportsHighlighting: true }, 
        fallbacks: ['html'], reason: 'Not yet implemented in Phase 3.'
    });
    CapabilityHealthManager.registerCapability({
        id: 'molstar', name: 'Molstar 3D', category: 'Visualization', status: 'NOT_AVAILABLE', healthScore: 0,
        features: { supportsInteraction: true }, 
        fallbacks: ['threejs'], reason: 'Module not installed.'
    });
    CapabilityHealthManager.registerCapability({
        id: 'html', name: 'Static HTML', category: 'Visualization', status: 'READY', healthScore: 100,
        features: { supportsInteraction: false, supportsHighlighting: false }, 
        fallbacks: []
    });

    // Presentation Services
    CapabilityHealthManager.registerCapability({
        id: 'avatar', name: 'Live2D Avatar', category: 'Presentation', status: 'READY', healthScore: 100,
        features: { supportsAnimation: true, supportsAudioSync: true }, 
        fallbacks: ['static-avatar']
    });
    CapabilityHealthManager.registerCapability({
        id: 'tts', name: 'Edge TTS', category: 'Presentation', status: 'READY', healthScore: 100,
        features: { supportsCaching: true }, 
        fallbacks: ['web-speech-api']
    });
    CapabilityHealthManager.registerCapability({
        id: 'execution-timeline', name: 'Timeline Orchestrator', category: 'Presentation', status: 'NOT_AVAILABLE', healthScore: 0,
        features: {}, 
        fallbacks: [], reason: 'Scheduled for Phase 4 implementation.'
    });
}
