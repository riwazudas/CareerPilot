%-------------------------
% Resume in Latex
%------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}

\usepackage{fontawesome5}
\usepackage[scale=0.90,lf]{FiraMono}

\definecolor{light-grey}{gray}{0.83}
\definecolor{dark-grey}{gray}{0.3}
\definecolor{text-grey}{gray}{.08}

\usepackage{contour}
\usepackage[normalem]{ulem}

\usepackage{tgheros}
\renewcommand*\familydefault{\sfdefault}
\usepackage[T1]{fontenc}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{0in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

\titleformat {\section}{
    \bfseries \vspace{2pt} \raggedright \large
}{}{0em}{}[\color{light-grey} {\titlerule[2pt]} \vspace{-4pt}]

% Custom commands

\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-1pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-1pt}\item
    \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & {\color{dark-grey}\small #2}\vspace{1pt}\\
      \textit{#3} & {\color{dark-grey} \small #4}\\
    \end{tabular*}\vspace{-4pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
      #1 & {\color{dark-grey}} \\
    \end{tabular*}\vspace{-4pt}
}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{0pt}}

\color{text-grey}

%-------------------------------------------
%%%%%% RESUME STARTS HERE %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}

%----------HEADING----------
\begin{center}
    \textbf{\Huge Riwaz Udas} \\ \vspace{4pt}

    \scriptsize
    \faPhone* \ 0451337510 \ $|$ \
    \faEnvelope \ udasriwaz@gmail.com \ $|$ \
    \faLinkedin \ \href{https://www.linkedin.com/in/riwaz-udas-7aab521b1/}{riwaz-udas} \ $|$ \
    \faGithub \ \href{https://github.com/riwazudas}{GitHub} \ $|$ \
    \faGlobe \ \href{https://portfolio-website-496606.web.app}{Portfolio}
\end{center}

%-----------SUMMARY-----------

\section{PROFESSIONAL SUMMARY}

\begin{itemize}[leftmargin=0in, label={}]
\small{\item{

AI Engineer with a Master’s degree in Computer Science from the University of Melbourne specializing in Large Language Models, multimodal AI systems, Retrieval-Augmented Generation (RAG), and scalable backend infrastructure. Experienced in fine-tuning and deploying transformer models using PyTorch and Hugging Face, building production-grade APIs in Go and FastAPI, and developing distributed authentication systems supporting millions of users. Strong background in LLM optimization, vector search, multilingual AI systems, cloud deployment, and high-scale microservice architectures.

}}
\end{itemize}

%-----------TECHNICAL SKILLS-----------

\section{TECHNICAL SKILLS}

\begin{itemize}[leftmargin=0in, label={}]
\small{\item{

\textbf{AI / Machine Learning:} PyTorch, TensorFlow, Scikit-learn, Reinforcement Learning (PPO, SAC, A2C, IMPALA) \\

\textbf{LLM \& AI Systems:} Hugging Face Transformers, RAG, LangChain, LoRA, PEFT, Prompt Engineering, Instruction Tuning, Vector Search, Multilingual AI \\

\textbf{Programming Languages:} Python, Go, Java, JavaScript, C, C\# \\

\textbf{Backend \& APIs:} Spring Boot, FastAPI, NodeJS, REST API Design, Authentication Systems, Microservices \\

\textbf{Databases:} PostgreSQL, MySQL, MongoDB, Query Optimization, Indexing, VectorDB \\

\textbf{Cloud \& DevOps:} AWS, Google Cloud Platform (GCP), Firebase, Docker, Kubernetes, Kafka, Linux, Git, CI/CD \\

\textbf{MLOps \& Infrastructure:} Hugging Face Accelerate, TensorBoard, Weights \& Biases \\

\textbf{Data \& Geospatial Tools:} OpenStreetMap, GIS

}}
\end{itemize}

%-----------EXPERIENCE-----------

\section{EXPERIENCE}

\resumeSubHeadingListStart

\resumeSubheading
{Byju’s}{Oct 2023 -- Jan 2024}
{Member of Technical Staff I}{Bangalore, India}

\resumeItemListStart

\resumeItem{Developed and maintained authentication and authorization systems based on \textbf{OAuth 2.0} using \textbf{Ory Hydra}, supporting secure identity management across multiple internal platforms}

\resumeItem{Designed and maintained \textbf{30+ production REST APIs} supporting login flows, token validation, and identity services used across large-scale educational products}

\resumeItem{Coordinated with \textbf{third-party service providers} to integrate \textbf{mobile OTP authentication and secure login-link systems}, improving user login reliability and security}

\resumeItem{Implemented a \textbf{sliding-window rate limiting middleware} with IP filtering to mitigate DDoS attacks, blocking \textbf{50K+ malicious requests} and strengthening authentication security}

\resumeItem{Designed adaptive traffic filtering strategies for authentication systems using behavioral request analysis and rate-limiting heuristics}

\resumeItem{Diagnosed and resolved \textbf{cross-service production incidents} across distributed identity microservices while providing \textbf{Level 3 operational support}}

\resumeItem{Optimized \textbf{SQL queries and indexing strategies} for databases supporting \textbf{2M+ daily users}, improving API response latency and system throughput}

\resumeItem{Containerized backend microservices using \textbf{Docker} and deployed them on \textbf{AWS ECS and EKS}, enabling scalable and fault-tolerant service deployment}

\resumeItem{Engineered CI/CD pipelines automating build, testing, and deployment workflows from GitHub to AWS ECS, reducing release overhead and improving deployment reliability}

\resumeItem{Automated lifecycle management scripts for expired \textbf{OAuth records} in \textbf{Ory Hydra} using Golang, processing \textbf{100M+ records annually}}

\resumeItem{Refactored legacy services into an \textbf{interface-based modular architecture} and authored \textbf{200+ automated tests} across production APIs}

\resumeItemListEnd

\resumeSubheading
{Byju’s}{Jan 2023 -- Sep 2023}
{Software Engineering Intern}{Bangalore, India}

\resumeItemListStart

\resumeItem{Contributed to a \textbf{Golang-based OAuth 2.0 identity platform} responsible for authentication and authorization across \textbf{10+ internal product verticals}}

\resumeItem{Designed and implemented scalable \textbf{REST APIs} supporting login flows, token validation, OTP authentication, and user identity services}

\resumeItem{Collaborated with \textbf{third-party providers} to integrate \textbf{mobile OTP authentication and secure login-link systems} into production authentication workflows}

\resumeItem{Integrated \textbf{Prometheus custom metrics} to monitor request latency, authentication failures, and system throughput across \textbf{30+ APIs}}

\resumeItem{Built monitoring dashboards and alert pipelines using \textbf{Grafana and Prometheus}, configuring \textbf{15+ automated alerts} to improve system observability and reliability}

\resumeItem{Worked with an \textbf{8-person platform engineering team} to improve authentication reliability, operational monitoring, and security across distributed microservices}

\resumeItem{Proposed and implemented \textbf{custom monitoring metrics} tracking OTP usage, login success rates, API errors, and system performance}

\resumeItemListEnd

\resumeSubheading
{Quantum AI Cloud}{Jul 2024 -- Sep 2024}
{Research Intern}{Melbourne, Australia}

\resumeItemListStart

\resumeItem{Developed reinforcement learning frameworks for \textbf{intelligent task scheduling} in quantum cloud computing environments}

\resumeItem{Implemented and benchmarked advanced RL algorithms including \textbf{A2C, PPO, SAC, and IMPALA} for dynamic workload allocation}

\resumeItem{Simulated quantum computing task placement scenarios and evaluated performance improvements in distributed resource allocation}

\resumeItem{Collaborated with researchers to evaluate AI-driven orchestration strategies for hybrid classical--quantum infrastructure}

\resumeItemListEnd

\resumeSubHeadingListEnd

%-----------PROJECTS-----------

\section{PROJECTS}

\resumeSubHeadingListStart

\resumeProjectHeading
{\textbf{Nepal Law AI Platform using Multilingual RAG}}{}

\resumeItemListStart

\resumeItem{Built a \textbf{multilingual legal AI platform} for Nepalese law queries using \textbf{Retrieval-Augmented Generation (RAG)} pipelines}

\resumeItem{Implemented \textbf{cross-language semantic retrieval} using multilingual embeddings, vector search, and contextual reranking for English and Nepali legal documents}

\resumeItem{Developed automated \textbf{web scraping, ingestion, chunking, and embedding pipelines} for continuously updating legal acts and regulations}

\resumeItem{Designed \textbf{self-healing knowledge base workflows} to refresh outdated embeddings and maintain retrieval consistency over time}

\resumeItem{Built scalable backend APIs and deployed the platform on \textbf{Google Cloud Platform (GCP)} using \textbf{FastAPI, Hugging Face, and vector search infrastructure}}

\resumeItemListEnd

\resumeProjectHeading
{\textbf{AI Portfolio Website with Personal RAG Chatbot}}{}

\resumeItemListStart

\resumeItem{Developed a modern \textbf{AI portfolio website} showcasing machine learning, backend engineering, and research projects}

\resumeItem{Built an integrated \textbf{RAG-based chatbot} trained on personal projects, resume data, technical experience, and research work}

\resumeItem{Implemented \textbf{semantic search and vector embedding pipelines} enabling conversational querying over portfolio content}

\resumeItem{Developed backend inference APIs using \textbf{Python and FastAPI} and deployed the platform using \textbf{Firebase Hosting}}

\resumeItemListEnd

\resumeProjectHeading
{\textbf{Social Media Geotagging using Large Language Models (Master’s Thesis)}}{}

\resumeItemListStart

\resumeItem{Designed a \textbf{multimodal geolocation prediction system} combining textual signals, metadata, and hierarchical geographic structures from social media posts}

\resumeItem{Fine-tuned \textbf{LLaMA, Gemma, and Mistral} models using \textbf{PyTorch and Hugging Face Transformers}}

\resumeItem{Implemented a \textbf{hierarchical multi-task learning architecture} predicting state, city, municipality, and suburb levels}

\resumeItem{Applied \textbf{LoRA fine-tuning, instruction tuning, and multimodal fusion} to improve geospatial prediction accuracy}

\resumeItem{Trained transformer models on \textbf{multi-million record datasets} using distributed GPU training and Hugging Face Accelerate}

\resumeItemListEnd

\resumeSubHeadingListEnd

%-----------EDUCATION-----------

\section{EDUCATION}

\resumeSubHeadingListStart

\resumeSubheading
{University of Melbourne}{Feb 2024 -- Dec 2025}
{Master of Computer Science}{Melbourne, Australia}

\resumeItemListStart

\resumeItem{Master’s Thesis: \textbf{Multimodal Social Media Geotagging using Large Language Models}}

\resumeItem{\textbf{Coursework:} Computer Vision, Distributed Systems, Advanced Databases, AI Planning for Autonomy, Machine Learning in Health, Computational Modelling and Simulation}

\resumeItemListEnd

\resumeSubheading
{Vellore Institute of Technology}{2019 -- 2023}
{Bachelor of Technology, Computer Science and Engineering}{India}

\resumeSubHeadingListEnd

%-----------CERTIFICATIONS-----------

\section{CERTIFICATIONS}

\begin{itemize}[leftmargin=0in, label={}]
\small{\item{

\textbf{Salesforce Certified AI Associate} \\

\textbf{Algorithmic Thinking} -- Rice University (Coursera) \\

\textbf{Artificial Intelligence Foundation Certification} -- NASSCOM \\

\textbf{Big Data Foundation Certification} -- NASSCOM \\

\textbf{Kotlin for Java Developers} -- JetBrains (Coursera)

}}
\end{itemize}

%-------------------------------------------

\end{document}