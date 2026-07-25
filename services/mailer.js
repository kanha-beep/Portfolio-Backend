import nodemailer from 'nodemailer';
import ExpressError from '../middleware/ExpressError.js';

let transporter;

const getRequiredMailConfig = () => {
  const { MAIL_USER, MAIL_APP_PASSWORD, CONTACT_RECEIVER_EMAIL } = process.env;

  if (!MAIL_USER || !MAIL_APP_PASSWORD || !CONTACT_RECEIVER_EMAIL) {
    throw new ExpressError(
      500,
      'Mail is not configured. Set MAIL_USER, MAIL_APP_PASSWORD, and CONTACT_RECEIVER_EMAIL in server/.env.'
    );
  }

  return { MAIL_USER, MAIL_APP_PASSWORD, CONTACT_RECEIVER_EMAIL };
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const { MAIL_USER, MAIL_APP_PASSWORD } = getRequiredMailConfig();

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: MAIL_USER,
      pass: MAIL_APP_PASSWORD,
    },
  });

  return transporter;
};

export const sendContactNotification = async ({
  name,
  email,
  message,
  projectName,
  projectId,
}) => {
  const { MAIL_USER, CONTACT_RECEIVER_EMAIL } = getRequiredMailConfig();
  const subjectProject = projectName?.trim() || 'General inquiry';
  const submittedAt = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const text = [
    'New contact form submission from your portfolio.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Project: ${subjectProject}`,
    `Project ID: ${projectId || 'Not provided'}`,
    `Submitted: ${submittedAt}`,
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Project:</strong> ${escapeHtml(subjectProject)}</p>
      <p><strong>Project ID:</strong> ${escapeHtml(projectId || 'Not provided')}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  const clientText = [
    `Hi ${name},`,
    '',
    'Thanks for reaching out through my portfolio.',
    `I have received your message about "${subjectProject}".`,
    '',
    'Here is a copy of what you sent:',
    message,
    '',
    'I will get back to you soon.',
  ].join('\n');

  const clientHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 16px;">Thanks for reaching out</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thanks for contacting me through my portfolio.</p>
      <p>I have received your message about <strong>${escapeHtml(subjectProject)}</strong>.</p>
      <p><strong>Your message:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      <p style="margin-top: 16px;">I will get back to you soon.</p>
    </div>
  `;

  const transporter = getTransporter();

  await Promise.all([
    transporter.sendMail({
      from: process.env.MAIL_FROM || MAIL_USER,
      to: CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `Portfolio contact: ${subjectProject}`,
      text,
      html,
    }),
    transporter.sendMail({
      from: process.env.MAIL_FROM || MAIL_USER,
      to: email,
      subject: `We received your message: ${subjectProject}`,
      text: clientText,
      html: clientHtml,
    }),
  ]);
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
