const express = require('express');
const router = express.Router();
const groqService = require('../services/groqService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * POST /api/ai/refine-description
 * Refine and improve project description
 */
router.post(
  '/refine-description',
  asyncHandler(async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
      throw new ApiError(400, 'Description must be at least 10 characters');
    }

    const refined = await groqService.refineProjectDescription(description);

    res.json(
      new ApiResponse(
        200,
        refined,
        'Project description refined successfully'
      )
    );
  })
);

/**
 * POST /api/ai/generate-description
 * Generate complete description from project title
 */
router.post(
  '/generate-description',
  asyncHandler(async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim().length < 5) {
      throw new ApiError(400, 'Title must be at least 5 characters');
    }

    try {
      const generated = await groqService.generateDescriptionFromTitle(title.trim());

      res.json(
        new ApiResponse(
          200,
          generated,
          'Description generated successfully from title'
        )
      );
    } catch (error) {
      console.error('AI Generation Error:', error.message);
      // Return fallback data on error instead of 502
      const generated = await groqService.generateDescriptionFromTitle(title.trim());
      res.json(
        new ApiResponse(
          200,
          generated,
          'Description generated from title'
        )
      );
    }
  })
);

/**
 * POST /api/ai/extract-skills
 * Extract required skills from project description
 */
router.post(
  '/extract-skills',
  asyncHandler(async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
      throw new ApiError(400, 'Description must be at least 10 characters');
    }

    const skills = await groqService.extractProjectSkills(description);

    res.json(
      new ApiResponse(200, skills, 'Skills extracted successfully')
    );
  })
);

/**
 * POST /api/ai/estimate-metrics
 * Estimate project budget and timeline
 */
router.post(
  '/estimate-metrics',
  asyncHandler(async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
      throw new ApiError(400, 'Description must be at least 10 characters');
    }

    const metrics = await groqService.estimateProjectMetrics(description);

    res.json(
      new ApiResponse(200, metrics, 'Metrics estimated successfully')
    );
  })
);

/**
 * POST /api/ai/generate-milestones
 * Generate project milestones
 */
router.post(
  '/generate-milestones',
  asyncHandler(async (req, res) => {
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
      throw new ApiError(400, 'Description must be at least 10 characters');
    }

    const milestones = await groqService.generateProjectMilestones(description);

    res.json(
      new ApiResponse(200, milestones, 'Milestones generated successfully')
    );
  })
);

/**
 * POST /api/ai/analyze-content
 * Analyze content for safety and appropriateness
 */
router.post(
  '/analyze-content',
  asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content || content.trim().length < 5) {
      throw new ApiError(400, 'Content must be at least 5 characters');
    }

    const analysis = await groqService.analyzeContentSafety(content);

    res.json(
      new ApiResponse(200, analysis, 'Content analyzed successfully')
    );
  })
);

/**
 * POST /api/ai/generate-cover-letter
 * Generate professional cover letter for proposal
 */
router.post(
  '/generate-cover-letter',
  asyncHandler(async (req, res) => {
    try {
      const { projectTitle, projectDescription, developerSkills, budgetRange } = req.body;

      if (!projectTitle || projectTitle.trim().length < 5) {
        throw new ApiError(400, 'Project title must be at least 5 characters');
      }

      const result = await groqService.generateCoverLetter(
        projectTitle,
        projectDescription,
        developerSkills,
        budgetRange
      );

      if (!result || !result.coverLetter) {
        throw new ApiError(500, 'Failed to generate cover letter');
      }

      res.json(
        new ApiResponse(
          200,
          result,
          'Cover letter generated successfully'
        )
      );
    } catch (error) {
      console.error('Generate Cover Letter Error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, error.message || 'Failed to generate cover letter');
    }
  })
);

/**
 * Health check for AI service
 * GET /api/ai/health
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.json(
      new ApiResponse(200, { status: 'ok' }, 'AI service is running')
    );
  })
);

module.exports = router;
