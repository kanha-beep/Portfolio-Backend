import ExpressError from '../middleware/ExpressError.js';
import Contact from '../models/contactSchema.js';
import { contactSchemaValidate } from '../schemaValidation/contactSchemaValidate.js';
import { sendContactNotification } from '../services/mailer.js';

export const contact = async (req, res, next) => {
  const { error, value } = contactSchemaValidate.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return next(new ExpressError(401, error.details[0].message));
  }

  const { name, email, message, projectName } = value;
  const projectId = req.body.projectId?.trim?.() || '';

  const createdContact = await Contact.create({
    name,
    email,
    message,
    projectName,
  });

  try {
    await sendContactNotification({
      name,
      email,
      message,
      projectName,
      projectId,
    });
  } catch (mailError) {
    await createdContact.deleteOne();

    return next(
      new ExpressError(
        500,
        mailError.message || 'Contact saved, but the email notification could not be sent.'
      )
    );
  }

  res.status(201).json({
    _id: createdContact._id,
    name: createdContact.name,
    email: createdContact.email,
    message: 'Your message was sent successfully.',
  });
};
