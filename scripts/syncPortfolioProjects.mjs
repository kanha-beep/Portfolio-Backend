import "dotenv/config";
import mongoose from "mongoose";
import Project from "../models/projectSchema.js";

const projects = [
  {
    title: "Study SaaS",
    description:
      "Study SaaS built with JWT auth, REST APIs, admin workflows, role-based access control, and personalized news features to improve reliability, security, and engagement.",
    url_1: "https://quick-learn-frontend.vercel.app/",
    url_2: "",
  },
  {
    title: "News SaaS",
    description:
      "News and blog platform that integrates News API, automates topic-wise content flow, supports smooth news-to-blog navigation, and adds comments to improve retention and discussion.",
    url_1: "https://news-frontend-plum.vercel.app/",
    url_2: "",
  },
  {
    title: "Discussion SaaS",
    description:
      "Discussion SaaS with JWT auth, security hardening, public and private rooms, video calls, real-time chat, and AI-powered summaries and notes for better collaboration.",
    url_1: "https://discussion-frontend-hazel.vercel.app/",
    url_2: "",
  },
  {
    title: "E-Commerce Platform",
    description:
      "Modern e-commerce application with product browsing, shopping flow, and a responsive storefront experience focused on clean UI and conversion-friendly interactions.",
    url_1: "https://e-commerce-frontend-iota-kohl.vercel.app/",
    url_2: "",
  },
  {
    title: "Tenant Notes SaaS",
    description:
      "Multi-tenant notes SaaS with RBAC, REST APIs, isolated user workflows, and admin-oriented task and analytics flows for scalable collaboration.",
    url_1: "https://tenant-notes-application-frontend.vercel.app/",
    url_2: "",
  },
];

async function syncProjects() {
  await mongoose.connect(process.env.MONGO_URI);

  await Project.deleteMany({});
  await Project.insertMany(projects);

  console.log(`Synced ${projects.length} projects.`);
  await mongoose.disconnect();
}

syncProjects().catch(async (error) => {
  console.error("Project sync failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
