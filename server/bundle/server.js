import http from 'http';
import express, { Router } from 'express';
import * as z from 'zod';
import { PrismaClient, Prisma } from '@prisma/client';
import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { hashPassword, verifyPassword, createJWTHelpers, TimeSpan } from '@wasp.sh/lib-auth/node';
import { registerCustom, deserialize, serialize } from 'superjson';
import crypto from 'crypto';
import * as jose from 'jose';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import { createTransport } from 'nodemailer';

function colorize(color, text) {
  if (!supportsAnsiFormatting()) {
    return text;
  }
  const ansiColorCode = ansiColorCodes[color];
  return text.split("\n").map((line) => `${ansiColorCode}${line}${ansiResetCode}`).join("\n");
}
function supportsAnsiFormatting() {
  const isBrowser = !!globalThis.window;
  const isNode = !!globalThis.process;
  if (isBrowser && "chrome" in window) {
    return true;
  }
  if (isNode) {
    if ("NO_COLOR" in process.env) {
      return false;
    }
    return true;
  }
  return false;
}
const ansiColorCodes = {
  red: "\x1B[31m",
  yellow: "\x1B[33m"
};
const ansiResetCode = "\x1B[0m";

function ensureEnvSchema(data, schema) {
  const result = getValidatedEnvOrError(data, schema);
  if (result.success) {
    return result.data;
  } else {
    console.error(colorize("red", formatZodEnvError(result.error)));
    throw new Error("Error parsing environment variables");
  }
}
function getValidatedEnvOrError(env, schema) {
  return schema.safeParse(env);
}
function formatZodEnvError(error) {
  const flattenedIssues = z.flattenError(error);
  return [
    "\u2550\u2550 Env vars validation failed \u2550\u2550",
    "",
    // Top-level errors
    ...flattenedIssues.formErrors,
    "",
    // Errors per field
    ...Object.entries(flattenedIssues.fieldErrors).map(([prop, error2]) => `${prop} - ${error2}`),
    "",
    "\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550"
  ].join("\n");
}

const userServerEnvSchema = z.object({});
const waspCommonServerEnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string({
    error: "DATABASE_URL is required"
  }),
  PG_BOSS_NEW_OPTIONS: z.string().optional(),
  SMTP_HOST: z.string({
    error: getRequiredEnvVarErrorMessage("SMTP email sender", "SMTP_HOST")
  }),
  SMTP_PORT: z.coerce.number({
    error: getRequiredEnvVarErrorMessage("SMTP email sender", "SMTP_PORT")
  }),
  SMTP_USERNAME: z.string({
    error: getRequiredEnvVarErrorMessage("SMTP email sender", "SMTP_USERNAME")
  }),
  SMTP_PASSWORD: z.string({
    error: getRequiredEnvVarErrorMessage("SMTP email sender", "SMTP_PASSWORD")
  }),
  SKIP_EMAIL_VERIFICATION_IN_DEV: z.enum(["true", "false"], {
    error: 'SKIP_EMAIL_VERIFICATION_IN_DEV must be either "true" or "false"'
  }).default("false").transform((value) => value === "true")
});
const serverUrlSchema = z.string({
  error: "WASP_SERVER_URL is required"
}).pipe(z.url({
  error: "WASP_SERVER_URL must be a valid URL"
}));
const clientUrlSchema = z.string({
  error: "WASP_WEB_CLIENT_URL is required"
}).pipe(z.url({
  error: "WASP_WEB_CLIENT_URL must be a valid URL"
}));
const jwtTokenSchema = z.string({
  error: "JWT_SECRET is required"
});
const waspDevServerEnvSchema = z.object({
  NODE_ENV: z.literal("development"),
  "WASP_SERVER_URL": serverUrlSchema.default("http://localhost:3001"),
  "WASP_WEB_CLIENT_URL": clientUrlSchema.default("http://localhost:3000/"),
  "JWT_SECRET": jwtTokenSchema.default("DEVJWTSECRET")
});
const waspProdServerEnvSchema = z.object({
  NODE_ENV: z.literal("production"),
  "WASP_SERVER_URL": serverUrlSchema,
  "WASP_WEB_CLIENT_URL": clientUrlSchema,
  "JWT_SECRET": jwtTokenSchema
});
const waspServerEnvSchema = z.discriminatedUnion("NODE_ENV", [
  z.object({ ...waspCommonServerEnvSchema.shape, ...waspDevServerEnvSchema.shape }),
  z.object({ ...waspCommonServerEnvSchema.shape, ...waspProdServerEnvSchema.shape })
]);
const serverEnvSchema = userServerEnvSchema.and(waspServerEnvSchema);
const defaultNodeEnvValue = waspDevServerEnvSchema.shape.NODE_ENV.value;
const { NODE_ENV: inputNodeEnvValue, ...restEnv } = process.env;
const env = ensureEnvSchema({
  NODE_ENV: inputNodeEnvValue ?? defaultNodeEnvValue,
  ...restEnv
}, serverEnvSchema);
function getRequiredEnvVarErrorMessage(featureName, envVarName) {
  return `${envVarName} is required when using ${featureName}`;
}

function stripTrailingSlash(url) {
  return url?.replace(/\/$/, "");
}
function getOrigin(url) {
  return new URL(url).origin;
}

const frontendUrl = stripTrailingSlash(env["WASP_WEB_CLIENT_URL"]);
stripTrailingSlash(env["WASP_SERVER_URL"]);
const allowedCORSOriginsPerEnv = {
  development: [/.*/],
  production: [getOrigin(frontendUrl)]
};
const allowedCORSOrigins = allowedCORSOriginsPerEnv[env.NODE_ENV];
const config$1 = {
  frontendUrl,
  allowedCORSOrigins,
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  auth: {
    jwtSecret: env["JWT_SECRET"]
  }
};

function createDbClient() {
  return new PrismaClient();
}
const dbClient = createDbClient();

class HttpError extends Error {
  statusCode;
  data;
  constructor(statusCode, message, data, options) {
    super(message, options);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
    this.name = this.constructor.name;
    if (!(Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600)) {
      throw new Error("statusCode has to be integer in range [400, 600).");
    }
    this.statusCode = statusCode;
    if (data) {
      this.data = data;
    }
  }
}

const prismaAdapter = new PrismaAdapter(dbClient.session, dbClient.auth);
const auth$1 = new Lucia(prismaAdapter, {
  // Since we are not using cookies, we don't need to set any cookie options.
  // But in the future, if we decide to use cookies, we can set them here.
  // sessionCookie: {
  //   name: "session",
  //   expires: true,
  //   attributes: {
  //     secure: !config.isDevelopment,
  //     sameSite: "lax",
  //   },
  // },
  getUserAttributes({ userId }) {
    return {
      userId
    };
  }
});

const defineHandler = (middleware) => middleware;
const sleep$2 = (ms) => new Promise((r) => setTimeout(r, ms));

const PASSWORD_FIELD = "password";
const EMAIL_FIELD = "email";
const TOKEN_FIELD = "token";
function ensureValidEmail(args) {
  validate(args, [
    { validates: EMAIL_FIELD, message: "email must be present", validator: (email) => !!email },
    { validates: EMAIL_FIELD, message: "email must be a valid email", validator: (email) => isValidEmail(email) }
  ]);
}
function ensurePasswordIsPresent(args) {
  validate(args, [
    { validates: PASSWORD_FIELD, message: "password must be present", validator: (password) => !!password }
  ]);
}
function ensureValidPassword(args) {
  validate(args, [
    { validates: PASSWORD_FIELD, message: "password must be at least 8 characters", validator: (password) => isMinLength(password, 8) },
    { validates: PASSWORD_FIELD, message: "password must contain a number", validator: (password) => containsNumber(password) }
  ]);
}
function ensureTokenIsPresent(args) {
  validate(args, [
    { validates: TOKEN_FIELD, message: "token must be present", validator: (token) => !!token }
  ]);
}
function throwValidationError(message) {
  throw new HttpError(422, "Validation failed", { message });
}
function validate(args, validators) {
  for (const { validates, message, validator } of validators) {
    if (!validator(args[validates])) {
      throwValidationError(message);
    }
  }
}
const validEmailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
function isValidEmail(input) {
  if (typeof input !== "string") {
    return false;
  }
  return input.match(validEmailRegex) !== null;
}
function isMinLength(input, minLength) {
  if (typeof input !== "string") {
    return false;
  }
  return input.length >= minLength;
}
function containsNumber(input) {
  if (typeof input !== "string") {
    return false;
  }
  return /\d/.test(input);
}

({
  entities: {
    User: dbClient.user
  }
});
function createProviderId(providerName, providerUserId) {
  return {
    providerName,
    providerUserId: normalizeProviderUserId(providerName, providerUserId)
  };
}
function normalizeProviderUserId(providerName, providerUserId) {
  switch (providerName) {
    case "email":
    case "username":
      return providerUserId.toLowerCase();
    case "google":
    case "github":
    case "discord":
    case "keycloak":
    case "slack":
    case "microsoft":
      return providerUserId;
    /*
          Why the default case?
          In case users add a new auth provider in the user-land.
          Users can't extend this function because it is private.
          If there is an unknown `providerName` in runtime, we'll
          return the `providerUserId` as is.
    
          We want to still have explicit OAuth providers listed
          so that we get a type error if we forget to add a new provider
          to the switch statement.
        */
    default:
      return providerUserId;
  }
}
async function findAuthIdentity(providerId) {
  return dbClient.authIdentity.findUnique({
    where: {
      providerName_providerUserId: providerId
    }
  });
}
async function updateAuthIdentityProviderData(providerId, existingProviderData, providerDataUpdates) {
  const sanitizedProviderDataUpdates = await ensurePasswordIsHashed(providerDataUpdates);
  const newProviderData = {
    ...existingProviderData,
    ...sanitizedProviderDataUpdates
  };
  const serializedProviderData = await serializeProviderData(newProviderData);
  return dbClient.authIdentity.update({
    where: {
      providerName_providerUserId: providerId
    },
    data: { providerData: serializedProviderData }
  });
}
async function findAuthWithUserBy(where) {
  const result = await dbClient.auth.findFirst({ where, include: { user: true } });
  if (result === null) {
    return null;
  }
  if (result.user === null) {
    return null;
  }
  return { ...result, user: result.user };
}
async function createUser(providerId, serializedProviderData, userFields) {
  return dbClient.user.create({
    data: {
      // Using any here to prevent type errors when userFields are not
      // defined. We want Prisma to throw an error in that case.
      ...userFields ?? {},
      auth: {
        create: {
          identities: {
            create: {
              providerName: providerId.providerName,
              providerUserId: providerId.providerUserId,
              providerData: serializedProviderData
            }
          }
        }
      }
    },
    // We need to include the Auth entity here because we need `authId`
    // to be able to create a session.
    include: {
      auth: true
    }
  });
}
async function deleteUserByAuthId(authId) {
  return dbClient.user.deleteMany({ where: { auth: {
    id: authId
  } } });
}
async function doFakeWork() {
  const timeToWork = Math.floor(Math.random() * 1e3) + 1e3;
  return sleep$2(timeToWork);
}
function rethrowPossibleAuthError(e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    throw new HttpError(422, "Save failed", {
      message: `user with the same identity already exists`
    });
  }
  if (e instanceof Prisma.PrismaClientValidationError) {
    console.error(e);
    throw new HttpError(422, "Save failed", {
      message: "there was a database error"
    });
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021") {
    console.error(e);
    console.info("\u{1F41D} This error can happen if you did't run the database migrations.");
    throw new HttpError(500, "Save failed", {
      message: `there was a database error`
    });
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
    console.error(e);
    console.info(`\u{1F41D} This error can happen if you have some relation on your User entity
   but you didn't specify the "onDelete" behaviour to either "Cascade" or "SetNull".
   Read more at: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions`);
    throw new HttpError(500, "Save failed", {
      message: `there was a database error`
    });
  }
  throw e;
}
async function validateAndGetUserFields(data, userSignupFields) {
  const { password: _password, ...sanitizedData } = data;
  const result = {};
  {
    return result;
  }
}
function getProviderData(providerData) {
  return sanitizeProviderData(getProviderDataWithPassword(providerData));
}
function getProviderDataWithPassword(providerData) {
  return JSON.parse(providerData);
}
function sanitizeProviderData(providerData) {
  if (providerDataHasPasswordField(providerData)) {
    const { hashedPassword, ...rest } = providerData;
    return rest;
  } else {
    return providerData;
  }
}
async function sanitizeAndSerializeProviderData(providerData) {
  return serializeProviderData(await ensurePasswordIsHashed(providerData));
}
function serializeProviderData(providerData) {
  return JSON.stringify(providerData);
}
async function ensurePasswordIsHashed(providerData) {
  const data = {
    ...providerData
  };
  if (providerDataHasPasswordField(data)) {
    data.hashedPassword = await hashPassword(data.hashedPassword);
  }
  return data;
}
function providerDataHasPasswordField(providerData) {
  return "hashedPassword" in providerData;
}
function createInvalidCredentialsError(message) {
  return new HttpError(401, "Invalid credentials", { message });
}

function createAuthUserData(user) {
  const { auth, ...rest } = user;
  if (!auth) {
    throw new Error(`\u{1F41D} Error: trying to create a user without auth data.
This should never happen, but it did which means there is a bug in the code.`);
  }
  const identities = {
    email: getProviderInfo(auth, "email")
  };
  return {
    ...rest,
    identities
  };
}
function getProviderInfo(auth, providerName) {
  const identity = getIdentity(auth, providerName);
  if (!identity) {
    return null;
  }
  return {
    ...getProviderData(identity.providerData),
    id: identity.providerUserId
  };
}
function getIdentity(auth, providerName) {
  return auth.identities.find((i) => i.providerName === providerName) ?? null;
}

async function createSession(authId) {
  return auth$1.createSession(authId, {});
}
async function getSessionAndUserFromBearerToken(req) {
  const authorizationHeader = req.headers["authorization"];
  if (typeof authorizationHeader !== "string") {
    return null;
  }
  const sessionId = auth$1.readBearerToken(authorizationHeader);
  if (!sessionId) {
    return null;
  }
  return getSessionAndUserFromSessionId(sessionId);
}
async function getSessionAndUserFromSessionId(sessionId) {
  const { session, user: authEntity } = await auth$1.validateSession(sessionId);
  if (!session || !authEntity) {
    return null;
  }
  return {
    session,
    user: await getAuthUserData(authEntity.userId)
  };
}
async function getAuthUserData(userId) {
  const user = await dbClient.user.findUnique({
    where: { id: userId },
    include: {
      auth: {
        include: {
          identities: true
        }
      }
    }
  });
  if (!user) {
    throw createInvalidCredentialsError();
  }
  return createAuthUserData(user);
}
function invalidateSession(sessionId) {
  return auth$1.invalidateSession(sessionId);
}

const auth = defineHandler(async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.sessionId = null;
    req.user = null;
    return next();
  }
  const sessionAndUser = await getSessionAndUserFromBearerToken(req);
  if (sessionAndUser === null) {
    throw createInvalidCredentialsError();
  }
  req.sessionId = sessionAndUser.session.id;
  req.user = sessionAndUser.user;
  next();
});

const Decimal = Prisma.Decimal;
if (Decimal) {
  registerCustom({
    isApplicable: (v) => Decimal.isDecimal(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new Decimal(v)
  }, "prisma.decimal");
}

function isNotNull(value) {
  return value !== null;
}

function makeAuthUserIfPossible(user) {
  return user ? makeAuthUser(user) : null;
}
function makeAuthUser(data) {
  return {
    ...data,
    getFirstProviderUserId: () => {
      const identities = Object.values(data.identities).filter(isNotNull);
      return identities.length > 0 ? identities[0].id : null;
    }
  };
}

function createOperation(handlerFn) {
  return defineHandler(async (req, res) => {
    const args = req.body && deserialize(req.body) || {};
    const context = {
      user: makeAuthUserIfPossible(req.user)
    };
    const result = await handlerFn(args, context);
    const serializedResult = serialize(result);
    res.json(serializedResult);
  });
}
function createQuery(handlerFn) {
  return createOperation(handlerFn);
}
function createAction(handlerFn) {
  return createOperation(handlerFn);
}

async function createOrganization$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  const existing = await context.entities.Organization.findUnique({ where: { name: args.name } });
  if (existing) throw new Error("Organization name already taken");
  return context.entities.Organization.create({
    data: { name: args.name, teacherId: context.user.id }
  });
}

async function createOrganization$1(args, context) {
  return createOrganization$2(args, {
    ...context,
    entities: {
      Organization: dbClient.organization
    }
  });
}

var createOrganization = createAction(createOrganization$1);

async function addOrgStudents$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  const { orgId, students } = args;
  const results = [];
  for (const s of students) {
    const student = await context.entities.OrgStudent.upsert({
      where: { rollNo_orgId: { rollNo: s.rollNo, orgId } },
      update: { name: s.name, section: s.section || "" },
      create: { name: s.name, rollNo: s.rollNo, section: s.section || "", orgId }
    });
    results.push(student);
  }
  return results;
}

async function addOrgStudents$1(args, context) {
  return addOrgStudents$2(args, {
    ...context,
    entities: {
      OrgStudent: dbClient.orgStudent,
      Organization: dbClient.organization
    }
  });
}

var addOrgStudents = createAction(addOrgStudents$1);

async function createCampaign$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  return context.entities.Campaign.create({
    data: {
      title: args.title,
      examName: args.examName,
      topic: args.topic,
      difficulty: args.difficulty,
      deadline: new Date(args.deadline),
      teacherId: context.user.id,
      orgId: args.orgId || null,
      mode: args.mode || "individual"
    }
  });
}

async function createCampaign$1(args, context) {
  return createCampaign$2(args, {
    ...context,
    entities: {
      Campaign: dbClient.campaign,
      Organization: dbClient.organization
    }
  });
}

var createCampaign = createAction(createCampaign$1);

function decodeKey(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
  return Buffer.from(padded, "base64").toString("utf-8");
}
const PRIVATE_KEY = decodeKey(process.env.QR_SIGNING_PRIVATE_KEY);
const PUBLIC_KEY = decodeKey(process.env.QR_SIGNING_PUBLIC_KEY);
async function signQRPayload(payload) {
  const jwt = await new jose.SignJWT(payload).setProtectedHeader({ alg: "ES256" }).setIssuedAt().setExpirationTime("2h").sign(await jose.importPKCS8(PRIVATE_KEY, "ES256"));
  return jwt;
}
async function verifyQRSignature(token) {
  try {
    const { payload } = await jose.jwtVerify(token, await jose.importSPKI(PUBLIC_KEY, "ES256"));
    return payload;
  } catch (err) {
    return null;
  }
}
function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}
function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function generateSecureQR$2(args, context) {
  const { campaignId, studentId } = args;
  const campaign = await context.entities.Campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campaign not found");
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);
  const payload = { studentId, campaignId, exp: Math.floor(Date.now() / 1e3) + 7200 };
  const signature = await signQRPayload(payload);
  const qrPaper = await context.entities.QRPaper.create({
    data: { token: tokenHash, signature, studentId, campaignId, isUsed: false }
  });
  return { rawToken, signature, qrPaperId: qrPaper.id };
}

async function generateSecureQR$1(args, context) {
  return generateSecureQR$2(args, {
    ...context,
    entities: {
      User: dbClient.user,
      QRPaper: dbClient.qRPaper,
      Campaign: dbClient.campaign
    }
  });
}

var generateSecureQR = createAction(generateSecureQR$1);

async function createIndividualSession$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  const campaign = await context.entities.Campaign.create({
    data: {
      title: args.title || args.examName + " - " + args.topic,
      examName: args.examName,
      topic: args.topic,
      difficulty: args.difficulty,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
      // 7 days from now
      teacherId: context.user.id,
      mode: "individual"
    }
  });
  return campaign;
}

async function createIndividualSession$1(args, context) {
  return createIndividualSession$2(args, {
    ...context,
    entities: {
      Campaign: dbClient.campaign
    }
  });
}

var createIndividualSession = createAction(createIndividualSession$1);

const DEFAULT_WEIGHTS = {
  assignment: 0.3,
  behavior: 0.1,
  performance: 0.2,
  classTest: 0.4
};
function computeStudentScore(assessments, classTestAttempts, weights) {
  const w = weights || DEFAULT_WEIGHTS;
  const categories = {
    assignment: { scored: 0, total: 0 },
    behavior: { scored: 0, total: 0 },
    performance: { scored: 0, total: 0 },
    classTest: { scored: 0, total: 0 }
  };
  for (const a of assessments) {
    if (categories[a.type]) {
      categories[a.type].scored += a.marks;
      categories[a.type].total += a.maxMarks;
    }
  }
  for (const attempt of classTestAttempts) {
    categories.classTest.scored += attempt.score;
    categories.classTest.total += attempt.totalMarks;
  }
  const breakdown = {};
  let activeWeightSum = 0;
  for (const [key, cat] of Object.entries(categories)) {
    if (cat.total > 0) {
      breakdown[key] = {
        scored: cat.scored,
        total: cat.total,
        percent: cat.scored / cat.total * 100,
        weight: w[key] || DEFAULT_WEIGHTS[key]
      };
      activeWeightSum += breakdown[key].weight;
    }
  }
  let combinedScore = 0;
  for (const data of Object.values(breakdown)) {
    data.adjustedWeight = activeWeightSum > 0 ? data.weight / activeWeightSum : 0;
    data.weighted = data.percent * data.adjustedWeight;
    combinedScore += data.weighted;
  }
  return { breakdown, combinedScore: Math.round(combinedScore * 100) / 100 };
}
function getTier(score) {
  if (score >= 80) return { name: "Excellent", color: "green", emoji: "\u{1F7E2}" };
  if (score >= 60) return { name: "Good", color: "blue", emoji: "\u{1F535}" };
  if (score >= 40) return { name: "Average", color: "yellow", emoji: "\u{1F7E1}" };
  return { name: "Needs Improvement", color: "red", emoji: "\u{1F534}" };
}
function getRecommendedDifficulty(score) {
  if (score >= 80) return "hard";
  if (score >= 50) return "medium";
  return "easy";
}

async function generateBulkQR$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  const { campaignId, orgId, adaptive } = args;
  const campaign = await context.entities.Campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("Campaign not found");
  const students = await context.entities.OrgStudent.findMany({ where: { orgId } });
  if (students.length === 0) throw new Error("No students in organization");
  let weights;
  if (adaptive) {
    const config = await context.entities.OrgConfig.findUnique({ where: { orgId } });
    if (config) {
      weights = {
        assignment: config.weightAssignment,
        behavior: config.weightBehavior,
        performance: config.weightPerformance,
        classTest: config.weightClassTest
      };
    }
  }
  const results = [];
  for (const student of students) {
    let difficulty = null;
    if (adaptive) {
      const assessments = await context.entities.Assessment.findMany({ where: { orgStudentId: student.id } });
      const qrPapers = await context.entities.QRPaper.findMany({
        where: { orgStudentId: student.id },
        include: { questionSets: { include: { attempts: true } } }
      });
      const attempts = [];
      for (const p of qrPapers) {
        for (const qs of p.questionSets) {
          for (const a of qs.attempts) attempts.push(a);
        }
      }
      const { combinedScore } = computeStudentScore(assessments, attempts, weights);
      difficulty = getRecommendedDifficulty(combinedScore);
    }
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const payload = { orgStudentId: student.id, campaignId, exp: Math.floor(Date.now() / 1e3) + 86400 };
    const signature = await signQRPayload(payload);
    const qrPaper = await context.entities.QRPaper.create({
      data: { token: tokenHash, signature, orgStudentId: student.id, campaignId, isUsed: false, difficulty }
    });
    results.push({
      student: { id: student.id, name: student.name, rollNo: student.rollNo, section: student.section },
      rawToken,
      qrPaperId: qrPaper.id,
      paperUrl: "/paper/" + rawToken,
      difficulty: difficulty || campaign.difficulty
    });
  }
  return results;
}

async function generateBulkQR$1(args, context) {
  return generateBulkQR$2(args, {
    ...context,
    entities: {
      QRPaper: dbClient.qRPaper,
      Campaign: dbClient.campaign,
      OrgStudent: dbClient.orgStudent,
      Organization: dbClient.organization,
      Assessment: dbClient.assessment,
      Attempt: dbClient.attempt,
      QuestionSet: dbClient.questionSet,
      OrgConfig: dbClient.orgConfig
    }
  });
}

var generateBulkQR = createAction(generateBulkQR$1);

async function submitAttempt$2(args, context) {
  const { questionSetId, answers } = args;
  const userId = context.user?.id || null;
  const questionSet = await context.entities.QuestionSet.findUnique({
    where: { id: questionSetId },
    include: { qrPaper: true }
  });
  const questions = JSON.parse(questionSet.questions);
  const orgStudentId = questionSet.qrPaper?.orgStudentId || null;
  const adaptiveId = userId || orgStudentId || null;
  let totalMarks = 0;
  let obtained = 0;
  const conceptResults = {};
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    totalMarks += q.marks || 0;
    const userAns = answers[i];
    const isCorrect = checkAnswer(userAns, q.correctAnswer, q.type);
    const conceptKey = q.concept || "General";
    conceptResults[conceptKey] = conceptResults[conceptKey] || { correct: 0, total: 0 };
    conceptResults[conceptKey].total++;
    if (isCorrect) {
      obtained += q.marks || 0;
      conceptResults[conceptKey].correct++;
    } else {
      if (q.negativeMarks && userAns !== null && userAns !== void 0 && userAns !== "") obtained -= q.negativeMarks;
    }
  }
  if (adaptiveId) {
    for (const [concept, stats] of Object.entries(conceptResults)) {
      const accuracy = stats.correct / stats.total;
      const existing = await context.entities.WeakArea.findUnique({
        where: { studentId_concept: { studentId: adaptiveId, concept } }
      });
      const newStrength = existing ? existing.strength * 0.7 + accuracy * 0.3 : accuracy;
      await context.entities.WeakArea.upsert({
        where: { studentId_concept: { studentId: adaptiveId, concept } },
        update: { strength: newStrength },
        create: { studentId: adaptiveId, concept, strength: newStrength }
      });
    }
  }
  const attempt = await context.entities.Attempt.create({
    data: {
      studentId: userId,
      orgStudentId,
      questionSetId,
      answers: JSON.stringify(answers),
      score: isNaN(obtained) ? 0 : Math.round(obtained * 100) / 100,
      totalMarks: isNaN(totalMarks) ? 0 : totalMarks,
      weakAreas: conceptResults
    }
  });
  const weakTopics = Object.entries(conceptResults).filter(([_, stats]) => stats.correct / stats.total < 0.5).map(([concept, stats]) => ({
    concept,
    accuracy: Math.round(stats.correct / stats.total * 100),
    correct: stats.correct,
    total: stats.total
  }));
  return JSON.parse(JSON.stringify({
    attemptId: attempt.id,
    score: Math.round(obtained * 100) / 100,
    totalMarks,
    weakTopics,
    conceptResults
  }));
}
function norm(s) {
  if (typeof s !== "string") return String(s ?? "");
  return s.replace(/^[A-Da-d][.):\s]+/, "").trim().toLowerCase().replace(/\s+/g, " ");
}
function checkAnswer(user, correct, type) {
  if (!user && user !== 0) return false;
  if (type === "MCQ") {
    const match = norm(user) === norm(correct);
    console.log(`[Score] MCQ: user="${user}" correct="${correct}" norm_user="${norm(user)}" norm_correct="${norm(correct)}" \u2192 ${match}`);
    return match;
  }
  if (type === "NAT") {
    const u = parseFloat(user), c = parseFloat(correct);
    const match = !isNaN(u) && !isNaN(c) && Math.abs(u - c) < 0.01;
    console.log(`[Score] NAT: user=${u} correct=${c} \u2192 ${match}`);
    return match;
  }
  if (type === "MSQ") {
    let correctArr = correct;
    if (typeof correct === "string") {
      try {
        correctArr = JSON.parse(correct);
      } catch {
        correctArr = correct.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    let userArr = user;
    if (typeof user === "string") {
      try {
        userArr = JSON.parse(user);
      } catch {
        userArr = [user];
      }
    }
    if (!Array.isArray(userArr) || !Array.isArray(correctArr)) return false;
    const userNorm = userArr.map(norm);
    const correctNorm = correctArr.map(norm);
    const allUserCorrect = userNorm.every((u) => correctNorm.includes(u));
    const coverage = userNorm.filter((u) => correctNorm.includes(u)).length / correctNorm.length;
    const match = allUserCorrect && coverage >= 0.7;
    console.log(`[Score] MSQ: user=${JSON.stringify(userArr)} correct=${JSON.stringify(correctArr)} coverage=${(coverage * 100).toFixed(0)}% \u2192 ${match}`);
    return match;
  }
  return false;
}

async function submitAttempt$1(args, context) {
  return submitAttempt$2(args, {
    ...context,
    entities: {
      Attempt: dbClient.attempt,
      QuestionSet: dbClient.questionSet,
      WeakArea: dbClient.weakArea,
      QRPaper: dbClient.qRPaper
    }
  });
}

var submitAttempt = createAction(submitAttempt$1);

async function createAssessment$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  const { orgId, entries } = args;
  const results = [];
  for (const entry of entries) {
    const assessment = await context.entities.Assessment.create({
      data: {
        orgStudentId: entry.orgStudentId,
        orgId,
        type: entry.type,
        title: entry.title,
        description: entry.description || "",
        marks: entry.marks,
        maxMarks: entry.maxMarks,
        date: entry.date ? new Date(entry.date) : /* @__PURE__ */ new Date(),
        createdBy: context.user.id
      }
    });
    results.push(assessment);
  }
  return results;
}

async function createAssessment$1(args, context) {
  return createAssessment$2(args, {
    ...context,
    entities: {
      Assessment: dbClient.assessment,
      OrgStudent: dbClient.orgStudent,
      Organization: dbClient.organization
    }
  });
}

var createAssessment = createAction(createAssessment$1);

async function deleteAssessment$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  return context.entities.Assessment.delete({ where: { id: args.id } });
}

async function deleteAssessment$1(args, context) {
  return deleteAssessment$2(args, {
    ...context,
    entities: {
      Assessment: dbClient.assessment
    }
  });
}

var deleteAssessment = createAction(deleteAssessment$1);

async function updateOrgConfig$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  const { orgId, weightAssignment, weightBehavior, weightPerformance, weightClassTest } = args;
  return context.entities.OrgConfig.upsert({
    where: { orgId },
    update: { weightAssignment, weightBehavior, weightPerformance, weightClassTest },
    create: { orgId, weightAssignment, weightBehavior, weightPerformance, weightClassTest }
  });
}

async function updateOrgConfig$1(args, context) {
  return updateOrgConfig$2(args, {
    ...context,
    entities: {
      OrgConfig: dbClient.orgConfig,
      Organization: dbClient.organization
    }
  });
}

var updateOrgConfig = createAction(updateOrgConfig$1);

async function deletePaper$2(args, context) {
  if (!context.user) throw new Error("Not authenticated");
  const { paperId } = args;
  const questionSets = await context.entities.QuestionSet.findMany({
    where: { qrPaperId: paperId }
  });
  for (const qs of questionSets) {
    await context.entities.Attempt.deleteMany({ where: { questionSetId: qs.id } });
  }
  await context.entities.QuestionSet.deleteMany({ where: { qrPaperId: paperId } });
  await context.entities.QRPaper.delete({ where: { id: paperId } });
  return { success: true };
}

async function deletePaper$1(args, context) {
  return deletePaper$2(args, {
    ...context,
    entities: {
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Attempt: dbClient.attempt
    }
  });
}

var deletePaper = createAction(deletePaper$1);

async function deleteCampaign$2(args, context) {
  if (!context.user) return null;
  const { campaignId } = args;
  const papers = await context.entities.QRPaper.findMany({
    where: { campaignId },
    include: { questionSets: true }
  });
  for (const paper of papers) {
    for (const qs of paper.questionSets) {
      await context.entities.Attempt.deleteMany({ where: { questionSetId: qs.id } });
    }
    await context.entities.QuestionSet.deleteMany({ where: { qrPaperId: paper.id } });
  }
  await context.entities.QRPaper.deleteMany({ where: { campaignId } });
  await context.entities.Campaign.delete({ where: { id: campaignId } });
  return { success: true };
}

async function deleteCampaign$1(args, context) {
  return deleteCampaign$2(args, {
    ...context,
    entities: {
      Campaign: dbClient.campaign,
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Attempt: dbClient.attempt
    }
  });
}

var deleteCampaign = createAction(deleteCampaign$1);

async function getMe$2(args, context) {
  if (!context.user) return null;
  return context.entities.User.findUnique({ where: { id: context.user.id } });
}

async function getMe$1(args, context) {
  return getMe$2(args, {
    ...context,
    entities: {
      User: dbClient.user
    }
  });
}

var getMe = createQuery(getMe$1);

async function getMyOrganization$2(args, context) {
  if (!context.user) return null;
  return context.entities.Organization.findFirst({
    where: { teacherId: context.user.id },
    include: {
      _count: { select: { students: true, campaigns: true } },
      campaigns: { orderBy: { createdAt: "desc" }, take: 5 }
    }
  });
}

async function getMyOrganization$1(args, context) {
  return getMyOrganization$2(args, {
    ...context,
    entities: {
      Organization: dbClient.organization,
      OrgStudent: dbClient.orgStudent,
      Campaign: dbClient.campaign
    }
  });
}

