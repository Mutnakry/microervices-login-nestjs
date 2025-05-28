// src/config/validation.ts
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  TCP_HOST: Joi.string().default('127.0.0.1'),
  TCP_PORT: Joi.number().default(8877),
  HTTP_PORT: Joi.number().default(3000),
});
