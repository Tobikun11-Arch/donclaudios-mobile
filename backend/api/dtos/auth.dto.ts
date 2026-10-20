import {z} from 'zod';

/** Required, non-empty string with a human-readable message. */
const requiredString = (label: string) =>
  z.string({required_error: `${label} is required`}).trim().min(1, `${label} is required`);

const emailSchema = requiredString('Email').pipe(
  z.string().email('Enter a valid email address')
);

const codeSchema = z
  .string({required_error: 'Verification code is required'})
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code');

const passwordSchema = z
  .string({required_error: 'Password is required'})
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

/** Accepts an email or a phone number — at least one must be provided. */
const identifierFields = {
  email: emailSchema.optional(),
  phoneNumber: z.string().trim().min(1, 'Phone number is required').optional()
};

const requireIdentifier = (
  v: {email?: string; phoneNumber?: string},
  ctx: z.RefinementCtx
) => {
  if (!v.email && !v.phoneNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Email or phone number is required'
    });
  }
  return v;
};

export const registerDto = z.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  email: emailSchema,
  password: passwordSchema,
  username: requiredString('Username'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required'),
  address: z.string().trim().min(1, 'Address is required')
});

export const verifyDto = z
  .object({
    ...identifierFields,
    code: codeSchema // always 6 digits from generateVerificationCode()
  })
  .superRefine(requireIdentifier);

export const resendVerificationDto = z
  .object(identifierFields)
  .superRefine(requireIdentifier);

export const loginDto = z
  .object({
    ...identifierFields,
    password: requiredString('Password')
  })
  .superRefine(requireIdentifier);

export const refreshDto = z.object({
  refreshToken: z.string().min(1).optional()
});

export const forgotPasswordDto = z
  .object(identifierFields)
  .superRefine(requireIdentifier);

export const resetPasswordDto = z
  .object({
    ...identifierFields,
    code: codeSchema,
    newPassword: passwordSchema
  })
  .superRefine(requireIdentifier);

export const resendResetCodeDto = z
  .object(identifierFields)
  .superRefine(requireIdentifier);

export const changePasswordDto = z.object({
  currentPassword: requiredString('Current password'),
  newPassword: passwordSchema
});

export type RegisterDto = z.infer<typeof registerDto>;
export type VerifyDto = z.infer<typeof verifyDto>;
export type ResendVerificationDto = z.infer<typeof resendVerificationDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type RefreshDto = z.infer<typeof refreshDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResendResetCodeDto = z.infer<typeof resendResetCodeDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
