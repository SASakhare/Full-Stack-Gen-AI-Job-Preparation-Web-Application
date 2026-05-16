const { GoogleGenAI } = require("@google/genai");
const { z } = require('zod');
const { zodToJsonSchema } = require("zod-to-json-schema");

const puppeteer = require('puppeteer-core')
const chromium = require("@sparticuz/chromium");
const isProduction = process.env.NODE_ENV === "production";


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const interviewReportSchema = z.object({
    title: z.string(),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),
            severity: z.enum(["low", "medium", "high"])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ),
    title: z.string(),
});
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
    You are an expert technical interview coach, senior recruiter, hiring manager, and career advisor.

    Your responsibility is to deeply analyze the candidate’s profile against the target job description and generate a highly accurate, personalized, role-specific interview preparation report.

    This report will be used in a production system where the output is directly parsed using:

    JSON.parse(response.text)

    This means your response MUST be STRICTLY VALID JSON.

    Any extra text, explanation, markdown formatting, invalid commas, comments, code fences, notes, or incomplete structure will break the system.

    You must follow every instruction with maximum precision.

    --------------------------------------------------
    ## INPUTS
    --------------------------------------------------

    ### Resume:
    ${resume}

    ### Self Description (Candidate's own words about themselves):
    ${selfDescription}

    ### Job Description:
    ${jobDescription}

    --------------------------------------------------
    ## YOUR TASK
    --------------------------------------------------

    Using the three inputs above, generate ONE JSON object that strictly follows this exact structure:

    {
    "title": "<exact job title extracted from the job description>",

    
    "skillGaps": [
        {
            "skill": "<skill, tool, framework, domain knowledge, or concept in the job description missing or weak in the candidate's resume>",
        "severity": "<high | medium | low>"
        }
        ],
        
    "technicalQuestions": [
            {
            "question": "<a specific technical question tailored to the job description and candidate's resume>",
            "intention": "<what the interviewer is actually testing with this question>",
            "answer": "<detailed answer guide: key concepts to cover, approach to take, frameworks, system design thinking, code patterns, optimization approaches, debugging approach, or architecture discussion depending on role>"
            }
        ],
    
    "behavioralQuestions": [
            {
            "question": "<a realistic behavioral question based on soft skills, ownership, teamwork, leadership, communication, adaptability, problem solving, or conflict handling from the job description>",
            "intention": "<what the interviewer is actually testing with this question>",
            "answer": "<STAR-based answer guide tied to candidate's real background: Situation, Task, Action, Result, measurable impact, learning outcome, and how to present it professionally>"
            }
        ],
    "preparationPlan": [
        {
        "day": 1,
        "focus": "<main theme of the day such as DSA Arrays & Strings, REST APIs, ML Fundamentals, System Design Basics, Resume Revision, SQL Optimization, OOP Revision etc.>",
        "tasks": [
            "<specific actionable task>",
            "<specific actionable task>",
            "<specific actionable task>"
        ]
        }
    ]
    }

    --------------------------------------------------
    ## STRICT RULES (MANDATORY)
    --------------------------------------------------

    1. Return ONLY the raw JSON object.

    2. Do NOT return:
    - markdown
    - explanation
    - notes
    - headings
    - comments
    - code blocks
    - \`\`\`json
    - extra text before JSON
    - extra text after JSON

    3. Every field must be present.
    Do not skip any key.

    4. "title" must be a string extracted directly from the Job Description.
    Do not invent job titles.

    5. "technicalQuestion" must contain EXACTLY 5 to 8 items.

    6. Every technical question must be:
    - specific to the role
    - specific to the candidate profile
    - based on the actual resume + JD
    - realistic for interviews
    - not generic textbook questions

    7. Every technical question object must contain:
    - question
    - intention
    - answer

    8. "answer" for technical questions must be detailed and practical.
    It should explain:
    - what to say
    - how to structure the answer
    - what technical depth to show
    - what examples to mention
    - what mistakes to avoid

    9. "behavioralQuestion" must contain EXACTLY 5 to 8 items.

    10. Every behavioral question must be:
    - realistic
    - role-specific
    - based on JD expectations
    - based on candidate’s actual background

    11. Every behavioral question object must contain:
    - question
    - intention
    - answer

    12. Behavioral answers must use STAR format:
    - Situation
    - Task
    - Action
    - Result

    Also include:
    - measurable outcomes if possible
    - ownership shown
    - learning outcome
    - leadership or teamwork demonstration where relevant

    13. "skillGaps" must include only real missing or weak skills from the candidate profile compared to JD.

    14. Do NOT hallucinate fake missing skills.

    15. "severity" must be ONLY one of:
    - "high"
    - "medium"
    - "low"

    No other values are allowed.

    16. Severity meaning:
    - high = critical for role and candidate has little or no evidence
    - medium = important skill with partial or transferable experience
    - low = nice-to-have and can be learned quickly

    17. "preparationPlan" must contain EXACTLY 14 objects.

    18. "day" values must be:
    1 through 14 only

    in exact order.

    19. Every day must contain:
    - day
    - focus
    - tasks

    20. Every day must have at least 3 tasks.

    21. Tasks must be:
    - practical
    - measurable
    - interview-oriented
    - specific
    - realistic for one day

    Bad example:
    "Study DSA"

    Good example:
    "Solve 3 medium LeetCode problems on arrays and explain optimal approach aloud"

    22. Day 14 MUST be:
    Full mock interview + light revision + confidence building + rest

    23. Do NOT leave empty strings.

    24. Do NOT generate placeholder values.

    25. Do NOT invent fake projects, fake internships, fake tools, fake achievements, or fake experiences.

    26. Use ONLY the provided Resume + Self Description + Job Description.

    27. Questions must be highly personalized and useful for real interview preparation.

    28. The final output must be production-safe JSON that can be parsed instantly using:

    JSON.parse(response.text)

    29. Invalid JSON is considered failure.

    30. Accuracy is more important than creativity.

    Now generate the final JSON output only.
    `;

    // ✅ Fix: Extract only the core schema, strip zod-to-json-schema wrapper
    const fullSchema = zodToJsonSchema(interviewReportSchema, { target: "openApi3" });

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",  // ✅ Fix: correct model name
        contents: prompt,
        config: {
            responseFormat: { text: { mimeType: "application/json", schema: fullSchema } },
        },
        temperature: 0.2,
    });

    // raw output
    let rawText = response.text;

    // ✅ Remove markdown code block wrappers if present
    rawText = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let result;

    try {
        result = JSON.parse(rawText);
    } catch (error) {
        // console.log("RAW RESPONSE:");
        // console.log(rawText);

        throw new Error("JSON parsing failed");
    }

    // console.log(JSON.stringify(result, null, 2));

    return result;
}