var getMyOrganization = createQuery(getMyOrganization$1);

async function getOrgStudents$2(args, context) {
  if (!context.user) return [];
  const { orgId } = args;
  return context.entities.OrgStudent.findMany({
    where: { orgId },
    include: { _count: { select: { qrPapers: true } } },
    orderBy: [{ section: "asc" }, { rollNo: "asc" }]
  });
}

async function getOrgStudents$1(args, context) {
  return getOrgStudents$2(args, {
    ...context,
    entities: {
      OrgStudent: dbClient.orgStudent,
      Organization: dbClient.organization
    }
  });
}

var getOrgStudents = createQuery(getOrgStudents$1);

async function getMyCampaigns$2(args, context) {
  if (!context.user) return [];
  return context.entities.Campaign.findMany({
    where: { teacherId: context.user.id },
    include: {
      _count: { select: { qrPapers: true } },
      qrPapers: { include: { questionSets: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getMyCampaigns$1(args, context) {
  return getMyCampaigns$2(args, {
    ...context,
    entities: {
      Campaign: dbClient.campaign,
      QRPaper: dbClient.qRPaper
    }
  });
}

var getMyCampaigns = createQuery(getMyCampaigns$1);

async function getCampaigns$2(args, context) {
  if (!context.user) return [];
  return context.entities.Campaign.findMany({
    where: { mode: "individual" },
    include: { _count: { select: { qrPapers: true } } },
    orderBy: { createdAt: "desc" }
  });
}

async function getCampaigns$1(args, context) {
  return getCampaigns$2(args, {
    ...context,
    entities: {
      Campaign: dbClient.campaign
    }
  });
}

var getCampaigns = createQuery(getCampaigns$1);

const MAX_RETRIES$1 = 3;
function sleep$1(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Get one free at https://aistudio.google.com/apikey");
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      maxOutputTokens: 8192
    }
  };
  for (let attempt = 1; attempt <= MAX_RETRIES$1; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response from Gemini API");
        return text;
      }
      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({}));
        let retryDelay = 10;
        const retryInfo = errorData.error?.details?.find((d) => d["@type"]?.includes("RetryInfo"));
        if (retryInfo?.retryDelay) {
          const match = retryInfo.retryDelay.match(/(\d+)/);
          if (match) retryDelay = parseInt(match[1]);
        }
        if (attempt < MAX_RETRIES$1) {
          console.log(`[Gemini] Rate limited. Waiting ${retryDelay}s before retry ${attempt + 1}/${MAX_RETRIES$1}...`);
          await sleep$1(retryDelay * 1e3);
          continue;
        }
        throw new Error(`Gemini API rate limited after ${MAX_RETRIES$1} retries. Daily quota may be exhausted.`);
      }
      if (res.status === 403) {
        const errorData = await res.json().catch(() => ({}));
        const reason = errorData.error?.message || "";
        if (reason.includes("quota") || reason.includes("RESOURCE_EXHAUSTED")) {
          throw new Error(`Gemini quota exhausted. Falling back to Groq. (${reason.substring(0, 100)})`);
        }
        throw new Error(`Gemini API forbidden (403): ${reason.substring(0, 100)}`);
      }
      const errorText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errorText}`);
    } catch (err) {
      if (attempt === MAX_RETRIES$1) throw err;
      if (!err.message.includes("429") && !err.message.includes("rate")) throw err;
      console.log(`[Gemini] Retry ${attempt + 1}/${MAX_RETRIES$1} after error...`);
      await sleep$1(15e3);
    }
  }
}

const MAX_RETRIES = 3;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set. Get one free at https://console.groq.com/keys");
  }
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const body = {
    model,
    messages: [
      {
        role: "system",
        // KEY FIX: Tell model to return a raw JSON array, not an object.
        // This works WITH the buildPrompt() template which expects [...].
        content: `You are an expert competitive exam question setter for GATE, JEE, and UPSC.
Your ONLY job is to return a valid JSON array of questions.
Rules:
- Return ONLY the raw JSON array starting with [ and ending with ]
- No markdown, no code fences, no explanation, no wrapper object
- Each correctAnswer for MCQ must be exactly one letter: A, B, C, or D
- Verify every answer mathematically/logically before including it
- Never guess \u2014 if unsure about a calculation, simplify the numbers`
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    // LOW temperature = accurate answers, less hallucination
    max_tokens: 4096
    // NO response_format here — that was the root cause of wrong answers
  };
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error("Empty response from Groq API");
        return text;
      }
      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error?.message || "";
        let retryDelay = 20;
        const match = msg.match(/try again in (\d+\.?\d*)/i);
        if (match) retryDelay = Math.ceil(parseFloat(match[1])) + 2;
        if (attempt < MAX_RETRIES) {
          console.log(`[Groq] Rate limited. Waiting ${retryDelay}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
          await sleep(retryDelay * 1e3);
          continue;
        }
        throw new Error(`Groq API rate limited after ${MAX_RETRIES} retries.`);
      }
      const errorText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errorText}`);
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      if (!err.message.includes("429") && !err.message.includes("rate")) throw err;
      console.log(`[Groq] Retry ${attempt + 1}/${MAX_RETRIES}...`);
      await sleep(2e4);
    }
  }
}

async function callOllama(prompt, model = process.env.OLLAMA_MODEL, useJson = false) {
  const body = {
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 2048,
      top_p: 0.9,
      repeat_penalty: 1.3
    }
  };
  if (useJson) body.format = "json";
  const res = await fetch(process.env.OLLAMA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data.response;
}

let geminiKeyIndex = 0;
function getNextGeminiKey() {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
  ].filter(Boolean);
  if (keys.length === 0) return null;
  const key = keys[geminiKeyIndex % keys.length];
  geminiKeyIndex++;
  return key;
}
async function callGeminiWithRotation(prompt) {
  const key = getNextGeminiKey();
  if (!key) throw new Error("No Gemini API keys configured");
  const original = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = key;
  try {
    return await callGemini(prompt);
  } finally {
    process.env.GEMINI_API_KEY = original;
  }
}
async function callAI(prompt) {
  const provider = process.env.AI_PROVIDER || "groq";
  if (provider === "gemini") {
    console.log("[AI Provider] Using Gemini API");
    return await callGeminiWithRotation(prompt);
  }
  if (provider === "groq") {
    try {
      console.log("[AI Provider] Using Groq API");
      return await callGroq(prompt);
    } catch (err) {
      console.error(`[AI Provider] \u274C Groq failed: ${err.message.substring(0, 80)}`);
      const geminiKey = getNextGeminiKey();
      if (geminiKey) {
        console.log("[AI Provider] Falling back to Gemini...");
        return await callGeminiWithRotation(prompt);
      }
      throw err;
    }
  }
  if (provider === "ollama") {
    console.log("[AI Provider] Using Ollama (local)");
    return await callOllama(prompt, void 0, true);
  }
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2);
  const providers = [];
  if (process.env.GROQ_API_KEY) providers.push({ name: "Groq", fn: callGroq });
  if (hasGemini) providers.push({ name: "Gemini", fn: callGeminiWithRotation });
  providers.push({ name: "Ollama", fn: (p) => callOllama(p, void 0, true) });
  for (const { name, fn } of providers) {
    try {
      console.log(`[AI Provider] Trying ${name}...`);
      const result = await fn(prompt);
      console.log(`[AI Provider] \u2705 ${name} succeeded`);
      return result;
    } catch (err) {
      console.error(`[AI Provider] \u274C ${name} failed: ${err.message.substring(0, 100)}`);
    }
  }
  throw new Error("All AI providers failed. Check your API keys.");
}

const SUBJECT_KNOWLEDGE = {
  // ─────────────────── MATHEMATICS ───────────────────
  "Mathematics - Calculus": {
    domain: "Mathematics",
    subtopic: "Calculus",
    concepts: [
      "Limits and Continuity",
      "L'H\xF4pital's Rule",
      "Squeeze Theorem",
      "Differentiability",
      "Chain Rule",
      "Implicit Differentiation",
      "Applications of Derivatives (Maxima/Minima, Rate of Change, Tangent/Normal)",
      "Mean Value Theorem",
      "Rolle's Theorem",
      "Indefinite Integrals",
      "Integration by Parts",
      "Integration by Substitution",
      "Partial Fractions",
      "Definite Integrals",
      "Properties of Definite Integrals",
      "Area under Curves",
      "Differential Equations (First Order, Linear, Homogeneous)",
      "Order and Degree of Differential Equations"
    ],
    questionStarters: [
      "Evaluate the limit:",
      "Find dy/dx if",
      "Evaluate the integral:",
      "Find the area bounded by",
      "Solve the differential equation:",
      "If f(x) is continuous on [a,b] and differentiable on (a,b), then",
      "The maximum value of f(x) = ... on the interval",
      "Find the value of the definite integral"
    ],
    exampleQuestion: {
      text: "If f(x) = \u222B\u2080\u02E3 (sin\xB2t)/(t) dt, then lim(x\u21920) f(x)/x\xB2 equals:",
      type: "MCQ",
      options: ["A. 1/2", "B. 1", "C. 2", "D. 0"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Definite Integrals and Limits"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "pipeline", "O(n)", "loop", "array", "function call", "compiler"]
  },
  "Mathematics - Algebra": {
    domain: "Mathematics",
    subtopic: "Algebra",
    concepts: [
      "Quadratic Equations",
      "Complex Numbers",
      "Sequences and Series",
      "Arithmetic Progression",
      "Geometric Progression",
      "Harmonic Progression",
      "Binomial Theorem",
      "Permutations and Combinations",
      "Matrices and Determinants",
      "Mathematical Induction",
      "Partial Fractions",
      "Logarithms",
      "Inequalities",
      "Theory of Equations",
      "Sets and Relations"
    ],
    questionStarters: [
      "If the roots of the equation",
      "Find the sum of the series",
      "The number of ways to",
      "If A is a 3\xD73 matrix such that",
      "The value of the determinant",
      "If z is a complex number such that",
      "In the expansion of (1+x)\u207F",
      "Find the coefficient of x^r in"
    ],
    exampleQuestion: {
      text: "If the sum of the first n terms of an A.P. is given by S\u2099 = 3n\xB2 + 5n, then the common difference is:",
      type: "MCQ",
      options: ["A. 3", "B. 5", "C. 6", "D. 8"],
      correctAnswer: "C",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Arithmetic Progression"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "pipeline", "O(n)", "loop", "array"]
  },
  "Mathematics - Coordinate Geometry": {
    domain: "Mathematics",
    subtopic: "Coordinate Geometry",
    concepts: [
      "Straight Lines",
      "Circles",
      "Parabola",
      "Ellipse",
      "Hyperbola",
      "Pair of Straight Lines",
      "Distance Formula",
      "Section Formula",
      "Locus",
      "Conic Sections",
      "Tangent and Normal to Conics",
      "Chord of Contact",
      "Director Circle"
    ],
    questionStarters: [
      "The equation of the tangent to the parabola",
      "A circle passes through the points",
      "The eccentricity of the ellipse",
      "The locus of a point such that",
      "If the line y = mx + c is a tangent to"
    ],
    exampleQuestion: {
      text: "The length of the latus rectum of the parabola y\xB2 = 12x is:",
      type: "MCQ",
      options: ["A. 3", "B. 6", "C. 12", "D. 24"],
      correctAnswer: "C",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Parabola"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Mathematics - Trigonometry": {
    domain: "Mathematics",
    subtopic: "Trigonometry",
    concepts: [
      "Trigonometric Ratios and Identities",
      "Trigonometric Equations",
      "Inverse Trigonometric Functions",
      "Properties of Triangles",
      "Heights and Distances",
      "Sine Rule",
      "Cosine Rule",
      "Multiple and Sub-multiple Angles",
      "Sum and Product Formulas"
    ],
    questionStarters: [
      "The general solution of the equation",
      "If sin\u207B\xB9(x) + cos\u207B\xB9(y) =",
      "In triangle ABC, if a = 5, b = 7, C = 60\xB0, then",
      "The value of cos\xB2(\u03C0/8) + cos\xB2(3\u03C0/8) is"
    ],
    exampleQuestion: {
      text: "The number of solutions of sin\xB2x - 2cosx + 1/4 = 0 in [0, 2\u03C0] is:",
      type: "MCQ",
      options: ["A. 1", "B. 2", "C. 3", "D. 4"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Trigonometric Equations"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Mathematics - Probability and Statistics": {
    domain: "Mathematics",
    subtopic: "Probability and Statistics",
    concepts: [
      "Probability (Classical, Conditional, Bayes' Theorem)",
      "Random Variables",
      "Probability Distribution",
      "Mean, Median, Mode",
      "Variance and Standard Deviation",
      "Binomial Distribution",
      "Independent Events",
      "Mutually Exclusive Events"
    ],
    questionStarters: [
      "A bag contains",
      "If P(A) = 0.4 and P(B) = 0.5",
      "Two dice are thrown simultaneously",
      "If X is a random variable with",
      "The mean and variance of a binomial distribution are"
    ],
    exampleQuestion: {
      text: "If two events A and B are such that P(A) = 1/2, P(B) = 1/3, and P(A\u2229B) = 1/4, then P(A|B) equals:",
      type: "MCQ",
      options: ["A. 1/4", "B. 3/4", "C. 1/2", "D. 2/3"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Conditional Probability"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Mathematics - Vectors and 3D Geometry": {
    domain: "Mathematics",
    subtopic: "Vectors and 3D Geometry",
    concepts: [
      "Vector Algebra (Addition, Dot Product, Cross Product)",
      "Scalar Triple Product",
      "Vector Triple Product",
      "Direction Cosines and Direction Ratios",
      "Equation of a Line in 3D",
      "Equation of a Plane",
      "Angle between Lines and Planes",
      "Shortest Distance between Lines"
    ],
    questionStarters: [
      "If vectors a and b are such that",
      "The angle between the planes",
      "The shortest distance between the lines",
      "The equation of the plane passing through",
      "If [a b c] = 5, then"
    ],
    exampleQuestion: {
      text: "If |a\u20D7| = 2, |b\u20D7| = 3, and a\u20D7\xB7b\u20D7 = 3, then the value of |a\u20D7 \xD7 b\u20D7| is:",
      type: "MCQ",
      options: ["A. 3", "B. 3\u221A3", "C. \u221A3", "D. 6"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Cross Product"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  // ─────────────────── PHYSICS ───────────────────
  "Physics - Mechanics": {
    domain: "Physics",
    subtopic: "Mechanics",
    concepts: [
      "Kinematics (1D and 2D)",
      "Newton's Laws of Motion",
      "Friction",
      "Work, Energy and Power",
      "Conservation of Momentum",
      "Rotational Motion",
      "Moment of Inertia",
      "Gravitation",
      "Simple Harmonic Motion",
      "Elasticity",
      "Fluid Mechanics",
      "Centre of Mass",
      "Projectile Motion",
      "Circular Motion"
    ],
    questionStarters: [
      "A block of mass m is placed on",
      "A particle is projected with velocity",
      "A disc of radius R and mass M",
      "Two bodies of masses m\u2081 and m\u2082",
      "A spring of spring constant k",
      "A satellite orbits the Earth at",
      "A ball is thrown vertically upward with"
    ],
    exampleQuestion: {
      text: "A block of mass 2 kg slides down a rough inclined plane of inclination 30\xB0 with uniform velocity. The coefficient of kinetic friction is:",
      type: "MCQ",
      options: ["A. 1/\u221A3", "B. \u221A3", "C. \u221A3/2", "D. 2/\u221A3"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Friction on Inclined Plane"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "pipeline"]
  },
  "Physics - Electrodynamics": {
    domain: "Physics",
    subtopic: "Electrodynamics",
    concepts: [
      "Coulomb's Law",
      "Electric Field and Potential",
      "Gauss's Law",
      "Capacitance",
      "Current Electricity (Ohm's Law, Kirchhoff's Laws)",
      "Wheatstone Bridge",
      "Potentiometer",
      "Magnetic Effects of Current",
      "Biot-Savart Law",
      "Ampere's Law",
      "Electromagnetic Induction",
      "Faraday's Law",
      "AC Circuits",
      "Electromagnetic Waves"
    ],
    questionStarters: [
      "Two charges q\u2081 and q\u2082 are placed",
      "A parallel plate capacitor with",
      "In the circuit shown",
      "A long straight wire carrying current",
      "A coil of N turns and area A",
      "In an LCR circuit"
    ],
    exampleQuestion: {
      text: "A parallel plate capacitor with plate area A and separation d has capacitance C. If a dielectric slab of thickness d/2 and dielectric constant K is inserted, the new capacitance is:",
      type: "MCQ",
      options: ["A. 2KC/(K+1)", "B. KC/(K+1)", "C. 2KC/(2K+1)", "D. KC/(2K+1)"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Capacitance with Dielectrics"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Physics - Optics": {
    domain: "Physics",
    subtopic: "Optics",
    concepts: [
      "Reflection and Refraction",
      "Total Internal Reflection",
      "Lenses (Thin Lens Formula)",
      "Mirrors",
      "Prism",
      "Young's Double Slit Experiment",
      "Diffraction",
      "Polarization",
      "Optical Instruments",
      "Wave Optics",
      "Interference"
    ],
    questionStarters: [
      "A convex lens of focal length",
      "In Young's double slit experiment",
      "A ray of light passes through a prism",
      "The critical angle for",
      "A concave mirror of radius of curvature"
    ],
    exampleQuestion: {
      text: "In Young's double slit experiment, the fringe width is \u03B2. If the wavelength of light is doubled and the slit separation is halved, the new fringe width is:",
      type: "MCQ",
      options: ["A. \u03B2", "B. 2\u03B2", "C. 4\u03B2", "D. \u03B2/2"],
      correctAnswer: "C",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Young's Double Slit Experiment"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Physics - Modern Physics": {
    domain: "Physics",
    subtopic: "Modern Physics",
    concepts: [
      "Photoelectric Effect",
      "Bohr Model of Hydrogen Atom",
      "de Broglie Wavelength",
      "X-rays",
      "Nuclear Physics",
      "Radioactivity (Alpha, Beta, Gamma Decay)",
      "Mass-Energy Equivalence",
      "Nuclear Fission and Fusion",
      "Semiconductor Physics",
      "Logic Gates"
    ],
    questionStarters: [
      "When light of wavelength \u03BB",
      "In the Bohr model of hydrogen atom",
      "The half-life of a radioactive element",
      "The binding energy per nucleon",
      "In a photoelectric experiment"
    ],
    exampleQuestion: {
      text: "The de Broglie wavelength of an electron accelerated through a potential difference of V volts is:",
      type: "MCQ",
      options: ["A. 1.227/\u221AV nm", "B. 12.27/\u221AV \xC5", "C. 0.1227/\u221AV nm", "D. 122.7/\u221AV \xC5"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "de Broglie Wavelength"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Physics - Thermodynamics": {
    domain: "Physics",
    subtopic: "Thermodynamics",
    concepts: [
      "Thermal Expansion",
      "Calorimetry",
      "Heat Transfer (Conduction, Convection, Radiation)",
      "Kinetic Theory of Gases",
      "Laws of Thermodynamics",
      "Carnot Engine",
      "Entropy",
      "Specific Heat Capacities (Cp, Cv)",
      "Isothermal and Adiabatic Processes",
      "Stefan's Law",
      "Newton's Law of Cooling"
    ],
    questionStarters: [
      "An ideal gas undergoes",
      "The efficiency of a Carnot engine operating between",
      "A metal rod of length L",
      "Two moles of an ideal gas at",
      "A black body at temperature T"
    ],
    exampleQuestion: {
      text: "An ideal gas undergoes an isothermal expansion at temperature T. If the volume doubles, the work done by the gas is:",
      type: "MCQ",
      options: ["A. nRT", "B. nRT ln2", "C. 2nRT", "D. nRT/2"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Isothermal Process"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Physics - Waves and Oscillations": {
    domain: "Physics",
    subtopic: "Waves and Oscillations",
    concepts: [
      "Simple Harmonic Motion",
      "Damped and Forced Oscillations",
      "Superposition of Waves",
      "Standing Waves",
      "Beats",
      "Doppler Effect",
      "String Vibrations",
      "Sound Waves",
      "Resonance",
      "Speed of Sound"
    ],
    questionStarters: [
      "A particle executes SHM with amplitude",
      "A string of length L is fixed at both ends",
      "Two tuning forks of frequencies",
      "A source of sound is moving towards",
      "The fundamental frequency of a closed organ pipe"
    ],
    exampleQuestion: {
      text: "A particle executes SHM with amplitude A and time period T. The time taken to travel from x = 0 to x = A/2 is:",
      type: "MCQ",
      options: ["A. T/12", "B. T/6", "C. T/4", "D. T/8"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Simple Harmonic Motion"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  // ─────────────────── CHEMISTRY ───────────────────
  "Chemistry - Organic": {
    domain: "Chemistry",
    subtopic: "Organic Chemistry",
    concepts: [
      "IUPAC Nomenclature",
      "Isomerism (Structural, Stereoisomerism)",
      "General Organic Chemistry (Inductive, Resonance, Hyperconjugation)",
      "Hydrocarbons (Alkanes, Alkenes, Alkynes)",
      "Aromatic Compounds",
      "Alcohols, Phenols and Ethers",
      "Aldehydes and Ketones",
      "Carboxylic Acids and Derivatives",
      "Amines",
      "Biomolecules",
      "Polymers",
      "Named Reactions (Aldol, Cannizzaro, Kolbe, etc.)"
    ],
    questionStarters: [
      "The major product formed when",
      "Identify the reagent for converting",
      "The IUPAC name of the compound",
      "Which of the following shows",
      "The correct order of reactivity",
      "In the following reaction sequence"
    ],
    exampleQuestion: {
      text: "The major product of dehydration of 2-methylcyclohexanol with conc. H\u2082SO\u2084 is:",
      type: "MCQ",
      options: ["A. 1-methylcyclohexene", "B. 2-methylcyclohexene", "C. methylenecyclohexane", "D. 3-methylcyclohexene"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Elimination Reactions"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Chemistry - Inorganic": {
    domain: "Chemistry",
    subtopic: "Inorganic Chemistry",
    concepts: [
      "Periodic Table and Periodicity",
      "Chemical Bonding (Ionic, Covalent, Metallic)",
      "VSEPR Theory",
      "Molecular Orbital Theory",
      "Coordination Compounds",
      "s-Block and p-Block Elements",
      "d-Block and f-Block Elements",
      "Metallurgy",
      "Qualitative Analysis",
      "Hydrogen and its Compounds"
    ],
    questionStarters: [
      "Which of the following has the highest",
      "The hybridization of the central atom in",
      "The magnetic moment of",
      "The IUPAC name of the complex",
      "The correct order of ionic radii",
      "Which of the following ores"
    ],
    exampleQuestion: {
      text: "The IUPAC name of [Co(NH\u2083)\u2084Cl\u2082]Cl is:",
      type: "MCQ",
      options: ["A. Tetraamminedichloridocobalt(III) chloride", "B. Dichloridotetraamminecobalt(III) chloride", "C. Tetraamminedichlorocobalt(III) chloride", "D. Cobalt tetraammine dichloride chloride"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Coordination Compounds"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  "Chemistry - Physical": {
    domain: "Chemistry",
    subtopic: "Physical Chemistry",
    concepts: [
      "Mole Concept and Stoichiometry",
      "Atomic Structure",
      "Chemical Thermodynamics (Enthalpy, Entropy, Gibbs Energy)",
      "Chemical Equilibrium",
      "Ionic Equilibrium (pH, Buffer, Solubility Product)",
      "Chemical Kinetics (Rate Laws, Order, Arrhenius Equation)",
      "Electrochemistry (Nernst Equation, Electrolysis, Galvanic Cells)",
      "Solutions (Raoult's Law, Colligative Properties)",
      "Surface Chemistry",
      "Solid State"
    ],
    questionStarters: [
      "For the reaction A \u2192 B, the rate constant",
      "The pH of a 0.01 M solution of",
      "The EMF of the cell",
      "The boiling point elevation of",
      "For an endothermic reaction",
      "The molar conductivity at infinite dilution"
    ],
    exampleQuestion: {
      text: "For a first-order reaction, the time required for 99.9% completion is approximately:",
      type: "MCQ",
      options: ["A. 5 times the half-life", "B. 10 times the half-life", "C. 7 times the half-life", "D. 20 times the half-life"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Chemical Kinetics"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software"]
  },
  // ─────────────────── COMPUTER SCIENCE ───────────────────
  "Theory of Computation": {
    domain: "Computer Science",
    subtopic: "Theory of Computation",
    concepts: [
      "Finite Automata (DFA, NFA)",
      "Regular Expressions",
      "Regular Languages",
      "Pumping Lemma for Regular Languages",
      "Context-Free Grammars (CFG)",
      "Pushdown Automata (PDA)",
      "Chomsky Normal Form",
      "CYK Algorithm",
      "Pumping Lemma for CFLs",
      "Turing Machines",
      "Decidability",
      "Halting Problem",
      "Reducibility",
      "Rice's Theorem",
      "Complexity Classes (P, NP, NP-Complete)",
      "NP-Completeness"
    ],
    questionStarters: [
      "Consider the language L =",
      "A DFA with minimum states for",
      "The regular expression for",
      "Which of the following is decidable",
      "A pushdown automaton that accepts",
      "The grammar S \u2192"
    ],
    exampleQuestion: {
      text: "The minimum number of states in a DFA that accepts all binary strings where the number of 1s is divisible by 3 is:",
      type: "MCQ",
      options: ["A. 3", "B. 4", "C. 5", "D. 6"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "DFA Design"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  "Operating Systems": {
    domain: "Computer Science",
    subtopic: "Operating Systems",
    concepts: [
      "Process Scheduling (FCFS, SJF, Round Robin, Priority)",
      "Process Synchronization",
      "Deadlock",
      "Memory Management",
      "Virtual Memory",
      "Page Replacement (FIFO, LRU, Optimal)",
      "Disk Scheduling",
      "File Systems",
      "Threads",
      "Semaphores and Mutex"
    ],
    questionStarters: [
      "Consider a set of processes with burst times",
      "In a system with",
      "A page reference string",
      "Using the Banker's algorithm"
    ],
    exampleQuestion: {
      text: "Given the page reference string 7,0,1,2,0,3,0,4,2,3 with 3 frames using FIFO, the number of page faults is:",
      type: "MCQ",
      options: ["A. 6", "B. 7", "C. 8", "D. 9"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Page Replacement"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics"]
  },
  "Algorithms": {
    domain: "Computer Science",
    subtopic: "Algorithms",
    concepts: [
      "Time Complexity Analysis",
      "Sorting Algorithms",
      "Graph Algorithms",
      "Dynamic Programming",
      "Greedy Algorithms",
      "Divide and Conquer",
      "Shortest Path (Dijkstra, Bellman-Ford, Floyd-Warshall)",
      "Minimum Spanning Tree (Kruskal, Prim)",
      "BFS and DFS",
      "Hashing",
      "Binary Search",
      "Recurrence Relations"
    ],
    questionStarters: [
      "The time complexity of",
      "Using dynamic programming",
      "In a graph with",
      "The recurrence relation T(n) ="
    ],
    exampleQuestion: {
      text: "The worst-case time complexity of QuickSort is:",
      type: "MCQ",
      options: ["A. O(n\xB2)", "B. O(n log n)", "C. O(n)", "D. O(log n)"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Sorting Algorithms"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics"]
  },
  "DBMS": {
    domain: "Computer Science",
    subtopic: "Database Management Systems",
    concepts: [
      "ER Model",
      "Relational Algebra",
      "SQL",
      "Normalization (1NF, 2NF, 3NF, BCNF)",
      "Transactions and Concurrency Control",
      "ACID Properties",
      "Indexing (B-Tree, B+ Tree, Hashing)",
      "Query Optimization",
      "Functional Dependencies",
      "Deadlock in DBMS"
    ],
    questionStarters: [
      "Consider a relation R with attributes",
      "The SQL query",
      "A schedule S is conflict serializable if",
      "The B+ tree of order"
    ],
    exampleQuestion: {
      text: "A relation R(A, B, C, D) with FDs: A\u2192B, B\u2192C, C\u2192D. The highest normal form of R is:",
      type: "MCQ",
      options: ["A. 2NF", "B. 3NF", "C. BCNF", "D. 1NF"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Normalization"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics"]
  },
  "Computer Networks": {
    domain: "Computer Science",
    subtopic: "Computer Networks",
    concepts: [
      "OSI Model",
      "TCP/IP Model",
      "IP Addressing and Subnetting",
      "Routing Algorithms (Distance Vector, Link State)",
      "TCP vs UDP",
      "Flow Control (Sliding Window)",
      "Error Detection (CRC, Checksum, Hamming Code)",
      "DNS",
      "HTTP/HTTPS",
      "ARP",
      "DHCP",
      "NAT",
      "Congestion Control",
      "MAC Protocols (ALOHA, CSMA/CD)",
      "Network Security (Firewalls, Encryption, SSL/TLS)"
    ],
    questionStarters: [
      "A class C network with subnet mask",
      "In the TCP 3-way handshake",
      "The maximum number of hosts in a",
      "Using Go-Back-N protocol with window size",
      "A router receives a packet with destination IP"
    ],
    exampleQuestion: {
      text: "A class B network with subnet mask 255.255.240.0 can have at most how many hosts per subnet?",
      type: "MCQ",
      options: ["A. 4094", "B. 4096", "C. 2046", "D. 2048"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Subnetting"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  "Compiler Design": {
    domain: "Computer Science",
    subtopic: "Compiler Design",
    concepts: [
      "Lexical Analysis",
      "Regular Expressions and Finite Automata",
      "Syntax Analysis (Top-down, Bottom-up Parsing)",
      "LL(1) Parsing",
      "LR(0), SLR(1), CLR(1), LALR(1) Parsing",
      "Syntax Directed Translation",
      "Intermediate Code Generation",
      "Three Address Code",
      "Code Optimization",
      "Register Allocation",
      "Symbol Table Management",
      "FIRST and FOLLOW Sets",
      "Operator Precedence Parsing"
    ],
    questionStarters: [
      "The FIRST set of the grammar",
      "An LR(1) parser for the grammar",
      "The number of reduce-reduce conflicts in",
      "The three-address code for the expression",
      "Given the grammar S \u2192 aAb | bBa"
    ],
    exampleQuestion: {
      text: "For the grammar S \u2192 AB, A \u2192 a | \u03B5, B \u2192 b | \u03B5, the FOLLOW(A) is:",
      type: "MCQ",
      options: ["A. {b, $}", "B. {b}", "C. {a, b, $}", "D. {$}"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "FOLLOW Sets"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  "Digital Logic": {
    domain: "Computer Science",
    subtopic: "Digital Logic",
    concepts: [
      "Boolean Algebra",
      "Logic Gates (AND, OR, NOT, NAND, NOR, XOR)",
      "Karnaugh Maps (K-maps)",
      "Combinational Circuits (Multiplexer, Decoder, Encoder, Adder)",
      "Sequential Circuits (Flip-flops, Counters, Registers)",
      "Finite State Machines (Mealy, Moore)",
      "Number Systems (Binary, Octal, Hex)",
      "Minimization Techniques",
      "Quine-McCluskey Method",
      "Timing Diagrams",
      "Hazards (Static, Dynamic)"
    ],
    questionStarters: [
      "The minimum number of NAND gates required to implement",
      "The output of the sequential circuit with",
      "A 4-bit synchronous counter",
      "The simplified Boolean expression for",
      "Using K-map, minimize the function"
    ],
    exampleQuestion: {
      text: "The minimum number of 2-input NAND gates required to implement the function F = AB + CD is:",
      type: "MCQ",
      options: ["A. 3", "B. 4", "C. 5", "D. 6"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "NAND Implementation"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  "Data Structures": {
    domain: "Computer Science",
    subtopic: "Data Structures",
    concepts: [
      "Arrays",
      "Linked Lists (Singly, Doubly, Circular)",
      "Stacks",
      "Queues (Simple, Circular, Priority, Deque)",
      "Binary Trees",
      "Binary Search Trees",
      "AVL Trees",
      "B-Trees and B+ Trees",
      "Heaps (Min, Max)",
      "Hashing (Chaining, Open Addressing)",
      "Graphs (Adjacency Matrix, Adjacency List)",
      "Trie",
      "Segment Trees",
      "Disjoint Set Union"
    ],
    questionStarters: [
      "The time complexity of inserting into a",
      "A binary search tree is constructed by inserting",
      "The number of comparisons in the worst case for",
      "A hash table of size",
      "The postorder traversal of the BST with"
    ],
    exampleQuestion: {
      text: "The maximum number of nodes in a binary tree of height h is:",
      type: "MCQ",
      options: ["A. 2^(h+1) - 1", "B. 2^h - 1", "C. 2^h", "D. 2^(h+1)"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Binary Trees"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  "Computer Architecture": {
    domain: "Computer Science",
    subtopic: "Computer Architecture",
    concepts: [
      "Instruction Set Architecture",
      "Pipelining (Hazards, Stalls, Forwarding)",
      "Cache Memory (Direct Mapped, Set Associative, Fully Associative)",
      "Cache Performance (Hit Rate, Miss Penalty, AMAT)",
      "Virtual Memory (Page Tables, TLB)",
      "Memory Hierarchy",
      "I/O Systems (Programmed I/O, Interrupt-driven, DMA)",
      "RISC vs CISC",
      "Instruction Formats",
      "Addressing Modes",
      "Performance Metrics (CPI, MIPS, Speedup)"
    ],
    questionStarters: [
      "A 5-stage pipeline with",
      "A direct-mapped cache with",
      "The effective memory access time for",
      "Consider a processor with a clock speed of",
      "A virtual memory system with page size"
    ],
    exampleQuestion: {
      text: "A direct-mapped cache with 64 blocks and block size of 16 bytes. The number of tag bits for a 32-bit address is:",
      type: "MCQ",
      options: ["A. 22", "B. 20", "C. 24", "D. 18"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Cache Design"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  "Discrete Mathematics": {
    domain: "Computer Science",
    subtopic: "Discrete Mathematics",
    concepts: [
      "Propositional Logic",
      "Predicate Logic",
      "Sets and Relations",
      "Functions (Injective, Surjective, Bijective)",
      "Graph Theory (Euler, Hamilton, Planar Graphs, Coloring)",
      "Trees (Spanning Trees, Binary Trees)",
      "Combinatorics",
      "Recurrence Relations",
      "Generating Functions",
      "Group Theory (Groups, Subgroups, Cosets, Lagrange's Theorem)",
      "Lattices and Boolean Algebra",
      "Partial Orders and Hasse Diagrams"
    ],
    questionStarters: [
      "The number of equivalence relations on",
      "A graph G with",
      "The chromatic number of",
      "If R is a relation on set A",
      "The number of onto functions from"
    ],
    exampleQuestion: {
      text: "The number of distinct equivalence relations on a set of 4 elements is:",
      type: "MCQ",
      options: ["A. 15", "B. 16", "C. 12", "D. 10"],
      correctAnswer: "A",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Equivalence Relations"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  "Software Engineering": {
    domain: "Computer Science",
    subtopic: "Software Engineering",
    concepts: [
      "SDLC Models (Waterfall, Agile, Spiral, V-model)",
      "Requirements Engineering",
      "Software Design (Coupling, Cohesion)",
      "Testing (Black Box, White Box, Unit, Integration, System)",
      "Software Metrics (Cyclomatic Complexity, Function Points)",
      "Project Management (COCOMO, Gantt Charts, PERT/CPM)",
      "Software Reliability",
      "Configuration Management",
      "UML Diagrams"
    ],
    questionStarters: [
      "The cyclomatic complexity of a program with",
      "In the Waterfall model",
      "The COCOMO model estimates",
      "A module with high cohesion and low coupling"
    ],
    exampleQuestion: {
      text: "The cyclomatic complexity of a program with 15 edges, 12 nodes, and 1 connected component is:",
      type: "MCQ",
      options: ["A. 5", "B. 4", "C. 3", "D. 6"],
      correctAnswer: "B",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Cyclomatic Complexity"
    },
    forbiddenContent: ["calculus", "integral", "derivative", "chemical", "thermodynamics", "optics", "kinematics"]
  },
  // ─────────────────── BIOLOGY (NEET) ───────────────────
  "Biology - Botany": {
    domain: "Biology",
    subtopic: "Botany",
    concepts: [
      "Cell Structure and Function",
      "Cell Division (Mitosis, Meiosis)",
      "Plant Anatomy",
      "Photosynthesis",
      "Plant Physiology",
      "Plant Growth and Development",
      "Morphology of Flowering Plants",
      "Plant Kingdom Classification",
      "Genetics and Molecular Biology",
      "Ecology and Environment",
      "Biotechnology"
    ],
    questionStarters: [
      "In the light reaction of photosynthesis",
      "The C4 pathway is found in",
      "Crossing over occurs during",
      "The correct sequence of cell cycle is"
    ],
    exampleQuestion: {
      text: "The site of light-dependent reactions of photosynthesis is:",
      type: "MCQ",
      options: ["A. Thylakoid membrane", "B. Stroma", "C. Outer membrane", "D. Matrix"],
      correctAnswer: "A",
      marks: 4,
      negativeMarks: 1,
      concept: "Photosynthesis"
    },
    forbiddenContent: ["programming", "algorithm", "data structure", "software", "calculus", "integral"]
  },
  "Biology - Zoology": {
    domain: "Biology",
    subtopic: "Zoology",
    concepts: [
      "Animal Kingdom Classification",
      "Structural Organization in Animals",
      "Human Physiology (Digestion, Respiration, Circulation, Excretion, Nervous System)",
      "Locomotion and Movement",
      "Reproductive Health",
      "Human Reproduction",
      "Genetics (Mendelian, Molecular)",
      "Evolution",
      "Human Health and Disease",
      "Microbes in Human Welfare"
    ],
    questionStarters: [
      "The glomerular filtration rate in humans is",
      "During the cardiac cycle",
      "The hormone responsible for",
      "In Mendelian genetics"
    ],
    exampleQuestion: {
      text: "The normal GFR (Glomerular Filtration Rate) in humans is approximately:",
      type: "MCQ",
      options: ["A. 125 mL/min", "B. 200 mL/min", "C. 75 mL/min", "D. 50 mL/min"],
      correctAnswer: "A",
      marks: 4,
      negativeMarks: 1,
      concept: "Excretory System"
    },
    forbiddenContent: ["programming", "algorithm", "data structure", "software", "calculus", "integral"]
  },
  // ─────────────────── UPSC ───────────────────
  "History": {
    domain: "UPSC",
    subtopic: "History",
    concepts: [
      "Ancient India (Indus Valley, Vedic Age, Maurya Empire, Gupta Empire)",
      "Medieval India (Delhi Sultanate, Mughal Empire, Bhakti and Sufi Movements)",
      "Modern India (British East India Company, 1857 Revolt, Indian National Congress)",
      "Freedom Struggle (Non-Cooperation, Civil Disobedience, Quit India)",
      "Social Reform Movements (Raja Ram Mohan Roy, Jyotiba Phule, Ambedkar)",
      "Post-Independence India (Integration of States, Five Year Plans, Green Revolution)",
      "World History (French Revolution, Industrial Revolution, World Wars)",
      "Art and Culture (Classical Dances, Music, Architecture, Paintings)",
      "Constitutional History (Government of India Acts, Constituent Assembly)",
      "Important Personalities (Gandhi, Nehru, Bose, Patel, Tagore)",
      "Archaeological Sources and Inscriptions",
      "Religious Movements (Buddhism, Jainism, Sikhism)",
      "Peasant and Tribal Movements",
      "Economic History of India under British Rule",
      "Press and Education during British India"
    ],
    questionStarters: [
      "The Simon Commission of 1927 was boycotted because",
      "The Permanent Settlement of 1793 was introduced by",
      "Which of the following was NOT a feature of the Indus Valley Civilization?",
      "The Cabinet Mission Plan of 1946 proposed",
      "The Khilafat Movement was launched in the year"
    ],
    exampleQuestion: {
      text: "Which of the following Round Table Conferences was attended by Mahatma Gandhi?",
      type: "MCQ",
      options: ["Second Round Table Conference (1931)", "First Round Table Conference (1930)", "Third Round Table Conference (1932)", "None of the above"],
      correctAnswer: "Second Round Table Conference (1931)",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Freedom Struggle"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "SQL", "database", "normalization", "B+ tree", "deadlock", "semaphore"]
  },
  "Geography": {
    domain: "UPSC",
    subtopic: "Geography",
    concepts: [
      "Physical Geography (Geomorphology, Plate Tectonics, Volcanism, Earthquakes)",
      "Climatology (Atmospheric Circulation, Monsoon Mechanism, El Ni\xF1o, La Ni\xF1a)",
      "Oceanography (Ocean Currents, Tides, Salinity, Coral Reefs)",
      "Indian Geography (Physiographic Divisions, Rivers, Climate Zones)",
      "Economic Geography (Agriculture, Industries, Minerals, Energy Resources)",
      "Human Geography (Population, Urbanization, Migration)",
      "Environmental Geography (Biodiversity, Conservation, Pollution)",
      "Map-based Questions (Important Locations, Mountain Passes, Ports)",
      "Soil Types of India (Alluvial, Black, Red, Laterite)",
      "Forest Types and Vegetation of India",
      "Drainage Systems of India (Himalayan and Peninsular Rivers)",
      "Natural Disasters (Floods, Cyclones, Droughts, Landslides)",
      "World Geography (Continents, Countries, Capital Cities, Important Straits)",
      "Transport and Communication Networks",
      "Census and Demographic Trends"
    ],
    questionStarters: [
      "Which of the following rivers does NOT originate from the Himalayas?",
      "The Western Ghats are also known as",
      "The Coriolis effect causes winds to deflect",
      "Which Indian state has the longest coastline?",
      "Laterite soil is mainly found in regions with"
    ],
    exampleQuestion: {
      text: "The Tropic of Cancer does NOT pass through which of the following Indian states?",
      type: "MCQ",
      options: ["Karnataka", "Rajasthan", "Madhya Pradesh", "West Bengal"],
      correctAnswer: "Karnataka",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Indian Geography"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "SQL", "database", "normalization", "B+ tree"]
  },
  "Polity": {
    domain: "UPSC",
    subtopic: "Polity",
    concepts: [
      "Indian Constitution (Preamble, Features, Schedules, Amendments)",
      "Fundamental Rights (Articles 14-32)",
      "Directive Principles of State Policy (Articles 36-51)",
      "Fundamental Duties (Article 51A)",
      "Union Executive (President, Vice President, Prime Minister, Council of Ministers)",
      "Parliament (Lok Sabha, Rajya Sabha, Legislative Process, Committees)",
      "State Government (Governor, Chief Minister, State Legislature)",
      "Judiciary (Supreme Court, High Courts, Judicial Review, PIL)",
      "Federal Structure (Centre-State Relations, Inter-State Councils)",
      "Local Self-Government (Panchayati Raj, Municipalities, 73rd and 74th Amendments)",
      "Constitutional Bodies (Election Commission, CAG, UPSC, Finance Commission)",
      "Statutory Bodies (NHRC, CIC, NCW, NITI Aayog)",
      "Emergency Provisions (National, State, Financial)",
      "Electoral System (First Past the Post, Proportional Representation)",
      "Important Constitutional Amendments"
    ],
    questionStarters: [
      "Article 32 of the Indian Constitution deals with",
      "The concept of Judicial Review in India is derived from",
      "Which of the following is NOT a Fundamental Right?",
      "The 73rd Constitutional Amendment Act relates to",
      "The President of India can be impeached by"
    ],
    exampleQuestion: {
      text: "Which of the following writs is issued by the court to prevent a person from holding a public office to which they are not entitled?",
      type: "MCQ",
      options: ["Quo Warranto", "Mandamus", "Certiorari", "Habeas Corpus"],
      correctAnswer: "Quo Warranto",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Writs under Article 32"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "SQL", "database", "normalization", "B+ tree"]
  },
  "Economy": {
    domain: "UPSC",
    subtopic: "Economy",
    concepts: [
      "National Income Accounting (GDP, GNP, NDP, NNP, Per Capita Income)",
      "Monetary Policy (Repo Rate, Reverse Repo, CRR, SLR, Open Market Operations)",
      "Fiscal Policy (Budget, Taxation, Fiscal Deficit, Revenue Deficit)",
      "Banking System (RBI, Commercial Banks, NBFCs, Payment Banks, Small Finance Banks)",
      "Inflation (WPI, CPI, Demand-Pull, Cost-Push, Phillips Curve)",
      "Indian Tax System (GST, Income Tax, Corporate Tax, Direct vs Indirect Taxes)",
      "International Trade (Balance of Payments, Current Account, Capital Account, WTO)",
      "Indian Agriculture (MSP, APMC, e-NAM, PM-KISAN, Crop Insurance)",
      "Industrial Policy (Make in India, PLI Scheme, SEZs, MSME)",
      "Poverty and Unemployment (Measurement, MGNREGA, Skill India)",
      "Financial Markets (SEBI, Stock Exchange, Mutual Funds, Bonds)",
      "Public Finance (Consolidated Fund, Contingency Fund, Public Account)",
      "Economic Reforms (LPG-1991, Disinvestment, FDI Policy)",
      "Money and Banking (Money Supply M1-M4, Credit Creation, Liquidity Trap)",
      "Government Schemes (PM Jan Dhan Yojana, Mudra Scheme, Stand-Up India)"
    ],
    questionStarters: [
      "The Fiscal Responsibility and Budget Management (FRBM) Act aims to",
      "If the RBI increases the Repo Rate, the likely effect on the economy is",
      "Which of the following is NOT included in the calculation of GDP?",
      "The difference between Revenue Receipts and Revenue Expenditure is called",
      "Open Market Operations by the RBI involve"
    ],
    exampleQuestion: {
      text: "If the Reserve Bank of India (RBI) decides to increase the Cash Reserve Ratio (CRR), what is the most likely immediate effect on the economy?",
      type: "MCQ",
      options: ["Decrease in money supply in the economy", "Increase in money supply in the economy", "No effect on money supply", "Increase in government spending"],
      correctAnswer: "Decrease in money supply in the economy",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Monetary Policy"
    },
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "SQL", "database", "normalization", "B+ tree", "deadlock", "semaphore", "compiler", "cache", "pipeline"]
  },
  "Science and Technology": {
    domain: "UPSC",
    subtopic: "Science and Technology",
    concepts: [
      "Space Technology (ISRO Missions, Satellites, Launch Vehicles, Mars/Moon Missions)",
      "Defence Technology (Missiles, BrahMos, Agni, DRDO, INS Vikrant)",
      "Biotechnology (Genetic Engineering, CRISPR, GM Crops, Stem Cells)",
      "Nuclear Technology (Nuclear Reactors, Thorium Cycle, IAEA, NPT)",
      "Information Technology (AI, Blockchain, IoT, Cyber Security, 5G)",
      "Health and Medicine (Vaccines, Antibiotics, Epidemics, AYUSH)",
      "Nanotechnology and its Applications",
      "Renewable Energy (Solar, Wind, Hydrogen, Biofuels)",
      "Environmental Technology (Carbon Capture, Waste Management)",
      "Indian S&T Institutions (CSIR, DST, DBT, BARC, ICAR)",
      "Awards in Science (Nobel Prize, Shanti Swarup Bhatnagar)",
      "Recent Scientific Discoveries and Innovations",
      "Intellectual Property Rights (Patents, Copyrights, TRIPS)",
      "Digital India Initiatives (UPI, Aadhaar, DigiLocker)",
      "Robotics and Automation"
    ],
    questionStarters: [
      "ISRO's Chandrayaan-3 mission was significant because",
      "CRISPR-Cas9 technology is used for",
      "The Hydrogen Fuel Cell works on the principle of",
      "Which of the following is NOT a satellite navigation system?",
      "India's three-stage nuclear programme was conceived by"
    ],
    exampleQuestion: {
      text: "Which of the following ISRO launch vehicles is designed to carry heavy payloads to Geostationary Transfer Orbit (GTO)?",
      type: "MCQ",
      options: ["GSLV Mk III (LVM3)", "PSLV", "SSLV", "SLV-3"],
      correctAnswer: "GSLV Mk III (LVM3)",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Space Technology"
    },
    forbiddenContent: ["SQL", "database", "normalization", "B+ tree", "deadlock", "semaphore", "compiler", "cache", "GATE"]
  },
  // ─────────────────── SSC / CAT ───────────────────
  "General Awareness": {
    domain: "General Knowledge",
    subtopic: "General Awareness",
    concepts: [
      "Indian History (Ancient, Medieval, Modern)",
      "Indian Geography (Physical, Economic)",
      "Indian Polity and Governance",
      "General Science (Physics, Chemistry, Biology basics)",
      "Current Affairs (National and International)",
      "Sports and Awards",
      "Books and Authors",
      "Important Days and Events",
      "Indian Economy Basics",
      "Environmental Issues",
      "Art and Culture of India"
    ],
    questionStarters: [
      "Which of the following is the capital of",
      "The Nobel Peace Prize 2024 was awarded to",
      "Which river is known as the",
      "The Battle of Plassey was fought in"
    ],
    exampleQuestion: {
      text: "The Tropic of Cancer passes through how many Indian states?",
      type: "MCQ",
      options: ["8 states", "6 states", "10 states", "5 states"],
      correctAnswer: "8 states",
      marks: 2,
      negativeMarks: 0.5,
      concept: "Indian Geography"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database", "normalization"]
  },
  "Quantitative Aptitude": {
    domain: "Mathematics",
    subtopic: "Quantitative Aptitude",
    concepts: [
      "Number System",
      "HCF and LCM",
      "Percentage",
      "Profit and Loss",
      "Simple and Compound Interest",
      "Ratio and Proportion",
      "Time, Speed and Distance",
      "Time and Work",
      "Averages",
      "Mensuration (Area, Volume, Surface Area)",
      "Data Interpretation",
      "Algebra (Linear Equations, Quadratics)",
      "Geometry (Triangles, Circles)",
      "Probability",
      "Permutation and Combination"
    ],
    questionStarters: [
      "A shopkeeper marks the price of an article",
      "A train 200 meters long crosses",
      "If the compound interest on a sum",
      "The ratio of ages of A and B"
    ],
    exampleQuestion: {
      text: "A shopkeeper offers a discount of 20% on the marked price and still makes a profit of 25%. If the cost price is \u20B9400, what is the marked price?",
      type: "MCQ",
      options: ["\u20B9625", "\u20B9500", "\u20B9600", "\u20B9550"],
      correctAnswer: "\u20B9625",
      marks: 2,
      negativeMarks: 0.5,
      concept: "Profit and Loss"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  "Reasoning": {
    domain: "Logical Reasoning",
    subtopic: "Reasoning",
    concepts: [
      "Coding-Decoding",
      "Blood Relations",
      "Direction Sense",
      "Syllogisms",
      "Seating Arrangement",
      "Puzzles",
      "Number Series",
      "Letter Series",
      "Analogies",
      "Classification (Odd One Out)",
      "Statement and Conclusion",
      "Venn Diagrams",
      "Order and Ranking",
      "Calendar and Clock"
    ],
    questionStarters: [
      "In a certain code language, APPLE is written as",
      "If P is the mother of Q, and Q is the sister of R",
      "Find the missing number in the series",
      "Five persons A, B, C, D and E are sitting in a row"
    ],
    exampleQuestion: {
      text: "In a code language, if COMPUTER is written as RFUVQNPD, then how is MEDICINE written in the same code?",
      type: "MCQ",
      options: ["EOJDJEFM", "FMDJDOJE", "FMEJDJOE", "FNDJDJOE"],
      correctAnswer: "FMEJDJOE",
      marks: 2,
      negativeMarks: 0.5,
      concept: "Coding-Decoding"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  "Quantitative Ability": {
    domain: "Mathematics",
    subtopic: "Quantitative Ability (CAT)",
    concepts: [
      "Number System",
      "Arithmetic (Percentage, Profit-Loss, SI/CI, Ratio)",
      "Algebra (Equations, Inequalities, Functions, Progressions)",
      "Geometry (Triangles, Circles, Coordinate Geometry)",
      "Mensuration",
      "Permutation and Combination",
      "Probability",
      "Set Theory",
      "Logarithms",
      "Surds and Indices",
      "Time Speed Distance",
      "Time and Work",
      "Averages and Mixtures"
    ],
    questionStarters: [
      "If log\u2082(x) + log\u2082(x-1) = 1, then",
      "The number of ways to arrange",
      "A mixture contains milk and water in the ratio"
    ],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  "Verbal Ability": {
    domain: "English",
    subtopic: "Verbal Ability",
    concepts: [
      "Reading Comprehension",
      "Para Jumbles",
      "Para Summary",
      "Sentence Correction",
      "Fill in the Blanks",
      "Vocabulary",
      "Critical Reasoning",
      "Analogies",
      "Idioms and Phrases",
      "One Word Substitution",
      "Error Spotting"
    ],
    questionStarters: [
      "Choose the word that is most nearly opposite in meaning to",
      "Rearrange the following sentences to form a coherent paragraph",
      "Choose the most appropriate word to fill in the blank"
    ],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  "Data Interpretation": {
    domain: "Mathematics",
    subtopic: "Data Interpretation",
    concepts: [
      "Bar Graphs",
      "Line Charts",
      "Pie Charts",
      "Tables",
      "Caselets",
      "Combined Data Sets",
      "Percentage Calculations",
      "Growth Rate Analysis",
      "Ratio-based Questions"
    ],
    questionStarters: [
      "Study the following table and answer",
      "The bar graph shows the sales of",
      "From the pie chart, calculate the percentage of"
    ],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  "Logical Reasoning": {
    domain: "Logical Reasoning",
    subtopic: "Logical Reasoning (CAT)",
    concepts: [
      "Seating Arrangement (Linear, Circular)",
      "Blood Relations",
      "Syllogisms",
      "Puzzles",
      "Logical Connectives",
      "Binary Logic",
      "Courses of Action",
      "Decision Making",
      "Input-Output",
      "Cubes and Dice",
      "Direction Sense"
    ],
    questionStarters: [
      "Eight people are sitting around a circular table",
      "If all cats are dogs and some dogs are parrots",
      "Read the following passage and answer"
    ],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  // ─────────────────── GATE ECE ───────────────────
  "Network Theory": {
    domain: "Electrical Engineering",
    subtopic: "Network Theory",
    concepts: [
      "KVL and KCL",
      "Mesh and Nodal Analysis",
      "Thevenin and Norton Theorem",
      "Superposition Theorem",
      "Maximum Power Transfer Theorem",
      "Transient Analysis (RC, RL, RLC Circuits)",
      "Steady State AC Analysis",
      "Impedance and Admittance",
      "Resonance (Series and Parallel)",
      "Two-Port Networks (Z, Y, h, ABCD Parameters)",
      "Network Functions",
      "Laplace Transform in Circuit Analysis",
      "Mutual Inductance and Coupled Circuits",
      "Graph Theory for Networks"
    ],
    questionStarters: [
      "In the circuit shown, find the current through",
      "The Thevenin equivalent of",
      "A series RLC circuit resonates at",
      "Using nodal analysis, the voltage at node"
    ],
    exampleQuestion: {
      text: "In a series RLC circuit at resonance, the impedance is:",
      type: "MCQ",
      options: ["Equal to resistance R only", "Zero", "Infinite", "Equal to XL + XC"],
      correctAnswer: "Equal to resistance R only",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Resonance"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database", "normalization"]
  },
  "Signals and Systems": {
    domain: "Electrical Engineering",
    subtopic: "Signals and Systems",
    concepts: [
      "Continuous-Time Signals (Unit Step, Impulse, Ramp, Exponential)",
      "Discrete-Time Signals",
      "LTI Systems and Convolution",
      "Fourier Series",
      "Fourier Transform and Properties",
      "Laplace Transform",
      "Z-Transform",
      "Transfer Function",
      "Sampling Theorem (Nyquist Rate)",
      "DFT and FFT",
      "Stability Analysis (ROC, Poles, Zeros)",
      "Parseval's Theorem",
      "Energy and Power Signals"
    ],
    questionStarters: [
      "The Fourier Transform of a rectangular pulse is",
      "For an LTI system with impulse response h(t)",
      "The Nyquist rate for the signal x(t) = cos(200\u03C0t) is",
      "The Z-transform of the sequence x[n] = a\u207Fu[n] is"
    ],
    exampleQuestion: {
      text: "The Nyquist sampling rate for the signal x(t) = cos(100\u03C0t) + sin(200\u03C0t) is:",
      type: "MCQ",
      options: ["200 Hz", "100 Hz", "300 Hz", "400 Hz"],
      correctAnswer: "200 Hz",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Sampling Theorem"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database", "normalization"]
  },
  "Digital Circuits": {
    domain: "Electrical Engineering",
    subtopic: "Digital Circuits",
    concepts: [
      "Boolean Algebra and Logic Gates",
      "K-maps and Minimization",
      "Combinational Circuits (MUX, Decoder, Encoder, Adder, Subtractor)",
      "Sequential Circuits (Flip-flops, Counters, Shift Registers)",
      "Finite State Machines (Mealy and Moore)",
      "ADC and DAC Converters",
      "Memory Devices (RAM, ROM)",
      "Timing Diagrams",
      "Hazards",
      "Number Systems and Codes"
    ],
    questionStarters: [
      "The minimum number of NAND gates to implement",
      "A 4-bit synchronous up counter",
      "The K-map for the function",
      "Design a Mealy machine that detects"
    ],
    exampleQuestion: {
      text: "A mod-12 counter requires minimum how many flip-flops?",
      type: "MCQ",
      options: ["4 flip-flops", "3 flip-flops", "5 flip-flops", "6 flip-flops"],
      correctAnswer: "4 flip-flops",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Counters"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database", "normalization"]
  },
  "Communications": {
    domain: "Electrical Engineering",
    subtopic: "Communications",
    concepts: [
      "Amplitude Modulation (AM, DSB-SC, SSB)",
      "Frequency Modulation (FM)",
      "Phase Modulation (PM)",
      "Pulse Modulation (PAM, PWM, PPM, PCM)",
      "Digital Modulation (ASK, FSK, PSK, QAM)",
      "Shannon's Channel Capacity",
      "Noise in Communication Systems",
      "SNR and BER",
      "Information Theory (Entropy, Source Coding)",
      "Superheterodyne Receiver",
      "Matched Filters",
      "Error Correcting Codes (Hamming, CRC)"
    ],
    questionStarters: [
      "The bandwidth of an AM signal with modulation index",
      "For a PCM system with sampling rate",
      "Shannon's channel capacity for",
      "The bit error rate of BPSK is"
    ],
    exampleQuestion: {
      text: "The bandwidth of a DSB-SC AM signal with message bandwidth W is:",
      type: "MCQ",
      options: ["2W", "W", "3W", "W/2"],
      correctAnswer: "2W",
      marks: 2,
      negativeMarks: 0.67,
      concept: "AM Bandwidth"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database", "normalization"]
  },
  "Control Systems": {
    domain: "Electrical Engineering",
    subtopic: "Control Systems",
    concepts: [
      "Transfer Functions",
      "Block Diagram Reduction",
      "Signal Flow Graphs (Mason's Gain Formula)",
      "Time Domain Analysis (Rise Time, Settling Time, Overshoot)",
      "Stability Analysis (Routh-Hurwitz Criterion)",
      "Root Locus",
      "Bode Plot",
      "Nyquist Plot",
      "State Space Analysis",
      "Controllability and Observability",
      "PID Controllers",
      "Gain and Phase Margins",
      "Steady-State Error",
      "Compensation Techniques"
    ],
    questionStarters: [
      "The open loop transfer function G(s) =",
      "Using Routh-Hurwitz criterion",
      "The gain margin of the system with",
      "For a unity feedback system with"
    ],
    exampleQuestion: {
      text: "A second-order underdamped system has damping ratio \u03B6 = 0.5. The percentage overshoot is approximately:",
      type: "MCQ",
      options: ["16.3%", "5%", "25.4%", "36.8%"],
      correctAnswer: "16.3%",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Transient Response"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database", "normalization"]
  },
  // ─────────────────── NAME ALIASES ───────────────────
  // JEE Main uses "Electromagnetism" but knowledge base had "Electrodynamics"
  "Physics - Electromagnetism": {
    domain: "Physics",
    subtopic: "Electromagnetism",
    concepts: [
      "Coulomb's Law",
      "Electric Field and Potential",
      "Gauss's Law",
      "Capacitance",
      "Current Electricity (Ohm's Law, Kirchhoff's Laws)",
      "Wheatstone Bridge",
      "Potentiometer",
      "Magnetic Effects of Current",
      "Biot-Savart Law",
      "Ampere's Law",
      "Electromagnetic Induction",
      "Faraday's Law",
      "AC Circuits",
      "Electromagnetic Waves"
    ],
    questionStarters: [
      "Two charges q\u2081 and q\u2082 are placed",
      "A parallel plate capacitor with",
      "In the circuit shown",
      "A long straight wire carrying current"
    ],
    exampleQuestion: {
      text: "The magnetic field at the center of a circular loop of radius R carrying current I is:",
      type: "MCQ",
      options: ["\u03BC\u2080I/2R", "\u03BC\u2080I/R", "\u03BC\u2080I/4\u03C0R", "2\u03BC\u2080I/R"],
      correctAnswer: "\u03BC\u2080I/2R",
      marks: 2,
      negativeMarks: 0.67,
      concept: "Biot-Savart Law"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  // ─────────────────── BROAD TOPICS (JEE Advanced / NEET) ───────────────────
  "Physics": {
    domain: "Physics",
    subtopic: "General Physics",
    concepts: [
      "Kinematics",
      "Newton's Laws",
      "Work Energy Power",
      "Gravitation",
      "Rotational Motion",
      "SHM and Waves",
      "Fluid Mechanics",
      "Thermodynamics",
      "Kinetic Theory of Gases",
      "Electrostatics",
      "Current Electricity",
      "Magnetism",
      "Electromagnetic Induction",
      "Optics",
      "Modern Physics",
      "Semiconductors"
    ],
    questionStarters: [
      "A particle is projected with",
      "A block of mass m on",
      "In Young's double slit experiment",
      "The de Broglie wavelength of"
    ],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  "Chemistry": {
    domain: "Chemistry",
    subtopic: "General Chemistry",
    concepts: [
      "Atomic Structure",
      "Periodic Table",
      "Chemical Bonding",
      "Thermodynamics and Thermochemistry",
      "Equilibrium",
      "Ionic Equilibrium",
      "Chemical Kinetics",
      "Electrochemistry",
      "Solutions",
      "Solid State",
      "Surface Chemistry",
      "Organic Chemistry Basics",
      "Hydrocarbons",
      "Alcohols Phenols Ethers",
      "Carbonyl Compounds",
      "Coordination Compounds"
    ],
    questionStarters: [
      "The IUPAC name of",
      "The pH of a solution",
      "The hybridization of",
      "For a first order reaction"
    ],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  "Mathematics": {
    domain: "Mathematics",
    subtopic: "General Mathematics",
    concepts: [
      "Sets Relations Functions",
      "Complex Numbers",
      "Quadratic Equations",
      "Permutations Combinations",
      "Binomial Theorem",
      "Sequences and Series",
      "Matrices and Determinants",
      "Limits and Continuity",
      "Differentiation",
      "Integration",
      "Differential Equations",
      "Coordinate Geometry",
      "Vectors and 3D",
      "Probability",
      "Statistics",
      "Trigonometry"
    ],
    questionStarters: [
      "If f(x) =",
      "The value of the integral",
      "The number of ways to arrange",
      "If the roots of the equation"
    ],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database"]
  },
  // ─────────────────── SSC ENGLISH ───────────────────
  "English": {
    domain: "English",
    subtopic: "English Language",
    concepts: [
      "Synonyms and Antonyms",
      "One Word Substitution",
      "Idioms and Phrases",
      "Spelling Correction",
      "Sentence Improvement",
      "Active and Passive Voice",
      "Direct and Indirect Speech",
      "Fill in the Blanks",
      "Cloze Test",
      "Error Spotting",
      "Reading Comprehension",
      "Para Jumbles",
      "Subject-Verb Agreement",
      "Tenses",
      "Parts of Speech"
    ],
    questionStarters: [
      "Choose the synonym of",
      "Choose the antonym of",
      "Identify the error in the sentence",
      "Choose the correct meaning of the idiom"
    ],
    exampleQuestion: {
      text: "Choose the correct synonym of 'Benevolent':",
      type: "MCQ",
      options: ["Kind and generous", "Cruel and harsh", "Lazy and careless", "Proud and arrogant"],
      correctAnswer: "Kind and generous",
      marks: 2,
      negativeMarks: 0.5,
      concept: "Synonyms"
    },
    forbiddenContent: ["programming", "code", "algorithm", "SQL", "database", "physics", "chemistry"]
  }
};
function getSubjectKnowledge(topic) {
  if (SUBJECT_KNOWLEDGE[topic]) {
    return SUBJECT_KNOWLEDGE[topic];
  }
  for (const [key, value] of Object.entries(SUBJECT_KNOWLEDGE)) {
    if (topic.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(topic.toLowerCase())) {
      return value;
    }
  }
  const parts = topic.split(" - ");
  const domain = parts[0] || topic;
  const subtopic = parts[1] || topic;
  return {
    domain,
    subtopic,
    concepts: [],
    questionStarters: [],
    exampleQuestion: null,
    forbiddenContent: ["programming", "code", "algorithm", "data structure", "software", "pipeline", "O(n)", "loop", "array"]
  };
}
for (const [, val] of Object.entries(SUBJECT_KNOWLEDGE)) {
  const eq = val.exampleQuestion;
  if (eq && eq.correctAnswer && eq.correctAnswer.length <= 2 && eq.options?.length) {
    const match = eq.options.find((o) => o.startsWith(eq.correctAnswer + ".") || o.startsWith(eq.correctAnswer + ")"));
    if (match) eq.correctAnswer = match;
  }
}
const PYQ_BANK = {
  "GATE CS": {
    "DBMS": [
      { text: "Consider R(A,B,C,D,E) with FDs {A\u2192BC, CD\u2192E, B\u2192D, E\u2192A}. How many candidate keys does R have?", type: "NAT", options: [], correctAnswer: "3", concept: "Candidate Keys" },
      { text: "Consider the schedule: T1:R(X), T2:R(X), T2:W(X), T1:W(X). This schedule is:", type: "MCQ", options: ["Conflict serializable", "View serializable but not conflict serializable", "Neither conflict nor view serializable", "Both conflict and view serializable"], correctAnswer: "View serializable but not conflict serializable", concept: "Serializability" },
      { text: "Given R(A,B,C) with FDs {A\u2192B, B\u2192C}. R is in 2NF but not 3NF because:", type: "MCQ", options: ["A\u2192C is a partial dependency", "B\u2192C is a transitive dependency", "A\u2192B is a trivial FD", "There is a multivalued dependency"], correctAnswer: "B\u2192C is a transitive dependency", concept: "Normalization" },
      { text: "SELECT dept, COUNT(*) FROM emp WHERE salary>50000 GROUP BY dept HAVING COUNT(*)>3 ORDER BY dept. Which clause is executed last?", type: "MCQ", options: ["WHERE", "GROUP BY", "HAVING", "ORDER BY"], correctAnswer: "ORDER BY", concept: "SQL Execution Order" },
      { text: "A B+ tree of order 4 (max 3 keys per node) stores 1000 records. The minimum number of levels (including root and leaf) is:", type: "NAT", options: [], correctAnswer: "5", concept: "B+ Tree Indexing" },
      { text: "In 2PL, a transaction T acquires locks in this order: S(A), S(B), X(C), Unlock(A), X(D), Unlock(B). Is this valid 2PL?", type: "MCQ", options: ["Yes, it follows strict 2PL", "Yes, it follows basic 2PL", "No, it acquires X(D) after Unlock(A)", "No, it mixes shared and exclusive locks"], correctAnswer: "No, it acquires X(D) after Unlock(A)", concept: "Two-Phase Locking" },
      { text: "Consider R(A,B,C,D) decomposed into R1(A,B,C) and R2(A,D). Given FD A\u2192D, this decomposition is:", type: "MCQ", options: ["Lossless but not dependency preserving", "Dependency preserving but not lossless", "Both lossless and dependency preserving", "Neither lossless nor dependency preserving"], correctAnswer: "Both lossless and dependency preserving", concept: "Decomposition" },
      { text: "A relation has 5 tuples. The maximum number of tuples in its Cartesian product with itself is:", type: "NAT", options: [], correctAnswer: "25", concept: "Relational Algebra" },
      { text: "In a concurrent system, which of the following is NOT a necessary condition for deadlock?", type: "MCQ", options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], correctAnswer: "Preemption", concept: "Deadlock in DBMS" },
      { text: "A hash table uses linear probing with h(k)=k mod 7. Keys 22, 29, 43, 36 are inserted in order. The position of key 36 is:", type: "NAT", options: [], correctAnswer: "3", concept: "Hashing and Indexing" }
    ],
    "Data Structures": [
      { text: "An AVL tree is constructed by inserting keys 3, 2, 1, 4, 5, 6, 7 one by one. The height of the resulting tree is:", type: "NAT", options: [], correctAnswer: "2", concept: "AVL Trees" },
      { text: "Consider a max-heap with 7 elements: [90,80,70,50,60,65,30]. After deleting the root, the new heap is:", type: "MCQ", options: ["[80,60,70,50,30,65]", "[80,70,65,50,60,30]", "[80,60,70,50,65,30]", "[70,80,65,50,60,30]"], correctAnswer: "[80,60,70,50,30,65]", concept: "Heaps" },
      { text: "A hash table of size 7 uses chaining. Keys 15, 22, 29, 36, 43 all hash to the same slot. The worst-case search time is:", type: "MCQ", options: ["O(1)", "O(5)", "O(n)", "O(log n)"], correctAnswer: "O(n)", concept: "Hashing" },
      { text: "In a complete binary tree with 31 nodes, the number of leaf nodes is:", type: "NAT", options: [], correctAnswer: "16", concept: "Binary Trees" },
      { text: "A graph has 6 vertices and the degree sequence {2,2,2,3,3,4}. The number of edges is:", type: "NAT", options: [], correctAnswer: "8", concept: "Graph Theory" },
      { text: "Postfix expression 6 3 2 * + 5 - evaluates to:", type: "NAT", options: [], correctAnswer: "7", concept: "Stack Applications" },
      { text: "In a BST, the inorder successor of a node with two children is always in its:", type: "MCQ", options: ["Left subtree", "Right subtree, leftmost node", "Parent node", "Right child"], correctAnswer: "Right subtree, leftmost node", concept: "BST Operations" },
      { text: "A circular queue of size 5 has front=2, rear=4. After 3 dequeues and 4 enqueues, the value of rear is:", type: "NAT", options: [], correctAnswer: "3", concept: "Queue" },
      { text: "The number of distinct BSTs that can be formed with 5 distinct keys is:", type: "NAT", options: [], correctAnswer: "42", concept: "Catalan Number" },
      { text: "An adjacency matrix of an undirected graph with n=5 vertices requires how many bits of storage?", type: "NAT", options: [], correctAnswer: "25", concept: "Graph Representation" }
    ],
    "Algorithms": [
      { text: "Consider QuickSort on array [3,1,4,1,5,9,2,6]. With first element as pivot and Lomuto partition, how many comparisons occur in the first partition?", type: "NAT", options: [], correctAnswer: "7", concept: "QuickSort Analysis" },
      { text: "The recurrence T(n) = 3T(n/4) + n log n. By Master theorem, T(n) is:", type: "MCQ", options: ["\u0398(n log n)", "\u0398(n^(log\u20843))", "\u0398(n\xB2 log n)", "\u0398(n log\xB2 n)"], correctAnswer: "\u0398(n log n)", concept: "Recurrences" },
      { text: "Dijkstra's algorithm is run on a graph with vertices {A,B,C,D} and edges A\u2192B(1), A\u2192C(4), B\u2192C(2), B\u2192D(6), C\u2192D(3). The shortest path from A to D has weight:", type: "NAT", options: [], correctAnswer: "6", concept: "Shortest Path" },
      { text: "In Kruskal's MST algorithm on a graph with 6 vertices and 10 edges, the maximum number of edges examined before MST is complete is:", type: "MCQ", options: ["5", "6", "10", "It depends on edge weights"], correctAnswer: "10", concept: "MST Algorithms" },
      { text: "The 0/1 Knapsack problem with n items and capacity W has time complexity using DP:", type: "MCQ", options: ["O(n log n)", "O(nW)", "O(2^n)", "O(n\xB2)"], correctAnswer: "O(nW)", concept: "Dynamic Programming" },
      { text: "Merge sort on a linked list of n elements. The space complexity (excluding input) is:", type: "MCQ", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)", concept: "Sorting Complexity" },
      { text: "A graph has 8 vertices. BFS from vertex 1 visits vertices in order: 1,2,5,3,6,4,7,8. The minimum number of edges in this graph is:", type: "NAT", options: [], correctAnswer: "7", concept: "BFS Traversal" },
      { text: "Huffman coding for characters with frequencies {5,9,12,13,16,45}. The length of the Huffman code for frequency 5 is:", type: "NAT", options: [], correctAnswer: "4", concept: "Greedy Algorithms" },
      { text: "In the activity selection problem with intervals (1,4),(3,5),(0,6),(5,7),(3,9),(5,9),(6,10),(8,11),(8,12),(2,14),(12,16), the maximum activities selected is:", type: "NAT", options: [], correctAnswer: "4", concept: "Greedy Activity Selection" },
      { text: "The time complexity of finding the strongly connected components using Kosaraju's algorithm is:", type: "MCQ", options: ["O(V\xB2)", "O(V+E)", "O(V\xB7E)", "O(E log V)"], correctAnswer: "O(V+E)", concept: "Graph Algorithms" }
    ],
    "Operating Systems": [
      { text: "Consider 3 processes P1(burst=6), P2(burst=4), P3(burst=2) arriving at t=0. With SJF scheduling, the average waiting time is:", type: "NAT", options: [], correctAnswer: "4", concept: "CPU Scheduling" },
      { text: "A system has 3 resource types: A(10), B(5), C(7). Five processes have max needs and current allocation. Using Banker's algorithm, if Available=[3,3,2], the system is in:", type: "MCQ", options: ["Safe state", "Unsafe state", "Deadlock", "Cannot determine without full allocation matrix"], correctAnswer: "Cannot determine without full allocation matrix", concept: "Deadlock Avoidance" },
      { text: "Page reference string: 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2. With 3 frames using LRU, the number of page faults is:", type: "NAT", options: [], correctAnswer: "12", concept: "Page Replacement" },
      { text: "A process has 5 pages. Page table entries are: {0\u21923, 1\u21927, 2\u21925, 3\u21922, 4\u21929}. Page size=4KB. Logical address 8196 maps to physical address:", type: "NAT", options: [], correctAnswer: "20484", concept: "Paging Address Translation" },
      { text: "Two processes execute: P1: wait(S); wait(Q); signal(Q); signal(S) and P2: wait(Q); wait(S); signal(S); signal(Q). This can lead to:", type: "MCQ", options: ["Starvation only", "Deadlock", "Neither deadlock nor starvation", "Race condition only"], correctAnswer: "Deadlock", concept: "Deadlock Detection" },
      { text: "In Round Robin with time quantum=3, processes P1(burst=10), P2(burst=4), P3(burst=3) arrive at t=0. P2 finishes at time:", type: "NAT", options: [], correctAnswer: "10", concept: "Round Robin Scheduling" },
      { text: "A system uses 2-level page table. Virtual address=30 bits, page size=1KB. Each PTE=4 bytes. The total size of all inner page tables is:", type: "MCQ", options: ["4KB", "4MB", "1MB", "80KB"], correctAnswer: "4MB", concept: "Multi-level Paging" },
      { text: "A disk has 200 tracks (0-199). Current head position=53. Request queue: 98,183,37,122,14,124,65,67. Using SSTF, the total head movement is:", type: "NAT", options: [], correctAnswer: "236", concept: "Disk Scheduling" },
      { text: "Peterson's solution for 2 processes uses which variables?", type: "MCQ", options: ["One shared boolean", "Two flags and one turn variable", "One semaphore", "Two mutexes"], correctAnswer: "Two flags and one turn variable", concept: "Process Synchronization" },
      { text: "A system with 4 resources and 3 processes has allocation [1,1,2] and max [2,2,3]. Total instances=4. The system is in:", type: "MCQ", options: ["Safe state", "Unsafe state", "Deadlocked state", "Cannot be determined"], correctAnswer: "Unsafe state", concept: "Banker's Algorithm" }
    ],
    "Computer Networks": [
      { text: "A host has IP 192.168.1.100/26. The broadcast address and number of usable hosts are:", type: "MCQ", options: ["192.168.1.127 and 62", "192.168.1.128 and 64", "192.168.1.63 and 30", "192.168.1.255 and 254"], correctAnswer: "192.168.1.127 and 62", concept: "Subnetting" },
      { text: "In Stop-and-Wait ARQ, link bandwidth=1Mbps, RTT=20ms, frame size=1000 bits. The utilization is:", type: "NAT", options: [], correctAnswer: "0.048", concept: "Flow Control" },
      { text: "TCP uses 3-way handshake. If SYN is sent at t=0 and RTT=100ms, the connection is established at approximately:", type: "NAT", options: [], correctAnswer: "150", concept: "TCP Connection" },
      { text: "Given a network 10.0.0.0/8 divided into 16 equal subnets. The subnet mask is:", type: "MCQ", options: ["255.240.0.0", "255.248.0.0", "255.128.0.0", "255.255.0.0"], correctAnswer: "255.240.0.0", concept: "Subnetting" },
      { text: "In Go-Back-N with window size W=4 and sequence numbers 0-7, sender sends frames 0,1,2,3. Frame 1 is lost. After timeout, sender retransmits:", type: "MCQ", options: ["Only frame 1", "Frames 1,2,3", "Frames 1,2,3,4", "All frames from 0"], correctAnswer: "Frames 1,2,3", concept: "Sliding Window" },
      { text: "A channel has bandwidth 3000 Hz and SNR=1023. Maximum data rate by Shannon theorem is:", type: "NAT", options: [], correctAnswer: "30000", concept: "Channel Capacity" },
      { text: "In CSMA/CD, the minimum frame size depends on:", type: "MCQ", options: ["Bandwidth only", "Propagation delay only", "Both bandwidth and propagation delay (2\xD7propagation\xD7bandwidth)", "MTU of the network"], correctAnswer: "Both bandwidth and propagation delay (2\xD7propagation\xD7bandwidth)", concept: "MAC Protocols" },
      { text: "A router has 4 interfaces. It receives a packet with TTL=1. The router:", type: "MCQ", options: ["Forwards with TTL=0", "Drops and sends ICMP Time Exceeded", "Forwards with TTL=255", "Drops silently"], correctAnswer: "Drops and sends ICMP Time Exceeded", concept: "IP Protocol" },
      { text: "In a sliding window protocol, if sender window size=6 and receiver window size=1, the minimum sequence number bits needed is:", type: "NAT", options: [], correctAnswer: "3", concept: "Sliding Window Protocol" },
      { text: "An Ethernet frame is 1518 bytes. With a preamble of 8 bytes and inter-frame gap of 12 bytes, the efficiency on a 100 Mbps link is approximately:", type: "MCQ", options: ["98.7%", "94.9%", "95.7%", "100%"], correctAnswer: "98.7%", concept: "Ethernet Efficiency" }
    ],
    "Theory of Computation": [
      { text: "The minimum DFA for L = {w \u2208 {a,b}* | w has an even number of a's and odd number of b's} has how many states?", type: "NAT", options: [], correctAnswer: "4", concept: "DFA Minimization" },
      { text: "Consider the grammar S\u2192aS|bS|\u03B5. The language generated is:", type: "MCQ", options: ["{a,b}*", "All strings starting with a", "All strings ending with b", "Only \u03B5"], correctAnswer: "{a,b}*", concept: "CFG Languages" },
      { text: "L = {0^n 1^n | n \u2265 1} is not regular. Using pumping lemma with string w = 0^p 1^p, if we pump the substring of 0's, the resulting string:", type: "MCQ", options: ["Has unequal 0s and 1s, so not in L", "Still has equal 0s and 1s", "Becomes empty", "Has more 1s than 0s"], correctAnswer: "Has unequal 0s and 1s, so not in L", concept: "Pumping Lemma" },
      { text: "An NFA has states {q0,q1,q2}, alphabet={0,1}, transitions: \u03B4(q0,0)={q0,q1}, \u03B4(q0,1)={q0}, \u03B4(q1,1)={q2}. q2 is final. The language accepted is:", type: "MCQ", options: ["Strings ending in 01", "Strings containing 01", "Strings starting with 01", "All binary strings"], correctAnswer: "Strings ending in 01", concept: "NFA Construction" },
      { text: "The language L = {ww^R | w \u2208 {a,b}*} (even-length palindromes) is:", type: "MCQ", options: ["Regular", "DCFL", "CFL but not DCFL", "CSL but not CFL"], correctAnswer: "CFL but not DCFL", concept: "Language Classification" },
      { text: "A PDA accepts L = {a^i b^j | i \u2260 j}. The minimum number of states needed is:", type: "NAT", options: [], correctAnswer: "4", concept: "PDA Design" },
      { text: "The intersection of a CFL and a regular language is always:", type: "MCQ", options: ["Regular", "CFL", "CSL", "Recursively enumerable"], correctAnswer: "CFL", concept: "Closure Properties" },
      { text: "Rice's theorem states that every non-trivial property of RE languages is:", type: "MCQ", options: ["Decidable", "Undecidable", "Semi-decidable", "NP-complete"], correctAnswer: "Undecidable", concept: "Decidability" },
      { text: "The number of strings of length 4 accepted by the DFA over {0,1} that accepts binary numbers divisible by 3 is:", type: "NAT", options: [], correctAnswer: "6", concept: "DFA Language Counting" },
      { text: "Consider two TMs: M1 accepts {0^n 1^n} and M2 accepts {0^n 1^n 0^n}. Which of the following is true?", type: "MCQ", options: ["Both M1 and M2 are decidable", "M1 is decidable but M2 is not", "Both are undecidable", "M1 is CFL, M2 is CSL, both decidable"], correctAnswer: "M1 is CFL, M2 is CSL, both decidable", concept: "Chomsky Hierarchy" }
    ],
    "Compiler Design": [
      { text: "Grammar: E\u2192E+T|T, T\u2192T*F|F, F\u2192(E)|id. FIRST(E) is:", type: "MCQ", options: ["{(, id}", "{+, *, (, id}", "{E, T, F}", "{(, id, +}"], correctAnswer: "{(, id}", concept: "FIRST Sets" },
      { text: "For the grammar S\u2192AB, A\u2192a|\u03B5, B\u2192b|\u03B5. FOLLOW(A) is:", type: "MCQ", options: ["{b, $}", "{a, b}", "{$}", "{b}"], correctAnswer: "{b, $}", concept: "FOLLOW Sets" },
      { text: 'The string "id + id * id" is parsed by an SLR(1) parser. The number of reductions performed is:', type: "NAT", options: [], correctAnswer: "5", concept: "SLR Parsing" },
      { text: 'Given grammar S\u2192aABe, A\u2192Abc|b, B\u2192d. The string "abbcde" is parsed using shift-reduce. The handle after reading "abb" is:', type: "MCQ", options: ["abb", "bb", "b (rightmost b)", "ab"], correctAnswer: "b (rightmost b)", concept: "Bottom-up Parsing" },
      { text: "Three-address code for x = a[i] + b[j] requires how many instructions (including array access)?", type: "NAT", options: [], correctAnswer: "4", concept: "Intermediate Code" },
      { text: "An LL(1) grammar must be:", type: "MCQ", options: ["Left recursive", "Right recursive or non-recursive", "Ambiguous", "Left factored with no left recursion"], correctAnswer: "Left factored with no left recursion", concept: "LL Parsing Constraints" },
      { text: "In a DAG representation of expression a+a*(b-c)+(b-c)*d, the number of interior nodes is:", type: "NAT", options: [], correctAnswer: "4", concept: "DAG Optimization" },
      { text: "A lexer uses the regex (a|b)*abb to recognize tokens. The minimum DFA states needed is:", type: "NAT", options: [], correctAnswer: "4", concept: "Lexical Analysis DFA" },
      { text: "Live variable analysis is a:", type: "MCQ", options: ["Forward, may analysis", "Forward, must analysis", "Backward, may analysis", "Backward, must analysis"], correctAnswer: "Backward, may analysis", concept: "Data Flow Analysis" },
      { text: "In an LR(0) item set, the item S\u2192A.B indicates:", type: "MCQ", options: ["A has been fully parsed", "B is yet to be parsed", "Both A and B are parsed", "Neither is parsed"], correctAnswer: "B is yet to be parsed", concept: "LR Parsing" }
    ],
    "Digital Logic": [
      { text: "F(A,B,C,D) = \u03A3m(0,1,2,5,8,9,10) with don't cares d(3,7). After K-map minimization, the number of prime implicants is:", type: "NAT", options: [], correctAnswer: "3", concept: "K-Map Minimization" },
      { text: "A synchronous counter counts: 000\u2192001\u2192010\u2192011\u2192100\u2192000. The number of flip-flops and the type of counter is:", type: "MCQ", options: ["3 flip-flops, mod-5", "3 flip-flops, mod-8", "4 flip-flops, mod-5", "2 flip-flops, mod-5"], correctAnswer: "3 flip-flops, mod-5", concept: "Counter Design" },
      { text: "Implement F(A,B,C) = \u03A3m(1,2,5,7) using an 8:1 MUX with A,B,C as select lines. The input to line 0 is:", type: "NAT", options: [], correctAnswer: "0", concept: "MUX Implementation" },
      { text: "A master-slave JK flip-flop has J=1, K=1. If current Q=0, after one clock pulse Q becomes:", type: "NAT", options: [], correctAnswer: "1", concept: "Flip-Flop Behavior" },
      { text: "The Boolean function F = AB'C + A'BC + ABC' + ABC can be simplified to:", type: "MCQ", options: ["AB + BC + AC", "A + BC", "AB + C", "A(B+C) + BC"], correctAnswer: "AB + BC + AC", concept: "Boolean Simplification" },
      { text: "A 4-bit ripple carry adder adds 0110 and 1011. The sum and carry out are:", type: "MCQ", options: ["10001 (sum=0001, Cout=1)", "01001 (sum=1001, Cout=0)", "10010 (sum=0010, Cout=1)", "00001 (sum=0001, Cout=0)"], correctAnswer: "10001 (sum=0001, Cout=1)", concept: "Adder Circuits" },
      { text: "A 3-to-8 decoder with enable is used to implement F(A,B,C) = \u03A3m(1,3,5,7). The output is taken from:", type: "MCQ", options: ["OR of outputs 1,3,5,7", "AND of outputs 1,3,5,7", "NAND of outputs 0,2,4,6", "NOR of outputs 1,3,5,7"], correctAnswer: "OR of outputs 1,3,5,7", concept: "Decoder Applications" },
      { text: "A finite state machine has 12 states. The minimum number of state variables (flip-flops) needed is:", type: "NAT", options: [], correctAnswer: "4", concept: "FSM Design" },
      { text: "In a mealy machine, the output changes:", type: "MCQ", options: ["Only on clock edge", "On input change between clock edges", "Only on state change", "Never asynchronously"], correctAnswer: "On input change between clock edges", concept: "Mealy vs Moore" },
      { text: "A ROM of size 256\xD78 can implement how many Boolean functions of 8 variables simultaneously?", type: "NAT", options: [], correctAnswer: "8", concept: "ROM as Function Generator" }
    ]
  },
  "GATE ECE": {
    "Network Theory": [
      { text: "In a series RLC circuit with R=5\u03A9, L=0.1H, C=1mF, the resonant frequency in rad/s is:", type: "NAT", options: [], correctAnswer: "100", concept: "Resonance" },
      { text: "Thevenin voltage across terminals A-B of a circuit with 12V source and 4\u03A9, 6\u03A9 in series (A-B across 6\u03A9) is:", type: "NAT", options: [], correctAnswer: "7.2", concept: "Thevenin Theorem" },
      { text: "For a two-port network with Z11=10, Z12=3, Z21=3, Z22=5, the network is reciprocal because:", type: "MCQ", options: ["Z11=Z22", "Z12=Z21", "Z11\xB7Z22-Z12\xB7Z21=41", "All parameters are positive"], correctAnswer: "Z12=Z21", concept: "Two-Port Networks" },
      { text: "An RC circuit with R=1k\u03A9, C=1\u03BCF is charged to 10V. Voltage across C at t=1ms is approximately:", type: "MCQ", options: ["3.68V", "6.32V", "0V", "10V"], correctAnswer: "3.68V", concept: "Transient Analysis" },
      { text: "In a graph with 5 nodes, 8 branches, and 2 separate parts, the independent mesh equations:", type: "NAT", options: [], correctAnswer: "5", concept: "Graph Theory" },
      { text: "Maximum power transferred to load when source has Zth=4+j3\u03A9 is when ZL equals:", type: "MCQ", options: ["4+j3", "4-j3", "5\u03A9", "7\u03A9"], correctAnswer: "4-j3", concept: "Max Power Transfer" },
      { text: "H(s)=10s/(s\xB2+3s+2). The poles are at s=:", type: "MCQ", options: ["-1 and -2", "1 and 2", "-1 and 2", "0 and -3"], correctAnswer: "-1 and -2", concept: "Pole-Zero Analysis" },
      { text: "The initial current through a 2H inductor with stored energy 8J is:", type: "MCQ", options: ["2A", "2.83A", "4A", "1A"], correctAnswer: "2.83A", concept: "Inductor Energy" },
      { text: "Balanced Wheatstone bridge: R1=100\u03A9, R2=200\u03A9, R3=150\u03A9. R4 equals:", type: "NAT", options: [], correctAnswer: "300", concept: "Bridge Circuits" },
      { text: "A circuit has two current sources 5A and 3A in parallel with internal resistances 4\u03A9 and 6\u03A9. Norton current is:", type: "MCQ", options: ["8A", "2A", "3.8A", "5A"], correctAnswer: "3.8A", concept: "Norton Theorem" }
    ],
    "Signals and Systems": [
      { text: "A signal x(t) has bandwidth 4kHz sampled at 10kHz. The signal is perfectly reconstructed because fs=10kHz which is:", type: "MCQ", options: ["Equal to 2fm", "Greater than 2fm", "Less than 2fm", "Equal to fm"], correctAnswer: "Greater than 2fm", concept: "Nyquist Sampling" },
      { text: "H(z)=(z-1)/(z-0.5) with ROC |z|>0.5. For input x[n]=u[n], the value of y[1] is:", type: "NAT", options: [], correctAnswer: "0.5", concept: "Z-Transform Analysis" },
      { text: "System y[n]=x[n]+x[n-1]. The magnitude response |H(e^j\u03C9)| at \u03C9=\u03C0 is:", type: "NAT", options: [], correctAnswer: "0", concept: "Frequency Response" },
      { text: "h[n]=(0.5)^n u[n]. The system is stable because \u03A3|h[n]| converges to:", type: "NAT", options: [], correctAnswer: "2", concept: "BIBO Stability" },
      { text: "x(t)=cos(100\u03C0t)+cos(200\u03C0t). Minimum sampling rate to avoid aliasing is:", type: "NAT", options: [], correctAnswer: "200", concept: "Sampling Rate" },
      { text: "The autocorrelation Rxx(0) of x(t)=3cos(10t)+4sin(10t) is:", type: "NAT", options: [], correctAnswer: "12.5", concept: "Autocorrelation" },
      { text: "y(t)=x(2t) is time-variant because:", type: "MCQ", options: ["It compresses the signal", "Shifting input by t0 gives x(2t-2t0) not x(2(t-t0))", "It doubles frequency", "It is non-causal"], correctAnswer: "Shifting input by t0 gives x(2t-2t0) not x(2(t-t0))", concept: "Time Invariance" },
      { text: "The Laplace transform of t\xB7u(t) is:", type: "MCQ", options: ["1/s", "1/s\xB2", "2/s\xB3", "s"], correctAnswer: "1/s\xB2", concept: "Laplace Transform" },
      { text: "DFT of x[n]={1,1,1,1} (N=4). X[0] equals:", type: "NAT", options: [], correctAnswer: "4", concept: "DFT" },
      { text: "A system with h(t)=e^(2t)u(t) is unstable because:", type: "MCQ", options: ["h(t) is non-causal", "\u222B|h(t)|dt diverges", "h(t) has a pole in RHP", "Both \u222B|h(t)|dt diverges and pole in RHP"], correctAnswer: "Both \u222B|h(t)|dt diverges and pole in RHP", concept: "Stability Analysis" }
    ],
    "Digital Circuits": [
      { text: "A 4-bit synchronous up-counter starts at 1010. After 7 clock pulses, the output is:", type: "MCQ", options: ["0001", "0010", "0000", "0011"], correctAnswer: "0001", concept: "Counters" },
      { text: "A 16K\xD78 memory chip requires total address+data lines:", type: "NAT", options: [], correctAnswer: "22", concept: "Memory Organization" },
      { text: "F=\u03A3m(0,2,5,7) using 4:1 MUX with A,B as select. Input I0 in terms of C is:", type: "MCQ", options: ["C'", "C", "1", "0"], correctAnswer: "C'", concept: "MUX Design" },
      { text: "An 8-bit successive approximation ADC with 1MHz clock completes one conversion in \u03BCs:", type: "NAT", options: [], correctAnswer: "8", concept: "ADC Timing" },
      { text: "Propagation delay of a 32-bit ripple carry adder (each FA delay=10ns) is:", type: "NAT", options: [], correctAnswer: "320", concept: "Adder Delay Analysis" },
      { text: 'Moore FSM for detecting "101" in serial bit stream needs minimum states:', type: "NAT", options: [], correctAnswer: "4", concept: "Sequence Detector" },
      { text: "Two 4K\xD74 RAM chips combined create memory of size:", type: "MCQ", options: ["4K\xD78", "8K\xD74", "8K\xD78", "4K\xD716"], correctAnswer: "4K\xD78", concept: "Memory Expansion" },
      { text: "A 3-bit flash ADC requires comparators:", type: "NAT", options: [], correctAnswer: "7", concept: "Flash ADC" },
      { text: "A hazard in combinational circuits is eliminated by:", type: "MCQ", options: ["Adding redundant prime implicants", "Removing essential PI", "Using more gates", "Reducing variables"], correctAnswer: "Adding redundant prime implicants", concept: "Hazard Elimination" },
      { text: "A shift register loaded with 1011 after 2 right shifts (serial input=0) contains:", type: "MCQ", options: ["0010", "0011", "1101", "0101"], correctAnswer: "0010", concept: "Shift Registers" }
    ],
    "Communications": [
      { text: "AM signal: carrier power=10W, modulation index=0.5. Total sideband power in watts is:", type: "NAT", options: [], correctAnswer: "1.25", concept: "AM Power" },
      { text: "FM signal: m(t) bandwidth=10kHz, kf=50kHz/V, max|m(t)|=2V. Carson bandwidth in Hz is:", type: "NAT", options: [], correctAnswer: "220000", concept: "FM Bandwidth" },
      { text: "In 16-QAM, bits per symbol is:", type: "NAT", options: [], correctAnswer: "4", concept: "Digital Modulation" },
      { text: "PCM: 8kHz sampling, 8 bits/sample. The bit rate in bps is:", type: "NAT", options: [], correctAnswer: "64000", concept: "PCM Bit Rate" },
      { text: "Superheterodyne receiver with IF=455kHz tuned to 1MHz. Image frequency in Hz is:", type: "NAT", options: [], correctAnswer: "1910000", concept: "Image Frequency" },
      { text: "Channel bandwidth=4kHz, SNR=31. Shannon capacity in kbps is:", type: "NAT", options: [], correctAnswer: "20", concept: "Channel Capacity" },
      { text: "QPSK spectral efficiency compared to BPSK is:", type: "MCQ", options: ["Same", "Twice", "Half", "Four times"], correctAnswer: "Twice", concept: "Spectral Efficiency" },
      { text: "A (7,4) Hamming code can correct up to how many errors per codeword?", type: "NAT", options: [], correctAnswer: "1", concept: "Error Correction" },
      { text: "Delta modulation slope overload occurs when the input signal changes:", type: "MCQ", options: ["Too slowly", "Too rapidly", "At constant rate", "Not at all"], correctAnswer: "Too rapidly", concept: "Delta Modulation" },
      { text: "Entropy of a source with probabilities {0.5, 0.25, 0.125, 0.125} in bits is:", type: "NAT", options: [], correctAnswer: "1.75", concept: "Information Theory" }
    ],
    "Control Systems": [
      { text: "G(s)=K/s(s+2)(s+4). By Routh criterion, the range of K for stability is:", type: "MCQ", options: ["0<K<48", "0<K<24", "K>48", "K>0"], correctAnswer: "0<K<48", concept: "Routh-Hurwitz" },
      { text: "Second-order system: \u03C9n=10 rad/s, \u03B6=0.5. Peak time tp is approximately:", type: "MCQ", options: ["0.363s", "0.628s", "0.1s", "1.0s"], correctAnswer: "0.363s", concept: "Time Response" },
      { text: "G(s)H(s)=K(s+1)/s\xB2(s+5). The system type is:", type: "NAT", options: [], correctAnswer: "2", concept: "System Type" },
      { text: "Unity feedback, G(s)=10/s(s+1). Steady-state error for ramp input is:", type: "NAT", options: [], correctAnswer: "0.1", concept: "Steady-State Error" },
      { text: "Root locus of G(s)H(s)=K/s(s+3)(s+5): asymptote angles are:", type: "MCQ", options: ["60\xB0,180\xB0,300\xB0", "90\xB0,270\xB0", "0\xB0,120\xB0,240\xB0", "45\xB0,135\xB0,225\xB0"], correctAnswer: "60\xB0,180\xB0,300\xB0", concept: "Root Locus" },
      { text: "Lag compensator has pole closer to origin than zero. This improves:", type: "MCQ", options: ["Transient response", "Steady-state accuracy", "Bandwidth", "Rise time"], correctAnswer: "Steady-state accuracy", concept: "Compensator Design" },
      { text: "Number of asymptotes in root locus of G(s)=K/(s(s+1)(s+3)) is:", type: "NAT", options: [], correctAnswer: "3", concept: "Root Locus Properties" },
      { text: "State matrix A=[[0,1],[-2,-3]]. The eigenvalues are:", type: "MCQ", options: ["-1 and -2", "1 and 2", "-1 and 2", "0 and -3"], correctAnswer: "-1 and -2", concept: "State Space" },
      { text: "G(s)=100/(s+10). The DC gain in dB is:", type: "NAT", options: [], correctAnswer: "20", concept: "Bode Plot" },
      { text: "G(j\u03C9)=1/(j\u03C9(j\u03C9+1)). Phase at \u03C9=1 rad/s is:", type: "MCQ", options: ["-90\xB0", "-135\xB0", "-180\xB0", "-45\xB0"], correctAnswer: "-135\xB0", concept: "Phase Analysis" }
    ]
  },
  "JEE Main": {
    "Physics - Mechanics": [
      { text: "A block slides down a 30\xB0 incline with \u03BC=0.3. If g=10m/s\xB2, the acceleration in m/s\xB2 is:", type: "NAT", options: [], correctAnswer: "2.4", concept: "Inclined Plane" },
      { text: "Two masses 3kg and 5kg connected by a string over a frictionless pulley (Atwood machine). The acceleration is (g=10m/s\xB2):", type: "NAT", options: [], correctAnswer: "2.5", concept: "Newton Laws" },
      { text: "A projectile is fired at 60\xB0 with velocity 40m/s. Maximum height reached is (g=10m/s\xB2):", type: "NAT", options: [], correctAnswer: "60", concept: "Projectile Motion" },
      { text: "A disc of mass 2kg and radius 0.5m rolls without slipping. Its total KE at v=4m/s is:", type: "NAT", options: [], correctAnswer: "24", concept: "Rolling Motion" },
      { text: "A satellite orbits Earth at height h=R (R=radius of Earth). Its orbital velocity relative to surface velocity is:", type: "MCQ", options: ["v\u2080/\u221A2", "v\u2080\xD7\u221A2", "v\u2080/2", "2v\u2080"], correctAnswer: "v\u2080/\u221A2", concept: "Orbital Mechanics" },
      { text: "Spring constant k=500N/m, mass=2kg in SHM. The time period in seconds is:", type: "MCQ", options: ["0.4\u03C0", "0.2\u03C0", "2\u03C0", "\u03C0"], correctAnswer: "0.4\u03C0", concept: "SHM" },
      { text: "A 2kg ball moving at 5m/s collides elastically with a stationary 3kg ball. Speed of 2kg ball after collision is:", type: "NAT", options: [], correctAnswer: "1", concept: "Elastic Collision" },
      { text: "Work done by gravity on a 5kg mass sliding 10m down a 37\xB0 incline is (g=10m/s\xB2):", type: "NAT", options: [], correctAnswer: "300", concept: "Work Energy" },
      { text: "A torque of 20Nm is applied to a wheel of moment of inertia 4kg\xB7m\xB2. Angular acceleration in rad/s\xB2 is:", type: "NAT", options: [], correctAnswer: "5", concept: "Rotational Dynamics" },
      { text: "A body starts from rest with acceleration 2m/s\xB2. Distance covered in the 5th second is:", type: "NAT", options: [], correctAnswer: "9", concept: "Kinematics" }
    ],
    "Physics - Electromagnetism": [
      { text: "Three capacitors 2\u03BCF, 3\u03BCF, 6\u03BCF in parallel. Equivalent capacitance in \u03BCF is:", type: "NAT", options: [], correctAnswer: "11", concept: "Capacitance" },
      { text: "A wire of resistance 12\u03A9 is bent into a circle. Resistance between diametrically opposite points is:", type: "NAT", options: [], correctAnswer: "3", concept: "Resistance Networks" },
      { text: "A circular coil of 100 turns, area 0.01m\xB2 in B=0.1T rotates at 50 rev/s. Peak EMF in volts is:", type: "MCQ", options: ["10\u03C0", "100\u03C0", "\u03C0", "50\u03C0"], correctAnswer: "10\u03C0", concept: "Electromagnetic Induction" },
      { text: "A proton enters uniform B=0.5T perpendicular to its velocity v=10\u2076m/s. Radius of circular path (mp=1.67\xD710\u207B\xB2\u2077kg) is:", type: "MCQ", options: ["0.021m", "0.21m", "2.1m", "0.0021m"], correctAnswer: "0.021m", concept: "Charged Particle Motion" },
      { text: "In an LCR series circuit, L=0.1H, C=100\u03BCF, R=10\u03A9. The quality factor is:", type: "MCQ", options: ["3.16", "10", "1", "31.6"], correctAnswer: "3.16", concept: "AC Circuits" },
      { text: "A parallel plate capacitor with plate area 0.01m\xB2, separation 1mm, \u03B5r=5. Capacitance in pF is:", type: "NAT", options: [], correctAnswer: "443", concept: "Capacitors" },
      { text: "Current I=2A in a solenoid of 500 turns, length 0.5m. Magnetic field inside in mT is:", type: "NAT", options: [], correctAnswer: "2.51", concept: "Solenoid" },
      { text: "A galvanometer of resistance 50\u03A9 gives full deflection at 1mA. Shunt needed for 1A ammeter is:", type: "MCQ", options: ["0.05\u03A9", "0.5\u03A9", "5\u03A9", "50\u03A9"], correctAnswer: "0.05\u03A9", concept: "Galvanometer Conversion" },
      { text: "Electric field at distance 10cm from a line charge of \u03BB=2\xD710\u207B\u2076 C/m is (in kV/m):", type: "NAT", options: [], correctAnswer: "360", concept: "Electric Field" },
      { text: "A transformer steps down 220V to 22V. If primary has 1000 turns, secondary turns:", type: "NAT", options: [], correctAnswer: "100", concept: "Transformers" }
    ],
    "Chemistry - Organic": [
      { text: "CH\u2083CH=CH\u2082 + HBr \u2192 product by Markovnikov rule is:", type: "MCQ", options: ["1-Bromopropane", "2-Bromopropane", "1,2-Dibromopropane", "Propane"], correctAnswer: "2-Bromopropane", concept: "Addition Reactions" },
      { text: "The number of sp\xB2 hybridized carbons in CH\u2082=CH-CH=CH\u2082 is:", type: "NAT", options: [], correctAnswer: "4", concept: "Hybridization" },
      { text: "SN2 rate is fastest for which substrate?", type: "MCQ", options: ["CH\u2083Br", "(CH\u2083)\u2082CHBr", "(CH\u2083)\u2083CBr", "C\u2086H\u2085CHBrCH\u2083"], correctAnswer: "CH\u2083Br", concept: "Nucleophilic Substitution" },
      { text: "The number of structural isomers of C\u2085H\u2081\u2082 is:", type: "NAT", options: [], correctAnswer: "3", concept: "Structural Isomerism" },
      { text: "Ozonolysis of 2-butene produces:", type: "MCQ", options: ["2 moles of acetaldehyde", "1 mole formaldehyde + 1 mole acetaldehyde", "2 moles of formaldehyde", "1 mole acetone + 1 mole formaldehyde"], correctAnswer: "2 moles of acetaldehyde", concept: "Ozonolysis" },
      { text: "In the Cannizzaro reaction, benzaldehyde gives:", type: "MCQ", options: ["Benzyl alcohol + benzoic acid", "Benzene + CO\u2082", "Benzophenone", "Cinnamaldehyde"], correctAnswer: "Benzyl alcohol + benzoic acid", concept: "Aldehyde Reactions" },
      { text: "The degree of unsaturation in C\u2086H\u2085NO\u2082 is:", type: "NAT", options: [], correctAnswer: "5", concept: "Degree of Unsaturation" },
      { text: "Lucas test gives turbidity fastest with:", type: "MCQ", options: ["Primary alcohol", "Secondary alcohol", "Tertiary alcohol", "Methanol"], correctAnswer: "Tertiary alcohol", concept: "Alcohol Tests" },
      { text: "How many monosubstitution products does neopentane give on chlorination?", type: "NAT", options: [], correctAnswer: "1", concept: "Halogenation" },
      { text: "The product of aldol condensation of acetaldehyde is:", type: "MCQ", options: ["3-Hydroxybutanal", "Butanal", "Crotonaldehyde", "Acetic acid"], correctAnswer: "3-Hydroxybutanal", concept: "Aldol Condensation" }
    ],
    "Chemistry - Inorganic": [
      { text: "The oxidation state of Mn in KMnO\u2084 is:", type: "NAT", options: [], correctAnswer: "7", concept: "Oxidation States" },
      { text: "An FCC unit cell contains effectively how many atoms?", type: "NAT", options: [], correctAnswer: "4", concept: "Solid State" },
      { text: "PCl\u2085 has shape trigonal bipyramidal. The number of 90\xB0 Cl-P-Cl bond angles is:", type: "NAT", options: [], correctAnswer: "6", concept: "VSEPR Theory" },
      { text: "The magnetic moment of Ti\xB3\u207A (Z=22) in BM is approximately:", type: "MCQ", options: ["1.73", "2.83", "3.87", "0"], correctAnswer: "1.73", concept: "d-Block Elements" },
      { text: "[Co(NH\u2083)\u2086]\xB3\u207A is diamagnetic. Co\xB3\u207A (d\u2076) must be in which field?", type: "MCQ", options: ["Weak field", "Strong field", "No field", "Medium field"], correctAnswer: "Strong field", concept: "Crystal Field Theory" },
      { text: "The number of lone pairs on Xe in XeF\u2084 is:", type: "NAT", options: [], correctAnswer: "2", concept: "Noble Gas Compounds" },
      { text: "In the thermite reaction, Al reduces Fe\u2082O\u2083. Al acts as:", type: "MCQ", options: ["Oxidizing agent", "Reducing agent", "Catalyst", "Flux"], correctAnswer: "Reducing agent", concept: "Metallurgy" },
      { text: "The packing efficiency of BCC structure is approximately:", type: "MCQ", options: ["52%", "68%", "74%", "90%"], correctAnswer: "68%", concept: "Solid State Packing" },
      { text: "Among Na, Mg, Al, Si \u2014 which has the highest ionization energy?", type: "MCQ", options: ["Na", "Mg", "Al", "Si"], correctAnswer: "Si", concept: "Periodic Trends" },
      { text: "The bond order of NO is:", type: "NAT", options: [], correctAnswer: "2.5", concept: "MOT" }
    ],
    "Mathematics - Calculus": [
      { text: "If f(x)=x\xB3-3x\xB2+2, the local minimum occurs at x=:", type: "NAT", options: [], correctAnswer: "2", concept: "Maxima Minima" },
      { text: "\u222B\u2080\xB9 x\xB7e\u02E3 dx equals:", type: "MCQ", options: ["1", "e-1", "2e-1", "e"], correctAnswer: "1", concept: "Integration by Parts" },
      { text: "lim(x\u21920) (e\u02E3-1-x)/x\xB2 equals:", type: "MCQ", options: ["0", "1/2", "1", "\u221E"], correctAnswer: "1/2", concept: "L'Hopital Rule" },
      { text: "The area enclosed between y=x\xB2 and y=2x is:", type: "NAT", options: [], correctAnswer: "1.33", concept: "Area Between Curves" },
      { text: "dy/dx + 2y = e\u207B\u02E3. The integrating factor is:", type: "MCQ", options: ["e\xB2\u02E3", "e\u207B\xB2\u02E3", "e\u02E3", "2x"], correctAnswer: "e\xB2\u02E3", concept: "Linear Differential Equations" },
      { text: "The radius of curvature of y=x\xB2 at origin is:", type: "NAT", options: [], correctAnswer: "0.5", concept: "Curvature" },
      { text: "d/dx[tan\u207B\xB9(sinx/(1+cosx))] equals:", type: "MCQ", options: ["1/2", "1", "cosx", "1/(1+cosx)"], correctAnswer: "1/2", concept: "Differentiation" },
      { text: "\u222B dx/(x\xB2+4x+8) requires completing the square. The answer involves:", type: "MCQ", options: ["tan\u207B\xB9", "sin\u207B\xB9", "log", "sec\u207B\xB9"], correctAnswer: "tan\u207B\xB9", concept: "Integration Techniques" },
      { text: "The solution of dy/dx = y/x with y(1)=2 at x=3 gives y=:", type: "NAT", options: [], correctAnswer: "6", concept: "Separable ODE" },
      { text: "The volume of solid of revolution of y=\u221Ax from x=0 to x=4 about x-axis is:", type: "MCQ", options: ["8\u03C0", "4\u03C0", "16\u03C0", "2\u03C0"], correctAnswer: "8\u03C0", concept: "Solid of Revolution" }
    ],
    "Mathematics - Algebra": [
      { text: "If roots of 2x\xB2-5x+k=0 are in ratio 2:3, then k equals:", type: "NAT", options: [], correctAnswer: "3", concept: "Quadratic Equations" },
      { text: "det([[1,2,3],[4,5,6],[7,8,9]]) equals:", type: "NAT", options: [], correctAnswer: "0", concept: "Determinants" },
      { text: "Sum of GP: 3+6+12+...+768. Number of terms is:", type: "NAT", options: [], correctAnswer: "9", concept: "Geometric Series" },
      { text: "If A is 3\xD73 matrix with det(A)=5, then det(adj(A)) is:", type: "NAT", options: [], correctAnswer: "25", concept: "Adjoint Matrix" },
      { text: "The number of 4-letter words from MATHEMATICS with no repetition is:", type: "MCQ", options: ["5040", "2520", "1680", "840"], correctAnswer: "2520", concept: "Permutations" },
      { text: "In how many ways can 8 people sit around a circular table?", type: "NAT", options: [], correctAnswer: "5040", concept: "Circular Permutations" },
      { text: "If |z|=2 and arg(z)=\u03C0/3, then z in rectangular form is:", type: "MCQ", options: ["1+i\u221A3", "2+i\u221A3", "1+i2", "\u221A3+i"], correctAnswer: "1+i\u221A3", concept: "Complex Numbers" },
      { text: "The coefficient of x\xB3 in (1+x)\xB9\u2070 is:", type: "NAT", options: [], correctAnswer: "120", concept: "Binomial Theorem" },
      { text: "If A={1,2,3,4}, the number of subsets containing element 1 is:", type: "NAT", options: [], correctAnswer: "8", concept: "Set Theory" },
      { text: "Sum to infinity: 1-1/3+1/9-1/27+... equals:", type: "MCQ", options: ["3/4", "2/3", "1/2", "4/3"], correctAnswer: "3/4", concept: "Infinite GP" }
    ]
  },
  "NEET": {
    "Biology - Botany": [
      { text: "In C3 plants, the first stable product of CO\u2082 fixation is 3-PGA (3-carbon). In C4 plants, it is OAA which has how many carbons?", type: "NAT", options: [], correctAnswer: "4", concept: "Photosynthesis Pathways" },
      { text: "During meiosis I, crossing over occurs at pachytene. If a cell has 2n=46, the number of tetrads formed is:", type: "NAT", options: [], correctAnswer: "23", concept: "Cell Division" },
      { text: "A plant shows genotype RrYy. By Mendel's law of independent assortment, the number of distinct gamete types is:", type: "NAT", options: [], correctAnswer: "4", concept: "Genetics" },
      { text: "In aerobic respiration, 1 NADH entering ETC produces approximately how many ATP via oxidative phosphorylation?", type: "MCQ", options: ["1.5", "2", "2.5", "3"], correctAnswer: "2.5", concept: "Respiration Efficiency" },
      { text: "A pea plant heterozygous for height (Tt) is crossed with a dwarf plant (tt). The expected ratio of tall to dwarf offspring is:", type: "MCQ", options: ["3:1", "1:1", "1:3", "All tall"], correctAnswer: "1:1", concept: "Mendelian Genetics" },
      { text: "Photorespiration in C3 plants is catalyzed by RuBisCO acting on:", type: "MCQ", options: ["CO\u2082 only", "O\u2082 only", "Both CO\u2082 and O\u2082", "Neither"], correctAnswer: "Both CO\u2082 and O\u2082", concept: "Photorespiration" },
      { text: "If a plant cell is placed in a hypertonic solution, it undergoes:", type: "MCQ", options: ["Turgidity", "Plasmolysis", "Lysis", "No change"], correctAnswer: "Plasmolysis", concept: "Osmosis" },
      { text: "The ratio of phenotypes in a dihybrid cross F2 generation is:", type: "MCQ", options: ["3:1", "9:3:3:1", "1:2:1", "1:1:1:1"], correctAnswer: "9:3:3:1", concept: "Dihybrid Cross" },
      { text: "How many NADPH molecules are required to fix one molecule of CO\u2082 in the Calvin cycle?", type: "NAT", options: [], correctAnswer: "2", concept: "Calvin Cycle" },
      { text: "Auxin moves basipetally in stems. This is an example of:", type: "MCQ", options: ["Osmosis", "Polar transport", "Active transport", "Facilitated diffusion"], correctAnswer: "Polar transport", concept: "Plant Hormones" }
    ],
    "Biology - Zoology": [
      { text: "GFR in a healthy human kidney is approximately (in mL/min):", type: "NAT", options: [], correctAnswer: "125", concept: "Renal Physiology" },
      { text: "A person with blood group AB can receive blood from:", type: "MCQ", options: ["O only", "A and B only", "AB only", "All blood groups (universal recipient)"], correctAnswer: "All blood groups (universal recipient)", concept: "Blood Groups" },
      { text: "If both parents are carriers (Aa) for sickle cell anemia, probability of an affected child is:", type: "MCQ", options: ["1/4", "1/2", "3/4", "1"], correctAnswer: "1/4", concept: "Human Genetics" },
      { text: "The cardiac output = stroke volume \xD7 heart rate. If SV=70mL and HR=72/min, CO in L/min is:", type: "NAT", options: [], correctAnswer: "5.04", concept: "Cardiac Physiology" },
      { text: "A codon has 3 bases. With 4 types of nucleotides, the total possible codons are:", type: "NAT", options: [], correctAnswer: "64", concept: "Molecular Biology" },
      { text: "Oxyhaemoglobin dissociation curve shifts right (Bohr effect) in:", type: "MCQ", options: ["Low CO\u2082 and high pH", "High CO\u2082 and low pH", "Low temperature", "High O\u2082 concentration"], correctAnswer: "High CO\u2082 and low pH", concept: "Respiratory Physiology" },
      { text: "In the human karyotype, total autosomes in a somatic cell are:", type: "NAT", options: [], correctAnswer: "44", concept: "Chromosomes" },
      { text: "The neurotransmitter at neuromuscular junction is:", type: "MCQ", options: ["Dopamine", "Serotonin", "Acetylcholine", "GABA"], correctAnswer: "Acetylcholine", concept: "Neural Signaling" },
      { text: "Antibodies are produced by:", type: "MCQ", options: ["T-helper cells", "B-lymphocytes (plasma cells)", "Macrophages", "NK cells"], correctAnswer: "B-lymphocytes (plasma cells)", concept: "Immunology" },
      { text: "During DNA replication, Okazaki fragments are formed on which strand?", type: "MCQ", options: ["Leading strand", "Lagging strand", "Both strands", "Neither strand"], correctAnswer: "Lagging strand", concept: "DNA Replication" }
    ],
    "Physics": [
      { text: "A concave mirror has focal length 15cm. An object at 30cm forms image at:", type: "NAT", options: [], correctAnswer: "30", concept: "Ray Optics" },
      { text: "Two resistors 4\u03A9 and 12\u03A9 in parallel. A 6V battery is connected. Total current drawn is:", type: "NAT", options: [], correctAnswer: "2", concept: "Circuits" },
      { text: "A convex lens of focal length 10cm. Object at 15cm. Image distance is:", type: "NAT", options: [], correctAnswer: "30", concept: "Lens Formula" },
      { text: "Photon of frequency 5\xD710\xB9\u2074 Hz. Its energy in eV is (h=6.6\xD710\u207B\xB3\u2074, 1eV=1.6\xD710\u207B\xB9\u2079):", type: "MCQ", options: ["2.06", "3.3", "1.03", "4.12"], correctAnswer: "2.06", concept: "Photoelectric Effect" },
      { text: "A body of mass 2kg moving at 3m/s collides with a wall and bounces back at 2m/s. Change in momentum (in kg\xB7m/s) is:", type: "NAT", options: [], correctAnswer: "10", concept: "Impulse Momentum" },
      { text: "In Young's experiment, \u03BB=600nm, d=0.1mm, D=1m. Fringe width in mm is:", type: "NAT", options: [], correctAnswer: "6", concept: "Wave Optics" },
      { text: "A radioactive element has half-life 20 min. After 1 hour, the fraction remaining is:", type: "MCQ", options: ["1/2", "1/4", "1/8", "1/16"], correctAnswer: "1/8", concept: "Nuclear Physics" },
      { text: "EMF of 2 cells (1.5V, 0.5\u03A9 each) in series with external resistance 4\u03A9. Current is:", type: "MCQ", options: ["0.5A", "0.6A", "0.75A", "1A"], correctAnswer: "0.6A", concept: "EMF and Internal Resistance" },
      { text: "A wire of length L and resistance R is stretched to 2L. New resistance is:", type: "MCQ", options: ["R", "2R", "4R", "R/2"], correctAnswer: "4R", concept: "Resistance" },
      { text: "A myopic eye has far point 2m. The corrective lens power in diopters is:", type: "NAT", options: [], correctAnswer: "-0.5", concept: "Defects of Vision" }
    ],
    "Chemistry": [
      { text: "The pH of 0.01M HCl solution is:", type: "NAT", options: [], correctAnswer: "2", concept: "pH Calculation" },
      { text: "How many moles of NaOH are needed to neutralize 0.5 moles of H\u2082SO\u2084?", type: "NAT", options: [], correctAnswer: "1", concept: "Stoichiometry" },
      { text: "At STP, 22.4L of any ideal gas contains molecules equal to:", type: "MCQ", options: ["6.022\xD710\xB2\xB2", "6.022\xD710\xB2\xB3", "3.011\xD710\xB2\xB3", "12.044\xD710\xB2\xB3"], correctAnswer: "6.022\xD710\xB2\xB3", concept: "Mole Concept" },
      { text: "The freezing point of 0.1m NaCl (i=2) is depressed by (Kf=1.86): \u0394Tf =", type: "MCQ", options: ["0.186\xB0C", "0.372\xB0C", "1.86\xB0C", "3.72\xB0C"], correctAnswer: "0.372\xB0C", concept: "Colligative Properties" },
      { text: "For a first-order reaction with k=0.693 min\u207B\xB9, the half-life in minutes is:", type: "NAT", options: [], correctAnswer: "1", concept: "Chemical Kinetics" },
      { text: "In the electrochemical series, which metal is the strongest reducing agent?", type: "MCQ", options: ["Zinc", "Iron", "Lithium", "Sodium"], correctAnswer: "Lithium", concept: "Electrochemistry" },
      { text: "\u0394G = \u0394H - T\u0394S. A reaction is spontaneous at all temperatures when:", type: "MCQ", options: ["\u0394H>0, \u0394S>0", "\u0394H<0, \u0394S>0", "\u0394H<0, \u0394S<0", "\u0394H>0, \u0394S<0"], correctAnswer: "\u0394H<0, \u0394S>0", concept: "Thermodynamics" },
      { text: "The number of sigma and pi bonds in ethyne (C\u2082H\u2082) are respectively:", type: "MCQ", options: ["3\u03C3, 2\u03C0", "2\u03C3, 3\u03C0", "5\u03C3, 0\u03C0", "2\u03C3, 2\u03C0"], correctAnswer: "3\u03C3, 2\u03C0", concept: "Chemical Bonding" },
      { text: "Equilibrium constant Kp for N\u2082+3H\u2082\u21CC2NH\u2083 is related to Kc by Kp=Kc(RT)^\u0394n. Here \u0394n is:", type: "NAT", options: [], correctAnswer: "-2", concept: "Chemical Equilibrium" },
      { text: "The molarity of a solution with 40g NaOH in 500mL is:", type: "NAT", options: [], correctAnswer: "2", concept: "Solution Chemistry" }
    ]
  },
  "JEE Advanced": {
    "Physics": [
      { text: "A uniform rod of mass M, length L pivoted at one end oscillates as a physical pendulum. Its time period is T=2\u03C0\u221A(2L/3g). If L=1.5m, T is approximately:", type: "MCQ", options: ["2.0s", "1.4s", "1.0s", "2.8s"], correctAnswer: "2.0s", concept: "Physical Pendulum" },
      { text: "In YDSE, slit separation d=0.5mm, screen distance D=1m, \u03BB=500nm. If one slit is covered with a thin film (\u03BC=1.5, t=1\u03BCm), the central fringe shifts by how many fringes?", type: "NAT", options: [], correctAnswer: "1", concept: "Wave Optics" },
      { text: "Electron accelerated through 150V. de Broglie wavelength in angstroms is approximately:", type: "NAT", options: [], correctAnswer: "1", concept: "Quantum Mechanics" },
      { text: "Carnot engine: T_hot=600K, T_cold=300K, absorbs 1000J. Work output in joules is:", type: "NAT", options: [], correctAnswer: "500", concept: "Thermodynamics" },
      { text: "A solid sphere rolls down an incline of height h without slipping. Velocity at bottom is v=\u221A(10gh/7). If h=3.5m, v is approximately:", type: "NAT", options: [], correctAnswer: "7", concept: "Rolling Motion" },
      { text: "Two charges +2\u03BCC and -2\u03BCC separated by 10cm. Electric field at midpoint is (k=9\xD710\u2079):", type: "MCQ", options: ["14.4\xD710\u2076 N/C", "7.2\xD710\u2076 N/C", "28.8\xD710\u2076 N/C", "0"], correctAnswer: "14.4\xD710\u2076 N/C", concept: "Dipole Field" },
      { text: "An LC circuit has L=1mH, C=1\u03BCF. The oscillation frequency in kHz is:", type: "MCQ", options: ["5.03", "15.9", "1.59", "50.3"], correctAnswer: "5.03", concept: "LC Oscillations" },
      { text: "Photoelectric effect: \u03C6=2eV, photon energy=5eV. Maximum KE of emitted electrons is:", type: "NAT", options: [], correctAnswer: "3", concept: "Photoelectric Effect" },
      { text: "A gas undergoes adiabatic expansion. If \u03B3=1.4 and volume doubles, temperature changes by factor:", type: "MCQ", options: ["2^0.4", "1/2^0.4", "2", "1/2"], correctAnswer: "1/2^0.4", concept: "Adiabatic Process" },
      { text: "Two identical springs (k=100N/m) in parallel support a 2kg mass. Time period of vertical oscillation is:", type: "MCQ", options: ["0.2\u03C0 s", "0.1\u03C0 s", "\u03C0/5 s", "2\u03C0/5 s"], correctAnswer: "0.2\u03C0 s", concept: "SHM Springs" }
    ],
    "Chemistry": [
      { text: "For 3d orbital: n=3, l=2. The total number of radial nodes is:", type: "NAT", options: [], correctAnswer: "0", concept: "Quantum Numbers" },
      { text: "\u0394G\xB0=-nFE\xB0. For a cell with E\xB0=1.1V and n=2, \u0394G\xB0 in kJ/mol is (F=96500):", type: "MCQ", options: ["-212.3", "-106.15", "212.3", "-96.5"], correctAnswer: "-212.3", concept: "Electrochemistry" },
      { text: "A reaction A\u2192B has rate=k[A]\xB2. When [A] is doubled, rate becomes:", type: "MCQ", options: ["2 times", "4 times", "8 times", "Unchanged"], correctAnswer: "4 times", concept: "Reaction Order" },
      { text: "Crystal field splitting: [Fe(CN)\u2086]\u2074\u207B has how many unpaired electrons? (CN\u207B is strong field)", type: "NAT", options: [], correctAnswer: "0", concept: "CFT" },
      { text: "Benzaldehyde with dilute NaOH undergoes Cannizzaro. The organic acid product is:", type: "MCQ", options: ["Benzoic acid", "Acetic acid", "Formic acid", "Phenylacetic acid"], correctAnswer: "Benzoic acid", concept: "Organic Reactions" },
      { text: "The van't Hoff factor for K\u2083[Fe(CN)\u2086] is:", type: "NAT", options: [], correctAnswer: "4", concept: "Colligative Properties" },
      { text: "Optical isomers exist when a molecule has no plane of symmetry. The number of chiral centers in tartaric acid is:", type: "NAT", options: [], correctAnswer: "2", concept: "Stereochemistry" },
      { text: "2-Butanol dehydration gives predominantly:", type: "MCQ", options: ["1-Butene", "2-Butene (Saytzeff)", "Butadiene", "Isobutylene"], correctAnswer: "2-Butene (Saytzeff)", concept: "Elimination Reactions" },
      { text: "Osmotic pressure \u03C0=iCRT. A 0.1M BaCl\u2082 solution (i=3) at 300K has \u03C0 (R=0.082):", type: "MCQ", options: ["7.38 atm", "2.46 atm", "24.6 atm", "0.82 atm"], correctAnswer: "7.38 atm", concept: "Osmotic Pressure" },
      { text: "Half-life of a zero-order reaction with k=0.1 M/s and [A]\u2080=2M is:", type: "NAT", options: [], correctAnswer: "10", concept: "Zero Order Kinetics" }
    ],
    "Mathematics": [
      { text: "The area bounded by y=x\xB2 and y=x from x=0 to x=1 is:", type: "NAT", options: [], correctAnswer: "0.167", concept: "Area Between Curves" },
      { text: "A conic section has equation x\xB2/16 - y\xB2/9 = 1. Its eccentricity is:", type: "NAT", options: [], correctAnswer: "1.25", concept: "Conic Sections" },
      { text: "The shortest distance between lines r=(1,2,3)+t(1,0,-1) and r=(2,1,0)+s(0,1,1) is:", type: "MCQ", options: ["1/\u221A3", "2/\u221A3", "\u221A3", "0"], correctAnswer: "1/\u221A3", concept: "3D Geometry" },
      { text: "P(A)=0.6, P(B)=0.5, P(A\u222AB)=0.8. P(A|B) equals:", type: "MCQ", options: ["0.3", "0.5", "0.6", "0.8"], correctAnswer: "0.6", concept: "Conditional Probability" },
      { text: "The sum \u03A3(k=1 to n) k\xB3 = [n(n+1)/2]\xB2. For n=5, the sum is:", type: "NAT", options: [], correctAnswer: "225", concept: "Series Summation" },
      { text: "\u222B\u2080^(\u03C0/2) sin\xB3x dx equals:", type: "MCQ", options: ["2/3", "1/3", "4/3", "\u03C0/4"], correctAnswer: "2/3", concept: "Definite Integrals" },
      { text: "The equation of tangent to y=e\u02E3 at x=0 is:", type: "MCQ", options: ["y=x+1", "y=x", "y=x-1", "y=2x+1"], correctAnswer: "y=x+1", concept: "Application of Derivatives" },
      { text: "If f(x)=x\xB3-6x\xB2+9x+1, the number of real roots is:", type: "NAT", options: [], correctAnswer: "3", concept: "Calculus + Algebra" },
      { text: "The angle between planes 2x+y-z=3 and x-y+2z=5 is:", type: "MCQ", options: ["60\xB0", "90\xB0", "45\xB0", "30\xB0"], correctAnswer: "60\xB0", concept: "3D Geometry" },
      { text: "The matrix [[1,2],[3,4]] has eigenvalues:", type: "MCQ", options: ["(5+\u221A33)/2 and (5-\u221A33)/2", "1 and 4", "2 and 3", "0 and 5"], correctAnswer: "(5+\u221A33)/2 and (5-\u221A33)/2", concept: "Linear Algebra" }
    ]
  },
  "UPSC": {
    "History": [
      { text: "Which of the following Indus Valley sites shows evidence of a dockyard? 1.Lothal 2.Kalibangan 3.Dholavira 4.Mohenjodaro", type: "MCQ", options: ["1 only", "1 and 3", "2 and 4", "1, 2 and 3"], correctAnswer: "1 only", concept: "Ancient India" },
      { text: "Consider: 1.Cripps Mission offered Dominion status after war 2.Cabinet Mission proposed a three-tier federal structure. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both 1 and 2", "Neither"], correctAnswer: "Both 1 and 2", concept: "Modern India" },
      { text: "The Rowlatt Act of 1919 was opposed because it:", type: "MCQ", options: ["Imposed heavy taxes", "Allowed detention without trial", "Banned political parties", "Restricted press freedom only"], correctAnswer: "Allowed detention without trial", concept: "Freedom Movement" },
      { text: "Match: A.Subsidiary Alliance-Lord Wellesley B.Doctrine of Lapse-Lord Dalhousie C.Permanent Settlement-Lord Cornwallis. Correct pairs:", type: "MCQ", options: ["A and B only", "B and C only", "A, B and C", "A and C only"], correctAnswer: "A, B and C", concept: "British Policies" },
      { text: "The Simon Commission was boycotted because:", type: "MCQ", options: ["It had no Indian member", "It proposed partition", "It imposed martial law", "It dissolved Congress"], correctAnswer: "It had no Indian member", concept: "Freedom Movement" },
      { text: "Consider: 1.Gandhara art shows Greek influence 2.Mathura art is purely indigenous. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "Both", concept: "Art and Culture" },
      { text: "Arrange chronologically: 1.Quit India 2.Dandi March 3.Non-Cooperation 4.Civil Disobedience", type: "MCQ", options: ["3,2,4,1", "3,4,2,1", "2,3,4,1", "3,2,1,4"], correctAnswer: "3,2,4,1", concept: "National Movement Timeline" },
      { text: "The Charter Act of 1833 made the Governor-General of Bengal the Governor-General of:", type: "MCQ", options: ["Bengal Presidency", "Madras and Bombay", "India", "British territories only"], correctAnswer: "India", concept: "Constitutional History" },
      { text: "Which Mughal emperor abolished Jizya tax?", type: "MCQ", options: ["Babur", "Humayun", "Akbar", "Shah Jahan"], correctAnswer: "Akbar", concept: "Medieval India" },
      { text: "The Vernacular Press Act was passed during the Viceroyalty of:", type: "MCQ", options: ["Lord Lytton", "Lord Ripon", "Lord Curzon", "Lord Dufferin"], correctAnswer: "Lord Lytton", concept: "British India Press" }
    ],
    "Geography": [
      { text: "Consider: 1.Western Ghats are older than Himalayas 2.Eastern Ghats are continuous mountain range. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "1 only", concept: "Indian Physiography" },
      { text: "The Tropic of Cancer does NOT pass through:", type: "MCQ", options: ["Rajasthan", "Madhya Pradesh", "Bihar", "Jharkhand"], correctAnswer: "Bihar", concept: "Indian Geography" },
      { text: "Arrange rivers by length (longest first): 1.Ganga 2.Godavari 3.Krishna 4.Narmada", type: "MCQ", options: ["1,2,3,4", "1,2,4,3", "2,1,3,4", "1,3,2,4"], correctAnswer: "1,2,3,4", concept: "Indian Rivers" },
      { text: "Jet streams affect Indian monsoon because they:", type: "MCQ", options: ["Bring moisture from ocean", "Shift the position of ITCZ", "Create cyclonic conditions", "Cool the upper atmosphere only"], correctAnswer: "Shift the position of ITCZ", concept: "Monsoon Mechanism" },
      { text: "Which soil type is self-ploughing due to its expansion and contraction?", type: "MCQ", options: ["Alluvial", "Black (Regur)", "Laterite", "Red"], correctAnswer: "Black (Regur)", concept: "Indian Soils" },
      { text: "Consider: 1.Earthquakes occur at plate boundaries 2.India lies entirely on the Indo-Australian plate. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "Both", concept: "Plate Tectonics" },
      { text: "The 180\xB0 meridian mostly coincides with the:", type: "MCQ", options: ["Prime Meridian", "International Date Line", "Equator", "Tropic of Capricorn"], correctAnswer: "International Date Line", concept: "World Geography" },
      { text: "Western disturbances bring winter rainfall to which part of India?", type: "MCQ", options: ["South India", "North-West India", "North-East India", "Central India"], correctAnswer: "North-West India", concept: "Indian Climate" },
      { text: "Mangrove forests in India are most extensive in:", type: "MCQ", options: ["Kerala coast", "Sundarbans", "Gulf of Kutch", "Andaman Islands"], correctAnswer: "Sundarbans", concept: "Indian Vegetation" },
      { text: "El Ni\xF1o weakens the Indian monsoon because:", type: "MCQ", options: ["It cools the Indian Ocean", "It warms eastern Pacific, reducing pressure gradient", "It increases Himalayan snowfall", "It blocks jet streams"], correctAnswer: "It warms eastern Pacific, reducing pressure gradient", concept: "Climate Phenomena" }
    ],
    "Polity": [
      { text: "Consider: 1.Article 14 guarantees equality before law 2.Article 19 gives 6 freedoms to all persons. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "1 only", concept: "Fundamental Rights" },
      { text: "A Money Bill can be introduced in:", type: "MCQ", options: ["Lok Sabha only", "Rajya Sabha only", "Either House", "Joint session"], correctAnswer: "Lok Sabha only", concept: "Legislative Process" },
      { text: "The 42nd Amendment is called 'Mini Constitution' because it:", type: "MCQ", options: ["Added Fundamental Duties", "Changed Preamble wording", "Made extensive changes to multiple parts", "All of the above"], correctAnswer: "All of the above", concept: "Constitutional Amendments" },
      { text: "Which writ is issued to a person holding public office illegally?", type: "MCQ", options: ["Habeas Corpus", "Mandamus", "Quo Warranto", "Certiorari"], correctAnswer: "Quo Warranto", concept: "Writs" },
      { text: "Rajya Sabha can delay a Money Bill for a maximum of:", type: "MCQ", options: ["30 days", "14 days", "6 months", "No delay possible"], correctAnswer: "14 days", concept: "Financial Legislation" },
      { text: "The concept of 'Basic Structure' of Constitution was established in:", type: "MCQ", options: ["Golaknath case", "Kesavananda Bharati case", "Minerva Mills case", "Maneka Gandhi case"], correctAnswer: "Kesavananda Bharati case", concept: "Judicial Doctrine" },
      { text: "The 73rd Amendment requires reservation of how many seats for women in Panchayats?", type: "MCQ", options: ["25%", "33%", "50%", "No reservation"], correctAnswer: "33%", concept: "Local Governance" },
      { text: "Which Schedule contains the anti-defection provisions?", type: "MCQ", options: ["8th Schedule", "9th Schedule", "10th Schedule", "11th Schedule"], correctAnswer: "10th Schedule", concept: "Anti-Defection" },
      { text: "The President can proclaim Financial Emergency under Article:", type: "NAT", options: [], correctAnswer: "360", concept: "Emergency Powers" },
      { text: "Inter-state disputes regarding water are adjudicated by:", type: "MCQ", options: ["Supreme Court", "High Court", "Inter-State Water Tribunal", "Parliament"], correctAnswer: "Inter-State Water Tribunal", concept: "Federal Relations" }
    ],
    "Economy": [
      { text: "If CRR is increased by RBI, the effect on money supply is:", type: "MCQ", options: ["Increases", "Decreases", "No change", "Becomes zero"], correctAnswer: "Decreases", concept: "Monetary Policy" },
      { text: "Consider: 1.Revenue deficit = Revenue expenditure - Revenue receipts 2.Fiscal deficit includes borrowings. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "Both", concept: "Public Finance" },
      { text: "GDP deflator = (Nominal GDP/Real GDP)\xD7100. If nominal GDP=200 and real GDP=160, inflation measured by deflator is:", type: "NAT", options: [], correctAnswer: "25", concept: "National Income" },
      { text: "GST is a destination-based tax. This means tax revenue goes to:", type: "MCQ", options: ["State where goods are manufactured", "State where goods are consumed", "Central government only", "Equally to both states"], correctAnswer: "State where goods are consumed", concept: "Taxation" },
      { text: "Consider: 1.SLR is maintained with RBI 2.CRR is maintained as liquid assets by banks. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither (both are reversed)"], correctAnswer: "Neither (both are reversed)", concept: "Banking Ratios" },
      { text: "If marginal propensity to consume is 0.8, the fiscal multiplier is:", type: "NAT", options: [], correctAnswer: "5", concept: "Keynesian Economics" },
      { text: "Which of the following is NOT a function of SEBI?", type: "MCQ", options: ["Regulate stock exchanges", "Protect investor interests", "Control inflation", "Prohibit insider trading"], correctAnswer: "Control inflation", concept: "Capital Markets" },
      { text: "The Phillips curve shows an inverse relationship between:", type: "MCQ", options: ["GDP and inflation", "Unemployment and inflation", "Interest rate and investment", "Savings and consumption"], correctAnswer: "Unemployment and inflation", concept: "Macroeconomics" },
      { text: "Current Account Deficit includes: 1.Trade deficit 2.Net invisibles 3.Capital transfers. Select correct:", type: "MCQ", options: ["1 only", "1 and 2", "1, 2 and 3", "2 and 3"], correctAnswer: "1 and 2", concept: "External Sector" },
      { text: "The base effect in inflation means that:", type: "MCQ", options: ["Higher base year lowers current inflation rate", "Lower base year lowers inflation", "Base year has no effect", "It only affects WPI"], correctAnswer: "Higher base year lowers current inflation rate", concept: "Inflation Analysis" }
    ],
    "Science and Technology": [
      { text: "Consider: 1.Chandrayaan-3 landed near the lunar south pole 2.ISRO used a cryogenic upper stage for GSLV. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "Both", concept: "Space Technology" },
      { text: "CRISPR-Cas9 edits DNA by:", type: "MCQ", options: ["Adding new chromosomes", "Cutting DNA at specific sequences", "Changing RNA only", "Inserting plasmids randomly"], correctAnswer: "Cutting DNA at specific sequences", concept: "Gene Editing" },
      { text: "Quantum computing uses qubits which can be in superposition. This means:", type: "MCQ", options: ["They are faster classical bits", "They can be 0 and 1 simultaneously", "They use quantum tunneling only", "They operate at room temperature"], correctAnswer: "They can be 0 and 1 simultaneously", concept: "Quantum Technology" },
      { text: "Consider: 1.mRNA vaccines use weakened virus 2.mRNA vaccines instruct cells to produce spike protein. Which is/are correct?", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "2 only", concept: "Vaccine Technology" },
      { text: "Blockchain ensures data integrity through:", type: "MCQ", options: ["Central server validation", "Cryptographic hashing and consensus", "Firewall protection", "Password encryption only"], correctAnswer: "Cryptographic hashing and consensus", concept: "Information Technology" },
      { text: "Nuclear fusion is preferred over fission because: 1.No radioactive waste 2.Fuel (hydrogen) is abundant. Select correct:", type: "MCQ", options: ["1 only", "2 only", "Both", "Neither"], correctAnswer: "2 only", concept: "Nuclear Energy" },
      { text: "The GPS system requires a minimum of how many satellites for 3D positioning?", type: "NAT", options: [], correctAnswer: "4", concept: "Navigation Technology" },
      { text: "India's NavIC navigation system covers which region?", type: "MCQ", options: ["Global coverage", "India and 1500km beyond borders", "Asia only", "Northern hemisphere"], correctAnswer: "India and 1500km beyond borders", concept: "Indian Space Tech" },
      { text: "5G's key advantage over 4G is:", type: "MCQ", options: ["Higher frequency only", "Low latency and higher bandwidth", "Longer range", "Lower power consumption only"], correctAnswer: "Low latency and higher bandwidth", concept: "Telecom Technology" },
      { text: "Green hydrogen is produced by:", type: "MCQ", options: ["Steam methane reforming", "Electrolysis using renewable energy", "Coal gasification", "Nuclear power"], correctAnswer: "Electrolysis using renewable energy", concept: "Clean Energy" }
    ]
  }
};
function pickRandomPYQs(examName, topic, count = 8) {
  const examBank = PYQ_BANK[examName];
  if (!examBank) return [];
  const topicBank = examBank[topic];
  if (!topicBank || topicBank.length === 0) return [];
  const shuffled = [...topicBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
function buildParaphrasePrompt(questions, examName, topic) {
  const qList = questions.map((q, i) => {
    const opts = q.options.length > 0 ? `
