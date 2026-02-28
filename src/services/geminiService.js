import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Send a message to Gemini AI
 * Tries serverless function first (Vercel), falls back to direct Gemini API call
 * @param {string} userMessage - The user's message
 * @param {Array} jobs - Array of job objects for context
 * @returns {Promise<string>} - AI response text
 */
export async function sendMessage(userMessage, jobs = []) {
  // Format jobs data for context
  const jobsData = Array.isArray(jobs) && jobs.length > 0
    ? jobs.map(job =>
        `Job Title: ${job.title}\n` +
        `Description: ${job.description}\n` +
        `Requirements: ${job.requirements || 'Not specified'}\n` +
        `Candidates: ${job.candidate_count || 0}\n`
      ).join('\n---\n')
    : 'No jobs currently available.';

  const systemPrompt = `You are HireDesk's AI assistant, helping job seekers understand available positions.

Current job openings:
${jobsData}

Your role:
- Answer questions about job requirements, responsibilities, and qualifications
- Help candidates understand which positions match their skills
- Be friendly, concise, and professional
- If asked about specific jobs, reference them by title
- If asked about application process, direct them to upload their resume on the platform

Keep responses brief (2-3 sentences unless more detail is requested).`;

  // Try serverless function first (works on Vercel)
  try {
    const response = await axios.post('/api/chat', {
      message: userMessage,
      jobsContext: jobs
    }, { timeout: 5000 });

    if (response.data.success) {
      return response.data.response;
    }
  } catch (serverlessError) {
    // Serverless function not available (e.g., on Nginx/DigitalOcean) — fall through to direct call
    console.log('Serverless chat unavailable, using direct Gemini API');
  }

  // Direct Gemini API call (fallback for non-Vercel deployments)
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Chat API Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

/**
 * Analyze resume using Gemini only (no ML scoring/taxonomy output)
 * @param {string} resumeText - Full resume text
 * @param {string} targetRole - Optional target role/job title
 * @returns {Promise<string>} - Structured analysis text
 */
export async function analyzeResumeWithGemini(resumeText, targetRole = '') {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const roleContext = targetRole?.trim()
      ? `Target role/job: ${targetRole.trim()}`
      : 'Target role/job: Infer the most likely role from the resume and evaluate against that inferred role.';

    const prompt = `You are an expert resume coach for recruiters and candidates.

${roleContext}

Analyze the resume below and provide practical feedback.

STRICT OUTPUT RULES:
- Do NOT provide numeric scores, percentages, confidence values, or rating scales.
- Do NOT mention ML models, extraction pipelines, taxonomy, ATS parser internals, or weighted formulas.
- Keep tone professional and recruiter-safe.
- Give concrete rewrite suggestions where useful.
- If information is missing in resume, mention that explicitly as a gap.

Return in this exact section format:
**Role Fit Summary**
- ...

**Strengths**
- ...

**Weaknesses / Gaps**
- ...

**Improvements (High Impact)**
- ...

**Suggested Resume Rewrite Examples**
- ...

Resume:
${resumeText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || !text.trim()) {
      throw new Error('Empty analysis response from Gemini');
    }

    return text.trim();
  } catch (error) {
    console.error('Gemini resume analysis error:', error);
    throw new Error('Failed to analyze resume with Gemini. Please try again.');
  }
}

