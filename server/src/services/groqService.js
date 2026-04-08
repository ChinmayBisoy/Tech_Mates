require('dotenv').config();

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'mixtral-8x7b-32k';
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async makeAPIRequest(prompt) {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(this.baseURL, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const errorMessage = error.error?.message || `HTTP ${response.status}`;
        console.error(`Groq API Error: ${response.status} - ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Groq API Request Failed:', error.message);
      throw error;
    }
  }

  async retryWithBackoff(fn, retries = this.maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.message.includes('429')) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (this.maxRetries - retries + 1)));
        return this.retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }

  parseJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  async refineProjectDescription(roughDescription) {
    if (!roughDescription || roughDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    const prompt = `You are a professional project manager and business consultant. The user provided this project description:

"${roughDescription}"

Analyze this and provide professional improvements. Return ONLY valid JSON (no markdown, no code blocks):

{
  "refinedDescription": "Provide a polished, 2-3 paragraph professional description that explains: 1) What the project delivers, 2) Target users/businesses, 3) Key benefits and outcomes",
  "skills": ["skill1", "skill2", "skill3", "skill4"],
  "difficulty": "Easy/Intermediate/Advanced",
  "estimatedDays": "realistic number",
  "estimatedBudget": "₹X,XXX-Y,YYY range",
  "keyPoints": ["key point 1", "key point 2", "key point 3"]
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response from Groq API');
      
      let cleanContent = content;
      if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '');
      }
      cleanContent = cleanContent.trim();

      const parsed = this.parseJSON(cleanContent);
      if (!parsed) {
        return {
          refinedDescription: roughDescription,
          skills: ['JavaScript', 'Node.js', 'React', 'MongoDB'],
          difficulty: 'Intermediate',
          estimatedDays: 21,
          estimatedBudget: '₹50,000-100,000',
          keyPoints: ['Professional Solution', 'Scalable Architecture', 'User-Friendly Design'],
        };
      }
      return parsed;
    });
  }

  async extractProjectSkills(projectDescription) {
    if (!projectDescription || projectDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    const prompt = `Analyze this project and recommend specific skills needed:

"${projectDescription}"

Return ONLY valid JSON (no markdown, no code blocks). Be specific with technology names:

{
  "skills": ["React.js", "Node.js", "MongoDB", "AWS", "REST APIs"],
  "level": "beginner|intermediate|advanced",
  "category": "Web Development|Mobile|Backend|DevOps|etc",
  "mustHave": ["required-skill1", "required-skill2"],
  "niceToHave": ["bonus-skill1", "bonus-skill2"],
  "learningCurve": "Low/Medium/High"
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response from Groq API');
      
      let cleanContent = content;
      if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '');
      }
      cleanContent = cleanContent.trim();

      const parsed = this.parseJSON(content);
      if (!parsed) {
        return {
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'CSS'],
          level: 'intermediate',
          category: 'Web Development',
          mustHave: ['JavaScript', 'React', 'Node.js'],
          niceToHave: ['Docker', 'AWS', 'Redis'],
          learningCurve: 'Medium',
        };
      }
      return parsed;
    });
  }

  async estimateProjectMetrics(projectDescription) {
    if (!projectDescription || projectDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    const prompt = `You are a project estimation expert. Estimate realistic metrics for this project:

"${projectDescription}"

Return ONLY valid JSON (no markdown, no code blocks). Provide realistic India-market pricing:

{
  "estimatedDays": "number between 5-120 based on complexity",
  "estimatedHours": "total hours needed",
  "hourlyRate": "₹rate based on difficulty",
  "estimatedBudget": "₹X,XXX-Y,YYY total cost",
  "complexity": "Easy/Intermediate/Advanced",
  "riskFactors": ["risk1", "risk2"],
  "recommendedExperience": "Junior/Mid-level/Senior",
  "milestones": "number of phases: 3-5"
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response from Groq API');
      
      let cleanContent = content;
      if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').replace(/```/g, '');
      }
      cleanContent = cleanContent.trim();

      const parsed = this.parseJSON(cleanContent);
      if (!parsed) {
        return {
          estimatedDays: 21,
          estimatedHours: 168,
          hourlyRate: '₹800-1200',
          estimatedBudget: '₹50,000-100,000',
          complexity: 'Intermediate',
          riskFactors: ['Scope Clarity', 'Team Coordination', 'Testing Coverage'],
          recommendedExperience: 'Mid-level',
          milestones: 4,
        };
      }
      return parsed;
    });
  }

  async generateProjectMilestones(projectDescription) {
    if (!projectDescription || projectDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    const prompt = `Create realistic project milestones for:

"${projectDescription}"

Break down into 3-4 phases. Return ONLY valid JSON (no markdown, no code blocks):

{
  "milestones": [
    {
      "title": "Phase 1 Name",
      "description": "What gets delivered",
      "duration": "X days",
      "percentage": 20,
      "deliverables": ["item1", "item2"]
    }
  ]
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response from Groq API');
      
      const parsed = this.parseJSON(content);
      if (!parsed) {
        return {
          milestones: [
            {
              title: 'Phase 1: Setup & Planning',
              description: 'Initial project setup',
              duration: '3 days',
              percentage: 25,
              deliverables: [],
            },
            {
              title: 'Phase 2: Development',
              description: 'Core feature development',
              duration: '7 days',
              percentage: 50,
              deliverables: [],
            },
            {
              title: 'Phase 3: Testing & Deployment',
              description: 'Testing and deployment',
              duration: '4 days',
              percentage: 25,
              deliverables: [],
            },
          ],
        };
      }
      return parsed;
    });
  }

  async analyzeContentSafety(content) {
    if (!content || content.trim().length < 5) {
      return {
        isSafe: true,
        riskLevel: 'safe',
        issues: [],
        suggestions: 'Content is too short to analyze',
      };
    }

    const prompt = `Analyze content safety: "${content}"

Respond ONLY with JSON:
{
  "isSafe": true,
  "riskLevel": "safe",
  "issues": [],
  "suggestions": "improvements needed"
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content_resp = data.choices[0]?.message?.content?.trim();
      
      if (!content_resp) {
        return {
          isSafe: true,
          riskLevel: 'safe',
          issues: [],
          suggestions: 'Content safety check completed',
        };
      }
      
      const parsed = this.parseJSON(content_resp);
      if (!parsed) {
        return {
          isSafe: true,
          riskLevel: 'safe',
          issues: [],
          suggestions: 'Content safety check completed',
        };
      }
      return parsed;
    });
  }

  async generateDescriptionFromTitle(title) {
    if (!title || title.trim().length < 5) {
      throw new Error('Title must be at least 5 characters');
    }

    // Project type analyzer - categorize the project
    const analyzeProjectType = (projectTitle) => {
      const titleLower = projectTitle.toLowerCase();
      
      if (titleLower.includes('ecommerce') || titleLower.includes('store') || titleLower.includes('shop') || titleLower.includes('marketplace')) {
        return 'ecommerce';
      } else if (titleLower.includes('learning') || titleLower.includes('education') || titleLower.includes('course') || titleLower.includes('lms')) {
        return 'education';
      } else if (titleLower.includes('social') || titleLower.includes('chat') || titleLower.includes('community') || titleLower.includes('network')) {
        return 'social';
      } else if (titleLower.includes('analytics') || titleLower.includes('dashboard') || titleLower.includes('report') || titleLower.includes('business')) {
        return 'analytics';
      } else if (titleLower.includes('mobile') || titleLower.includes('app')) {
        return 'mobile';
      } else if (titleLower.includes('ai') || titleLower.includes('machine') || titleLower.includes('automation')) {
        return 'ai';
      } else if (titleLower.includes('api') || titleLower.includes('backend') || titleLower.includes('microservice')) {
        return 'backend';
      } else if (titleLower.includes('website') || titleLower.includes('portal') || titleLower.includes('cms') || titleLower.includes('blog')) {
        return 'website';
      } else {
        return 'general';
      }
    };

    const projectType = analyzeProjectType(title);

    // Generate specific prompt based on project type
    const generateSpecificPrompt = (title, type) => {
      const prompts = {
        ecommerce: `You are an ecommerce expert. For the project "${title}", generate a complete specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "A professional ecommerce platform description (3-4 sentences) covering: product catalog, shopping cart, payment integration, order management, and user experience for both customers and admins",
  "skills": ["E-commerce Stack: React.js or Vue.js", "Payment Gateway Integration", "Node.js/Express", "PostgreSQL or MongoDB", "Stripe/Razorpay", "AWS or similar hosting"],
  "difficulty": "Intermediate",
  "estimatedDays": 30,
  "estimatedBudget": "₹60,000-150,000",
  "features": ["Product Catalog with Search/Filter", "Shopping Cart & Checkout", "Secure Payment Gateway", "Order Tracking", "Admin Dashboard", "User Ratings & Reviews"],
  "techStack": ["React.js", "Node.js", "Express", "PostgreSQL", "Stripe/Razorpay", "Redis for caching"],
  "timeline": "Week 1-2: Backend & DB setup. Week 3-4: Frontend & Integration. Week 5: Testing & Deployment."
}`,
        education: `You are an education platform expert. For the project "${title}", generate a complete learning platform specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "An interactive learning platform (3-4 sentences) featuring: course creation, video streaming, assignments, progress tracking, student-teacher communication, and certification system",
  "skills": ["React.js or Vue.js", "Node.js backend", "Video Streaming (AWS or similar)", "Database Design", "Real-time Communication", "Payment Integration"],
  "difficulty": "Advanced",
  "estimatedDays": 45,
  "estimatedBudget": "₹80,000-180,000",
  "features": ["Course Management", "Video Lectures", "Assignments & Quizzes", "Progress Tracking", "Student Messaging", "Certificate Generation"],
  "techStack": ["React.js", "Node.js", "MongoDB", "Socket.io", "AWS S3/CloudFront", "Stripe"],
  "timeline": "Week 1-2: Architecture & Setup. Week 3-4: Course Module. Week 5-6: Payments & Analytics. Week 7: Testing."
}`,
        social: `You are a social network expert. For the project "${title}", generate a complete social platform specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "A real-time social networking platform (3-4 sentences) enabling: user profiles, post sharing, messaging, notifications, friend connections, and community interaction",
  "skills": ["React.js", "Node.js", "Real-time Database", "Socket.io for notifications", "MongoDB", "Authentication & Security"],
  "difficulty": "Advanced",
  "estimatedDays": 40,
  "estimatedBudget": "₹70,000-160,000",
  "features": ["User Profiles", "Post/Feed System", "Real-time Messaging", "Notifications", "Follow/Friend System", "Search & Recommendations"],
  "techStack": ["React.js", "Node.js", "MongoDB", "Socket.io", "Redis", "JWT Authentication"],
  "timeline": "Week 1-2: User & Auth System. Week 3: Feed & Post. Week 4: Messaging. Week 5-6: Notifications & Optimization."
}`,
        analytics: `You are a business intelligence expert. For the project "${title}", generate a complete analytics platform specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "A comprehensive business analytics dashboard (3-4 sentences) offering: real-time data visualization, KPI tracking, custom reports, data export, and predictive insights",
  "skills": ["Data Visualization (Chart.js, D3.js)", "React.js", "Node.js", "SQL/NoSQL", "Business Intelligence", "Data Analysis"],
  "difficulty": "Intermediate",
  "estimatedDays": 25,
  "estimatedBudget": "₹50,000-120,000",
  "features": ["Real-time Dashboard", "Custom Widgets", "Report Generation", "Data Export (PDF/CSV)", "User Permissions", "Alert System"],
  "techStack": ["React.js", "Node.js", "PostgreSQL", "Chart.js", "D3.js", "Apache"],
  "timeline": "Week 1: Data & API. Week 2-3: Dashboard UI. Week 4: Reports & Export. Week 5: Testing."
}`,
        mobile: `You are a mobile app expert. For the project "${title}", generate a complete mobile app specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "A native/cross-platform mobile application (3-4 sentences) featuring: offline functionality, push notifications, mobile-optimized UI, seamless sync with backend services",
  "skills": ["React Native or Flutter", "Mobile UI/UX", "Backend API Integration", "Push Notifications", "Database Sync", "Device APIs"],
  "difficulty": "Intermediate",
  "estimatedDays": 28,
  "estimatedBudget": "₹55,000-140,000",
  "features": ["User Authentication", "Offline Support", "Push Notifications", "Location Services", "Image Upload", "In-app Payments"],
  "techStack": ["React Native or Flutter", "Firebase", "Node.js backend", "MongoDB", "Geolocation APIs"],
  "timeline": "Week 1-2: Setup & Core Screens. Week 3: API Integration. Week 4: Push Notifications. Week 5: Testing & Optimization."
}`,
        ai: `You are an AI/ML expert. For the project "${title}", generate a complete AI solution specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "An intelligent AI-powered solution (3-4 sentences) implementing: machine learning models, data processing, predictive analytics, automated workflows, and intelligent recommendations",
  "skills": ["Python or Node.js", "Machine Learning", "TensorFlow/PyTorch", "Data Processing", "Model Training", "API Development"],
  "difficulty": "Advanced",
  "estimatedDays": 35,
  "estimatedBudget": "₹80,000-180,000",
  "features": ["ML Model Development", "Data Pipeline", "Prediction Engine", "Model Monitoring", "API Endpoints", "Admin Dashboard"],
  "techStack": ["Python", "TensorFlow/PyTorch", "Node.js", "MongoDB", "Docker", "MLflow"],
  "timeline": "Week 1-2: Data & EDA. Week 3-4: Model Dev. Week 5: API & Integration. Week 6: Testing & Deployment."
}`,
        backend: `You are a backend architecture expert. For the project "${title}", generate a complete backend specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "A scalable backend system (3-4 sentences) providing: robust APIs, database management, authentication, caching, microservices architecture, and high performance",
  "skills": ["Node.js or Python", "Microservices Architecture", "Database Design", "API Development", "Caching (Redis)", "DevOps/Docker"],
  "difficulty": "Advanced",
  "estimatedDays": 25,
  "estimatedBudget": "₹60,000-140,000",
  "features": ["RESTful APIs", "Authentication & Authorization", "Database Optimization", "Caching Layer", "Logging & Monitoring", "Rate Limiting"],
  "techStack": ["Node.js or Python", "Express or FastAPI", "PostgreSQL", "Redis", "Docker", "AWS"],
  "timeline": "Week 1: Architecture Design. Week 2-3: API Development. Week 4: Optimization. Week 5: Testing & Documentation."
}`,
        website: `You are a web design expert. For the project "${title}", generate a complete website specification.

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "A professional website (3-4 sentences) featuring: responsive design, SEO optimization, dynamic content, user-friendly navigation, and fast performance",
  "skills": ["React.js or Next.js", "Responsive Design", "SEO Optimization", "Node.js backend", "Database", "Web Performance"],
  "difficulty": "Intermediate",
  "estimatedDays": 20,
  "estimatedBudget": "₹40,000-100,000",
  "features": ["Responsive UI", "CMS Integration", "SEO Meta Tags", "Contact Forms", "Analytics", "Fast Loading"],
  "techStack": ["React.js", "Next.js", "Node.js", "MongoDB", "Tailwind CSS", "Vercel Hosting"],
  "timeline": "Week 1: Design & Planning. Week 2: Frontend Dev. Week 3: Backend & Integration. Week 4: Testing & Launch."
}`,
        general: `You are a solutions architect. Analyze the project "${title}" and generate a complete specification based on the project name.

Think like a professional consultant:
1. What problem does this solve?
2. Who are the users?
3. What technology stack makes sense?
4. What are realistic timelines and budgets?

Return ONLY this JSON (no markdown, no code blocks):
{
  "description": "A comprehensive project description (3-4 sentences) analyzing: core functionality, business value, target users, and key capabilities based on the project title",
  "skills": ["Determine 5-6 realistic skills needed for this specific project type"],
  "difficulty": "Estimate as Easy/Intermediate/Advanced",
  "estimatedDays": "Provide realistic estimate (10-60 days)",
  "estimatedBudget": "Estimate realistic Indian market pricing",
  "features": ["Determine 5-6 specific features this project would need"],
  "techStack": ["Select appropriate modern technologies"],
  "timeline": "Provide realistic phase breakdown"
}`
      };
      
      return prompts[type] || prompts.general;
    };

    const prompt = generateSpecificPrompt(title, projectType);

    try {
      const data = await this.makeAPIRequest(prompt);
      
      if (!data || !data.choices || !data.choices[0]) {
        throw new Error('Invalid response structure from Groq API');
      }

      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error('Empty response from Groq API');
      }

      // Clean the content - remove markdown code blocks if present
      let cleanContent = content;
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```/g, '');
      }
      cleanContent = cleanContent.trim();

      const parsed = this.parseJSON(cleanContent);
      
      if (!parsed) {
        console.warn('Failed to parse JSON response, using type-specific defaults');
        // Return type-specific defaults
        const typeDefaults = {
          ecommerce: {
            description: `${title} is a feature-rich e-commerce platform that enables businesses to sell products online with a professional storefront. It provides secure payment processing, inventory management, order fulfillment, and customer relationship tools. The platform supports multiple payment methods and integrates with popular shipping providers to streamline order delivery.`,
            skills: ['React.js', 'Node.js', 'Payment Gateway', 'Stripe/Razorpay', 'MongoDB', 'Responsive Design'],
            difficulty: 'Intermediate',
            estimatedDays: 30,
            estimatedBudget: '₹60,000-150,000',
            features: ['Product Catalog', 'Shopping Cart', 'Payment Processing', 'Order Management', 'Admin Dashboard', 'Customer Reviews'],
            techStack: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Stripe', 'AWS'],
            timeline: 'Phase 1: Backend & Database. Phase 2: Frontend & Cart. Phase 3: Payments & Testing.'
          },
          education: {
            description: `${title} is an interactive online learning platform that connects educators with students through structured courses and engaging content. It features video streaming, interactive quizzes, assignments, and progress tracking. Students can earn certificates upon completion and instructors have comprehensive analytics to monitor student performance.`,
            skills: ['React.js', 'Node.js', 'Video Streaming', 'Real-time Communication', 'MongoDB', 'Authentication'],
            difficulty: 'Advanced',
            estimatedDays: 45,
            estimatedBudget: '₹80,000-180,000',
            features: ['Course Creation', 'Video Lectures', 'Quizzes', 'Assignments', 'Progress Tracking', 'Certificates'],
            techStack: ['React.js', 'Node.js', 'MongoDB', 'Socket.io', 'AWS S3', 'Stripe'],
            timeline: 'Phase 1: Core Architecture. Phase 2: Course Module. Phase 3: Payments & Analytics.'
          },
          social: {
            description: `${title} is a modern social networking platform that brings people together through content sharing, real-time messaging, and community building. Users can create profiles, share posts, connect with friends, and receive instant notifications. The platform emphasizes privacy, security, and meaningful social interactions.`,
            skills: ['React.js', 'Node.js', 'Socket.io', 'Real-time Database', 'MongoDB', 'Authentication'],
            difficulty: 'Advanced',
            estimatedDays: 40,
            estimatedBudget: '₹70,000-160,000',
            features: ['User Profiles', 'Post Feed', 'Messaging', 'Notifications', 'Friend System', 'Search'],
            techStack: ['React.js', 'Node.js', 'MongoDB', 'Socket.io', 'Redis', 'JWT'],
            timeline: 'Phase 1: User & Auth. Phase 2: Feed System. Phase 3: Messaging & Optimization.'
          },
          default: {
            description: `${title} is a professional solution designed to address modern business needs through innovative technology and user-centric design. The project combines best practices in software architecture, real-time functionality, and scalability to deliver measurable business value. It serves as a complete solution for organizations looking to streamline their operations and improve efficiency.`,
            skills: ['React.js', 'Node.js', 'Database Design', 'API Development', 'Cloud Services', 'Security'],
            difficulty: 'Intermediate',
            estimatedDays: 25,
            estimatedBudget: '₹50,000-120,000',
            features: ['User Authentication', 'Dashboard', 'Data Management', 'Reporting', 'Integration', 'Analytics'],
            techStack: ['React.js', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'AWS'],
            timeline: 'Phase 1: Architecture & Setup. Phase 2: Core Features. Phase 3: Testing & Deployment.'
          }
        };

        return typeDefaults[projectType] || typeDefaults.default;
      }

      return parsed;
    } catch (error) {
      console.error('Error in generateDescriptionFromTitle:', error.message);
      // Return sensible type-specific defaults on error
      const typeDefaults = {
        ecommerce: {
          description: `${title} is a comprehensive e-commerce solution that enables businesses to establish and manage their online stores. It provides complete product catalog management, secure checkout, inventory tracking, and order fulfillment capabilities. The platform supports multiple payment methods and ensures a seamless shopping experience for customers.`,
          skills: ['React.js', 'Node.js', 'Stripe/Razorpay', 'MongoDB', 'Payment Integration', 'Responsive Design'],
          difficulty: 'Intermediate',
          estimatedDays: 30,
          estimatedBudget: '₹60,000-150,000',
          features: ['Product Management', 'Cart & Checkout', 'Payment Processing', 'Order Tracking', 'Admin Panel', 'Analytics'],
          techStack: ['React.js', 'Node.js', 'MongoDB', 'Stripe', 'AWS', 'Redis'],
          timeline: 'Week 1-2: Backend Setup. Week 3-4: Frontend Dev. Week 5: Integration & Testing.'
        },
        education: {
          description: `${title} is an advanced online education platform that revolutionizes how students learn and teachers teach. It offers interactive course delivery, real-time collaboration tools, progress monitoring, and certification programs. The platform leverages modern technology to create engaging, scalable learning experiences.`,
          skills: ['React.js', 'Node.js', 'Video Streaming', 'WebRTC', 'MongoDB', 'Real-time DB'],
          difficulty: 'Advanced',
          estimatedDays: 45,
          estimatedBudget: '₹80,000-180,000',
          features: ['Course Platform', 'Video Delivery', 'Assignments', 'Live Classes', 'Certificates', 'Analytics'],
          techStack: ['React.js', 'Node.js', 'MongoDB', 'Socket.io', 'AWS', 'FFmpeg'],
          timeline: 'Week 1-2: Architecture. Week 3: Learning Module. Week 4: Live Classes. Week 5-6: Polish & Launch.'
        },
        social: {
          description: `${title} is a cutting-edge social networking platform that connects communities and fosters meaningful interactions. It provides real-time messaging, content sharing, feed algorithms, and social discovery. The platform prioritizes user engagement, security, and authentic connections.`,
          skills: ['React.js', 'Node.js', 'Socket.io', 'Redis', 'MongoDB', 'WebSockets'],
          difficulty: 'Advanced',
          estimatedDays: 40,
          estimatedBudget: '₹70,000-160,000',
          features: ['User Profiles', 'Feed & Posts', 'Real-time Chat', 'Push Notifications', 'Groups', 'Discovery'],
          techStack: ['React.js', 'Node.js', 'MongoDB', 'Socket.io', 'Redis', 'Firebase'],
          timeline: 'Week 1: User System. Week 2: Feed & Connections. Week 3: Messaging. Week 4-5: Notifications & Optimization.'
        },
        analytics: {
          description: `${title} is a data-driven analytics platform that transforms raw data into actionable business insights. It provides real-time dashboards, custom reports, predictive analytics, and data visualization. Organizations use it to make informed decisions based on comprehensive data analysis.`,
          skills: ['React.js', 'D3.js', 'Node.js', 'SQL', 'Data Analysis', 'Chart.js'],
          difficulty: 'Intermediate',
          estimatedDays: 25,
          estimatedBudget: '₹50,000-120,000',
          features: ['Real-time Dashboard', 'Custom Reports', 'Data Export', 'Visualization', 'Alerts', 'Filters'],
          techStack: ['React.js', 'Node.js', 'PostgreSQL', 'D3.js', 'Apache', 'Redis'],
          timeline: 'Week 1: Data Pipeline. Week 2-3: Dashboard UI. Week 4: Reports. Week 5: Testing.'
        },
        default: {
          description: `${title} is a professional-grade solution that meets modern business requirements with scalability and performance. It integrates cutting-edge technologies with intuitive design to deliver measurable results. The project is built with best practices in architecture, security, and user experience.`,
          skills: ['React.js', 'Node.js', 'Database Design', 'API Development', 'Cloud Infrastructure', 'DevOps'],
          difficulty: 'Intermediate',
          estimatedDays: 25,
          estimatedBudget: '₹50,000-120,000',
          features: ['Authentication', 'Dashboard', 'CRUD Operations', 'Reporting', 'API Integration', 'Mobile Responsive'],
          techStack: ['React.js', 'Node.js', 'MongoDB', 'Express', 'Tailwind CSS', 'Docker'],
          timeline: 'Week 1: Planning & Setup. Week 2-3: Development. Week 4: Testing & Deployment.'
        }
      };

      return typeDefaults[projectType] || typeDefaults.default;
    }
  }

  async generateCoverLetter(projectTitle, projectDescription, developerSkills = [], budgetRange = {}) {
    if (!projectTitle || projectTitle.trim().length < 5) {
      throw new Error('Project title must be at least 5 characters');
    }

    const skillsText = Array.isArray(developerSkills) && developerSkills.length > 0 
      ? `Developer skills: ${developerSkills.join(', ')}` 
      : '';

    const budgetText = budgetRange.min && budgetRange.max 
      ? `Project budget range: ₹${budgetRange.min.toLocaleString('en-IN')} - ₹${budgetRange.max.toLocaleString('en-IN')}` 
      : '';

    const prompt = `You are an expert proposal writer for freelance developers. Write a compelling, professional cover letter for a developer responding to this project.

Project Title: "${projectTitle}"
${projectDescription ? `Project Description: ${projectDescription}` : ''}
${skillsText}
${budgetText}

Requirements:
- Professional and engaging tone (friendly but expert)
- 150-300 words
- Demonstrate understanding of the project
- Highlight relevant expertise
- Show enthusiasm for the work
- Include a soft call-to-action
- Personalized (not generic)

Write ONLY the cover letter text, no meta information or explanations. Make it ready to be sent directly to the client.`;

    try {
      const result = await this.retryWithBackoff(async () => {
        const data = await this.makeAPIRequest(prompt);
        const content = data.choices[0]?.message?.content?.trim();
        
        if (!content) {
          throw new Error('Empty response from Groq API');
        }

        return {
          coverLetter: content.trim(),
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error generating cover letter:', error.message);
      
      // Fallback to template-based generation if API fails
      const fallbackCoverLetter = `Dear Client,

I am excited to submit my proposal for your "${projectTitle}" project. With my strong expertise in ${skillsText || 'modern web technologies'}, I am confident in my ability to deliver exceptional results that exceed your expectations.

I have carefully reviewed your project requirements and understand the scope, complexity, and business objectives involved. My experience with similar projects has equipped me with the skills and knowledge necessary to successfully complete this work within your specifications and timeline.

Key highlights of my proposal:
• Proven track record of delivering high-quality projects on time and within budget
• Strong technical skills combined with excellent communication and project management abilities
• Commitment to understanding your vision and delivering solutions that truly meet your needs
• Flexible and adaptive approach to ensure client satisfaction

I am passionate about contributing to your project's success and would welcome the opportunity to discuss how I can add value to your team. ${budgetText ? 'I believe my pricing is competitive and reflects the quality of work you can expect.' : ''}

Looking forward to working with you!

Best regards`;

      return {
        coverLetter: fallbackCoverLetter,
      };
    }
  }
}

module.exports = new GroqService();
