import { TopicAnalysis, SubjectType, DifficultyLevel, EducationLevel, QuizType, ConfidenceScores, DecisionReasons } from './types';
import { safeJsonParse } from '../jsonHelper';

export class TopicAnalyzer {
    /**
     * Analyzes the educational request and returns structured JSON with confidence and reasoning.
     */
    static async analyze(
        query: string, 
        generateResponse: (messages: {role: string, content: string}[], onChunk?: (text: string) => void) => Promise<string>
    ): Promise<TopicAnalysis> {
        
        const systemPrompt = `You are the core Educational Intelligence Layer.
Your job is to analyze the user's educational request and return ONLY a strict JSON object mapping it to a curriculum taxonomy.
Include confidence scores (0-100) and human-readable reasons for your choices.
Do NOT wrap the JSON in markdown blocks. Do NOT output any conversational text.

Valid subjects: "Mathematics", "Physics", "Chemistry", "Biology", "Anatomy", "Astronomy", "Programming", "Computer Science", "Networking", "History", "Geography", "Civics", "Economics", "Finance", "Business", "Architecture", "AI/Machine Learning", "General".

Required JSON Output Format:
{
  "subject": "SubjectName",
  "topic": "Main Topic",
  "subtopic": "Specific Subtopic",
  "difficulty": "Beginner|Intermediate|Advanced|Expert",
  "educationLevel": "Elementary|Middle School|High School|College|Professional",
  "visualization": "Engine short name (e.g., echarts, threejs, mermaid, katex, molstar)",
  "notesTemplate": "Template style name",
  "quizType": "multiple_choice|graph|coding|diagram|none",
  "teachingStrategy": "Strategy ID (e.g., economics-standard, programming-standard)",
  "confidenceScores": {
    "subject": 99,
    "visualization": 95,
    "teachingStrategy": 90,
    "quiz": 90,
    "notes": 90
  },
  "decisionReasons": {
    "visualization": "Explain why this engine is best for this topic.",
    "teachingStrategy": "Explain why this pedagogical sequence fits this topic."
  }
}`;

        const userMessage = `Analyze this topic: "${query}"`;

        try {
            let fullOutput = "";
            await generateResponse([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ], (chunk) => {
                fullOutput = chunk;
            });

            const match = fullOutput.match(/\{[\s\S]*\}/);
            const jsonString = match ? match[0] : fullOutput;
            
            let parsed = safeJsonParse(jsonString, null) as any;

            if (!parsed) {
                console.warn("Topic Analyzer failed to parse LLM output into JSON. Falling back to default.");
                parsed = {};
            }
            
            // Calculate an overall confidence average safely
            const confs = parsed.confidenceScores || {};
            const overallConf = Math.round(
                ((confs.subject || 80) + 
                (confs.visualization || 80) + 
                (confs.teachingStrategy || 80) + 
                (confs.quiz || 80) + 
                (confs.notes || 80)) / 5
            );

            return {
                subject: parsed.subject as SubjectType || 'General',
                topic: parsed.topic || query,
                subtopic: parsed.subtopic || 'Overview',
                difficulty: parsed.difficulty as DifficultyLevel || 'Beginner',
                educationLevel: parsed.educationLevel as EducationLevel || 'High School',
                visualization: parsed.visualization || 'html',
                notesTemplate: parsed.notesTemplate || 'standard',
                quizType: parsed.quizType as QuizType || 'multiple_choice',
                teachingStrategy: parsed.teachingStrategy || 'default',
                confidenceScores: {
                    subject: confs.subject || 80,
                    visualization: confs.visualization || 80,
                    teachingStrategy: confs.teachingStrategy || 80,
                    quiz: confs.quiz || 80,
                    notes: confs.notes || 80,
                    overall: overallConf
                },
                decisionReasons: {
                    visualization: parsed.decisionReasons?.visualization || 'Fallback default selection.',
                    teachingStrategy: parsed.decisionReasons?.teachingStrategy || 'Fallback default strategy.'
                }
            };

        } catch (error) {
            console.error("TopicAnalyzer Error:", error);
            return {
                subject: 'General',
                topic: query,
                subtopic: 'Overview',
                difficulty: 'Beginner',
                educationLevel: 'High School',
                visualization: 'html',
                notesTemplate: 'standard',
                quizType: 'multiple_choice',
                teachingStrategy: 'default',
                confidenceScores: { subject: 0, visualization: 0, teachingStrategy: 0, quiz: 0, notes: 0, overall: 0 },
                decisionReasons: {
                    visualization: 'Failed to generate.',
                    teachingStrategy: 'Failed to generate.'
                }
            };
        }
    }
}
