export const defaultResume = `# Riwaz Udas

Melbourne, VIC, Australia | 0451337510 | udasriwaz@gmail.com
[LinkedIn](https://www.linkedin.com/in/riwaz-udas-7aab521b1/) | [GitHub](https://github.com/riwazudas) | [Portfolio](https://portfolio-website-496606.web.app)

---

# PROFESSIONAL SUMMARY

AI Engineer with a Master’s degree in Computer Science from the University of Melbourne specializing in Large Language Models, multimodal AI systems, Retrieval-Augmented Generation (RAG), and scalable backend infrastructure. Experienced in fine-tuning and deploying transformer models using PyTorch and Hugging Face, building production-grade APIs in Go and FastAPI, and developing distributed authentication systems supporting millions of users. Strong background in LLM optimization, vector search, multilingual AI systems, cloud deployment, and high-scale microservice architectures.

---

# TECHNICAL SKILLS

- **AI / Machine Learning:** PyTorch, TensorFlow, Scikit-learn, Reinforcement Learning (PPO, SAC, A2C, IMPALA)
- **LLM & AI Systems:** Hugging Face Transformers, RAG, LangChain, LoRA, PEFT, Prompt Engineering, Instruction Tuning, Vector Search, Multilingual AI
- **Programming Languages:** Python, Go, Java, JavaScript, C, C#
- **Backend & APIs:** Spring Boot, FastAPI, NodeJS, REST API Design, Authentication Systems, Microservices
- **Databases:** PostgreSQL, MySQL, MongoDB, Query Optimization, Indexing, VectorDB
- **Cloud & DevOps:** AWS, Google Cloud Platform (GCP), Firebase, Docker, Kubernetes, Kafka, Linux, Git, CI/CD
- **MLOps & Infrastructure:** Hugging Face Accelerate, TensorBoard, Weights & Biases
- **Data & Geospatial Tools:** OpenStreetMap, GIS

---

# EXPERIENCE

## Byju’s
### Member of Technical Staff I
**Bangalore, India | Oct 2023 – Jan 2024**

- Developed and maintained authentication and authorization systems based on OAuth 2.0 using Ory Hydra, supporting secure identity management across multiple internal platforms
- Designed and maintained 30+ production REST APIs supporting login flows, token validation, and identity services used across large-scale educational products
- Coordinated with third-party service providers to integrate mobile OTP authentication and secure login-link systems, improving user login reliability and security
- Implemented a sliding-window rate limiting middleware with IP filtering to mitigate DDoS attacks, blocking 50K+ malicious requests and strengthening authentication security
- Designed adaptive traffic filtering strategies for authentication systems using behavioral request analysis and rate-limiting heuristics
- Diagnosed and resolved cross-service production incidents across distributed identity microservices while providing Level 3 operational support
- Optimized SQL queries and indexing strategies for databases supporting 2M+ daily users, improving API response latency and system throughput
- Containerized backend microservices using Docker and deployed them on AWS ECS and EKS, enabling scalable and fault-tolerant service deployment
- Engineered CI/CD pipelines automating build, testing, and deployment workflows from GitHub to AWS ECS, reducing release overhead and improving deployment reliability
- Automated lifecycle management scripts for expired OAuth records in Ory Hydra using Golang, processing 100M+ records annually
- Refactored legacy services into an interface-based modular architecture and authored 200+ automated tests across production APIs

## Byju’s
### Software Engineering Intern
**Bangalore, India | Jan 2023 – Sep 2023**

- Contributed to a Golang-based OAuth 2.0 identity platform responsible for authentication and authorization across 10+ internal product verticals
- Designed and implemented scalable REST APIs supporting login flows, token validation, OTP authentication, and user identity services
- Collaborated with third-party providers to integrate mobile OTP authentication and secure login-link systems into production authentication workflows
- Integrated Prometheus custom metrics to monitor request latency, authentication failures, and system throughput across 30+ APIs
- Built monitoring dashboards and alert pipelines using Grafana and Prometheus, configuring 15+ automated alerts to improve system observability and reliability
- Worked with an 8-person platform engineering team to improve authentication reliability, operational monitoring, and security across distributed microservices
- Proposed and implemented custom monitoring metrics tracking OTP usage, login success rates, API errors, and system performance

## Quantum AI Cloud
### Research Intern
**Melbourne, Australia | Jul 2024 – Sep 2024**

- Developed reinforcement learning frameworks for intelligent task scheduling in quantum cloud computing environments
- Implemented and benchmarked advanced RL algorithms including A2C, PPO, SAC, and IMPALA for dynamic workload allocation
- Simulated quantum computing task placement scenarios and evaluated performance improvements in distributed resource allocation
- Collaborated with researchers to evaluate AI-driven orchestration strategies for hybrid classical–quantum infrastructure

---

# PROJECTS

## Nepal Law AI Platform using Multilingual RAG

- Built a multilingual legal AI platform for Nepalese law queries using Retrieval-Augmented Generation (RAG) pipelines
- Implemented cross-language semantic retrieval using multilingual embeddings, vector search, and contextual reranking for English and Nepali legal documents
- Developed automated web scraping, ingestion, chunking, and embedding pipelines for continuously updating legal acts and regulations
- Designed self-healing knowledge base workflows to refresh outdated embeddings and maintain retrieval consistency over time
- Built scalable backend APIs and deployed the platform on Google Cloud Platform (GCP) using FastAPI, Hugging Face, and vector search infrastructure

## AI Portfolio Website with Personal RAG Chatbot

- Developed a modern AI portfolio website showcasing machine learning, backend engineering, and research projects
- Built an integrated RAG-based chatbot trained on personal projects, resume data, technical experience, and research work
- Implemented semantic search and vector embedding pipelines enabling conversational querying over portfolio content
- Developed backend inference APIs using Python and FastAPI and deployed the platform using Firebase Hosting

## Social Media Geotagging using Large Language Models (Master’s Thesis)

- Designed a multimodal geolocation prediction system combining textual signals, metadata, and hierarchical geographic structures from social media posts
- Fine-tuned LLaMA, Gemma, and Mistral models using PyTorch and Hugging Face Transformers
- Implemented a hierarchical multi-task learning architecture predicting state, city, municipality, and suburb levels
- Applied LoRA fine-tuning, instruction tuning, and multimodal fusion to improve geospatial prediction accuracy
- Trained transformer models on multi-million record datasets using distributed GPU training and Hugging Face Accelerate

---

# EDUCATION

## University of Melbourne
### Master of Computer Science
**Melbourne, Australia | Feb 2024 – Dec 2025**

- Master’s Thesis: Multimodal Social Media Geotagging using Large Language Models
- Coursework: Computer Vision, Distributed Systems, Advanced Databases, AI Planning for Autonomy, Machine Learning in Health, Computational Modelling and Simulation

## Vellore Institute of Technology
### Bachelor of Technology, Computer Science and Engineering
**India | 2019 – 2023**

---

# CERTIFICATIONS

- **Salesforce Certified AI Associate**
- **Algorithmic Thinking** -- Rice University (Coursera)
- **Artificial Intelligence Foundation Certification** -- NASSCOM
- **Big Data Foundation Certification** -- NASSCOM
- **Kotlin for Java Developers** -- JetBrains (Coursera)
`;