Options: ${q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join(" | ")}` : " [NAT \u2014 numerical answer]";
    return `Q${i + 1}. ${q.text}${opts}
Correct Answer: ${q.correctAnswer}
Concept: ${q.concept}`;
  }).join("\n\n");
  return `You are an expert ${examName} question paraphraser for the topic "${topic}".

TASK: Paraphrase each question below. Follow these rules STRICTLY:

FOR MCQ QUESTIONS:
- Rewrite the question text using different words but SAME concept
- Rewrite ALL options using different wording but keep the meaning
- The correct answer must map to the SAME reworded option
- Shuffle the order of options randomly

FOR NAT (Numerical) QUESTIONS:
- Change the numerical values in the question (different numbers)
- Recalculate the correct answer based on new values
- Show your calculation in "reasoning"

FOR ALL QUESTIONS:
- Keep the same difficulty level
- Keep the same concept tag
- Keep the same question type (MCQ/NAT)
- The question must still be about "${topic}" for "${examName}"
- Add "reasoning" field with 2-3 sentence explanation

ORIGINAL QUESTIONS:
${qList}

Return ONLY a valid JSON array:
[{"text":"paraphrased question","type":"MCQ","options":["opt1","opt2","opt3","opt4"],"correctAnswer":"correct option text","reasoning":"brief explanation","marks":2,"negativeMarks":0.67,"concept":"same concept"},...]`;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))
  ]);
}
function parseQuestions(response) {
  if (!response) return null;
  let cleaned = response.replace(/```json/gi, "").replace(/```/g, "").trim();
  if (cleaned.startsWith("{")) {
    try {
      const obj = JSON.parse(cleaned);
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) {
          cleaned = JSON.stringify(obj[key]);
          break;
        }
      }
    } catch (_) {
    }
  }
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((q) => {
      if (!q.text || q.text.length < 20) return false;
      if (!Array.isArray(q.options) || q.options.length < 2) return false;
      q.options = q.options.map((o) => {
        if (typeof o !== "string") return "";
        return o.replace(/^[A-Da-d][.):\s]+/, "").trim();
      });
      const badOption = q.options.some((o) => {
        if (!o || o.length === 0) return true;
        if (/^option\s*\d*$/i.test(o)) return true;
        return false;
      });
      if (badOption) {
        console.error("[QParse] Rejected bad options:", q.text.substring(0, 50), q.options);
        return false;
      }
      if (q.type === "MCQ") {
        if (typeof q.correctAnswer === "string") {
          let ca = q.correctAnswer.replace(/^[A-Da-d][.):\s]+/, "").trim();
          if (/^[A-Da-d]$/.test(ca)) {
            const idx = ca.toUpperCase().charCodeAt(0) - 65;
            if (q.options[idx]) ca = q.options[idx];
          }
          if (!q.options.includes(ca)) {
            const ci = q.options.find((o) => o.toLowerCase() === ca.toLowerCase());
            if (ci) ca = ci;
          }
          q.correctAnswer = ca;
        }
      } else if (q.type === "MSQ") {
        if (Array.isArray(q.correctAnswer)) {
          q.correctAnswer = q.correctAnswer.map((ca) => {
            if (typeof ca !== "string") return ca;
            let s = ca.replace(/^[A-Da-d][.):\s]+/, "").trim();
            if (/^[A-Da-d]$/.test(s)) {
              const idx = s.toUpperCase().charCodeAt(0) - 65;
              if (q.options[idx]) s = q.options[idx];
            }
            const ci = q.options.find((o) => o.toLowerCase() === s.toLowerCase());
            return ci || s;
          });
        }
      }
      delete q.reasoning;
      return true;
    });
  } catch (e) {
    return null;
  }
}
async function verifyQuestions(questions, campaign = {}) {
  if (!questions || questions.length === 0) return questions;
  const qList = questions.map((q, i) => {
    if (q.type === "MCQ") {
      const opts = q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join(" | ");
      return `Q${i + 1} [MCQ] ${q.text}
Options: ${opts}`;
    } else if (q.type === "MSQ") {
      const opts = q.options.map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`).join(" | ");
      return `Q${i + 1} [MSQ \u2014 select ALL correct] ${q.text}
Options: ${opts}`;
    } else {
      return `Q${i + 1} [NAT \u2014 numerical] ${q.text}`;
    }
  }).join("\n\n");
  const examLabel = campaign.examName || "competitive exam";
  const topicLabel = campaign.topic || "the given subject";
  const subjectInfo = getSubjectKnowledge(topicLabel);
  const isDBAMS = topicLabel.toLowerCase().includes("dbms") || topicLabel.toLowerCase().includes("database") || subjectInfo.domain === "DBMS";
  const dbmsVerifyRules = isDBAMS ? `
NORMALIZATION \u2014 MANDATORY ALGORITHM (apply to EVERY normalization question):
Step 1 \u2014 Find ALL candidate keys by computing closures.
Step 2 \u2014 Identify prime and non-prime attributes.
Step 3 \u2014 Check 2NF: partial dependencies on candidate key?
Step 4 \u2014 Check 3NF: transitive dependencies (non-prime \u2192 non-prime)?
Step 5 \u2014 Check BCNF: every determinant must be a superkey.
CRITICAL: Single-attribute CK \u2192 2NF auto-satisfied, but 3NF can still be violated.

CONCURRENCY/TRANSACTIONS:
- Conflict serializable = serial schedule via swapping non-conflicting ops.
- Recoverable = Tj reads from Ti \u2192 Tj commits after Ti.
- 2PL: shared lock allows concurrent reads; exclusive requires no other locks.

SQL:
- AND = both conditions simultaneously. OR = at least one.
- \u03C3 (selection) \u2261 WHERE clause.

FUNCTIONAL DEPENDENCIES:
- X\u2192Y: for each X value, exactly one Y value.
- X\u2192Y does NOT imply Y\u2192X.` : "";
  const verifyPrompt = `You are a ${examLabel} examiner and subject matter expert in "${topicLabel}" (${subjectInfo.domain}).

Solve each question INDEPENDENTLY from scratch. The stated answer may be WRONG \u2014 your job is to find the TRUE correct answer.

MANDATORY SOLVING PROCESS per question:
1. Identify the concept being tested.
2. Show your working in "reasoning" (3-5 sentences minimum).
3. Arrive at the answer from first principles.
4. Return the exact option text \u2014 never a letter.
${dbmsVerifyRules}

IMPORTANT: You are verifying questions about "${topicLabel}" for the "${examLabel}" exam. ALL questions MUST be about this subject domain. If a question appears to be about a completely different subject, flag it in your reasoning.

QUESTIONS:
${qList}

Return ONLY a JSON array \u2014 no preamble, no trailing text, no markdown fences:
[{"q":1,"answer":"full option text or number","reasoning":"3-5 sentence working showing how you arrived at this answer"},...]`;
  try {
    console.log("[Verify] Starting answer verification for", questions.length, "questions...");
    const verifyResponse = await withTimeout(callAI(verifyPrompt), 12e4);
    let vCleaned = verifyResponse.replace(/```json/gi, "").replace(/```/g, "").trim();
    if (vCleaned.startsWith("{")) {
      try {
        const obj = JSON.parse(vCleaned);
        for (const key of Object.keys(obj)) {
          if (Array.isArray(obj[key])) {
            vCleaned = JSON.stringify(obj[key]);
            break;
          }
        }
      } catch (_) {
      }
    }
    const match = vCleaned.match(/\[[\s\S]*\]/);
    if (!match) {
      console.log("[Verify] Could not parse verification response, keeping all questions");
      return questions;
    }
    const verified = JSON.parse(match[0]);
    let kept = 0, fixed = 0, dropped = 0;
    const result = questions.map((q, i) => {
      const v = verified.find((a) => a.q === i + 1);
      if (!v) {
        kept++;
        return q;
      }
      const vAnswer = v.answer;
      if (q.type === "MCQ") {
        const origNorm = (q.correctAnswer || "").toLowerCase().trim();
        const verifyNorm = (vAnswer || "").toLowerCase().trim();
        if (origNorm === verifyNorm) {
          kept++;
          return q;
        }
        const exactMatch = q.options.find((o) => o.toLowerCase().trim() === verifyNorm);
        if (exactMatch) {
          console.log(`[Verify] FIXED MCQ Q${i + 1}: "${q.correctAnswer}" \u2192 "${exactMatch}" | ${v.reasoning || ""}`);
          fixed++;
          return { ...q, correctAnswer: exactMatch };
        }
        const partialMatch = q.options.find(
          (o) => o.toLowerCase().includes(verifyNorm) || verifyNorm.includes(o.toLowerCase().trim())
        );
        if (partialMatch) {
          console.log(`[Verify] FIXED MCQ Q${i + 1} (partial): "${q.correctAnswer}" \u2192 "${partialMatch}" | ${v.reasoning || ""}`);
          fixed++;
          return { ...q, correctAnswer: partialMatch };
        }
        console.log(`[Verify] DROPPED MCQ Q${i + 1}: orig="${origNorm}", verify="${verifyNorm}" \u2014 conflict, no match in options`);
        dropped++;
        return null;
      } else if (q.type === "MSQ") {
        const origArr = Array.isArray(q.correctAnswer) ? q.correctAnswer.map((a) => a.toLowerCase().trim()).sort() : [];
        let verifyArr = [];
        if (Array.isArray(vAnswer)) {
          verifyArr = vAnswer.map((a) => String(a).trim().toLowerCase()).sort();
        } else if (typeof vAnswer === "string") {
          verifyArr = vAnswer.split(",").map((a) => a.trim().toLowerCase()).sort();
        }
        if (JSON.stringify(origArr) === JSON.stringify(verifyArr)) {
          kept++;
          return q;
        }
        const fixedAnswers = verifyArr.map((va) => {
          const exact = q.options.find((o) => o.toLowerCase().trim() === va);
          if (exact) return exact;
          const partial = q.options.find((o) => o.toLowerCase().includes(va) || va.includes(o.toLowerCase().trim()));
          return partial || null;
        }).filter(Boolean);
        const uniqueFixed = [...new Set(fixedAnswers)];
        if (uniqueFixed.length < origArr.length) {
          console.log(`[Verify] KEPT MSQ Q${i + 1}: verifier returned ${uniqueFixed.length} answers but original had ${origArr.length} \u2014 keeping original`);
          kept++;
          return q;
        }
        if (uniqueFixed.length >= 1) {
          console.log(`[Verify] FIXED MSQ Q${i + 1}: ${JSON.stringify(q.correctAnswer)} \u2192 ${JSON.stringify(uniqueFixed)} | ${v.reasoning || ""}`);
          fixed++;
          return { ...q, correctAnswer: uniqueFixed };
        }
        console.log(`[Verify] DROPPED MSQ Q${i + 1}: answers conflict, cannot map verifier answers to options`);
        dropped++;
        return null;
      } else if (q.type === "NAT") {
        const origNum = parseFloat(q.correctAnswer);
        const verifyNum = parseFloat(vAnswer);
        if (!isNaN(origNum) && !isNaN(verifyNum)) {
          const pctDiff = origNum !== 0 ? Math.abs(origNum - verifyNum) / Math.abs(origNum) : Math.abs(origNum - verifyNum);
          if (pctDiff < 0.01) {
            kept++;
            return q;
          }
          console.log(`[Verify] FIXED NAT Q${i + 1}: ${q.correctAnswer} \u2192 ${verifyNum} | ${v.reasoning || ""}`);
          fixed++;
          return { ...q, correctAnswer: String(verifyNum) };
        }
        kept++;
        return q;
      }
      kept++;
      return q;
    }).filter(Boolean);
    console.log(`[Verify] Results: ${kept} kept, ${fixed} fixed, ${dropped} dropped. Final: ${result.length} questions.`);
    return result;
  } catch (e) {
    console.error("[Verify] Verification failed:", e.message, "\u2014 keeping original questions");
    return questions;
  }
}
async function generateQuestions(campaign, weakConcepts, previousQuestions, uniqueSeed = "", globalPoolQuestions = []) {
  const subjectInfo = getSubjectKnowledge(campaign.topic);
  const { domain, subtopic, concepts, questionStarters, exampleQuestion, forbiddenContent } = subjectInfo;
  const weakStr = weakConcepts.length > 0 ? `Student weak areas to focus on: ${weakConcepts.join(", ")}.` : "";
  const allPreviousTexts = /* @__PURE__ */ new Set();
  const avoidList = [];
  for (const q of [...previousQuestions, ...globalPoolQuestions]) {
    const key = (q.text || "").substring(0, 100);
    if (!allPreviousTexts.has(key)) {
      allPreviousTexts.add(key);
      avoidList.push(q);
    }
  }
  const conceptGroups = {};
  for (const q of avoidList.slice(0, 40)) {
    const c = q.concept || "General";
    if (!conceptGroups[c]) conceptGroups[c] = [];
    conceptGroups[c].push(q.text.substring(0, 90));
  }
  const prevStr = Object.keys(conceptGroups).length > 0 ? `PREVIOUSLY USED QUESTIONS \u2014 DO NOT reuse these scenarios or rephrase them:
` + Object.entries(conceptGroups).map(([concept, texts]) => `[${concept}]:
${texts.map((t) => "  - " + t).join("\n")}`).join("\n") : "";
  const coveredConcepts = new Set(avoidList.map((q) => q.concept).filter(Boolean));
  const shuffledConcepts = [...concepts].sort(() => Math.random() - 0.5);
  const freshConcepts = shuffledConcepts.filter((c) => !coveredConcepts.has(c));
  const selectedConcepts = (freshConcepts.length >= 4 ? freshConcepts : shuffledConcepts).slice(0, Math.min(15, concepts.length));
  if (questionStarters && questionStarters.length > 0) {
    [...questionStarters].sort(() => Math.random() - 0.5).slice(0, 4);
  }
  if (exampleQuestion) {
    `
EXAMPLE (do NOT copy \u2014 for format reference only):
{"text": "${exampleQuestion.text}", "type": "${exampleQuestion.type}", "options": ${JSON.stringify(exampleQuestion.options)}, "correctAnswer": ${JSON.stringify(exampleQuestion.correctAnswer)}, "marks": ${exampleQuestion.marks}, "negativeMarks": ${exampleQuestion.negativeMarks}, "concept": "${exampleQuestion.concept}"}`;
  }
  const dbmsConceptPool = [
    "Normalization (1NF)",
    "Normalization (2NF)",
    "Normalization (3NF)",
    "Normalization (BCNF)",
    "Functional Dependencies",
    "Candidate Keys",
    "Armstrong Axioms",
    "SQL SELECT with WHERE",
    "SQL JOIN (INNER)",
    "SQL JOIN (LEFT/RIGHT)",
    "SQL GROUP BY and HAVING",
    "SQL Aggregate Functions",
    "SQL Subqueries",
    "SQL IN and EXISTS",
    "Relational Algebra (Selection)",
    "Relational Algebra (Projection)",
    "Relational Algebra (Join)",
    "Conflict Serializability",
    "View Serializability",
    "Recoverable Schedules",
    "Cascadeless Schedules",
    "Two-Phase Locking (2PL)",
    "Deadlock in DBMS",
    "B+ Tree Indexing",
    "Hash Indexing",
    "Dense vs Sparse Index",
    "ER Model (Entities and Attributes)",
    "ER Model (Relationships and Cardinality)",
    "Weak Entities",
    "Participation Constraints",
    "ACID Properties",
    "Transaction States",
    "Lossless Join Decomposition",
    "Dependency Preservation",
    "Query Optimization",
    "Query Processing Pipeline",
    "File Organization (Heap, Sequential, Hash)",
    "Bitmap Index",
    "Clustered vs Unclustered Index",
    "Concurrency Control (Timestamp Ordering)",
    "Log-Based Recovery",
    "Checkpointing",
    "Stored Procedures",
    "Triggers",
    "Views",
    "SQL NULL handling",
    "SQL DISTINCT and ORDER BY"
  ];
  const relationSchemas = [
    { attrs: "P, Q, R, S", fds: "P\u2192Q, Q\u2192R, R\u2192S", hint: "chain FDs" },
    { attrs: "X, Y, Z", fds: "XY\u2192Z, Z\u2192X", hint: "composite key scenario" },
    { attrs: "E, F, G, H", fds: "E\u2192F, EF\u2192G, G\u2192H", hint: "multi-step closure" },
    { attrs: "M, N, O", fds: "MN\u2192O, O\u2192M", hint: "overlapping keys" },
    { attrs: "A, B, C, D, E", fds: "AB\u2192C, C\u2192D, D\u2192E, E\u2192B", hint: "cycle in FDs" },
    { attrs: "StudentID, CourseID, Grade, InstructorID, Room", fds: "StudentID CourseID\u2192Grade, CourseID\u2192InstructorID, InstructorID\u2192Room", hint: "real-world university schema" },
    { attrs: "OrderID, ProductID, Qty, Price, CustomerID, City", fds: "OrderID ProductID\u2192Qty, ProductID\u2192Price, OrderID\u2192CustomerID, CustomerID\u2192City", hint: "e-commerce schema" },
    { attrs: "EmpID, DeptID, DeptName, ManagerID, Salary", fds: "EmpID\u2192DeptID Salary, DeptID\u2192DeptName ManagerID", hint: "HR schema" },
    { attrs: "BookID, AuthorID, AuthorName, PublisherID, PublisherCity", fds: "BookID\u2192AuthorID PublisherID, AuthorID\u2192AuthorName, PublisherID\u2192PublisherCity", hint: "library schema" },
    { attrs: "FlightNo, Date, SeatNo, PassengerID, Gate", fds: "FlightNo Date\u2192Gate, FlightNo Date SeatNo\u2192PassengerID", hint: "airline schema" }
  ];
  const sqlContexts = [
    { table: "Employees", cols: "EmpID, Name, Dept, Salary, JoinDate", sample: 'WHERE Dept = "HR" AND Salary > 50000' },
    { table: "Orders", cols: "OrderID, CustomerID, Product, Amount, OrderDate", sample: 'WHERE Amount > 1000 AND OrderDate > "2023-01-01"' },
    { table: "Students", cols: "StudentID, Name, Course, Marks, Year", sample: "WHERE Marks >= 60 AND Year = 3" },
    { table: "Products", cols: "ProductID, Name, Category, Price, Stock", sample: 'WHERE Category = "Electronics" AND Price < 500' },
    { table: "Flights", cols: "FlightNo, Origin, Destination, Seats, Price", sample: 'WHERE Origin = "DEL" AND Seats > 0' },
    { table: "Transactions", cols: "TxnID, AccountID, Amount, Type, TxnDate", sample: 'WHERE Type = "Credit" AND Amount > 10000' },
    { table: "Patients", cols: "PatientID, Name, Disease, Doctor, AdmitDate", sample: 'WHERE Disease = "Diabetes" AND AdmitDate > "2024-01-01"' }
  ];
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const pickedSchemas = shuffle(relationSchemas).slice(0, 4);
  const pickedSqlCtx = shuffle(sqlContexts).slice(0, 3);
  const isDBAMS = campaign.topic.toLowerCase().includes("dbms") || campaign.topic.toLowerCase().includes("database") || domain === "DBMS";
  let conceptSlots;
  if (isDBAMS) {
    const poolShuffled = shuffle(dbmsConceptPool);
    const alreadyUsed = new Set(avoidList.map((q) => q.concept).filter(Boolean));
    const fresh = poolShuffled.filter((c) => !alreadyUsed.has(c));
    const fallback = poolShuffled.filter((c) => alreadyUsed.has(c));
    conceptSlots = [...fresh, ...fallback].slice(0, 15);
  } else {
    const all = shuffle([...selectedConcepts, ...concepts]);
    const seen = /* @__PURE__ */ new Set();
    conceptSlots = all.filter((c) => {
      if (seen.has(c)) return false;
      seen.add(c);
      return true;
    }).slice(0, 15);
  }
  const bloomLevels = [
    "Remember",
    // Q1  — recall facts, definitions
    "Understand",
    // Q2  — explain concepts, summarize
    "Apply",
    // Q3  — use knowledge in new situations
    "Analyze",
    // Q4  — compare, differentiate, break down
    "Remember",
    // Q5
    "Apply",
    // Q6
    "Understand",
    // Q7
    "Apply",
    // Q8
    "Apply",
    // Q9  (NAT — typically calculation/application)
    "Analyze",
    // Q10 (NAT)
    "Evaluate",
    // Q11 (NAT — justify, assess)
    "Analyze",
    // Q12 (NAT)
    "Understand",
    // Q13 (MSQ — multiple correct = deeper understanding)
    "Create",
    // Q14 (MSQ — design/construct scenarios)
    "Remember"
    // Q15 (MSQ)
  ];
  const questionAssignments = conceptSlots.map((concept, i) => {
    const type = i < 8 ? "MCQ" : i < 12 ? "NAT" : "MSQ";
    const bloom = bloomLevels[i] || "Apply";
    return `Q${i + 1} [${type}] \u2192 concept: "${concept}" | Bloom's level: ${bloom}`;
  }).join("\n");
  const schemaHints = pickedSchemas.map(
    (s, i) => `Normalization scenario ${i + 1}: R(${s.attrs}) with FDs: ${s.fds}`
  ).join("\n");
  const sqlHints = pickedSqlCtx.map(
    (s, i) => `SQL scenario ${i + 1}: table ${s.table}(${s.cols})`
  ).join("\n");
  let domainRules = "";
  if (isDBAMS) {
    domainRules = `
VARIETY CONSTRAINTS \u2014 STRICTLY ENFORCED:
- For normalization questions, use ONLY the schemas provided below \u2014 do NOT invent R(A,B,C) with A\u2192B,B\u2192C.
- For SQL questions, use ONLY the table contexts provided below.
- Use REAL-WORLD attribute names (StudentID, CourseID, Salary, etc.).

NORMALIZATION SCHEMAS TO USE:
${schemaHints}

SQL TABLE CONTEXTS TO USE:
${sqlHints}

NORMALIZATION RULES:
- Single-attribute CK \u2192 2NF is automatically satisfied.
- Check 3NF: if any non-prime X\u2192Y where X is not a superkey \u2192 3NF VIOLATED.
- BCNF: every determinant must be a superkey.
- NEVER conclude 3NF or BCNF without checking transitive dependencies.

CONCURRENCY RULES:
- Conflict serializable = serial schedule by swapping NON-CONFLICTING ops.
- Recoverable = Tj reads from Ti \u2192 Tj commits AFTER Ti.

SQL RULES:
- AND = both conditions simultaneously. OR = at least one.
- Trace query on sample rows in reasoning.`;
  } else {
    domainRules = `
VARIETY CONSTRAINTS \u2014 STRICTLY ENFORCED:
- Each question MUST test a DIFFERENT scenario.
- NEVER generate questions about DBMS, SQL, normalization, databases, B+ trees, or any computer science topic unless "${campaign.topic}" IS a computer science topic.
- ALL 15 questions MUST be strictly about "${campaign.topic}" for the "${campaign.examName}" exam.
- Use real-world, factual scenarios relevant to the subject domain.
- Questions should match the style and difficulty of actual "${campaign.examName}" exam papers.`;
  }
  const prompt = `You are a senior ${campaign.examName} exam paper setter and subject matter expert in "${campaign.topic}" (${domain}).

TASK: Generate exactly 15 exam questions about "${campaign.topic}" ONLY. Each question's concept AND Bloom's Taxonomy cognitive level are PRE-ASSIGNED below \u2014 you MUST follow these assignments exactly.

BLOOM'S TAXONOMY GUIDE (match the cognitive level for each question):
- Remember: Test recall of facts, definitions, terms. Use "Which of the following is...", "Define...", "State...".
- Understand: Test comprehension. Use "Explain why...", "What is the significance of...", "Summarize...".
- Apply: Test application to new situations. Use "Calculate...", "Given the following, solve...", "Using X, determine...".
- Analyze: Test comparison and breakdown. Use "Compare...", "Differentiate between...", "What would happen if...".
- Evaluate: Test judgement and critique. Use "Which approach is better and why...", "Justify...", "Assess...".
- Create: Test design and construction. Use "Design a...", "Propose a solution for...", "Construct...".

QUESTION ASSIGNMENTS (concept AND Bloom's level are mandatory for each slot):
${questionAssignments}
${domainRules}

MANDATORY SOLVING PROCESS for every question:
1. Draft the question using the pre-assigned concept AND matching the assigned Bloom's Taxonomy level.
2. In "reasoning": solve step-by-step (3-5 sentences).
3. Set correctAnswer ONLY after completing reasoning.
4. Create distractors that are plausible but wrong.

CRITICAL:
- correctAnswer MUST exactly match one option text (MCQ) or a subset (MSQ).
- Options must be full descriptive text \u2014 NEVER bare letters.
- NEVER guess. If uncertain about a concept slot, pick the closest concept you know well.
- ALL questions MUST be about "${campaign.topic}" \u2014 generating questions on a different subject is a FAILURE.
- Each question MUST match its assigned Bloom's Taxonomy level \u2014 a "Remember" slot should NOT ask for analysis, and an "Analyze" slot should NOT ask for simple recall.

${weakStr}
${prevStr}
Difficulty: ${campaign.difficulty || "Medium"}

Mix is fixed: Q1-Q8 are MCQ (4 options, 1 correct), Q9-Q12 are NAT (options=[], numerical), Q13-Q15 are MSQ (4 options, 2-3 correct array).

Return ONLY a valid JSON array, no text before or after:
[
  {"text":"...","type":"MCQ","options":["...","...","...","..."],"correctAnswer":"...","reasoning":"step-by-step...","marks":2,"negativeMarks":0.67,"concept":"..."},
  {"text":"...","type":"NAT","options":[],"correctAnswer":"42","reasoning":"Calculation: ...","marks":2,"negativeMarks":0,"concept":"..."},
  {"text":"...","type":"MSQ","options":["...","...","...","..."],"correctAnswer":["...","..."],"reasoning":"opt1 correct because... opt3 wrong because...","marks":2,"negativeMarks":0.67,"concept":"..."}
]`;
  try {
    console.log("[AI] Sending prompt for topic:", campaign.topic);
    const response = await withTimeout(callAI(prompt), 3e5);
    console.log("[AI] Raw response length:", response?.length, "First 200 chars:", response?.substring(0, 200));
    let questions = parseQuestions(response);
    console.log("[AI] Parsed questions count:", questions?.length || 0);
    if (questions && forbiddenContent.length > 0) {
      const filtered = questions.filter((q) => {
        const textLower = q.text.toLowerCase();
        return !forbiddenContent.some((term) => textLower.includes(term.toLowerCase()));
      });
      console.log("[AI] After forbidden-content filter:", filtered.length, "of", questions.length, "passed");
      questions = filtered.length >= 3 ? filtered : questions;
    }
    const pyqOriginals = pickRandomPYQs(campaign.examName, campaign.topic, 8);
    let paraphrasedPYQs = [];
    if (pyqOriginals.length > 0) {
      try {
        console.log("[PYQ] Paraphrasing", pyqOriginals.length, "PYQs for", campaign.examName, "-", campaign.topic);
        const paraphrasePrompt = buildParaphrasePrompt(pyqOriginals, campaign.examName, campaign.topic);
        const pyqResponse = await withTimeout(callAI(paraphrasePrompt), 2e4);
        const parsed = parseQuestions(pyqResponse);
        if (parsed && parsed.length > 0) {
          paraphrasedPYQs = parsed;
          console.log("[PYQ] Successfully paraphrased", paraphrasedPYQs.length, "questions");
        }
      } catch (pyqErr) {
        console.error("[PYQ] Paraphrasing failed:", pyqErr.message, "\u2014 using AI-only questions");
      }
    }
    if (paraphrasedPYQs.length > 0 && questions && questions.length > 0) {
      const aiSlice = questions.slice(0, 7);
      const pyqSlice = paraphrasedPYQs.slice(0, 8);
      questions = [...aiSlice, ...pyqSlice].sort(() => Math.random() - 0.5);
      console.log("[PYQ] Merged paper:", aiSlice.length, "AI +", pyqSlice.length, "PYQ =", questions.length, "total");
    }
    if (questions && questions.length > 0) {
      questions = await verifyQuestions(questions, campaign);
    }
    return questions;
  } catch (e) {
    console.error("[AI] Generation error:", e.message);
    console.error("[AI] Full error:", e);
    return null;
  }
}
async function getPaper$2(args, context) {
  const { token } = args;
  const tokenHash = hashToken(token);
  const qrPaper = await context.entities.QRPaper.findUnique({
    where: { token: tokenHash },
    include: { campaign: true, orgStudent: true }
  });
  if (!qrPaper) throw new Error("Invalid or expired QR code");
  const payload = await verifyQRSignature(qrPaper.signature);
  if (!payload) throw new Error("Invalid QR signature");
  let questionSet = await context.entities.QuestionSet.findFirst({
    where: { qrPaperId: qrPaper.id }
  });
  if (qrPaper.isUsed && !questionSet) throw new Error("QR code already used");
  if (!questionSet) {
    const campaign = qrPaper.campaign;
    const adaptiveId = qrPaper.studentId || qrPaper.orgStudentId || "none";
    const weakAreas = await context.entities.WeakArea.findMany({
      where: { studentId: adaptiveId }
    });
    const weakConcepts = weakAreas.filter((w) => w.strength < 0.5).map((w) => w.concept);
    const previousPapersWhere = {
      campaign: { topic: campaign.topic },
      isUsed: true,
      id: { not: qrPaper.id }
    };
    if (qrPaper.studentId) previousPapersWhere.studentId = qrPaper.studentId;
    else if (qrPaper.orgStudentId) previousPapersWhere.orgStudentId = qrPaper.orgStudentId;
    const previousPapers = await context.entities.QRPaper.findMany({
      where: previousPapersWhere,
      include: { questionSets: true },
      take: 3
    });
    const previousQuestions = previousPapers.flatMap((p) => p.questionSets).flatMap((qs) => {
      try {
        return JSON.parse(qs.questions);
      } catch (e) {
        return [];
      }
    });
    const uniqueSeed = `${qrPaper.studentId || qrPaper.orgStudentId || "anon"}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const poolRecords = await context.entities.GeneratedQuestionPool.findMany({
      where: {
        topic: campaign.topic,
        examName: campaign.examName
      },
      orderBy: { createdAt: "desc" },
      take: 120,
      // last 120 questions = ~8 full papers worth
      select: { text: true, concept: true, type: true }
    });
    console.log(`[Pool] Loaded ${poolRecords.length} previous questions for topic "${campaign.topic}"`);
    const questions = await generateQuestions(campaign, weakConcepts, previousQuestions, uniqueSeed, poolRecords);
    if (!questions || questions.length === 0) {
      console.error("[QParse] AI failed, using subject-specific fallback");
      const fallback = generateFallbackQuestions(campaign.topic, campaign.examName, campaign.difficulty);
      questionSet = await context.entities.QuestionSet.create({
        data: {
          qrPaperId: qrPaper.id,
          questions: JSON.stringify(fallback),
          version: 1,
          weakConcepts
        }
      });
      await context.entities.QRPaper.update({ where: { id: qrPaper.id }, data: { isUsed: true } });
      return {
        paperId: qrPaper.id,
        campaign: qrPaper.campaign,
        questions: fallback,
        questionSetId: questionSet.id,
        student: qrPaper.orgStudent ? { name: qrPaper.orgStudent.name, rollNo: qrPaper.orgStudent.rollNo, section: qrPaper.orgStudent.section } : null
      };
    }
    questionSet = await context.entities.QuestionSet.create({
      data: {
        qrPaperId: qrPaper.id,
        questions: JSON.stringify(questions),
        version: 1,
        weakConcepts
      }
    });
    context.entities.GeneratedQuestionPool.createMany({
      data: questions.map((q) => ({
        topic: campaign.topic,
        examName: campaign.examName,
        text: q.text,
        concept: q.concept || campaign.topic,
        type: q.type || "MCQ"
      })),
      skipDuplicates: true
    }).catch((err) => console.error("[Pool] Failed to save questions to pool:", err.message));
    await context.entities.QRPaper.update({
      where: { id: qrPaper.id },
      data: { isUsed: true }
    });
  }
  return {
    paperId: qrPaper.id,
    campaign: qrPaper.campaign,
    questions: JSON.parse(questionSet.questions),
    questionSetId: questionSet.id,
    student: qrPaper.orgStudent ? { name: qrPaper.orgStudent.name, rollNo: qrPaper.orgStudent.rollNo, section: qrPaper.orgStudent.section } : null
  };
}
function generateFallbackQuestions(topic, examName, difficulty) {
  const subjectInfo = getSubjectKnowledge(topic);
  const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const fallbackPools = {
    "Mathematics": [
      { q: `If f(x) = x\xB3 - 3x\xB2 + 2x + 1, then f'(2) equals:`, o: ["f'(2) = 2", "f'(2) = 3", "f'(2) = 1", "f'(2) = 0"], correct: "f'(2) = 2", concept: "Derivatives" },
      { q: `The value of \u222B\u2080\xB9 x\xB2dx is:`, o: ["1/3", "1/2", "2/3", "1/4"], correct: "1/3", concept: "Definite Integrals" },
      { q: `lim(x\u21920) (sin x)/x equals:`, o: ["The limit is 1", "The limit is 0", "The limit is \u221E", "The limit is -1"], correct: "The limit is 1", concept: "Limits" },
      { q: `The derivative of e\u02E3 sin x is:`, o: ["e\u02E3(sin x + cos x)", "e\u02E3 sin x", "e\u02E3 cos x", "e\u02E3(sin x - cos x)"], correct: "e\u02E3(sin x + cos x)", concept: "Product Rule" },
      { q: `\u222B (1/x) dx equals:`, o: ["ln|x| + C", "x\xB2 + C", "1/x\xB2 + C", "-1/x\xB2 + C"], correct: "ln|x| + C", concept: "Integration" },
      { q: `If y = x\xB2 + 3x, then dy/dx at x = 1 is:`, o: ["dy/dx = 5", "dy/dx = 4", "dy/dx = 3", "dy/dx = 6"], correct: "dy/dx = 5", concept: "Differentiation" },
      { q: `The order of the differential equation d\xB2y/dx\xB2 + 3(dy/dx) + y = 0 is:`, o: ["Order 2", "Order 1", "Order 3", "Order 0"], correct: "Order 2", concept: "Differential Equations" },
      { q: `The area under y = x\xB2 from x = 0 to x = 2 is:`, o: ["8/3 sq. units", "4 sq. units", "2 sq. units", "4/3 sq. units"], correct: "8/3 sq. units", concept: "Area under Curves" }
    ],
    "Physics": [
      { q: `A ball is dropped from height 80m. Time to reach ground is (g=10 m/s\xB2):`, o: ["4 seconds", "2 seconds", "8 seconds", "6 seconds"], correct: "4 seconds", concept: "Kinematics" },
      { q: `A 2kg block on a frictionless surface is pushed with 10N force. Its acceleration is:`, o: ["5 m/s\xB2", "10 m/s\xB2", "20 m/s\xB2", "2 m/s\xB2"], correct: "5 m/s\xB2", concept: "Newton's Laws" },
      { q: `The work done in moving a 5kg object through 4m against gravity is (g=10 m/s\xB2):`, o: ["200 J", "100 J", "50 J", "400 J"], correct: "200 J", concept: "Work and Energy" },
      { q: `Two charges of +2\u03BCC and -2\u03BCC are separated by 0.1m. The force between them is (k=9\xD710\u2079):`, o: ["3.6 N", "36 N", "0.36 N", "360 N"], correct: "3.6 N", concept: "Coulomb's Law" },
      { q: `A convex lens of focal length 20cm forms an image of an object at 30cm. The image distance is:`, o: ["60 cm", "40 cm", "30 cm", "120 cm"], correct: "60 cm", concept: "Optics" },
      { q: `The de Broglie wavelength of an electron with KE = 100 eV is approximately:`, o: ["1.227 \xC5", "12.27 \xC5", "0.1227 \xC5", "122.7 \xC5"], correct: "1.227 \xC5", concept: "Modern Physics" }
    ],
    "Chemistry": [
      { q: `The IUPAC name of CH\u2083CH(OH)CH\u2083 is:`, o: ["Propan-2-ol", "Propan-1-ol", "Isopropyl alcohol", "Propanol"], correct: "Propan-2-ol", concept: "Nomenclature" },
      { q: `The pH of 0.01 M HCl solution is:`, o: ["pH = 2", "pH = 1", "pH = 3", "pH = 0.01"], correct: "pH = 2", concept: "Ionic Equilibrium" },
      { q: `The hybridization of carbon in CO\u2082 is:`, o: ["sp hybridization", "sp\xB2 hybridization", "sp\xB3 hybridization", "sp\xB3d hybridization"], correct: "sp hybridization", concept: "Chemical Bonding" },
      { q: `For a first-order reaction with k = 0.693 s\u207B\xB9, the half-life is:`, o: ["1 second", "0.693 seconds", "2 seconds", "0.5 seconds"], correct: "1 second", concept: "Chemical Kinetics" },
      { q: `The number of moles in 36g of water (M = 18) is:`, o: ["2 moles", "1 mole", "0.5 moles", "4 moles"], correct: "2 moles", concept: "Mole Concept" },
      { q: `The oxidation state of Mn in KMnO\u2084 is:`, o: ["+7", "+5", "+6", "+4"], correct: "+7", concept: "Oxidation States" }
    ],
    "Biology": [
      { q: `The site of light-dependent reactions of photosynthesis is:`, o: ["Thylakoid membrane", "Stroma", "Outer membrane of chloroplast", "Cytoplasm"], correct: "Thylakoid membrane", concept: "Photosynthesis" },
      { q: `Crossing over occurs during which stage of meiosis?`, o: ["Pachytene of Prophase I", "Metaphase I", "Anaphase II", "Telophase I"], correct: "Pachytene of Prophase I", concept: "Cell Division" },
      { q: `The Glomerular Filtration Rate (GFR) in a healthy human is approximately:`, o: ["125 mL/min", "200 mL/min", "75 mL/min", "50 mL/min"], correct: "125 mL/min", concept: "Excretory System" },
      { q: `Which hormone is responsible for maintaining pregnancy?`, o: ["Progesterone", "Estrogen", "FSH", "LH"], correct: "Progesterone", concept: "Reproductive System" },
      { q: `The functional unit of a kidney is:`, o: ["Nephron", "Neuron", "Alveolus", "Hepatocyte"], correct: "Nephron", concept: "Excretory System" },
      { q: `DNA replication is:`, o: ["Semi-conservative", "Conservative", "Dispersive", "Non-conservative"], correct: "Semi-conservative", concept: "Molecular Biology" },
      { q: `In the lac operon, the inducer molecule is:`, o: ["Allolactose", "Glucose", "Galactose", "Lactose"], correct: "Allolactose", concept: "Gene Regulation" },
      { q: `Which blood group is called the universal donor?`, o: ["O negative", "AB positive", "A positive", "B negative"], correct: "O negative", concept: "Blood Groups" }
    ],
    "Compiler Design": [
      { q: `For the grammar S \u2192 AB, A \u2192 a | \u03B5, B \u2192 b | \u03B5, the FOLLOW(A) is:`, o: ["{b, $}", "{b}", "{a, b, $}", "{$}"], correct: "{b, $}", concept: "FOLLOW Sets" },
      { q: `Which parsing technique uses a stack and reads input left-to-right producing a rightmost derivation in reverse?`, o: ["Bottom-up (LR) parsing", "Top-down (LL) parsing", "Recursive descent parsing", "Operator precedence parsing"], correct: "Bottom-up (LR) parsing", concept: "LR Parsing" },
      { q: `The FIRST set of a non-terminal A where A \u2192 aB | \u03B5 is:`, o: ["{a, \u03B5}", "{a}", "{\u03B5}", "{a, b}"], correct: "{a, \u03B5}", concept: "FIRST Sets" },
      { q: `An SLR(1) parser uses which set to decide reduce actions?`, o: ["FOLLOW set of the LHS non-terminal", "FIRST set of the RHS", "Lookahead tokens only", "The entire grammar"], correct: "FOLLOW set of the LHS non-terminal", concept: "SLR Parsing" },
      { q: `Which phase of a compiler converts a stream of characters into tokens?`, o: ["Lexical Analysis", "Syntax Analysis", "Semantic Analysis", "Code Generation"], correct: "Lexical Analysis", concept: "Compiler Phases" },
      { q: `A grammar is ambiguous if:`, o: ["A string has more than one parse tree", "The grammar has no start symbol", "All productions are left-recursive", "FIRST and FOLLOW sets are disjoint"], correct: "A string has more than one parse tree", concept: "Ambiguity" },
      { q: `Left factoring is used to make a grammar suitable for:`, o: ["Predictive (LL) parsing", "LR parsing", "Operator precedence parsing", "CYK algorithm"], correct: "Predictive (LL) parsing", concept: "Left Factoring" },
      { q: `Three-address code is a form of:`, o: ["Intermediate representation", "Machine code", "Assembly language", "Source code optimization"], correct: "Intermediate representation", concept: "Intermediate Code" }
    ],
    "Theory of Computation": [
      { q: `Which of the following languages is NOT context-free?`, o: ["a\u207Fb\u207Fc\u207F (n \u2265 1)", "a\u207Fb\u207F (n \u2265 0)", "Palindromes over {a,b}", "Balanced parentheses"], correct: "a\u207Fb\u207Fc\u207F (n \u2265 1)", concept: "Formal Languages" },
      { q: `A DFA for strings over {0,1} ending in 01 requires at least how many states?`, o: ["3 states", "2 states", "4 states", "5 states"], correct: "3 states", concept: "Finite Automata" },
      { q: `The pumping lemma is used to prove that a language is:`, o: ["NOT regular", "Regular", "Context-free", "Recursive"], correct: "NOT regular", concept: "Pumping Lemma" },
      { q: `Which of the following is equivalent to a Turing Machine in computational power?`, o: ["Post correspondence problem", "Pushdown automaton", "Finite automaton", "Mealy machine"], correct: "Post correspondence problem", concept: "Computability" },
      { q: `Which of the following problems is undecidable?`, o: ["Halting problem", "Membership in a regular language", "Emptiness of a CFL", "Equivalence of DFAs"], correct: "Halting problem", concept: "Decidability" },
      { q: `A context-free grammar that generates the empty string must have:`, o: ["A nullable start symbol or \u03B5-productions", "Only terminal rules", "No recursive rules", "Exactly one production"], correct: "A nullable start symbol or \u03B5-productions", concept: "Context-Free Grammars" }
    ],
    "Operating Systems": [
      { q: `In a page replacement algorithm, which strategy is optimal but not implementable?`, o: ["Belady's optimal algorithm", "LRU", "FIFO", "Clock algorithm"], correct: "Belady's optimal algorithm", concept: "Page Replacement" },
      { q: `Which scheduling algorithm may cause starvation?`, o: ["Shortest Job First (SJF)", "Round Robin", "FCFS", "Round Robin with priority aging"], correct: "Shortest Job First (SJF)", concept: "Process Scheduling" },
      { q: `A system with 3 processes and 3 resource types uses the Banker's algorithm. This algorithm prevents:`, o: ["Deadlock", "Starvation", "Race condition", "Thrashing"], correct: "Deadlock", concept: "Deadlock Avoidance" },
      { q: `The working set model in virtual memory is used to:`, o: ["Determine the set of pages a process is actively using", "Calculate CPU utilization", "Optimize disk scheduling", "Manage file permissions"], correct: "Determine the set of pages a process is actively using", concept: "Virtual Memory" },
      { q: `Which of the following is NOT a necessary condition for deadlock?`, o: ["Preemption", "Mutual exclusion", "Hold and wait", "Circular wait"], correct: "Preemption", concept: "Deadlock Conditions" },
      { q: `The convoy effect is associated with which CPU scheduling algorithm?`, o: ["First Come First Served (FCFS)", "Round Robin", "Shortest Job First", "Priority Scheduling"], correct: "First Come First Served (FCFS)", concept: "CPU Scheduling" }
    ],
    "DBMS": [
      { q: `A relation R(A,B,C,D) with FDs AB\u2192C, C\u2192D, D\u2192A is in which normal form?`, o: ["2NF but not 3NF", "3NF", "BCNF", "1NF only"], correct: "2NF but not 3NF", concept: "Normalization" },
      { q: `In a B+ tree of order m, each internal node can have at most how many children?`, o: ["m children", "m-1 children", "m+1 children", "2m children"], correct: "m children", concept: "B+ Trees" },
      { q: `Two schedules are conflict equivalent if:`, o: ["They have the same set of conflicting operation pairs in the same order", "They produce the same final result", "They have the same number of operations", "They use the same transactions"], correct: "They have the same set of conflicting operation pairs in the same order", concept: "Serializability" },
      { q: `The ACID property that ensures a transaction is all-or-nothing is:`, o: ["Atomicity", "Consistency", "Isolation", "Durability"], correct: "Atomicity", concept: "ACID Properties" },
      { q: `Which SQL clause is used to filter groups created by GROUP BY?`, o: ["HAVING", "WHERE", "FILTER", "GROUP FILTER"], correct: "HAVING", concept: "SQL" },
      { q: `A lossless join decomposition ensures:`, o: ["No information is lost during decomposition", "All FDs are preserved", "The decomposition is in BCNF", "No redundancy exists"], correct: "No information is lost during decomposition", concept: "Decomposition" }
    ],
    "Data Structures": [
      { q: `The time complexity of searching in a balanced BST with n nodes is:`, o: ["O(log n)", "O(n)", "O(n log n)", "O(1)"], correct: "O(log n)", concept: "Binary Search Trees" },
      { q: `The maximum number of nodes in a binary tree of height h is:`, o: ["2^(h+1) - 1 nodes", "2^h nodes", "2^h - 1 nodes", "h\xB2 nodes"], correct: "2^(h+1) - 1 nodes", concept: "Binary Trees" },
      { q: `In a max-heap, the parent node is always:`, o: ["Greater than or equal to its children", "Less than its children", "Equal to its children", "Greater than only the left child"], correct: "Greater than or equal to its children", concept: "Heaps" },
      { q: `The worst-case time complexity of searching in a hash table with chaining is:`, o: ["O(n)", "O(1)", "O(log n)", "O(n log n)"], correct: "O(n)", concept: "Hashing" },
      { q: `Which traversal of a BST gives nodes in sorted order?`, o: ["Inorder traversal", "Preorder traversal", "Postorder traversal", "Level-order traversal"], correct: "Inorder traversal", concept: "Tree Traversals" },
      { q: `The minimum number of nodes in an AVL tree of height h is:`, o: ["N(h) = N(h-1) + N(h-2) + 1", "N(h) = 2^h", "N(h) = h\xB2", "N(h) = 2h + 1"], correct: "N(h) = N(h-1) + N(h-2) + 1", concept: "AVL Trees" }
    ],
    "Computer Networks": [
      { q: `In TCP, the 3-way handshake uses which flags in order?`, o: ["SYN, SYN-ACK, ACK", "ACK, SYN, FIN", "FIN, ACK, SYN", "SYN, ACK, FIN"], correct: "SYN, SYN-ACK, ACK", concept: "TCP Handshake" },
      { q: `The maximum number of hosts in a Class C network is:`, o: ["254 hosts", "256 hosts", "128 hosts", "512 hosts"], correct: "254 hosts", concept: "IP Addressing" },
      { q: `Which layer of the OSI model handles routing?`, o: ["Network Layer (Layer 3)", "Data Link Layer (Layer 2)", "Transport Layer (Layer 4)", "Session Layer (Layer 5)"], correct: "Network Layer (Layer 3)", concept: "OSI Model" },
      { q: `CSMA/CD is used in which type of network?`, o: ["Ethernet (wired LAN)", "Wi-Fi (wireless LAN)", "Bluetooth", "Satellite networks"], correct: "Ethernet (wired LAN)", concept: "MAC Protocols" },
      { q: `The purpose of ARP (Address Resolution Protocol) is:`, o: ["Map IP addresses to MAC addresses", "Map domain names to IP addresses", "Route packets between networks", "Encrypt network traffic"], correct: "Map IP addresses to MAC addresses", concept: "ARP" },
      { q: `In Go-Back-N protocol, if the window size is N, the sender can send:`, o: ["Up to N frames without waiting for ACK", "Only 1 frame at a time", "N\xB2 frames at a time", "Unlimited frames"], correct: "Up to N frames without waiting for ACK", concept: "Flow Control" }
    ],
    "Digital Logic": [
      { q: `The number of flip-flops needed to design a mod-16 counter is:`, t: "MCQ", o: ["4 flip-flops", "8 flip-flops", "16 flip-flops", "3 flip-flops"], correct: "4 flip-flops", concept: "Counters" },
      { q: `The simplified form of F = AB + AB' using Boolean algebra is:`, t: "MCQ", o: ["F = A", "F = B", "F = AB", "F = A + B"], correct: "F = A", concept: "Boolean Simplification" },
      { q: `A 4:1 multiplexer has how many select lines?`, t: "MCQ", o: ["2 select lines", "4 select lines", "1 select line", "3 select lines"], correct: "2 select lines", concept: "Multiplexer" },
      { q: `In a K-map, adjacent cells differ by:`, t: "MCQ", o: ["Exactly 1 variable", "Exactly 2 variables", "All variables", "No variables"], correct: "Exactly 1 variable", concept: "K-maps" },
      { q: `The characteristic equation of a JK flip-flop is:`, t: "MCQ", o: ["Q(next) = JQ' + K'Q", "Q(next) = JQ + KQ'", "Q(next) = J + K", "Q(next) = JK"], correct: "Q(next) = JQ' + K'Q", concept: "Flip-flops" },
      { q: `De Morgan's theorem states that (A+B)' equals:`, t: "MCQ", o: ["A' \xB7 B'", "A' + B'", "A \xB7 B", "(AB)'"], correct: "A' \xB7 B'", concept: "Boolean Algebra" },
      { q: `A full adder has how many inputs?`, t: "MCQ", o: ["3 inputs (A, B, Carry-in)", "2 inputs (A, B)", "4 inputs", "1 input"], correct: "3 inputs (A, B, Carry-in)", concept: "Adders" },
      { q: `The universal gate(s) from which any logic gate can be constructed:`, t: "MSQ", o: ["NAND gate", "NOR gate", "AND gate", "XOR gate"], correct: ["NAND gate", "NOR gate"], concept: "Universal Gates" },
      { q: `A 3-to-8 decoder has how many output lines?`, t: "MCQ", o: ["8 output lines", "3 output lines", "16 output lines", "6 output lines"], correct: "8 output lines", concept: "Decoders" },
      { q: `The output of an XOR gate is 1 when:`, t: "MCQ", o: ["Inputs are different", "Both inputs are 1", "Both inputs are 0", "At least one input is 1"], correct: "Inputs are different", concept: "XOR Gate" },
      { q: `How many minterms are present in a 4-variable Boolean function?`, t: "NAT", o: [], correct: "16", concept: "Minterms" },
      { q: `A mod-10 counter requires how many flip-flops?`, t: "NAT", o: [], correct: "4", concept: "Counters" },
      { q: `In an 8:1 multiplexer, how many select lines are needed?`, t: "NAT", o: [], correct: "3", concept: "Multiplexer Design" },
      { q: `The number of cells in a 4-variable K-map is:`, t: "NAT", o: [], correct: "16", concept: "K-map Size" },
      { q: `Which of the following are properties of Boolean algebra?`, t: "MSQ", o: ["Commutative law", "Distributive law", "Associative law", "Logarithmic law"], correct: ["Commutative law", "Distributive law", "Associative law"], concept: "Boolean Properties" },
      { q: `A Moore machine's output depends on:`, t: "MCQ", o: ["Only the current state", "Current state and input", "Only the input", "Previous output"], correct: "Only the current state", concept: "Moore Machine" },
      { q: `A Mealy machine differs from a Moore machine because its output depends on:`, t: "MCQ", o: ["Both current state and input", "Only the current state", "Only the input", "The clock signal"], correct: "Both current state and input", concept: "Mealy Machine" },
      { q: `Which of the following flip-flops can be used as a toggle flip-flop?`, t: "MSQ", o: ["JK flip-flop with J=K=1", "T flip-flop with T=1", "D flip-flop with D=Q'", "SR flip-flop with S=R=1"], correct: ["JK flip-flop with J=K=1", "T flip-flop with T=1", "D flip-flop with D=Q'"], concept: "Toggle Behavior" },
      { q: `The don't-care conditions in a K-map can be treated as:`, t: "MCQ", o: ["Either 0 or 1 for simplification", "Always 1", "Always 0", "They must be ignored"], correct: "Either 0 or 1 for simplification", concept: "Don't Care Conditions" },
      { q: `A priority encoder with 8 inputs produces how many output bits?`, t: "NAT", o: [], correct: "3", concept: "Priority Encoder" }
    ],
    "Algorithms": [
      { q: `The recurrence T(n) = 2T(n/2) + n has solution:`, t: "MCQ", o: ["O(n log n)", "O(n\xB2)", "O(n)", "O(log n)"], correct: "O(n log n)", concept: "Divide and Conquer" },
      { q: `The worst-case time complexity of QuickSort is:`, t: "MCQ", o: ["O(n\xB2)", "O(n log n)", "O(n)", "O(log n)"], correct: "O(n\xB2)", concept: "Sorting" },
      { q: `Dijkstra's algorithm does NOT work correctly with:`, t: "MCQ", o: ["Negative edge weights", "Undirected graphs", "Sparse graphs", "Weighted graphs"], correct: "Negative edge weights", concept: "Shortest Path" },
      { q: `The minimum number of edges in a connected graph with n vertices is:`, t: "MCQ", o: ["n \u2212 1 edges", "n edges", "n + 1 edges", "n/2 edges"], correct: "n \u2212 1 edges", concept: "Graph Theory" },
      { q: `Dynamic programming is applicable when a problem has:`, t: "MCQ", o: ["Optimal substructure and overlapping subproblems", "Only optimal substructure", "No overlapping subproblems", "Greedy choice property only"], correct: "Optimal substructure and overlapping subproblems", concept: "Dynamic Programming" },
      { q: `The number of minimum spanning trees of a complete graph K\u2084 with all distinct edge weights is:`, t: "MCQ", o: ["Exactly 1", "Exactly 4", "Exactly 16", "Exactly 8"], correct: "Exactly 1", concept: "MST" }
    ],
    "Computer Architecture": [
      { q: `A 5-stage pipeline can have at most how many instructions in execution simultaneously?`, t: "MCQ", o: ["5 instructions", "4 instructions", "10 instructions", "1 instruction"], correct: "5 instructions", concept: "Pipelining" },
      { q: `In a direct-mapped cache, each memory block maps to:`, t: "MCQ", o: ["Exactly one cache line", "Any cache line", "Two cache lines", "Half the cache lines"], correct: "Exactly one cache line", concept: "Cache Mapping" },
      { q: `A data hazard in pipelining occurs when:`, t: "MCQ", o: ["An instruction depends on the result of a previous instruction still in the pipeline", "Two instructions access different memory locations", "The branch prediction is always correct", "The cache is fully associative"], correct: "An instruction depends on the result of a previous instruction still in the pipeline", concept: "Pipeline Hazards" },
      { q: `The effective CPI with a cache miss rate of 5% and miss penalty of 20 cycles (base CPI = 1) is:`, t: "MCQ", o: ["2.0 cycles", "1.5 cycles", "1.05 cycles", "5.0 cycles"], correct: "2.0 cycles", concept: "Cache Performance" },
      { q: `DMA (Direct Memory Access) is used to:`, t: "MCQ", o: ["Transfer data between I/O and memory without CPU intervention", "Increase CPU clock speed", "Manage virtual memory pages", "Handle interrupts"], correct: "Transfer data between I/O and memory without CPU intervention", concept: "I/O Systems" }
    ],
    "Discrete Mathematics": [
      { q: `The number of distinct equivalence relations on a set of 3 elements is:`, t: "MCQ", o: ["5 relations", "3 relations", "8 relations", "6 relations"], correct: "5 relations", concept: "Equivalence Relations" },
      { q: `The chromatic number of a complete graph K\u2085 is:`, t: "MCQ", o: ["5 colors", "4 colors", "3 colors", "6 colors"], correct: "5 colors", concept: "Graph Coloring" },
      { q: `The number of onto functions from a set of 4 elements to a set of 2 elements is:`, t: "MCQ", o: ["14 functions", "16 functions", "8 functions", "12 functions"], correct: "14 functions", concept: "Functions" },
      { q: `A planar graph with 6 vertices can have at most how many edges?`, t: "MCQ", o: ["12 edges", "15 edges", "10 edges", "18 edges"], correct: "12 edges", concept: "Planar Graphs" },
      { q: `If R is a reflexive and transitive relation that is also symmetric, then R is:`, t: "MCQ", o: ["An equivalence relation", "A partial order", "An antisymmetric relation", "A total order"], correct: "An equivalence relation", concept: "Relations" }
    ],
    "Economy": [
      { q: "If the RBI increases CRR, the most likely immediate effect is:", o: ["Decrease in money supply", "Increase in money supply", "No effect on money supply", "Increase in government spending"], correct: "Decrease in money supply", concept: "Monetary Policy" },
      { q: "The Fiscal Responsibility and Budget Management (FRBM) Act aims to:", o: ["Reduce fiscal deficit", "Increase exports", "Control inflation only", "Privatize banks"], correct: "Reduce fiscal deficit", concept: "Fiscal Policy" },
      { q: "Which of the following is NOT included in GDP calculation?", o: ["Household unpaid work", "Government spending", "Net exports", "Private consumption"], correct: "Household unpaid work", concept: "National Income" },
      { q: "Open Market Operations by the RBI involve:", o: ["Buying/selling government securities", "Printing new currency", "Changing tax rates", "Setting minimum wages"], correct: "Buying/selling government securities", concept: "Monetary Policy" },
      { q: "GST in India is a:", o: ["Destination-based consumption tax", "Origin-based production tax", "Direct tax on income", "Tax on agricultural produce"], correct: "Destination-based consumption tax", concept: "Taxation" },
      { q: "The primary deficit equals:", o: ["Fiscal deficit minus interest payments", "Revenue deficit plus capital expenditure", "Total expenditure minus revenue", "GDP minus GNP"], correct: "Fiscal deficit minus interest payments", concept: "Public Finance" }
    ],
    "History": [
      { q: "The Simon Commission was boycotted because:", o: ["It had no Indian members", "It supported partition", "It was led by Congress", "It proposed monarchy"], correct: "It had no Indian members", concept: "Freedom Struggle" },
      { q: "The Permanent Settlement of 1793 was introduced by:", o: ["Lord Cornwallis", "Lord Wellesley", "Warren Hastings", "Lord Dalhousie"], correct: "Lord Cornwallis", concept: "British Rule" },
      { q: "Which Round Table Conference did Gandhi attend?", o: ["Second (1931)", "First (1930)", "Third (1932)", "None"], correct: "Second (1931)", concept: "Freedom Struggle" },
      { q: "The Quit India Movement was launched in:", o: ["1942", "1940", "1944", "1939"], correct: "1942", concept: "Freedom Struggle" },
      { q: "Who founded the Indian National Congress?", o: ["A.O. Hume", "Dadabhai Naoroji", "Surendranath Banerjee", "W.C. Bonnerjee"], correct: "A.O. Hume", concept: "Modern India" },
      { q: "The Doctrine of Lapse was introduced by:", o: ["Lord Dalhousie", "Lord Wellesley", "Lord Cornwallis", "Lord Ripon"], correct: "Lord Dalhousie", concept: "British Rule" }
    ],
    "Polity": [
      { q: "Which writ prevents a person from holding an office they are not entitled to?", o: ["Quo Warranto", "Mandamus", "Certiorari", "Habeas Corpus"], correct: "Quo Warranto", concept: "Constitutional Remedies" },
      { q: "Article 32 of the Indian Constitution deals with:", o: ["Right to Constitutional Remedies", "Right to Equality", "Right to Freedom", "Right to Education"], correct: "Right to Constitutional Remedies", concept: "Fundamental Rights" },
      { q: "The 73rd Amendment relates to:", o: ["Panchayati Raj", "Municipalities", "Anti-Defection", "Right to Education"], correct: "Panchayati Raj", concept: "Local Government" },
      { q: "Who appoints the Chief Justice of India?", o: ["President of India", "Prime Minister", "Parliament", "Law Minister"], correct: "President of India", concept: "Judiciary" },
      { q: "Money Bills can only be introduced in:", o: ["Lok Sabha", "Rajya Sabha", "Either House", "Joint Session"], correct: "Lok Sabha", concept: "Parliament" },
      { q: "The concept of Judicial Review in India is derived from:", o: ["Constitution of USA", "British Parliament", "French Constitution", "Canadian Constitution"], correct: "Constitution of USA", concept: "Judiciary" }
    ],
    "Geography": [
      { q: "The Tropic of Cancer does NOT pass through:", o: ["Karnataka", "Rajasthan", "Madhya Pradesh", "West Bengal"], correct: "Karnataka", concept: "Indian Geography" },
      { q: "Which Indian state has the longest coastline?", o: ["Gujarat", "Maharashtra", "Andhra Pradesh", "Tamil Nadu"], correct: "Gujarat", concept: "Physical Geography" },
      { q: "Laterite soil is formed due to:", o: ["Leaching in heavy rainfall areas", "Volcanic activity", "River deposition", "Glacial action"], correct: "Leaching in heavy rainfall areas", concept: "Soil Types" },
      { q: "The Western Ghats are also known as:", o: ["Sahyadri", "Vindhya", "Satpura", "Aravalli"], correct: "Sahyadri", concept: "Physiographic Divisions" },
      { q: "Which river is known as the Sorrow of Bihar?", o: ["Kosi", "Gandak", "Son", "Damodar"], correct: "Kosi", concept: "Drainage System" },
      { q: "The Coriolis effect causes winds to deflect to the:", o: ["Right in Northern Hemisphere", "Left in Northern Hemisphere", "Same direction everywhere", "Upward"], correct: "Right in Northern Hemisphere", concept: "Climatology" }
    ],
    "Science and Technology": [
      { q: "ISRO's launch vehicle for heavy payloads to GTO is:", o: ["GSLV Mk III (LVM3)", "PSLV", "SSLV", "SLV-3"], correct: "GSLV Mk III (LVM3)", concept: "Space Technology" },
      { q: "CRISPR-Cas9 technology is used for:", o: ["Gene editing", "Nuclear fusion", "Satellite navigation", "Quantum computing"], correct: "Gene editing", concept: "Biotechnology" },
      { q: "India's three-stage nuclear programme was conceived by:", o: ["Homi Bhabha", "A.P.J. Abdul Kalam", "Vikram Sarabhai", "C.V. Raman"], correct: "Homi Bhabha", concept: "Nuclear Technology" },
      { q: "UPI stands for:", o: ["Unified Payments Interface", "Universal Payment Integration", "United Payment Initiative", "Unified Processing Infrastructure"], correct: "Unified Payments Interface", concept: "Digital India" },
      { q: "5G technology operates in which frequency band?", o: ["Millimeter wave (30-300 GHz)", "Only 2.4 GHz", "Only 900 MHz", "Infrared spectrum"], correct: "Millimeter wave (30-300 GHz)", concept: "Information Technology" },
      { q: "The Chandrayaan-3 mission successfully landed on:", o: ["Lunar south pole", "Lunar north pole", "Lunar equator", "Mars surface"], correct: "Lunar south pole", concept: "Space Technology" }
    ]
  };
  const topicLower = topic.toLowerCase();
  let pool = null;
  for (const [key, value] of Object.entries(fallbackPools)) {
    if (topicLower === key.toLowerCase() || topicLower.includes(key.toLowerCase()) || key.toLowerCase().includes(topicLower)) {
      pool = value;
      break;
    }
  }
  if (!pool) {
    const domain = subjectInfo.domain || "";
    pool = fallbackPools[domain];
  }
  if (!pool) {
    if (["compiler"].some((k) => topicLower.includes(k))) pool = fallbackPools["Compiler Design"];
    else if (["automata", "computation", "turing", "chomsky"].some((k) => topicLower.includes(k))) pool = fallbackPools["Theory of Computation"];
    else if (["operating system", " os "].some((k) => topicLower.includes(k))) pool = fallbackPools["Operating Systems"];
    else if (["database", "dbms", "sql", "normalization"].some((k) => topicLower.includes(k))) pool = fallbackPools["DBMS"];
    else if (["data structure", "tree", "heap", "stack", "queue", "linked list", "hash"].some((k) => topicLower.includes(k))) pool = fallbackPools["Data Structures"];
    else if (["network theory", "kvl", "kcl", "thevenin", "norton"].some((k) => topicLower.includes(k))) pool = fallbackPools["Physics"];
    else if (["signal", "fourier", "laplace", "z-transform", "nyquist"].some((k) => topicLower.includes(k))) pool = fallbackPools["Physics"];
    else if (["communication", "modulation", "am ", "fm ", "pcm"].some((k) => topicLower.includes(k))) pool = fallbackPools["Physics"];
    else if (["control system", "bode", "root locus", "routh"].some((k) => topicLower.includes(k))) pool = fallbackPools["Physics"];
    else if (["digital circuit", "digital logic", "logic gate", "boolean", "flip-flop", "k-map"].some((k) => topicLower.includes(k))) pool = fallbackPools["Digital Logic"];
    else if (["network", "tcp", "ip address", "routing", "osi"].some((k) => topicLower.includes(k))) pool = fallbackPools["Computer Networks"];
    else if (["algorithm", "sorting", "dynamic programming", "graph algorithm", "complexity"].some((k) => topicLower.includes(k))) pool = fallbackPools["Algorithms"];
    else if (["architecture", "pipeline", "cache", "cpu", "risc", "cisc"].some((k) => topicLower.includes(k))) pool = fallbackPools["Computer Architecture"];
    else if (["discrete", "combinatorics", "relation", "propositional"].some((k) => topicLower.includes(k))) pool = fallbackPools["Discrete Mathematics"];
    else if (["economy", "gdp", "rbi", "fiscal", "monetary", "inflation", "banking"].some((k) => topicLower.includes(k))) pool = fallbackPools["Economy"];
    else if (["history", "freedom struggle", "mughal", "british", "independence"].some((k) => topicLower.includes(k))) pool = fallbackPools["History"];
    else if (["polity", "constitution", "fundamental right", "parliament", "judiciary"].some((k) => topicLower.includes(k))) pool = fallbackPools["Polity"];
    else if (["geography", "river", "soil", "climate", "monsoon", "mountain"].some((k) => topicLower.includes(k))) pool = fallbackPools["Geography"];
    else if (["science and technology", "isro", "space", "biotechnology", "nuclear"].some((k) => topicLower.includes(k))) pool = fallbackPools["Science and Technology"];
    else if (["english", "synonym", "antonym", "grammar", "vocabulary", "comprehension"].some((k) => topicLower.includes(k))) pool = fallbackPools["Chemistry"];
    else if (["physics", "mechanics", "optics", "electro", "thermo", "waves", "modern physics", "kinematics"].some((k) => topicLower.includes(k))) pool = fallbackPools["Physics"];
    else if (["chemistry", "organic", "inorganic", "physical chemistry", "chemical"].some((k) => topicLower.includes(k))) pool = fallbackPools["Chemistry"];
    else if (["math", "calculus", "algebra", "trigonometry", "geometry", "probability", "statistics", "vector"].some((k) => topicLower.includes(k))) pool = fallbackPools["Mathematics"];
    else if (["biology", "botany", "zoology", "genetics", "ecology", "anatomy", "physiology"].some((k) => topicLower.includes(k))) pool = fallbackPools["Biology"];
    else pool = [];
  }
  console.error(`[FALLBACK] \u26A0\uFE0F AI FAILED \u2014 Using hardcoded ${pool.length} questions for "${topic}". Check your AI API key!`);
  if (!pool || pool.length === 0) {
    throw new Error(`AI generation failed and no fallback questions available for "${topic}". Please try again in a few seconds \u2014 the AI may be rate limited.`);
  }
  const count = Math.min(15, pool.length);
  const selected = pick(pool, count);
  return selected.map((m) => {
    const opts = m.t === "NAT" ? [] : shuffle([...m.o]);
    return {
      text: m.q,
      type: m.t || "MCQ",
      options: opts,
      correctAnswer: m.t === "MSQ" ? m.correct : m.correct,
      marks: 2,
      negativeMarks: m.t === "NAT" ? 0 : 0.67,
      concept: m.concept || topic
    };
  });
}

