/* =====================================================================
   CONTENT: everything the site shows.
   Easiest way to edit: the Control Panel at /admin/ on the live site.
   Editing by hand also works: keep this valid JSON (double quotes,
   no comments, no trailing commas).
   ===================================================================== */
const CONTENT = {
  "name": "Hatheem Rafeek",
  "handle": "hatheem-r",
  "role": "CSE undergrad · Data Science & Engineering",
  "about": "Deeply interested in AI/ML Engineering and Agentic AI systems. University of Moratuwa, 2024–2028.",
  "facts": [["Location", "Sri Lanka"], ["Focus", "Machine Learning · Deep Learning · Agentic AI · RAG · Full-Stack"]],
  "photo": "images/me.jpeg",
  "cv": { "file": "cv.pdf", "updated": "Sep 2026" },
  "welcome": { "small": "welcome to", "big": "Hatheem's Space" },
  "music": { "src": "audio/calm-shore.mp3?v=5", "title": "Calm Shore", "volume": 0.008 },
  "boatSays": [
    "ahoy!",
    "Greetings from Hatheem",
    "you're doing great :)",
    "drink some water!",
    "smooth sailing~",
    "hello, sailor!",
    "stay curious",
    "git push, then rest",
    "the sea says hi",
    "take a break, friend",
    "404: worries not found",
    "nice to see you!",
    "keep building ✦"
  ],
  "ticker": "NOW BUILDING: SinTOX paper drafted for IEEE  ★  New: games folder. Try to beat my Minesweeper time  ★",
  "badges": [],
  "contact": {
    "email": "hatheemrafeek9999@gmail.com",
    "github": "https://github.com/hatheem-r",
    "linkedin": "https://www.linkedin.com/in/hatheem-rafeek-24871b336?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    "phone": "+94 74 048 7041"
  },
  "projects": [
    {
      "id": "sintox",
      "title": "SinTOX",
      "year": "2026",
      "kind": "Research",
      "thumb": "chart",
      "blurb": "Token-level Sinhala offensive-language detection without pretrained LMs.",
      "summary": "Marks which words in a Sinhala social-media post are offensive, using a 176K-parameter model instead of a large pretrained transformer.",
      "info": [
        ["Role", "Project lead · class imbalance & evaluation"],
        ["Team", "CS3631 course group"],
        ["Status", "Paper drafted (IEEE format)"],
        ["Dataset", "SOLD"]
      ],
      "stack": ["Python", "BiLSTM-CRF", "BPE subwords", "LaTeX"],
      "links": { "repo": "https://github.com/hatheem-r/project_DNN", "demo": "", "paper": "" },
      "description": [
        "SinTOX began as a CS3631 course submission and grew into a full paper, “Subword Decomposition Closes the Gap”.",
        "Phase 1 reproduced the published BiLSTM-CRF baseline (F1 ≈ 0.597). While checking those numbers we found a precision/recall swap in the SOLD repository's evaluation code.",
        "Phase 2 added a BPE subword channel (1,000 pieces, BiLSTM pooling). F1 rose to ≈ 0.708 with about 176K parameters: above published XLM-T and within 0.012 of XLM-R.",
        "Three more ideas (a joint sentence head, class-balanced losses, distillation from SemiSOLD) gave null results. Those nulls became the paper's central argument: the gain comes from how subwords handle unseen tokens."
      ],
      "highlights": [
        "Unseen-token F1 went from 0.086 to 0.458",
        "Found and documented an evaluation bug in the public benchmark code",
        "Error analysis: use vs. mention, semantic shift, annotation subjectivity, contextual ambiguity"
      ],
      "images": [{ "src": "", "caption": "" }, { "src": "", "caption": "" }]
    },
    {
      "id": "margent",
      "title": "MARGENT",
      "year": "",
      "kind": "Multi Agentic",
      "thumb": "graph",
      "blurb": "Multi-agent market-entry analysis.",
      "summary": "A multi-agent system for market-entry analysis, built with LangGraph and LangChain.",
      "info": [["Role", "Creator"], ["Status", "On - going"]],
      "stack": ["LangGraph", "LangChain"],
      "links": { "repo": "https://github.com/hatheem-r/project-MARGENT", "demo": "" },
      "description": [
        "A multi-agent AI system that produces market-entry analysis reports for the Sri Lankan market. Give it a business idea ('a subscription specialty-coffee delivery service in Colombo') and a team of specialist agents researches demand, competitors and local pricing in parallel, drafts a report, self-critiques it, and asks a human to approve key decisions along the way."
      ],
      "highlights": [],
      "images": [{ "src": "images/projects/margent/img1.jpeg", "caption": "Steamlit UI" }]
    },
    {
      "id": "ragmail",
      "title": "RAGMAIL",
      "year": "",
      "kind": "Agents",
      "blurb": "Agentic RAG email assistant with an MCP server.",
      "summary": "An agentic retrieval-augmented email assistant exposed through an MCP server, built with LangGraph and LangChain.",
      "info": [["Role", "Creator"], ["Status", "On - going"]],
      "stack": ["LangGraph", "LangChain", "RAG", "MCP"],
      "links": { "repo": "https://github.com/hatheem-r/project-RAGMAIL", "demo": "" },
      "description": [
        "An agentic RAG assistant that answers questions over your live Gmail inbox and documents — built to demonstrate modern RAG architecture, the Model Context Protocol (MCP), agentic tool routing, dual memory, and hybrid multimodal retrieval. Ask it 'do I have any pending submissions?', 'any new emails about interviews?', or 'what time is the exam in the attached timetable?' — and watch it choose the right data path for each question."
      ],
      "highlights": [],
      "images": []
    },
    {
      "id": "apoint",
      "title": "aPOINT",
      "year": "",
      "kind": "Agents",
      "blurb": "Multi-agent hotel operations backend.",
      "summary": "A multi-agent backend for hotel operations, built with LangGraph and LangChain.",
      "info": [["Role", "[your role]"], ["Status", "[status]"]],
      "stack": ["LangGraph", "LangChain"],
      "links": { "repo": "https://github.com/hatheem-r/project-APOINT", "demo": "" },
      "description": [
        "AI takes control — people deliver. Guest messages from the web, WhatsApp and email are understood by a team of AI agents that book rooms, answer questions, and dispatch real staff — automatically, in seconds."
      ],
      "highlights": [],
      "images": [{ "src": "images/projects/apoint/img1.png", "caption": "Hotel operations dashboard" }]
    },
    {
      "id": "eazyrents",
      "title": "EazyRents",
      "year": "2026",
      "kind": "Full-stack",
      "thumb": "browser",
      "blurb": "Rentals platform, containerised and deployed on Render.",
      "summary": "A full-stack rentals app: React 19 + Vite front end, Node/Express API, PostgreSQL database.",
      "info": [["Role", "Full-stack + DevOps"], ["Status", "Deployed on Render"]],
      "stack": ["React 19", "Vite", "Express", "PostgreSQL", "Docker", "Render"],
      "links": { "repo": "https://github.com/hatheem-r/EAZYRENTS", "demo": "" },
      "description": [
        "Containerised with docker-compose and multi-stage Dockerfiles, checked by a CI smoke-test pipeline, and deployed with a Render Blueprint.",
        "Two Render-specific failures needed debugging: the free tier rejected preDeployCommand, and a chained shell command exited with code 127. A start.sh startup script fixed both."
      ],
      "highlights": ["Multi-stage Docker builds", "CI smoke-test pipeline", "Render Blueprint deployment"],
      "images": [{ "src": "images/projects/eazyrents/img1.png", "caption": "Listings page" }]
    },
    {
      "id": "voxlit",
      "title": "VoxLIT Diarization",
      "year": "2026",
      "kind": "Group project",
      "thumb": "wave",
      "blurb": "Speaker diarization for an audio-model interpretability tool.",
      "summary": "Extending VoxLIT, an interpretability tool for audio and voice ML models. My part is speaker diarization: who spoke when.",
      "info": [
        ["Role", "Speaker diarization"],
        ["Team", "Group 09 · 3 people"],
        ["Mentor", "Prof. Uthayasanker Thayasivam"],
        ["Status", "In progress"]
      ],
      "stack": ["FastAPI", "React/TS", "Redis", "Audio ML"],
      "links": { "repo": "https://github.com/VoxLIT/VoxLIT", "demo": "" },
      "description": [
        "Interpretability tools such as Google's Learning Interpretability Tool (LIT) have made text and tabular models far easier to inspect, but speech models have no equivalent. Audio adds difficulties of its own: decisions unfold over time, the same signal can be read as a waveform or a spectrogram, and a model can score well by exploiting recording artefacts rather than the voice itself. VoxLIT brings interactive interpretability to speech. It pairs each model's predictions with the evidence behind them (attention, attribution over time, embedding geometry and controlled perturbations) so that researchers can test why a model decides, not only what it decides."
      ],
      "highlights": [],
      "images": [{ "src": "", "caption": "Diarization timeline" }]
    },
    {
      "id": "shorts",
      "title": "Shorts Clipper",
      "year": "2026",
      "kind": "Tool",
      "thumb": "film",
      "blurb": "Turns long YouTube videos into upload-ready Shorts.",
      "summary": "Takes a long YouTube video and cuts upload-ready Shorts, picking clips by context and trends.",
      "info": [["Status", "Building the MVP"], ["Main use", "Anime edits"]],
      "stack": ["Python", "Hugging Face"],
      "links": { "repo": "", "demo": "" },
      "description": [
        "Built only on free, public Hugging Face models.",
        "Most clips are no-speech action and fight scenes from anime, with some speech-based Shorts too. The first step, download and transcription, is in place."
      ],
      "highlights": [],
      "images": []
    }
  ],
  "journal": [
    {
      "id": "hacktoberfest",
      "date": "2026-10-05",
      "title": "Hacktoberfest",
      "tag": "festival",
      "body": [
        "It was a random afternoon. I got bored and scrolling through social media. I was scrolling and scrolling and scrolling until something catched my eyes. It was not a meme. Not a movie update. Not a workout tip. But a poster about a festival. It was not a regular festival. But a festival for devs -  Hacktoberfest.",
        "Hacktoberfest is a month-long celebration of open source throughout October. This year, it’s all about building with open-weight models and open-source AI. It’s free, and it’s for everyone, wherever we are in our open-source AI or software creating journey. We can join one of 300+ Fests in cities around the world, take part online all month, or both.",
        "So this time in challenges, hacktoberfest had two types. DEV and kaggle. In dev we have to create a open-source AI product and write about it in DEV. The week 1 theme was build for a friend. We have to build an AI for a friend's problem with openly available model, frameworks, harnesses,...",
        "So I built an app called CircleUp. CircleUp gets your timetable image and fetches moodle calendar and finds gaps amidst lectures and deadlines and rank the best time of the week or hangingout. Siince there were special prizes provided for using some of their partnership tools. Gemma, Render, SerpApi were in it. I used Gemma3B to analyze the image of  timetable and tbh it was terrible. I found that 3-4B model are not supposed to process grid diagrams. So i tried to switch to gamma12B and nearly missed a chance to blow up my macM2 as I force quit ollama serve. And ummm... I generated a list style timetable from gemini banana (This doesnt count as cheating. right?) and used that for demo, using gemma3B as it was. And did the arithmatic in python to find the gaps (firstly tried to make the model do it. but it sucked) and used SerpApi (google api) to find nearest hotel in those gap times. and asked model to justify choosing top 3 places to suggest (atleast it did this well, although I have to hard restrict to cite the index of the pulled hotels by serpapi to prevent the \"Brilliant\" gemma not to come up with a non existing hotel). And deployed the service of serpapi and frontend in Render. Recorded a demo. Asked claude to give niche post to put in DEV. and the beginning of my hacktober first came to end in such way!",
        "Demo video drive link: https://drive.google.com/drive/folders/1ForC4309PeUt41V1Ur_KCAQY2WygBu49",
        "Code Check the repo here: https://github.com/hatheem-r/project_CIRCLEUP frontend link: https://project-circleup.onrender.com/",
        "And the week 2 already had begun and the theme is Touch Grass, where this time the product need to get people out into the real world.",
        "The walk into the hacktoberfest 26 was so fun. Hoping to win something in upcoming challenges 😉"
      ],
      "images": [
        {
          "src": "images/journal/hacktoberfest/into-the-hacktoberfest.webp",
          "caption": "Into the Hacktoberfest"
        }
      ]
    },
    {
      "id": "hello-world",
      "date": "2026-10-03",
      "title": "Hello, world",
      "tag": "site",
      "body": [
        "This is the first entry on my new site. It runs like a 1998 desktop: open windows, drag them around, play a game.",
        "I'll use this journal for the stories behind my projects: workshops, competitions, and the things that broke along the way."
      ],
      "images": [{ "src": "images/journal1.jpeg", "caption": "Me into the unknown void" }]
    }
  ],
  "certificates": [
    {
      "course": "Agentic AI",
      "issuer": "DeepLearning.AI",
      "date": "Jan 2026",
      "image": "certs/agenticai_deeplearningAI.png"
    },
    {
      "course": "Introduction to LangGraph : Python",
      "issuer": "LangChain Academy",
      "date": "Jul 2026",
      "image": "certs/langgraph_langchainacademy.png"
    },
    {
      "course": "Supervised Machine Learning",
      "issuer": "Coursera | Stanford",
      "date": "Jan 2026",
      "image": "certs/supervisedml_coursera.png"
    },
    { "course": "Intro to MCP", "issuer": "Scrimba", "date": "Jul 2026", "image": "certs/mcp_scrimba.png" }
  ],
  "accomplishments": [
    {
      "year": "2026",
      "title": "Intern Machine Learning Engineer offer",
      "org": "SenzMate (Pvt) Ltd",
      "note": "Starts 16 Nov 2026"
    },
    {
      "year": "2026",
      "title": "IEEE paper drafted: “Subword Decomposition Closes the Gap”",
      "org": "SinTOX",
      "note": "Venue to be confirmed"
    },
    { "year": "2024", "title": "Dean's List", "org": "University of Moratuwa", "note": "Semester 1" }
  ],
  "competitions": [
    {
      "year": "2025",
      "name": "Octwave 2.0",
      "type": "Machine learning",
      "place": 2,
      "result": "Overall runner-up"
    },
    {
      "year": "2026",
      "name": "Idealize 2.0",
      "type": "MultiAgentic AI Hackathon",
      "place": "",
      "result": "Semi-Finalist"
    },
    { "year": "2026", "name": "CodeSplash 2.0", "type": "Agentic AI", "place": "", "result": "Semi-Finalist" }
  ]
};
