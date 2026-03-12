import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Cpu, 
  Zap, 
  Shield, 
  Building2, 
  Network, 
  ChevronRight, 
  MessageSquare, 
  Activity, 
  Layers, 
  Loader2, 
  Sparkles, 
  Info, 
  UserCheck, 
  AlertTriangle, 
  ArrowRightCircle, 
  TrendingUp, 
  BarChart,
  Image as ImageIcon,
  Download,
  X,
  ChevronDown,
  Check,
  ZapOff,
  FileText,
  Printer,
  FileDown,
  Mail,
  Calendar,
  Volume2,
  Target,
  MessageSquareWarning,
  Copy,
  PenTool,
  List,
  Calculator,
  User,
  HelpCircle,
  Swords
} from 'lucide-react';

const App = () => {
  const [industry, setIndustry] = useState('');
  const [company, setCompany] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Strategic Content States
  const [infographicUrl, setInfographicUrl] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [objections, setObjections] = useState(null);
  const [isGeneratingObjections, setIsGeneratingObjections] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  
  // Prompt generation state
  const [infographicPrompt, setInfographicPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // New Gemini Features State
  const [agenda, setAgenda] = useState('');
  const [isGeneratingAgenda, setIsGeneratingAgenda] = useState(false);
  const [roi, setRoi] = useState(null);
  const [isGeneratingROI, setIsGeneratingROI] = useState(false);

  // New Discovery & Battlecard States
  const [discoveryQs, setDiscoveryQs] = useState(null);
  const [isGeneratingDiscovery, setIsGeneratingDiscovery] = useState(false);
  const [battlecard, setBattlecard] = useState(null);
  const [isGeneratingBattlecard, setIsGeneratingBattlecard] = useState(false);

  const [activeToolkitTab, setActiveToolkitTab] = useState(null);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false); // New state for toolkit dropdown

  const scenarioDropdownRef = useRef(null); // New ref for toolkit dropdown
  const apiKey = ""; // Provided by environment

  const industries = [
    { id: 'financial', label: 'Financial Services', icon: <Shield size={24} /> },
    { id: 'healthcare', label: 'Healthcare', icon: <Activity size={24} /> },
    { id: 'manufacturing', label: 'Manufacturing', icon: <Cpu size={24} /> },
    { id: 'retail', label: 'Retail & Hospitality', icon: <Building2 size={24} /> },
    { id: 'public', label: 'Public Sector', icon: <Network size={24} /> },
  ];

  const loadingStatuses = [
    "Initializing Strategic Agent...",
    "Scanning for CX friction touchpoints...",
    "Mapping detection triggers to Splunk & Meraki sensors...",
    "Configuring Webex Connect CPaaS orchestration...",
    "Defining Action paths via Contact Center & AI Agents...",
    "Finalizing tiered executive briefing paragraphs...",
    "Constructing stakeholder impact matrix..."
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scenarioDropdownRef.current && !scenarioDropdownRef.current.contains(event.target)) {
        setIsScenarioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingStatuses.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Resilient JSON extraction helper
  const extractJSON = (text) => {
    if (!text) return null;
    try {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON Extraction Error:", e);
      return null;
    }
  };

  // Safe renderer for potential object anomalies from AI
  const safeRender = (val) => {
    if (val === null || val === undefined) return "";
    return typeof val === 'object' ? JSON.stringify(val) : String(val);
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const fetchWithBackoff = async (url, options, maxRetries = 5) => {
    let retries = 0;
    const delays = [1500, 3000, 6000, 12000, 24000];
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        
        // Handle 401 errors more gracefully during initialization
        if (response.status === 401) {
             console.warn(`Attempt ${retries + 1}: API key synchronization pending...`);
             if (retries === maxRetries - 1) {
                 throw new Error("Authentication failed after multiple attempts. Please try again.");
             }
        } else {
             throw new Error(`Request failed with status ${response.status}`);
        }
      } catch (err) {
        retries++;
        if (retries === maxRetries) throw err;
        await new Promise(res => setTimeout(res, delays[retries - 1]));
      }
    }
  };

  const handleIndustryClick = (id) => {
    setIndustry(id);
    generateStrategy(id, company);
  };

  const generateStrategy = async (selectedIndustryId, targetCompany) => {
    setIsGenerating(true);
    setError(null);
    setShowResults(false);
    setData(null);
    setAudioUrl(null);
    setInfographicUrl(null);
    setActiveToolkitTab(null);
    setSelectedCaseIndex(0);
    setDiscoveryQs(null);
    setBattlecard(null);

    const industryLabel = industries.find(i => i.id === selectedIndustryId)?.label || 'Enterprise';
    const targetEntity = targetCompany || industryLabel;
    
    const query = `Create a high-value Cisco DNA strategy for ${targetEntity}. Focus on end-to-end customer experience and operational efficiency. Exactly 10 use cases split between Customer Experience and Internal Operational categories.`;

    const systemPrompt = `You are a Senior Cisco Solutions Architect. Return strictly valid JSON.
    CONSTRAINTS:
    - DETECT: Must use Splunk (digital experience) or Meraki (physical sensors).
    - NOTIFY: Must use Webex Connect CPaaS digital channels (SMS, WhatsApp, RCS, Apple Business). NO Webex Teams.
    - ACT: Must use Webex Contact Center or AI Agent resolution.
    - CATEGORIZATION: Explicitly classify each use case into either "Customer Experience" or "Internal Operational" in the category field. Ensure exactly 10 cases total.
    - EXECUTIVE SUMMARY: Write 4 paragraphs (Paragraph 1: The Challenge - reactive friction; Paragraph 2: The Cisco Vision - Detect/Notify/Act; Paragraph 3: Business Impact - MTTR/CSAT; Paragraph 4: Conclusion). 
    - CRITICAL: DO NOT include specific samplers, examples, or list items in the Executive Summary paragraphs.
    
    Structure:
    {
      "useCases": [{"category": "Customer Experience | Internal Operational", "subSegment": "", "problem": "", "detection": "", "notification": "", "sponsorTitle": "", "sponsorDepartment": "", "resolution": "", "outcome": "", "strategicValue": ""}],
      "executiveSummary": [string],
      "differentiators": [{"title": "", "desc": ""}]
    }`;

    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error("No valid strategy generated by the agent.");
      
      const parsed = extractJSON(text);
      if (!parsed) throw new Error("Failed to process strategy structure.");
      
      const normalizeArray = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return [val];
        return [];
      };

      parsed.useCases = Array.isArray(parsed.useCases) ? parsed.useCases : [];
      parsed.executiveSummary = normalizeArray(parsed.executiveSummary);
      parsed.differentiators = Array.isArray(parsed.differentiators) ? parsed.differentiators : [];

      setData(parsed);
      setShowResults(true);
    } catch (err) {
      console.error("Strategy Generation Error:", err);
      setError(err.message.includes("Unauthorized") ? "Strategic agent unavailable: API Key Error. Please refresh." : `Strategic agent unavailable. Please try a different target name.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInfographic = async (index) => {
    if (!data || !data.useCases || !data.useCases[index]) return;
    
    setIsGeneratingImage(true);
    setImageError(null);
    setIsDropdownOpen(false);
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    
    const promptText = `Generate a SLEEK CORPORATE INFOGRAPHIC. 
    Topic: End-to-end operational strategy for ${targetCase.subSegment}.
    Concept: Detect, Notify, Action workflow.
    Detection layer: ${targetCase.detection}.
    Notification layer: Intelligent orchestration of signals and alerts via cloud messaging.
    Action layer: ${targetCase.resolution} via enterprise support systems.
    Visual style: 3D isometric flat vector, neutral professional executive deck quality. 
    Palette: Sophisticated deep ocean blue, slate gray, and crisp white. 
    NO BRAND LOGOS. NO TRADEMARKED NAMES. NO SPECIFIC CORPORATE LOGOS. 
    Clear visual flow from left to right showing problem discovery, communication, and resolution. Use generic technology icons. High resolution, minimalist layout.`;

    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { 
            responseModalities: ["IMAGE"] 
          }
        })
      });

      const result = await response.json();
      const base64Image = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (!base64Image) throw new Error('No image data returned from Nano Banana');
      
      setInfographicUrl(`data:image/png;base64,${base64Image}`);
    } catch (err) {
      console.error("Nano Banana Image Generation Error:", err);
      setImageError("Visualization engine failed to return a visual. Please try a different scenario.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateEmailDraft = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingEmail(true);
    setActiveToolkitTab('email');
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const prompt = `Draft professional Cisco AE email to ${targetCase.sponsorTitle} regarding: "${targetCase.problem}". Use the DNA framework. No products. Ask for a meeting.`;
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      setEmailDraft(result.candidates?.[0]?.content?.parts?.[0]?.text || "");
    } catch (err) { console.error(err); } finally { setIsGeneratingEmail(false); }
  };

  const generateRoadmap = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingRoadmap(true);
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const prompt = `Create professional 30-60-90 day roadmap for: "${targetCase.problem}". Based on: Detect (${targetCase.detection}), Notify (${targetCase.notification}), and Act (${targetCase.resolution}). Respond with JSON matching schema.`;
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                days30: { type: "ARRAY", items: { type: "STRING" } },
                days60: { type: "ARRAY", items: { type: "STRING" } },
                days90: { type: "ARRAY", items: { type: "STRING" } }
              },
              required: ["days30", "days60", "days90"]
            }
          }
        })
      });
      const result = await response.json();
      setRoadmap(extractJSON(result.candidates?.[0]?.content?.parts?.[0]?.text));
      setActiveToolkitTab('roadmap');
    } catch (err) { console.error(err); } finally { setIsGeneratingRoadmap(false); }
  };

  const generateObjectionHandling = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingObjections(true);
    setActiveToolkitTab('objections');
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const prompt = `Identify 3 executive objections for: "${targetCase.problem}". Provide responses focusing on outcomes. Format as JSON matching schema.`;
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }], 
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                objections: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      title: { type: "STRING" },
                      response: { type: "STRING" }
                    },
                    required: ["title", "response"]
                  }
                }
              },
              required: ["objections"]
            }
          } 
        })
      });
      const result = await response.json();
      setObjections(extractJSON(result.candidates?.[0]?.content?.parts?.[0]?.text));
    } catch (err) { console.error(err); } finally { setIsGeneratingObjections(false); }
  };

  const generateInfographicPrompt = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingPrompt(true);
    setActiveToolkitTab('prompt');
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const promptRequest = `Detailed image prompt for a grounded business infographic for: "${targetCase.problem}". 
    The image must include three clearly labeled sections: 
    1. Detect (Text: "${targetCase.detection}")
    2. Notify (Text: "${targetCase.notification}")
    3. Act (Text: "${targetCase.resolution}")
    Visual style: Isometric 3D vector, professional Cisco blues, simple reality-based icons. No ethereal AI elements. Clear Title at top: "Solution Workflow".`;

    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptRequest }] }] })
      });
      const result = await response.json();
      setInfographicPrompt(result.candidates?.[0]?.content?.parts?.[0]?.text || "Prompt construction failed.");
    } catch (err) { console.error(err); setInfographicPrompt("Error generating design prompt."); } finally { setIsGeneratingPrompt(false); }
  };

  const generateMeetingAgenda = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingAgenda(true);
    setActiveToolkitTab('agenda');
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const prompt = `Create a professional 45-minute executive meeting agenda for discussing the following solution: "${targetCase.problem}". Include sections for Introductions, The Challenge, The DNA Framework (Detect via ${targetCase.detection}, Notify via ${targetCase.notification}, Act via ${targetCase.resolution}), and Next Steps. Keep it concise.`;
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      setAgenda(result.candidates?.[0]?.content?.parts?.[0]?.text || "Agenda generation failed.");
    } catch (err) { console.error(err); } finally { setIsGeneratingAgenda(false); }
  };

  const generateROI = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingROI(true);
    setActiveToolkitTab('roi');
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const prompt = `Generate a realistic hypothetical Business Value & ROI projection for solving: "${targetCase.problem}" using Cisco's Detect-Notify-Act framework. Return ONLY valid JSON matching the schema.`;
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }], 
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                metrics: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      metricName: { type: "STRING" },
                      projectedImprovement: { type: "STRING" },
                      businessValue: { type: "STRING" }
                    },
                    required: ["metricName", "projectedImprovement", "businessValue"]
                  }
                },
                paybackPeriod: { type: "STRING" },
                summary: { type: "STRING" }
              },
              required: ["metrics", "paybackPeriod", "summary"]
            }
          } 
        })
      });
      const result = await response.json();
      setRoi(extractJSON(result.candidates?.[0]?.content?.parts?.[0]?.text));
    } catch (err) { console.error(err); } finally { setIsGeneratingROI(false); }
  };

  const generateDiscoveryQs = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingDiscovery(true);
    setActiveToolkitTab('discovery');
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const prompt = `You are a Cisco Enterprise AE. Generate 5 high-impact, open-ended discovery questions to ask the ${targetCase.sponsorTitle} regarding their operational friction point: "${targetCase.problem}". Focus on uncovering the cost of their current reactive state and leading them toward a proactive Detect-Notify-Act value prop. Return ONLY valid JSON matching the schema.`;
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }], 
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                questions: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              },
              required: ["questions"]
            }
          } 
        })
      });
      const result = await response.json();
      setDiscoveryQs(extractJSON(result.candidates?.[0]?.content?.parts?.[0]?.text));
    } catch (err) { console.error(err); } finally { setIsGeneratingDiscovery(false); }
  };

  const generateBattlecard = async (index) => {
    if (!data || !data.useCases[index]) return;
    setIsGeneratingBattlecard(true);
    setActiveToolkitTab('battlecard');
    setSelectedCaseIndex(index);
    const targetCase = data.useCases[index];
    const prompt = `Generate a concise competitive battlecard for pitching the Cisco Detect-Notify-Act strategy to solve: "${targetCase.problem}". Compare the comprehensive Cisco approach against doing nothing (Status Quo) and piecing together disparate vendors (Point Solution Patchwork). Return ONLY valid JSON matching the schema.`;
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }], 
          generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                statusQuoRisk: { type: "STRING" },
                pointSolutionRisk: { type: "STRING" },
                ciscoAdvantage: { type: "STRING" },
                keyTakeaway: { type: "STRING" }
              },
              required: ["statusQuoRisk", "pointSolutionRisk", "ciscoAdvantage", "keyTakeaway"]
            }
          } 
        })
      });
      const result = await response.json();
      setBattlecard(extractJSON(result.candidates?.[0]?.content?.parts?.[0]?.text));
    } catch (err) { console.error(err); } finally { setIsGeneratingBattlecard(false); }
  };

  const generateVoiceSummary = async () => {
    if (!data || !data.executiveSummary) return;
    setIsGeneratingAudio(true);
    setActiveToolkitTab('audio');
    const textToSpeak = "Executive Summary for " + (company || "your enterprise") + ". " + data.executiveSummary.join(" ");
    try {
      const response = await fetchWithBackoff(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Say with authority: ${textToSpeak}` }] }],
          generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } } },
          model: "gemini-2.5-flash-preview-tts"
        })
      });
      const result = await response.json();
      const pcmData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (pcmData) {
        const pcmToWav = (pcmBase64, sampleRate = 24000) => {
          const raw = atob(pcmBase64);
          const buffer = new ArrayBuffer(44 + raw.length);
          const view = new DataView(buffer);
          const writeStr = (off, s) => { for(let i=0; i<s.length; i++) view.setUint8(off+i, s.charCodeAt(i)); };
          writeStr(0, 'RIFF'); view.setUint32(4, 36 + raw.length, true);
          writeStr(8, 'WAVE'); writeStr(12, 'fmt '); view.setUint32(16, 16, true);
          view.setUint16(20, 1, true); view.setUint16(22, 1, true);
          view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
          view.setUint16(32, 2, true); view.setUint16(34, 16, true);
          writeStr(36, 'data'); view.setUint32(40, raw.length, true);
          for(let i=0; i<raw.length; i++) view.setUint8(44 + i, raw.charCodeAt(i));
          return new Blob([buffer], { type: 'audio/wav' });
        };
        setAudioUrl(URL.createObjectURL(pcmToWav(pcmData)));
      }
    } catch (err) { console.error(err); } finally { setIsGeneratingAudio(false); }
  };

  const getVolumeColor = (vol) => {
    switch (vol?.toLowerCase()) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'med': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExportGoogleDocs = () => {
    if (!data) return;

    const reportTitle = company || industries.find(i => i.id === industry)?.label || "Enterprise";
    const safeUseCases = Array.isArray(data.useCases) ? data.useCases : [];
    const safeExecSummary = Array.isArray(data.executiveSummary) ? data.executiveSummary : [];
    const safeDiffs = Array.isArray(data.differentiators) ? data.differentiators : [];

    const cxCases = safeUseCases.filter(uc => uc?.category === "Customer Experience" || String(uc?.category).includes("Customer"));
    const opsCases = safeUseCases.filter(uc => !cxCases.includes(uc));

    const generateTableHtml = (cases, title) => {
      if (cases.length === 0) return '';
      return `
        <h2>${title}</h2>
        <table>
          <thead>
            <tr>
              <th>Segment & Problem</th>
              <th>Detection Trigger</th>
              <th>Notification Signal</th>
              <th>Action Path</th>
              <th>Executive Sponsor</th>
              <th>Impact & Outcome</th>
            </tr>
          </thead>
          <tbody>
            ${cases.map(uc => `
              <tr>
                <td><b>${safeRender(uc?.subSegment)}</b><br/>${safeRender(uc?.problem)}</td>
                <td>${safeRender(uc?.detection)}</td>
                <td>${safeRender(uc?.notification)}</td>
                <td>${safeRender(uc?.resolution)}</td>
                <td><b>${safeRender(uc?.sponsorTitle)}</b><br/>${safeRender(uc?.sponsorDepartment)}</td>
                <td>
                  <div class="outcome">${safeRender(uc?.outcome)}</div>
                  <div class="strategic">${safeRender(uc?.strategicValue)}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    };

    const reportHtml = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #1a1a1a; padding: 40px; }
            h1 { color: #002d72; border-bottom: 3px solid #002d72; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { color: #002d72; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 25px 0; border: 1px solid #e2e8f0; }
            th { background-color: #f8fafc; color: #475569; font-size: 10px; text-transform: uppercase; padding: 12px; border: 1px solid #e2e8f0; text-align: left; }
            td { padding: 12px; border: 1px solid #e2e8f0; font-size: 11px; vertical-align: top; }
            .outcome { font-weight: bold; color: #1d4ed8; font-size: 11px; }
            .strategic { font-size: 9px; color: #64748b; text-transform: uppercase; margin-top: 4px; font-weight: bold; }
            ul { margin-top: 15px; }
            li { margin-bottom: 10px; font-size: 12px; }
            .diff-card { margin-top: 20px; padding: 15px; border-left: 5px solid #002d72; background: #f8fafc; }
            footer { margin-top: 60px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Strategic Playbook: ${reportTitle}</h1>
          <p>Strategic Analysis: Detect • Notify • Action Workflow</p>
          
          ${generateTableHtml(cxCases, 'Customer Experience Scenarios')}
          ${generateTableHtml(opsCases, 'Internal Operational Scenarios')}

          <h2>Executive Summary</h2>
          <ul>
            ${safeExecSummary.map(item => `<li>${safeRender(item)}</li>`).join('')}
          </ul>

          <h2>Key Differentiators</h2>
          ${safeDiffs.map(diff => `
            <div class="diff-card">
              <p><b>${safeRender(diff?.title)}</b><br/>${safeRender(diff?.desc)}</p>
            </div>
          `).join('')}

          <footer>
            Produced by Cisco Strategic Ideation Engine • Internal Use Only
          </footer>
        </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/\s+/g, '_')}_Cisco_Strategy_Report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (showResults && data) {
    const safeUseCases = Array.isArray(data.useCases) ? data.useCases : [];
    const safeExecSummary = Array.isArray(data.executiveSummary) ? data.executiveSummary : [];
    const safeDiffs = Array.isArray(data.differentiators) ? data.differentiators : [];

    const cxCases = safeUseCases.filter(uc => uc?.category === "Customer Experience" || String(uc?.category).includes("Customer"));
    const opsCases = safeUseCases.filter(uc => !cxCases.includes(uc));

    const renderTable = (cases, title, headerBg) => {
      if (cases.length === 0) return null;
      return (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 mb-8">
          <div className={`${headerBg} p-6 text-white`}>
            <h2 className="text-2xl font-bold mb-1">{title}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider">
                  <th className="px-6 py-4">Segment & Problem</th>
                  <th className="px-6 py-4">Detection Trigger</th>
                  <th className="px-6 py-4">Notification Signal</th>
                  <th className="px-6 py-4">Action Path</th>
                  <th className="px-6 py-4">Executive Sponsor</th>
                  <th className="px-6 py-4">Outcome & Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((uc, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm mb-1">{safeRender(uc?.subSegment) || "N/A"}</p>
                      <p className="text-xs text-slate-500 leading-tight italic">{safeRender(uc?.problem) || "Problem details not available"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <span className="p-1.5 rounded bg-indigo-50 text-indigo-600 mr-2 mt-0.5 no-print"><Activity size={14} /></span>
                        <p className="text-xs text-slate-700 leading-snug">{safeRender(uc?.detection) || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <span className="p-1.5 rounded bg-green-50 text-green-600 mr-2 mt-0.5 no-print"><MessageSquare size={14} /></span>
                        <p className="text-xs text-slate-700 leading-snug font-medium">{safeRender(uc?.notification) || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <span className="p-1.5 rounded bg-amber-50 text-amber-600 mr-2 mt-0.5 no-print"><UserCheck size={14} /></span>
                        <p className="text-xs text-slate-700 leading-snug">{safeRender(uc?.resolution) || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <span className="p-1.5 rounded bg-purple-50 text-purple-600 mr-2 mt-0.5 no-print"><User size={14} /></span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-snug">{safeRender(uc?.sponsorTitle) || "N/A"}</p>
                          <p className="text-[10px] text-slate-500 italic">{safeRender(uc?.sponsorDepartment) || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-blue-700 font-bold leading-snug mb-1">{safeRender(uc?.outcome) || "N/A"}</p>
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter">{safeRender(uc?.strategicValue) || "N/A"}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans animate-in fade-in duration-500 relative pb-32">
        <div className="max-w-7xl mx-auto print-container">
          <div className="flex justify-between items-center mb-6 no-print">
            <button 
              onClick={() => setShowResults(false)}
              className="flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              ← Back to Ideation Portal
            </button>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportGoogleDocs}
                className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-900 transition-all shadow-lg"
              >
                <FileText size={16} className="mr-2 text-blue-400" />
                Export Google Docs
              </button>
            </div>
          </div>
          
          {infographicUrl && (
            <div className="mb-8 relative animate-in slide-in-from-top-4 duration-500">
              <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-4 px-2 no-print">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="text-amber-500" size={18} />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Strategic Visualization: {safeRender(safeUseCases[selectedCaseIndex]?.subSegment) || "Selected Use Case"}
                    </span>
                  </div>
                  <button onClick={() => setInfographicUrl(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <img src={infographicUrl} alt="Visual Analysis" className="w-full h-auto rounded-2xl shadow-inner border border-slate-100" />
              </div>
            </div>
          )}

          {imageError && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs flex items-center justify-center no-print">
              <AlertTriangle size={16} className="mr-2" />
              {imageError}
            </div>
          )}

          <div className="mb-6 px-2">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Strategic Playbook: {company || industries.find(i => i.id === industry)?.label || "Enterprise"}
            </h1>
            <p className="text-slate-500 italic">Strategic DNA Matrix: Detect • Notify • Action Workflow</p>
          </div>

          {renderTable(cxCases, "Customer Experience Scenarios", "bg-blue-900")}
          {renderTable(opsCases, "Internal Operational Scenarios", "bg-slate-800")}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-full relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Shield className="mr-2 text-blue-600 no-print" size={24} /> Executive Summary
                </h2>
                <button 
                  onClick={generateVoiceSummary}
                  disabled={isGeneratingAudio}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50 no-print"
                >
                  {isGeneratingAudio ? <Loader2 className="animate-spin" size={14} /> : <Volume2 size={14} />}
                  Voice Briefing ✨
                </button>
              </div>
              <div className="space-y-6">
                {safeExecSummary.map((para, i) => (
                  <p key={i} className="text-slate-600 text-sm leading-relaxed font-medium text-justify">{safeRender(para)}</p>
                ))}
              </div>
              {audioUrl && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 no-print animate-in slide-in-from-top-2">
                  <audio src={audioUrl} controls className="h-10 flex-grow" />
                  <button onClick={() => setAudioUrl(null)} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 flex-grow">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <Zap className="mr-2 text-amber-500 no-print" size={24} /> Key Differentiators
                </h2>
                <div className="space-y-4">
                  {safeDiffs.map((diff, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow">
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{safeRender(diff?.title) || "N/A"}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed">{safeRender(diff?.desc) || "Details not available"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AE Strategic Toolkit Section ✨ */}
              <div className="bg-gradient-to-br from-indigo-950 to-blue-900 p-8 rounded-3xl shadow-xl text-white no-print">
                <h2 className="text-xl font-bold mb-6 flex items-center"><Sparkles className="mr-2 text-amber-400" size={24} /> AE Strategic Toolkit ✨</h2>
                <div className="space-y-6">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-balance relative">
                    
                    {/* Improved Custom Scenario Dropdown */}
                    <div className="flex flex-col gap-2 mb-5">
                      <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Scenario Focus</p>
                      <div className="relative" ref={scenarioDropdownRef}>
                        <button 
                          onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
                          className="w-full bg-slate-900/60 hover:bg-slate-900 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between transition-all text-left group shadow-inner"
                        >
                          <div className="truncate mr-4">
                            <p className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                              {safeUseCases[selectedCaseIndex] ? safeRender(safeUseCases[selectedCaseIndex]?.subSegment) : "Select Scenario"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {safeUseCases[selectedCaseIndex] ? safeRender(safeUseCases[selectedCaseIndex]?.problem) : "Choose a use case..."}
                            </p>
                          </div>
                          <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${isScenarioDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isScenarioDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-64 overflow-y-auto">
                            {safeUseCases.map((uc, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSelectedCaseIndex(i);
                                  setSelectedEmailIndex(i);
                                  setSelectedRoadmapIndex(i);
                                  setIsScenarioDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0 flex items-start ${selectedCaseIndex === i ? 'bg-slate-700/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                              >
                                <div className="mt-0.5 mr-3 flex-shrink-0">
                                  {selectedCaseIndex === i ? <Check size={14} className="text-blue-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                                </div>
                                <div>
                                  <p className={`text-xs font-bold mb-0.5 ${selectedCaseIndex === i ? 'text-blue-300' : 'text-slate-200'}`}>
                                    {safeRender(uc?.subSegment)}
                                  </p>
                                  <p className="text-[10px] text-slate-400 line-clamp-2">
                                    {safeRender(uc?.problem)}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => generateEmailDraft(selectedCaseIndex)} disabled={isGeneratingEmail} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Draft Email ✨
                      </button>
                      <button onClick={() => generateRoadmap(selectedCaseIndex)} disabled={isGeneratingRoadmap} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingRoadmap ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />} Build Roadmap ✨
                      </button>
                      <button onClick={() => generateObjectionHandling(selectedCaseIndex)} disabled={isGeneratingObjections} className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingObjections ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />} Objections ✨
                      </button>
                      <button onClick={() => generateInfographicPrompt(selectedCaseIndex)} disabled={isGeneratingPrompt} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingPrompt ? <Loader2 size={14} className="animate-spin" /> : <PenTool size={14} />} Image Prompt ✨
                      </button>
                      <button onClick={() => generateMeetingAgenda(selectedCaseIndex)} disabled={isGeneratingAgenda} className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingAgenda ? <Loader2 size={14} className="animate-spin" /> : <List size={14} />} Exec Agenda ✨
                      </button>
                      <button onClick={() => generateROI(selectedCaseIndex)} disabled={isGeneratingROI} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingROI ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} Value & ROI ✨
                      </button>
                      <button onClick={() => generateDiscoveryQs(selectedCaseIndex)} disabled={isGeneratingDiscovery} className="flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingDiscovery ? <Loader2 size={14} className="animate-spin" /> : <HelpCircle size={14} />} Discovery Qs ✨
                      </button>
                      <button onClick={() => generateBattlecard(selectedCaseIndex)} disabled={isGeneratingBattlecard} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
                        {isGeneratingBattlecard ? <Loader2 size={14} className="animate-spin" /> : <Swords size={14} />} Battlecard ✨
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8 no-print">
            {activeToolkitTab === 'objections' && objections && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-amber-600 animate-in slide-in-from-bottom-4">
                 <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center"><Target className="mr-2 text-amber-600" /> Executive Defense Guide ✨</h3>
                  <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {objections.objections?.map((obj, i) => (
                    <div key={i} className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                      <p className="font-bold text-amber-900 mb-2 flex items-start"><MessageSquareWarning size={16} className="mr-2 mt-1 flex-shrink-0" /> <span>{safeRender(obj.title)}</span></p>
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-amber-50"><span className="font-bold text-blue-700 block mb-1">AE Tactical Response:</span> {safeRender(obj.response)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeToolkitTab === 'email' && emailDraft && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-blue-600 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center"><Mail className="mr-2 text-blue-600" /> Executive Email Draft ✨</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(emailDraft)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg" title="Copy to Clipboard"><Copy size={18} /></button>
                    <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{emailDraft}</div>
              </div>
            )}

            {activeToolkitTab === 'roadmap' && roadmap && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-green-600 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center text-balance"><Calendar className="mr-2 text-green-600" /> Roadmap: {safeRender(safeUseCases[selectedCaseIndex]?.problem)}</h3>
                  <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {['days30', 'days60', 'days90'].map((key) => (
                    <div key={key} className="space-y-4">
                      <div className="bg-indigo-50 p-3 rounded-lg font-bold text-indigo-800 border-l-4 border-indigo-500 capitalize">{key.replace('days', 'Day ')} Milestone</div>
                      <ul className="space-y-2">
                        {roadmap[key]?.map((step, i) => (<li key={i} className="text-[11px] text-slate-600 flex items-start text-balance leading-relaxed"><ChevronRight size={14} className="mr-1 mt-0.5 text-blue-400 flex-shrink-0"/> {safeRender(step)}</li>))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeToolkitTab === 'prompt' && infographicPrompt && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-indigo-600 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center"><PenTool className="mr-2 text-indigo-600" /> Infographic Prompt ✨</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(infographicPrompt)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg" title="Copy to Clipboard"><Copy size={18} /></button>
                    <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                  </div>
                </div>
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-200 text-sm text-indigo-900 whitespace-pre-wrap font-mono leading-relaxed italic">{infographicPrompt}</div>
              </div>
            )}

            {activeToolkitTab === 'agenda' && agenda && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-cyan-600 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center"><List className="mr-2 text-cyan-600" /> Executive Meeting Agenda ✨</h3>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(agenda)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg" title="Copy to Clipboard"><Copy size={18} /></button>
                    <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{agenda}</div>
              </div>
            )}

            {activeToolkitTab === 'roi' && roi && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-emerald-600 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center"><Calculator className="mr-2 text-emerald-600" /> Business Value & ROI Projection ✨</h3>
                  <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {roi.metrics?.map((metric, i) => (
                    <div key={i} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{safeRender(metric.metricName)}</p>
                      <p className="text-2xl font-extrabold text-slate-800 mb-2">{safeRender(metric.projectedImprovement)}</p>
                      <p className="text-xs text-slate-600 leading-tight">{safeRender(metric.businessValue)}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4 items-center">
                  <p className="text-sm text-slate-700 leading-relaxed max-w-2xl"><span className="font-bold text-emerald-700">Summary:</span> {safeRender(roi.summary)}</p>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 text-center flex-shrink-0 min-w-[120px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Payback</p>
                    <p className="text-lg font-bold text-emerald-600">{safeRender(roi.paybackPeriod)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeToolkitTab === 'discovery' && discoveryQs && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-fuchsia-600 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center"><HelpCircle className="mr-2 text-fuchsia-600" /> High-Impact Discovery Questions ✨</h3>
                  <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                </div>
                <div className="space-y-3">
                  {discoveryQs.questions?.map((q, i) => (
                    <div key={i} className="flex items-start gap-3 bg-fuchsia-50/50 p-4 rounded-xl border border-fuchsia-100">
                      <div className="mt-0.5 text-fuchsia-500 font-bold flex-shrink-0">{i + 1}.</div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">{safeRender(q)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeToolkitTab === 'battlecard' && battlecard && (
              <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-rose-600 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center"><Swords className="mr-2 text-rose-600" /> Competitive Battlecard ✨</h3>
                  <button onClick={() => setActiveToolkitTab(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status Quo / Do Nothing</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{safeRender(battlecard.statusQuoRisk)}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Point Solution Patchwork</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{safeRender(battlecard.pointSolutionRisk)}</p>
                  </div>
                </div>
                <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-2">The Cisco DNA Advantage</p>
                  <p className="text-sm text-slate-800 leading-relaxed font-bold">{safeRender(battlecard.ciscoAdvantage)}</p>
                </div>
                <div className="mt-4 text-center">
                  <p className="inline-block bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md">Key Takeaway: {safeRender(battlecard.keyTakeaway)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      <main className="flex-grow flex flex-col items-center justify-center px-6 relative z-10 py-16 text-balance">
        <div className="max-w-4xl w-full text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-10 text-blue-400 text-xs font-bold uppercase tracking-widest"><Sparkles size={14} /><span>Strategic Solutions Engine</span></div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">Cisco DNA Workflow <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">Ideation Portal</span></h1>
          <div className="bg-slate-900/50 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl mb-12 max-w-2xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); if (company) generateStrategy(industry, company); }} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="text" placeholder="Enter Company Name (e.g. Starbucks, Chase)" className="w-full bg-transparent border-0 focus:ring-0 py-4 pl-12 text-white placeholder:text-slate-600 text-sm" value={company} onChange={(e) => setCompany(e.target.value)}/>
              </div>
              <button type="submit" disabled={isGenerating || !company} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg text-nowrap">
                {isGenerating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Zap size={18} className="mr-2" />}Run Strategy
              </button>
            </form>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {industries.map((ind) => (
              <button key={ind.id} type="button" onClick={() => handleIndustryClick(ind.id)} disabled={isGenerating} className={`flex flex-col items-center p-6 rounded-2xl border transition-all group disabled:opacity-50 ${industry === ind.id ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500'}`}>
                <div className={`mb-4 p-3 rounded-xl transition-all ${industry === ind.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'}`}>{ind.icon}</div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{ind.label}</span>
              </button>
            ))}
          </div>
          {error && <div className="mt-8 text-rose-400 text-sm flex items-center justify-center font-semibold bg-rose-500/10 py-2 px-4 rounded-lg animate-bounce"><AlertTriangle size={16} className="mr-2" />{error}</div>}
        </div>
      </main>
      
      {/* Universal Loading Overlay */}
      {(isGenerating || isGeneratingRoadmap || isGeneratingEmail || isGeneratingImage || isGeneratingAudio || isGeneratingObjections || isGeneratingAgenda || isGeneratingROI || isGeneratingDiscovery || isGeneratingBattlecard) && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin mb-8"></div>
          <p className="text-slate-400 text-lg italic max-w-md text-balance">
            {isGenerating ? loadingStatuses[loadingStep] : 
             isGeneratingAudio ? "Aoede is preparing your executive voice summary... ✨" :
             isGeneratingObjections ? "Analyzing potential stakeholder friction points... ✨" :
             isGeneratingAgenda ? "Structuring strategic meeting agenda... ✨" :
             isGeneratingROI ? "Calculating business value metrics... ✨" :
             isGeneratingDiscovery ? "Drafting executive discovery questions... ✨" :
             isGeneratingBattlecard ? "Compiling competitive battlecard... ✨" :
             isGeneratingImage ? "Nano Banana is synthesizing your high-fidelity DNA visual... ✨" :
             "Constructing strategic content... ✨"}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
