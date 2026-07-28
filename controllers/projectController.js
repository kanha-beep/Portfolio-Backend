import ExpressError from '../middleware/ExpressError.js';
import Project from '../models/projectSchema.js';
import { projectsSchemaValidate } from '../schemaValidation/projectsSchemaValidate.js';

export const getProjects = async (req, res, next) => {
  const projects = await Project.find({});
  res.json(projects);
};

export const addProject = async (req, res, next) => {
  const { title, description, url_1, url_2 } = req.body;
  // const { error, value } = projectsSchemaValidate.validate(req.body, { abortEarly: false })
  // if (error) return next(new ExpressError(400, error.details[0].message))
  const project = await Project.create({ title, description, url_1, url_2 });
  res.status(201).json(project);
};
export const singleProject = async (req, res, next) => {
  const id = req.params.id;
  // console.log("1. id: ", id)
  const project = await Project.findOne({ _id: id });
  if (!project) return next(new ExpressError(404, "Project not found"))
  // console.log("2. project: ", project)
  res.status(201).json(project);
};
export const editProject = async (req, res, next) => {
  const id = req.params.id;
  console.log("3. id: ", id)
  const { error, value } = projectsSchemaValidate.validate(req.body, { abortEarly: false, allowUnknown: true, stripUnknown: true })
  if (error) return next(new ExpressError(400, error.details[0].message))
  const project = await Project.findByIdAndUpdate(id, { ...value });
  console.log("4. project: ", project)
  res.status(201).json(project);
};
export const deleteProject = async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return next(new ExpressError(404, "Project not found"));
  res.json({ message: 'Project deleted' });
};
