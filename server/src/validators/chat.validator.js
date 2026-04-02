const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const createRoomSchema = z.object({
  userId: objectIdSchema,
  contractId: objectIdSchema.optional(),
  purchaseId: objectIdSchema.optional(),
});

module.exports = {
  createRoomSchema,
};
