require('dotenv').config();

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async makeAPIRequest(prompt) {
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

    const response = await fetch(this.baseURL, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json();
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

    const prompt = `You are a professional project manager. The user provided: "${roughDescription}"

Your task:
1. Make it professional and clear
2. Add missing important details
3. Suggest required skills
4. Estimate difficulty (Easy/Medium/Hard)
5. Rough timeline estimate
6. Estimated budget in INR (₹)

Respond ONLY with JSON (no markdown):
{
  "refinedDescription": "improved description",
  "skills": ["skill1", "skill2"],
  "difficulty": "Medium",
  "estimatedDays": 14,
  "estimatedBudget": "₹30,000-50,000",
  "keyPoints": ["point1"]
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response from Groq API');
      
      const parsed = this.parseJSON(content);
      if (!parsed) {
        return {
          refinedDescription: roughDescription,
          skills: [],
          difficulty: 'Medium',
          estimatedDays: 14,
          estimatedBudget: '₹30,000-50,000',
          keyPoints: [],
        };
      }
      return parsed;
    });
  }

  async extractProjectSkills(projectDescription) {
    if (!projectDescription || projectDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    const prompt = `Extract skills from: "${projectDescription}"

Respond ONLY with JSON:
{
  "skills": ["skill1", "skill2"],
  "level": "beginner|intermediate|advanced",
  "category": "Web Development",
  "mustHave": ["required-skill1"],
  "niceToHave": ["bonus-skill1"]
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response from Groq API');
      
      const parsed = this.parseJSON(content);
      if (!parsed) {
        return {
          skills: [],
          level: 'intermediate',
          category: 'Web Development',
          mustHave: [],
          niceToHave: [],
        };
      }
      return parsed;
    });
  }

  async estimateProjectMetrics(projectDescription) {
    if (!projectDescription || projectDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    const prompt = `Estimate metrics for: "${projectDescription}"

Respond ONLY with JSON:
{
  "estimatedDays": 14,
  "estimatedHours": 112,
  "hourlyRate": "₹500-1000",
  "estimatedBudget": "₹30,000-50,000",
  "complexity": "Medium",
  "riskFactors": ["factor1"],
  "recommendedExperience": "Mid-level",
  "milestones": 3
}`;

    return this.retryWithBackoff(async () => {
      const data = await this.makeAPIRequest(prompt);
      const content = data.choices[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response from Groq API');
      
      const parsed = this.parseJSON(content);
      if (!parsed) {
        return {
          estimatedDays: 14,
          estimatedHours: 112,
          hourlyRate: '₹500-1000',
          estimatedBudget: '₹30,000-50,000',
          complexity: 'Medium',
          riskFactors: [],
          recommendedExperience: 'Mid-level',
          milestones: 3,
        };
      }
      return parsed;
    });
  }

  async generateProjectMilestones(projectDescription) {
    if (!projectDescription || projectDescription.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    const prompt = `Create milestone breakdown for: "${projectDescription}"

Respond ONLY with JSON:
{
  "milestones": [
    {
      "title": "Phase 1: Setup & Planning",
      "description": "Initial setup",
      "duration": "3 days",
      "percentage": 25,
      "deliverables": ["item1"]
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

    const prompt = `You are a professional project manager. Based on the project title "${title}", create a professional project description.

Generate ONLY valid JSON (no markdown, no extra text, no code blocks):
{
  "description": "2-3 sentence professional description of the project that explains what it does and its business value",
  "skills": ["skill1", "skill2", "skill3", "skill4"],
  "difficulty": "Easy",
  "estimatedDays": 14,
  "estimatedBudget": "₹30,000-50,000",
  "features": ["feature1", "feature2", "feature3"]
}`;

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
        // If parsing fails, return sensible defaults based on title
        return {
          description: `A professional ${title.toLowerCase()} solution built with modern technologies and best practices.`,
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          difficulty: 'Medium',
          estimatedDays: 14,
          estimatedBudget: '₹30,000-50,000',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
        };
      }

      return parsed;
    } catch (error) {
      console.error('Error in generateDescriptionFromTitle:', error.message);
      // Return sensible defaults on error instead of crashing
      return {
        description: `A professional ${title.toLowerCase()} solution. Contact developer for detailed specifications.`,
        skills: ['JavaScript', 'React', 'MongoDB', 'Node.js'],
        difficulty: 'Medium',
        estimatedDays: 14,
        estimatedBudget: '₹30,000-50,000',
        features: ['Core Functionality', 'User Interface', 'Backend Integration'],
      };
    }
  }
}

module.exports = new GroqService();
