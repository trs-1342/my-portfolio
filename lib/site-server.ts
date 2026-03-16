/**
 * Server-side Firestore okuma fonksiyonları (adminDb kullanır).
 * Sadece Server Components ve Route Handlers'da import edilebilir.
 */

import { adminDb } from "./firebase-admin";
import type { HomepageConfig, SkillItem, Project, MenuItem, AboutConfig, LifeEvent, ProjectsPageConfig } from "./firestore";
import {
  DEFAULT_HOMEPAGE,
  DEFAULT_SKILLS,
  DEFAULT_MENU,
  DEFAULT_PROJECTS,
  DEFAULT_PROJECTS_PAGE,
  DEFAULT_ABOUT,
  DEFAULT_LIFE_EVENTS,
} from "./site-defaults";

export async function getHomepageConfigServer(): Promise<HomepageConfig> {
  try {
    const snap = await adminDb.doc("site_config/homepage").get();
    if (!snap.exists) return DEFAULT_HOMEPAGE;
    return { ...DEFAULT_HOMEPAGE, ...snap.data() } as HomepageConfig;
  } catch {
    return DEFAULT_HOMEPAGE;
  }
}

export async function getSkillsServer(): Promise<SkillItem[]> {
  try {
    const snap = await adminDb.doc("site_config/skills").get();
    if (!snap.exists) return DEFAULT_SKILLS;
    return ((snap.data()?.items as SkillItem[]) ?? DEFAULT_SKILLS);
  } catch {
    return DEFAULT_SKILLS;
  }
}

export async function getMenuServer(): Promise<MenuItem[]> {
  try {
    const snap = await adminDb.doc("site_config/menu").get();
    if (!snap.exists) return DEFAULT_MENU;
    return ((snap.data()?.items as MenuItem[]) ?? DEFAULT_MENU);
  } catch {
    return DEFAULT_MENU;
  }
}

export async function getProjectsPageConfigServer(): Promise<ProjectsPageConfig> {
  try {
    const snap = await adminDb.doc("site_config/projects_page").get();
    if (!snap.exists) return DEFAULT_PROJECTS_PAGE;
    return { ...DEFAULT_PROJECTS_PAGE, ...snap.data() } as ProjectsPageConfig;
  } catch {
    return DEFAULT_PROJECTS_PAGE;
  }
}

export async function getAboutConfigServer(): Promise<AboutConfig> {
  try {
    const snap = await adminDb.doc("site_config/about").get();
    if (!snap.exists) return DEFAULT_ABOUT;
    return { ...DEFAULT_ABOUT, ...snap.data() } as AboutConfig;
  } catch {
    return DEFAULT_ABOUT;
  }
}

export async function getLifeEventsServer(): Promise<LifeEvent[]> {
  try {
    const snap = await adminDb.doc("site_config/life_events").get();
    if (!snap.exists) return DEFAULT_LIFE_EVENTS;
    return ((snap.data()?.items as LifeEvent[]) ?? DEFAULT_LIFE_EVENTS);
  } catch {
    return DEFAULT_LIFE_EVENTS;
  }
}

export async function getProjectsServer(): Promise<Project[]> {
  try {
    const snap = await adminDb
      .collection("projects")
      .orderBy("order", "asc")
      .get();
    if (snap.empty) {
      /* Henüz Firestore'da proje yoksa varsayılanları döndür */
      return DEFAULT_PROJECTS.map((p, i) => ({ ...p, id: `default-${i}` }));
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
  } catch {
    return DEFAULT_PROJECTS.map((p, i) => ({ ...p, id: `default-${i}` }));
  }
}
