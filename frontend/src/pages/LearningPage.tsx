import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LearningPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'summary' | 'graph' | 'quiz'>('summary');
    const [summaryData, setSummaryData] = useState<any>(null);
    const [mcqData, setMcqData] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<any>(null);
    const [materialId, setMaterialId] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    const [generatingGraph, setGeneratingGraph] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
    const [showResults, setShowResults] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        try {
            const res = await import('../services/api').then(m => m.uploadLearningMaterial(e.target.files![0]));
            if (res.summary) {
                setSummaryData(res.summary);
                setMaterialId(res.materialId);
                alert('Upload successful! Summary generated.');
            }
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        if (!materialId) return;
        setGeneratingQuiz(true);
        try {
            const res = await import('../services/api').then(m => m.generateMCQ(materialId));
            setMcqData(Array.isArray(res) ? res : []);
            setActiveTab('quiz');
            alert('Quiz generated!');
        } catch (err: any) {
            alert('Quiz generation failed: ' + err.message);
        } finally {
            setGeneratingQuiz(false);
        }
    };

    const handleGenerateGraph = async () => {
        if (!materialId) return;
        setGeneratingGraph(true);
        try {
            const res = await import('../services/api').then(m => m.generateGraph(materialId));
            setGraphData(res);
            setActiveTab('graph');
            alert('Knowledge graph generated!');
        } catch (err: any) {
            alert('Graph generation failed: ' + err.message);
        } finally {
            setGeneratingGraph(false);
        }
    };

    const handleSubmitQuiz = () => {
        setShowResults(true);
    };

    const calculateScore = () => {
        let correct = 0;
        mcqData.forEach((q, i) => {
            if (userAnswers[i] === q.correctAnswer) correct++;
        });
        return correct;
    };

    // Simple graph layout algorithm
    const layoutGraph = (nodes: any[]) => {
        const radius = 200;
        const centerX = 300;
        const centerY = 250;

        return nodes.map((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            return {
                ...node,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={() => navigate('/')}>&larr; Back to Dashboard</button>
                <button onClick={() => navigate('/files')} style={{ background: '#10b981' }}>📁 Your Files</button>
            </div>
            <h1>Learning Materials</h1>

            <div className="card">
                <h3>Upload New Material</h3>
                <input type="file" onChange={handleUpload} disabled={uploading} accept=".pdf" />
                {uploading && <span style={{ marginLeft: '1rem' }}>Uploading & Processing...</span>}
                {materialId && (
                    <>
                        <button
                            onClick={handleGenerateQuiz}
                            disabled={generatingQuiz}
                            style={{ marginLeft: '1rem', background: '#535bf2' }}
                        >
                            {generatingQuiz ? 'Generating...' : 'Generate Quiz'}
                        </button>
                        <button
                            onClick={handleGenerateGraph}
                            disabled={generatingGraph}
                            style={{ marginLeft: '0.5rem', background: '#10b981' }}
                        >
                            {generatingGraph ? 'Generating...' : 'Generate Graph'}
                        </button>
                        {summaryData && (
                            <>
                                <button
                                    onClick={async () => {
                                        try {
                                            await import('../services/api').then(m =>
                                                m.saveLearningSession('document.pdf', summaryData, null, null)
                                            );
                                            alert('Summary saved!');
                                        } catch (e: any) {
                                            alert('Save failed: ' + e.message);
                                        }
                                    }}
                                    style={{ marginLeft: '0.5rem', background: '#f59e0b' }}
                                >
                                    💾 Save Summary
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await import('../services/api').then(m =>
                                                m.saveLearningSession('document.pdf', summaryData, graphData, mcqData.length > 0 ? mcqData : null)
                                            );
                                            alert('Everything saved!');
                                        } catch (e: any) {
                                            alert('Save failed: ' + e.message);
                                        }
                                    }}
                                    style={{ marginLeft: '0.5rem', background: '#8b5cf6' }}
                                >
                                    💾 Save Everything
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button onClick={() => setActiveTab('summary')} style={{ opacity: activeTab === 'summary' ? 1 : 0.6 }}>Summary</button>
                <button onClick={() => setActiveTab('graph')} style={{ opacity: activeTab === 'graph' ? 1 : 0.6 }}>Knowledge Graph</button>
                <button onClick={() => setActiveTab('quiz')} style={{ opacity: activeTab === 'quiz' ? 1 : 0.6 }}>Quiz</button>
            </div>

            <div className="card" style={{ minHeight: '300px' }}>
                {activeTab === 'summary' && (
                    <div>
                        <h3>Summary</h3>
                        {summaryData ? (
                            <div>
                                {summaryData.title && <h2 style={{ marginTop: 0 }}>{summaryData.title}</h2>}

                                {summaryData.overview && (
                                    <div style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                        <strong>Overview:</strong>
                                        <p>{summaryData.overview}</p>
                                    </div>
                                )}

                                {summaryData.keyConcepts && summaryData.keyConcepts.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4>Key Concepts</h4>
                                        {summaryData.keyConcepts.map((kc: any, i: number) => (
                                            <div key={i} style={{ marginBottom: '0.75rem', paddingLeft: '1rem', borderLeft: '3px solid #535bf2' }}>
                                                <strong>{kc.concept}</strong>
                                                <p style={{ margin: '0.25rem 0 0 0', color: '#666' }}>{kc.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {summaryData.keyTakeaways && summaryData.keyTakeaways.length > 0 && (
                                    <div>
                                        <h4>Key Takeaways</h4>
                                        <ul>
                                            {summaryData.keyTakeaways.map((kt: string, i: number) => <li key={i}>{kt}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={async () => {
                                        if (!summaryData) return;
                                        try {
                                            await import('../services/api').then(m => m.saveSummary('uploaded-file.pdf', JSON.stringify(summaryData)));
                                            alert('Summary saved to DB!');
                                        } catch (e: any) {
                                            alert('Save failed: ' + e.message);
                                        }
                                    }}
                                    style={{ marginTop: '1rem', background: '#4CAF50' }}
                                >
                                    Save Summary to DB
                                </button>
                            </div>
                        ) : (
                            <p>Upload a document to generate a summary.</p>
                        )}
                    </div>
                )}
                {activeTab === 'graph' && (
                    <div>
                        <h3>Knowledge Graph</h3>
                        {graphData && graphData.nodes ? (
                            <div>
                                <svg width="600" height="500" style={{ border: '1px solid #ddd', borderRadius: '4px', background: '#fafafa' }}>
                                    {/* Render edges first (so they appear behind nodes) */}
                                    {(() => {
                                        const positionedNodes = layoutGraph(graphData.nodes);
                                        return graphData.edges.map((edge: any, i: number) => {
                                            const fromNode = positionedNodes.find(n => n.id === edge.from);
                                            const toNode = positionedNodes.find(n => n.id === edge.to);
                                            if (!fromNode || !toNode) return null;

                                            return (
                                                <g key={`edge-${i}`}>
                                                    <line
                                                        x1={fromNode.x}
                                                        y1={fromNode.y}
                                                        x2={toNode.x}
                                                        y2={toNode.y}
                                                        stroke="#999"
                                                        strokeWidth="2"
                                                        markerEnd="url(#arrowhead)"
                                                    />
                                                    {edge.label && (
                                                        <text
                                                            x={(fromNode.x + toNode.x) / 2}
                                                            y={(fromNode.y + toNode.y) / 2}
                                                            fill="#666"
                                                            fontSize="10"
                                                            textAnchor="middle"
                                                        >
                                                            {edge.label}
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        });
                                    })()}

                                    {/* Arrow marker definition */}
                                    <defs>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                            <polygon points="0 0, 10 3, 0 6" fill="#999" />
                                        </marker>
                                    </defs>

                                    {/* Render nodes */}
                                    {layoutGraph(graphData.nodes).map((node: any) => (
                                        <g key={node.id}>
                                            <circle
                                                cx={node.x}
                                                cy={node.y}
                                                r={node.type === 'main' ? 35 : 25}
                                                fill={node.type === 'main' ? '#535bf2' : '#10b981'}
                                                stroke="#fff"
                                                strokeWidth="3"
                                            />
                                            <text
                                                x={node.x}
                                                y={node.y}
                                                fill="white"
                                                fontSize="11"
                                                fontWeight="bold"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                style={{ pointerEvents: 'none' }}
                                            >
                                                {node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label}
                                            </text>
                                        </g>
                                    ))}
                                </svg>
                                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                    <p><strong>Legend:</strong></p>
                                    <p>🔵 Main Concepts | 🟢 Supporting Concepts</p>
                                </div>
                            </div>
                        ) : (
                            <p>Upload a document and click "Generate Graph" to visualize key concepts.</p>
                        )}
                    </div>
                )}
                {activeTab === 'quiz' && (
                    <div>
                        <h3>Quiz</h3>
                        {mcqData.length > 0 ? (
                            <div>
                                {mcqData.map((q, qIndex) => (
                                    <div key={qIndex} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
                                        <strong>Q{qIndex + 1}: {q.question}</strong>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            {q.options.map((opt: string, optIndex: number) => (
                                                <div key={optIndex} style={{ marginBottom: '0.25rem' }}>
                                                    <label style={{
                                                        display: 'block',
                                                        padding: '0.5rem',
                                                        background: showResults
                                                            ? (optIndex === q.correctAnswer ? '#d4edda' : userAnswers[qIndex] === optIndex ? '#f8d7da' : 'white')
                                                            : 'white',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}>
                                                        <input
                                                            type="radio"
                                                            name={`q${qIndex}`}
                                                            checked={userAnswers[qIndex] === optIndex}
                                                            onChange={() => !showResults && setUserAnswers({ ...userAnswers, [qIndex]: optIndex })}
                                                            disabled={showResults}
                                                        />
                                                        {' '}{opt}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                        {showResults && q.explanation && (
                                            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#e7f3ff', borderRadius: '4px', fontSize: '0.9rem' }}>
                                                <strong>Explanation:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {!showResults ? (
                                    <button onClick={handleSubmitQuiz} style={{ background: '#535bf2' }}>Submit Answers</button>
                                ) : (
                                    <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '4px', marginTop: '1rem' }}>
                                        <h3>Results: {calculateScore()} / {mcqData.length}</h3>
                                        <p>Score: {Math.round((calculateScore() / mcqData.length) * 100)}%</p>
                                        <button onClick={() => { setShowResults(false); setUserAnswers({}); }}>Retry</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p>Upload a document and click "Generate Quiz" to create questions.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPage;
