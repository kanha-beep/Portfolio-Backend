import Joi from "joi";

export const contactSchemaValidate = Joi.object({
    name: Joi.string().trim().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required"
    }),
    email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
        "string.empty": "Email is required",
        "string.email": "Email must be valid",
        "any.required": "Email is required"
    }),
    message: Joi.string().trim().min(6).required().messages({
        "string.empty": "Message is required",
        "string.min": "Message must be at least 6 characters",
        "any.required": "Message is required"
    }),
    projectName: Joi.string().trim().allow("").messages({
        "string.empty": "Project Name is required",
        "any.required": "Project Name is required"
    })
}).options({ stripUnknown: true });
