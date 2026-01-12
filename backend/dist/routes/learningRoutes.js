"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const { PDFParse } = require('pdf-parse');
const db_1 = require("../utils/db");
const llm_1 = require("../agent/llm");
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ error: 'No file uploaded' });
        const dataBuffer = fs_1.default.readFileSync(req.file.path);
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        await parser.destroy();
        const extractedText = data.text;
        // Save metadata
        const material = await db_1.prisma.learningMaterial.create({
            data: {
                // @ts-ignore
                userId: req.userId, // Added by requireAuth
                filename: req.file.originalname,
                fileType: 'pdf',
                extractedText: extractedText
            }
        });
        // 2. Generate Summary via LLM
        const summaryPrompt = `
        Analyze the following document and create a comprehensive, structured summary.
        
        Document text:
        ${extractedText.substring(0, 8000)}
        
        Generate a JSON response with this exact structure:
        {
          "title": "Brief title for the document",
          "overview": "2-3 sentence high-level summary",
          "keyConcepts": [
            { "concept": "Concept name", "explanation": "1-2 sentence explanation" }
          ],
          "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
          "topics": ["Topic 1", "Topic 2"]
        }
        
        Make it educational and clear. Include 4-6 key concepts and 3-5 takeaways.
        `;
        const summaryRes = await (0, llm_1.callLLM)({ userPrompt: summaryPrompt });
        // 3. Save Summary Artifact
        await db_1.prisma.learningArtifact.create({
            data: {
                learningMaterialId: material.id,
                type: 'summary',
                artifactJson: JSON.stringify(summaryRes)
            }
        });
        // Cleanup temp file
        fs_1.default.unlinkSync(req.file.path);
        res.json({ message: "File processed", materialId: material.id, summary: summaryRes });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/:id/summary', async (req, res) => {
    try {
        const artifacts = await db_1.prisma.learningArtifact.findMany({
            where: { learningMaterialId: req.params.id, type: 'summary' },
            orderBy: { createdAt: 'desc' },
            take: 1
        });
        if (artifacts.length > 0) {
            res.json(JSON.parse(artifacts[0].artifactJson));
        }
        else {
            res.status(404).json({ error: "No summary found" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/:id/graph', async (req, res) => {
    try {
        const material = await db_1.prisma.learningMaterial.findUnique({
            where: { id: req.params.id }
        });
        if (!material || !material.extractedText) {
            return res.status(404).json({ error: 'Material not found' });
        }
        // Check if graph already exists
        const existing = await db_1.prisma.learningArtifact.findFirst({
            where: { learningMaterialId: req.params.id, type: 'graph' }
        });
        if (existing) {
            return res.json(JSON.parse(existing.artifactJson));
        }
        // Generate Knowledge Graph via LLM
        const graphPrompt = `
        Analyze the following document and create a knowledge graph showing the relationships between key concepts.
        
        Document text:
        ${material.extractedText.substring(0, 8000)}
        
        Generate a JSON object with this exact structure:
        {
          "nodes": [
            { "id": "1", "label": "Concept Name", "type": "main" | "sub" }
          ],
          "edges": [
            { "from": "1", "to": "2", "label": "relationship type" }
          ]
        }
        
        Rules:
        - Create 8-15 nodes representing key concepts
        - Use "main" type for primary concepts, "sub" for supporting concepts
        - Create edges showing how concepts relate (e.g., "leads to", "requires", "part of", "enables")
        - Make the graph connected and meaningful
        - Use simple, clear labels
        `;
        const graphRes = await (0, llm_1.callLLM)({ userPrompt: graphPrompt });
        // Save Graph Artifact
        await db_1.prisma.learningArtifact.create({
            data: {
                learningMaterialId: material.id,
                type: 'graph',
                artifactJson: JSON.stringify(graphRes)
            }
        });
        res.json(graphRes);
    }
    catch (error) {
        console.error('Graph generation error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/:id/mcq', async (req, res) => {
    try {
        const material = await db_1.prisma.learningMaterial.findUnique({
            where: { id: req.params.id }
        });
        if (!material || !material.extractedText) {
            return res.status(404).json({ error: 'Material not found' });
        }
        // Check if MCQ already exists
        const existing = await db_1.prisma.learningArtifact.findFirst({
            where: { learningMaterialId: req.params.id, type: 'mcq' }
        });
        if (existing) {
            return res.json(JSON.parse(existing.artifactJson));
        }
        // Generate MCQ via LLM
        const mcqPrompt = `
        Based on the following document, generate 7-10 multiple choice questions to test understanding.
        
        Document text:
        ${material.extractedText.substring(0, 8000)}
        
        Generate a JSON array with this exact structure:
        [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Why this answer is correct"
          }
        ]
        
        Rules:
        - Make questions test actual understanding, not just memorization
        - Include 4 options per question
        - correctAnswer is the index (0-3) of the correct option
        - Provide a brief explanation for each answer
        - Cover different topics from the document
        `;
        const mcqRes = await (0, llm_1.callLLM)({ userPrompt: mcqPrompt });
        // Save MCQ Artifact
        await db_1.prisma.learningArtifact.create({
            data: {
                learningMaterialId: material.id,
                type: 'mcq',
                artifactJson: JSON.stringify(mcqRes)
            }
        });
        res.json(mcqRes);
    }
    catch (error) {
        console.error('MCQ generation error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