async function generatePDFFromHTML(htmlContent) {

    const browser = await puppeteer.launch(
        isProduction
            ? {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            }
            : {
                executablePath:
                    "C:/Program Files/Google/Chrome/Application/chrome.exe",
                headless: true,
            }
    );

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
        },
    });

    await browser.close();

    return pdfBuffer
}


async function generateResumePDF({ resume, selfDescription, jobDescription }) {

    const resumepdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using library puppeteer-core and sparticuz/chromium")
    })

    const prompt = `
    Generate a highly professional, ATS-friendly, recruiter-optimized resume for the candidate using the following details:

    Candidate Resume Information:
    ${resume}

    Self Description:
    ${selfDescription}

    Target Job Description:
    ${jobDescription}

    IMPORTANT OBJECTIVE:
    The goal is to create a premium-quality resume that maximizes the candidate’s chances of getting shortlisted for interviews by aligning strongly with the target job description while remaining realistic, professional, and human-written.

    The generated output must be specifically designed for PDF generation using:
    - puppeteer-core
    - @sparticuz/chromium

    This means the HTML must be production-ready for browser-based PDF rendering.

    ==================================================
    STRICT REQUIREMENTS
    ==================================================

    1. RESPONSE FORMAT

    Return ONLY a valid JSON object with exactly one field:

    {
    "html": "complete HTML content here"
    }

    Do not return markdown.
    Do not use code blocks.
    Do not add explanations outside JSON.
    Do not add extra fields.

    ==================================================
    2. HTML REQUIREMENTS (VERY IMPORTANT)
    ==================================================

    The "html" field must contain COMPLETE clean HTML that can be directly rendered and converted to PDF using:

    - puppeteer-core
    - @sparticuz/chromium

    The HTML must include:

    - full HTML structure
    - <!DOCTYPE html>
    - <html>
    - <head>
    - <body>
    - proper inline CSS only
    - professional typography
    - print-safe formatting
    - A4 PDF friendly layout
    - consistent spacing
    - clean hierarchy
    - visually polished formatting
    - proper margins and padding
    - strong readability
    - excellent PDF rendering quality

    The HTML should look excellent when exported as PDF.

    Use:

    - inline CSS only
    - simple professional design
    - ATS-friendly formatting
    - print-friendly layout
    - proper font sizing
    - clean section separation
    - balanced white space
    - strong readability

    Avoid:

    - external CSS files
    - JavaScript
    - Tailwind classes
    - React syntax
    - complex CSS frameworks
    - unnecessary graphics
    - heavy tables
    - complicated multi-column layouts
    - excessive icons
    - overly decorative elements
    - backgrounds that break PDF rendering

    The design must be elegant, premium, professional, recruiter-friendly, and ATS compatible.

    ==================================================
    3. RESUME QUALITY REQUIREMENTS
    ==================================================

    The resume must:

    - be highly tailored to the target job description
    - prioritize relevant skills and experience
    - include important keywords from the job description naturally
    - improve ATS match score significantly
    - sound human-written, not AI-generated
    - avoid generic fluff and vague statements
    - use strong action verbs
    - show measurable impact where possible
    - highlight projects with real business/technical value
    - emphasize achievements over responsibilities
    - make the candidate look strong but realistic

    The final resume should feel like it was written by an expert recruiter.

    ==================================================
    4. STRUCTURE TO INCLUDE
    ==================================================

    Create sections only when relevant:

    - Full Name
    - Professional Title
    - Contact Information
    - Professional Summary
    - Technical Skills
    - Work Experience / Internship Experience
    - Projects
    - Education
    - Certifications
    - Achievements
    - Leadership / Extracurricular (if valuable)
    - Publications / Research (if relevant)

    Do not force unnecessary sections.

    Do not include weak filler sections.

    ==================================================
    5. PROFESSIONAL SUMMARY
    ==================================================

    Write a strong recruiter-focused summary that is:

    - concise
    - role-specific
    - impactful
    - achievement-oriented
    - keyword-rich
    - highly relevant to the target role

    This section must strongly improve shortlist chances.

    This should create a powerful first impression within 6–8 seconds.

    ==================================================
    6. PROJECTS SECTION
    ==================================================

    Projects must:

    - align strongly with the target role
    - highlight technical depth
    - show measurable outcomes
    - include tools/technologies used
    - explain business impact or problem solved
    - reflect practical industry relevance

    Do not write weak student-style project descriptions.

    Projects should look strong enough for recruiter attention.

    ==================================================
    7. EXPERIENCE SECTION
    ==================================================

    Experience must:

    - prioritize relevant achievements
    - include quantified results when possible
    - be concise and powerful
    - look realistic and professional
    - focus on value delivered

    Avoid generic responsibility-only descriptions.

    ==================================================
    8. ATS OPTIMIZATION
    ==================================================

    Ensure:

    - strong keyword matching
    - recruiter scanning friendliness
    - clean hierarchy
    - ATS parser compatibility
    - strong first impression
    - high shortlist probability

    The resume should be optimized for both:

    1. ATS systems
    2. Human recruiters

    ==================================================
    9. LENGTH
    ==================================================

    Keep the final resume ideally within:

    1–2 pages maximum when converted to PDF.

    Focus on:

    quality > quantity

    Do not make it too lengthy.

    ==================================================
    10. FINAL STANDARD
    ==================================================

    The final resume should look like something created by:

    an experienced recruiter
    OR
    a senior career consultant
    for top-tier companies.

    It should feel:

    premium
    professional
    credible
    strong
    interview-converting

    The final HTML should be immediately usable for:

    await page.setContent(html)
    await page.pdf()

    without requiring major cleanup.
    `;

    const fullSchema = zodToJsonSchema(resumepdfSchema, { target: "openApi3" });

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",  // ✅ Fix: correct model name
        contents: prompt,
        config: {
            responseFormat: { text: { mimeType: "application/json", schema: fullSchema } },
        },
        temperature: 0.2,
    });

    const jsonContent = JSON.parse(response.text)

    // console.log(jsonContent.html);
    

    const pdfBuffer = await generatePDFFromHTML(jsonContent.html)

    return pdfBuffer
}


module.exports = { generateInterviewReport, generateResumePDF };