const { z } = require('zod');

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must not exceed 60 characters'),
    email: z
      .string()
      .email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter and one number'
      ),
    confirmPassword: z
      .string(),
    role: z
      .enum(['developer', 'client'], {
        errorMap: () => ({ message: 'Role must be developer or client' }),
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format'),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one number, and one special character'
      ),
    confirmPassword: z
      .string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