async function getPaper$1(args, context) {
  return getPaper$2(args, {
    ...context,
    entities: {
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Campaign: dbClient.campaign,
      WeakArea: dbClient.weakArea,
      PyqChunk: dbClient.pyqChunk,
      GeneratedQuestionPool: dbClient.generatedQuestionPool
    }
  });
}

var getPaper = createQuery(getPaper$1);

async function getStudentWeakAreas$2(args, context) {
  const studentId = context.user.id;
  return context.entities.WeakArea.findMany({ where: { studentId } });
}

async function getStudentWeakAreas$1(args, context) {
  return getStudentWeakAreas$2(args, {
    ...context,
    entities: {
      WeakArea: dbClient.weakArea
    }
  });
}

var getStudentWeakAreas = createQuery(getStudentWeakAreas$1);

async function getStudentPapers$2(args, context) {
  if (!context.user) return [];
  return context.entities.QRPaper.findMany({
    where: { studentId: context.user.id },
    include: {
      campaign: true,
      questionSets: { include: { attempts: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getStudentPapers$1(args, context) {
  return getStudentPapers$2(args, {
    ...context,
    entities: {
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Attempt: dbClient.attempt,
      Campaign: dbClient.campaign
    }
  });
}

var getStudentPapers = createQuery(getStudentPapers$1);

async function getOrgStudentPapers$2(args, context) {
  if (!context.user) return [];
  const { orgStudentId } = args;
  return context.entities.QRPaper.findMany({
    where: { orgStudentId },
    include: {
      campaign: true,
      questionSets: { include: { attempts: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getOrgStudentPapers$1(args, context) {
  return getOrgStudentPapers$2(args, {
    ...context,
    entities: {
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Attempt: dbClient.attempt,
      Campaign: dbClient.campaign,
      OrgStudent: dbClient.orgStudent
    }
  });
}

var getOrgStudentPapers = createQuery(getOrgStudentPapers$1);

async function getOrgAssessments$2(args, context) {
  if (!context.user) return [];
  const where = { orgId: args.orgId };
  if (args.type) where.type = args.type;
  if (args.orgStudentId) where.orgStudentId = args.orgStudentId;
  return context.entities.Assessment.findMany({
    where,
    include: { orgStudent: true },
    orderBy: { date: "desc" }
  });
}

async function getOrgAssessments$1(args, context) {
  return getOrgAssessments$2(args, {
    ...context,
    entities: {
      Assessment: dbClient.assessment,
      OrgStudent: dbClient.orgStudent
    }
  });
}

var getOrgAssessments = createQuery(getOrgAssessments$1);

async function getOrgAllPapers$2(args, context) {
  if (!context.user) return [];
  const campaigns = await context.entities.Campaign.findMany({
    where: { teacherId: context.user.id },
    select: { id: true }
  });
  if (!campaigns.length) return [];
  return context.entities.QRPaper.findMany({
    where: {
      campaignId: { in: campaigns.map((c) => c.id) }
    },
    include: {
      campaign: true,
      orgStudent: true,
      questionSets: { include: { attempts: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getOrgAllPapers$1(args, context) {
  return getOrgAllPapers$2(args, {
    ...context,
    entities: {
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Attempt: dbClient.attempt,
      Campaign: dbClient.campaign,
      Organization: dbClient.organization
    }
  });
}

var getOrgAllPapers = createQuery(getOrgAllPapers$1);

async function getStudentReport$2(args, context) {
  if (!context.user) return null;
  const { orgStudentId } = args;
  const student = await context.entities.OrgStudent.findUnique({ where: { id: orgStudentId } });
  if (!student) throw new Error("Student not found");
  const config = await context.entities.OrgConfig.findUnique({ where: { orgId: student.orgId } });
  const weights = config ? {
    assignment: config.weightAssignment,
    behavior: config.weightBehavior,
    performance: config.weightPerformance,
    classTest: config.weightClassTest
  } : void 0;
  const assessments = await context.entities.Assessment.findMany({
    where: { orgStudentId },
    orderBy: { date: "desc" }
  });
  const qrPapers = await context.entities.QRPaper.findMany({
    where: { orgStudentId },
    include: { campaign: true, questionSets: { include: { attempts: true } } }
  });
  const classTestAttempts = [];
  for (const paper of qrPapers) {
    for (const qs of paper.questionSets) {
      for (const attempt of qs.attempts) classTestAttempts.push(attempt);
    }
  }
  const { breakdown, combinedScore } = computeStudentScore(assessments, classTestAttempts, weights);
  const tier = getTier(combinedScore);
  const recommendedDifficulty = getRecommendedDifficulty(combinedScore);
  return {
    student,
    breakdown,
    combinedScore,
    tier,
    recommendedDifficulty,
    assessments,
    classTests: qrPapers
  };
}

async function getStudentReport$1(args, context) {
  return getStudentReport$2(args, {
    ...context,
    entities: {
      Assessment: dbClient.assessment,
      OrgStudent: dbClient.orgStudent,
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Attempt: dbClient.attempt,
      Campaign: dbClient.campaign,
      OrgConfig: dbClient.orgConfig
    }
  });
}

var getStudentReport = createQuery(getStudentReport$1);

async function getStudentSegregation$2(args, context) {
  if (!context.user) return [];
  const { orgId } = args;
  const config = await context.entities.OrgConfig.findUnique({ where: { orgId } });
  const weights = config ? {
    assignment: config.weightAssignment,
    behavior: config.weightBehavior,
    performance: config.weightPerformance,
    classTest: config.weightClassTest
  } : void 0;
  const students = await context.entities.OrgStudent.findMany({ where: { orgId } });
  const results = [];
  for (const student of students) {
    const assessments = await context.entities.Assessment.findMany({
      where: { orgStudentId: student.id }
    });
    const qrPapers = await context.entities.QRPaper.findMany({
      where: { orgStudentId: student.id },
      include: { questionSets: { include: { attempts: true } } }
    });
    const classTestAttempts = [];
    for (const paper of qrPapers) {
      for (const qs of paper.questionSets) {
        for (const a of qs.attempts) classTestAttempts.push(a);
      }
    }
    const { breakdown, combinedScore } = computeStudentScore(assessments, classTestAttempts, weights);
    results.push({
      ...student,
      combinedScore,
      tier: getTier(combinedScore),
      recommendedDifficulty: getRecommendedDifficulty(combinedScore),
      breakdown
    });
  }
  results.sort((a, b) => b.combinedScore - a.combinedScore);
  return results;
}

async function getStudentSegregation$1(args, context) {
  return getStudentSegregation$2(args, {
    ...context,
    entities: {
      Assessment: dbClient.assessment,
      OrgStudent: dbClient.orgStudent,
      QRPaper: dbClient.qRPaper,
      QuestionSet: dbClient.questionSet,
      Attempt: dbClient.attempt,
      Campaign: dbClient.campaign,
      OrgConfig: dbClient.orgConfig
    }
  });
}

var getStudentSegregation = createQuery(getStudentSegregation$1);

async function getOrgConfig$2(args, context) {
  if (!context.user) return null;
  const config = await context.entities.OrgConfig.findUnique({ where: { orgId: args.orgId } });
  return config || {
    weightAssignment: 0.3,
    weightBehavior: 0.1,
    weightPerformance: 0.2,
    weightClassTest: 0.4
  };
}

async function getOrgConfig$1(args, context) {
  return getOrgConfig$2(args, {
    ...context,
    entities: {
      OrgConfig: dbClient.orgConfig,
      Organization: dbClient.organization
    }
  });
}

var getOrgConfig = createQuery(getOrgConfig$1);

const router$3 = express.Router();
router$3.post("/create-organization", auth, createOrganization);
router$3.post("/add-org-students", auth, addOrgStudents);
router$3.post("/create-campaign", auth, createCampaign);
router$3.post("/generate-secure-qr", auth, generateSecureQR);
router$3.post("/create-individual-session", auth, createIndividualSession);
router$3.post("/generate-bulk-qr", auth, generateBulkQR);
router$3.post("/submit-attempt", auth, submitAttempt);
router$3.post("/create-assessment", auth, createAssessment);
router$3.post("/delete-assessment", auth, deleteAssessment);
router$3.post("/update-org-config", auth, updateOrgConfig);
router$3.post("/delete-paper", auth, deletePaper);
router$3.post("/delete-campaign", auth, deleteCampaign);
router$3.post("/get-me", auth, getMe);
router$3.post("/get-my-organization", auth, getMyOrganization);
router$3.post("/get-org-students", auth, getOrgStudents);
router$3.post("/get-my-campaigns", auth, getMyCampaigns);
router$3.post("/get-campaigns", auth, getCampaigns);
router$3.post("/get-paper", auth, getPaper);
router$3.post("/get-student-weak-areas", auth, getStudentWeakAreas);
router$3.post("/get-student-papers", auth, getStudentPapers);
router$3.post("/get-org-student-papers", auth, getOrgStudentPapers);
router$3.post("/get-org-assessments", auth, getOrgAssessments);
router$3.post("/get-org-all-papers", auth, getOrgAllPapers);
router$3.post("/get-student-report", auth, getStudentReport);
router$3.post("/get-student-segregation", auth, getStudentSegregation);
router$3.post("/get-org-config", auth, getOrgConfig);

const _waspGlobalMiddlewareConfigFn = (mc) => mc;
const defaultGlobalMiddlewareConfig = /* @__PURE__ */ new Map([
  ["helmet", helmet()],
  ["cors", cors({ origin: config$1.allowedCORSOrigins })],
  ["logger", logger("dev")],
  ["express.json", express.json()],
  ["express.urlencoded", express.urlencoded()],
  ["cookieParser", cookieParser()]
]);
const globalMiddlewareConfig = _waspGlobalMiddlewareConfigFn(defaultGlobalMiddlewareConfig);
function globalMiddlewareConfigForExpress(middlewareConfigFn) {
  {
    return Array.from(globalMiddlewareConfig.values());
  }
}

var me = defineHandler(async (req, res) => {
  if (req.user) {
    res.json(serialize(req.user));
  } else {
    res.json(serialize(null));
  }
});

var logout = defineHandler(async (req, res) => {
  if (req.sessionId) {
    await invalidateSession(req.sessionId);
    res.json({ success: true });
  } else {
    throw createInvalidCredentialsError();
  }
});

const onBeforeSignupHook = async (_params) => {
};
const onAfterSignupHook = async (_params) => {
};
const onAfterEmailVerifiedHook = async (_params) => {
};
const onBeforeLoginHook = async (_params) => {
};
const onAfterLoginHook = async (_params) => {
};

function getLoginRoute() {
  return async function login(req, res) {
    const fields = req.body ?? {};
    ensureValidArgs$2(fields);
    const providerId = createProviderId("email", fields.email);
    const authIdentity = await findAuthIdentity(providerId);
    if (!authIdentity) {
      throw createInvalidCredentialsError();
    }
    const providerData = getProviderDataWithPassword(authIdentity.providerData);
    if (!providerData.isEmailVerified) {
      throw createInvalidCredentialsError();
    }
    try {
      await verifyPassword(providerData.hashedPassword, fields.password);
    } catch (e) {
      throw createInvalidCredentialsError();
    }
    const auth = await findAuthWithUserBy({ id: authIdentity.authId });
    if (auth === null) {
      throw createInvalidCredentialsError();
    }
    await onBeforeLoginHook({
      user: auth.user
    });
    const session = await createSession(auth.id);
    await onAfterLoginHook({
      user: auth.user
    });
    res.json({
      sessionId: session.id
    });
  };
}
function ensureValidArgs$2(args) {
  ensureValidEmail(args);
  ensurePasswordIsPresent(args);
}

const JWT_SECRET = new TextEncoder().encode(config$1.auth.jwtSecret);
const JWT_ALGORITHM = "HS256";
const { createJWT, validateJWT } = createJWTHelpers(JWT_SECRET, JWT_ALGORITHM);

function formatFromField({ email, name }) {
  if (name) {
    return `${name} <${email}>`;
  }
  return email;
}
function getDefaultFromField() {
  return {
    email: "",
    name: ""
  };
}

function initSmtpEmailSender(config) {
  const transporter = createTransport({
    host: config.host,
    port: config.port,
    auth: {
      user: config.username,
      pass: config.password
    }
  });
  const defaultFromField = getDefaultFromField();
  return {
    async send(email) {
      return transporter.sendMail({
        from: formatFromField(email.from || defaultFromField),
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html
      });
    }
  };
}

const emailProvider = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  username: env.SMTP_USERNAME,
  password: env.SMTP_PASSWORD
};
const emailSender = initSmtpEmailSender(emailProvider);

async function createEmailVerificationLink(email, clientRoute) {
  const { jwtToken } = await createEmailJWT(email);
  return `${config$1.frontendUrl}${clientRoute}?token=${jwtToken}`;
}
async function createPasswordResetLink(email, clientRoute) {
  const { jwtToken } = await createEmailJWT(email);
  return `${config$1.frontendUrl}${clientRoute}?token=${jwtToken}`;
}
async function createEmailJWT(email) {
  const jwtToken = await createJWT({ email }, { expiresIn: new TimeSpan(30, "m") });
  return { jwtToken };
}
async function sendPasswordResetEmail(email, content) {
  return sendEmailAndSaveMetadata(email, content, {
    passwordResetSentAt: (/* @__PURE__ */ new Date()).toISOString()
  });
}
async function sendEmailVerificationEmail(email, content) {
  return sendEmailAndSaveMetadata(email, content, {
    emailVerificationSentAt: (/* @__PURE__ */ new Date()).toISOString()
  });
}
async function sendEmailAndSaveMetadata(email, content, metadata) {
  const providerId = createProviderId("email", email);
  const authIdentity = await findAuthIdentity(providerId);
  if (!authIdentity) {
    throw new Error(`User with email: ${email} not found.`);
  }
  const providerData = getProviderDataWithPassword(authIdentity.providerData);
  await updateAuthIdentityProviderData(providerId, providerData, metadata);
  emailSender.send(content).catch((e) => {
    console.error("Failed to send email", e);
  });
}
function isEmailResendAllowed(fields, field, resendInterval = 1e3 * 60) {
  const sentAt = fields[field];
  if (!sentAt) {
    return {
      isResendAllowed: true,
      timeLeft: 0
    };
  }
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - new Date(sentAt).getTime();
  const isResendAllowed = diff > resendInterval;
  const timeLeft = isResendAllowed ? 0 : Math.round((resendInterval - diff) / 1e3);
  return { isResendAllowed, timeLeft };
}

function getSignupRoute({
  userSignupFields,
  fromField,
  clientRoute,
  getVerificationEmailContent,
  isEmailAutoVerified
}) {
  return async function signup(req, res) {
    const fields = req.body;
    ensureValidArgs$1(fields);
    const providerId = createProviderId("email", fields.email);
    const existingAuthIdentity = await findAuthIdentity(providerId);
    if (existingAuthIdentity) {
      const providerData = getProviderDataWithPassword(
        existingAuthIdentity.providerData
      );
      if (providerData.isEmailVerified) {
        await doFakeWork();
        res.json({ success: true });
        return;
      }
      const { isResendAllowed, timeLeft } = isEmailResendAllowed(
        providerData,
        "passwordResetSentAt"
      );
      if (!isResendAllowed) {
        throw new HttpError(
          400,
          `Please wait ${timeLeft} secs before trying again.`
        );
      }
      try {
        await deleteUserByAuthId(existingAuthIdentity.authId);
      } catch (e) {
        rethrowPossibleAuthError(e);
      }
    }
    const userFields = await validateAndGetUserFields(fields);
    const newUserProviderData = await sanitizeAndSerializeProviderData(
      {
        hashedPassword: fields.password,
        isEmailVerified: false,
        emailVerificationSentAt: null,
        passwordResetSentAt: null
      }
    );
    try {
      await onBeforeSignupHook({ req, providerId });
      const user = await createUser(
        providerId,
        newUserProviderData,
        // Using any here because we want to avoid TypeScript errors and
        // rely on Prisma to validate the data.
        userFields
      );
      await onAfterSignupHook({ req, providerId, user });
    } catch (e) {
      rethrowPossibleAuthError(e);
    }
    const verificationLink = await createEmailVerificationLink(
      fields.email,
      clientRoute
    );
    try {
      await sendEmailVerificationEmail(fields.email, {
        from: fromField,
        to: fields.email,
        ...getVerificationEmailContent({ verificationLink })
      });
    } catch (e) {
      console.error("Failed to send email verification email:", e);
      throw new HttpError(500, "Failed to send email verification email.");
    }
    res.json({ success: true });
  };
}
function ensureValidArgs$1(args) {
  ensureValidEmail(args);
  ensurePasswordIsPresent(args);
  ensureValidPassword(args);
}

function getRequestPasswordResetRoute({
  fromField,
  clientRoute,
  getPasswordResetEmailContent
}) {
  return async function requestPasswordReset(req, res) {
    const args = req.body ?? {};
    ensureValidEmail(args);
    const authIdentity = await findAuthIdentity(
      createProviderId("email", args.email)
    );
    if (!authIdentity) {
      await doFakeWork();
      res.json({ success: true });
      return;
    }
    const providerData = getProviderDataWithPassword(authIdentity.providerData);
    const { isResendAllowed, timeLeft } = isEmailResendAllowed(providerData, "passwordResetSentAt");
    if (!isResendAllowed) {
      throw new HttpError(400, `Please wait ${timeLeft} secs before trying again.`);
    }
    const passwordResetLink = await createPasswordResetLink(args.email, clientRoute);
    try {
      const email = authIdentity.providerUserId;
      await sendPasswordResetEmail(
        email,
        {
          from: fromField,
          to: email,
          ...getPasswordResetEmailContent({ passwordResetLink })
        }
      );
    } catch (e) {
      console.error("Failed to send password reset email:", e);
      throw new HttpError(500, "Failed to send password reset email.");
    }
    res.json({ success: true });
  };
}

async function resetPassword(req, res) {
  const args = req.body ?? {};
  ensureValidArgs(args);
  const { token, password } = args;
  const { email } = await validateJWT(token).catch(() => {
    throw new HttpError(400, "Password reset failed, invalid token");
  });
  const providerId = createProviderId("email", email);
  const authIdentity = await findAuthIdentity(providerId);
  if (!authIdentity) {
    throw new HttpError(400, "Password reset failed, invalid token");
  }
  const providerData = getProviderDataWithPassword(authIdentity.providerData);
  await updateAuthIdentityProviderData(providerId, providerData, {
    // The act of resetting the password verifies the email
    isEmailVerified: true,
    // The password will be hashed when saving the providerData
    // in the DB
    hashedPassword: password
  });
  res.json({ success: true });
}
function ensureValidArgs(args) {
  ensureTokenIsPresent(args);
  ensurePasswordIsPresent(args);
  ensureValidPassword(args);
}

async function verifyEmail(req, res) {
  const { token } = req.body;
  const { email } = await validateJWT(token).catch(() => {
    throw new HttpError(400, "Email verification failed, invalid token");
  });
  const providerId = createProviderId("email", email);
  const authIdentity = await findAuthIdentity(providerId);
  if (!authIdentity) {
    throw new HttpError(400, "Email verification failed, invalid token");
  }
  const providerData = getProviderDataWithPassword(authIdentity.providerData);
  await updateAuthIdentityProviderData(providerId, providerData, {
    isEmailVerified: true
  });
  const auth = await findAuthWithUserBy({ id: authIdentity.authId });
  await onAfterEmailVerifiedHook({ user: auth.user });
  res.json({ success: true });
}

const _waspUserSignupFields = void 0;
const _waspGetVerificationEmailContent = ({ verificationLink }) => ({
  subject: "Verify your email",
  text: `Click the link below to verify your email: ${verificationLink}`,
  html: `
        <p>Click the link below to verify your email</p>
        <a href="${verificationLink}">Verify email</a>
    `
});
const _waspGetPasswordResetEmailContent = ({ passwordResetLink }) => ({
  subject: "Reset your password",
  text: `Click the link below to reset your password: ${passwordResetLink}`,
  html: `
        <p>Click the link below to reset your password</p>
        <a href="${passwordResetLink}">Reset password</a>
    `
});
const fromField = {
  name: "Professor ARQI",
  email: "admin@professorqrai.com"
};
const config = {
  id: "email",
  displayName: "Email and password",
  createRouter() {
    const router = Router();
    const loginRoute = defineHandler(getLoginRoute());
    router.post("/login", loginRoute);
    const signupRoute = defineHandler(getSignupRoute({
      userSignupFields: _waspUserSignupFields,
      fromField,
      clientRoute: "/email-verification",
      getVerificationEmailContent: _waspGetVerificationEmailContent,
      isEmailAutoVerified: false
    }));
    router.post("/signup", signupRoute);
    const requestPasswordResetRoute = defineHandler(getRequestPasswordResetRoute({
      fromField,
      clientRoute: "/password-reset",
      getPasswordResetEmailContent: _waspGetPasswordResetEmailContent
    }));
    router.post("/request-password-reset", requestPasswordResetRoute);
    router.post("/reset-password", defineHandler(resetPassword));
    router.post("/verify-email", defineHandler(verifyEmail));
    return router;
  }
};

const providers = [
  config
];
const router$2 = Router();
for (const provider of providers) {
  const { createRouter } = provider;
  const providerRouter = createRouter(provider);
  router$2.use(`/${provider.id}`, providerRouter);
  console.log(`\u{1F680} "${provider.displayName}" auth initialized`);
}

const router$1 = express.Router();
router$1.get("/me", auth, me);
router$1.post("/logout", auth, logout);
router$1.use("/", router$2);

const router = express.Router();
const middleware = globalMiddlewareConfigForExpress();
router.get(
  "/",
  middleware,
  function(_req, res) {
    res.status(200).send();
  }
);
router.use("/auth", middleware, router$1);
router.use("/operations", middleware, router$3);

const app = express();
app.use("/", router);
app.use((err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message, data: err.data });
  }
  return next(err);
});

const startServer = async () => {
  const port = normalizePort(config$1.port);
  app.set("port", port);
  const server = http.createServer(app);
  server.listen(port);
  server.on("error", (error) => {
    if (error.syscall !== "listen") throw error;
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
      default:
        throw error;
    }
  });
  server.on("listening", () => {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    console.log("Server listening on " + bind);
  });
};
startServer().catch((e) => console.error(e));
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}
//# sourceMappingURL=server.js.map
