import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabasePublic } from "@/integrations/supabase/client.public";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// L'applicazione non usa mai la chiave service role. Le letture pubbliche
// passano dal client anon (`supabasePublic`), le operazioni di amministrazione
// dal client autenticato dell'utente (`context.supabase`): in entrambi i casi
// è il database, con le sue policy RLS, a decidere cosa è permesso.

// ---------------------- LETTURE PUBBLICHE (client anon, solo righe pubblicate) ----------------------

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabasePublic.from("site_settings").select("key, value");
  if (error) throw error;
  const map: Record<string, any> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
});

export const getPublishedSectors = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabasePublic
    .from("sectors")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export const getSectorBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabasePublic
      .from("sectors")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

export const getPublishedProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabasePublic
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

export const getPublishedCertifications = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabasePublic
    .from("certifications")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
});

// ---------------------- LEAD SUBMISSION (public) ----------------------

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
});

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    // La tabella `leads` non è scrivibile da anonimo: si passa dalla funzione
    // SECURITY DEFINER `zicca.submit_lead`, che rivalida i campi lato database
    // e imposta solo le colonne del form (`status` e `notes` restano ai valori
    // di default e non sono pilotabili dall'esterno).
    const { error } = await supabasePublic.rpc("submit_lead", {
      _name: data.name,
      _email: data.email,
      _message: data.message,
      _phone: data.phone || null,
      _company: data.company || null,
      _subject: data.subject || null,
    });
    if (error) {
      console.error("submitLead error", error);
      throw new Error("Impossibile inviare la richiesta");
    }
    return { ok: true };
  });

// ---------------------- ADMIN: AUTH & ROLE ----------------------

type AuthedContext = { supabase: SupabaseClient<Database, "zicca">; userId: string };

// Le policy RLS bloccano già le scritture di chi non è admin: questo controllo
// serve a restituire un errore chiaro invece di un fallimento silenzioso.
async function ensureAdmin(context: AuthedContext) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin role required");
}

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data, userId: context.userId };
  });

// ---------------------- ADMIN: SITE SETTINGS ----------------------

export const upsertSiteSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ key: z.string().min(1).max(100), value: z.any() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw error;
    return { ok: true };
  });

// ---------------------- ADMIN: SECTORS ----------------------

const sectorInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  tagline: z.string().max(300).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  icon: z.string().max(60).nullable().optional(),
  image_url: z.string().url().max(1000).nullable().optional().or(z.literal("")),
  bullets: z.array(z.string().max(200)).max(20).default([]),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});

export const adminListSectors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("sectors")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const adminSaveSector = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => sectorInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const payload = { ...data, image_url: data.image_url || null };
    const { error } = data.id
      ? await context.supabase.from("sectors").update(payload).eq("id", data.id)
      : await context.supabase.from("sectors").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteSector = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("sectors").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------------------- ADMIN: PROJECTS ----------------------

const projectInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  client: z.string().max(200).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  location: z.string().max(160).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  image_url: z.string().url().max(1000).nullable().optional().or(z.literal("")),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});

export const adminListProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const adminSaveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => projectInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const payload = { ...data, image_url: data.image_url || null };
    const { error } = data.id
      ? await context.supabase.from("projects").update(payload).eq("id", data.id)
      : await context.supabase.from("projects").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("projects").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------------------- ADMIN: CERTIFICATIONS ----------------------

const certInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  issuer: z.string().max(200).nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  pdf_url: z.string().url().max(1000).nullable().optional().or(z.literal("")),
  logo_url: z.string().url().max(1000).nullable().optional().or(z.literal("")),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});

export const adminListCertifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("certifications")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const adminSaveCertification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => certInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const payload = { ...data, pdf_url: data.pdf_url || null, logo_url: data.logo_url || null };
    const { error } = data.id
      ? await context.supabase.from("certifications").update(payload).eq("id", data.id)
      : await context.supabase.from("certifications").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteCertification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("certifications").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------------------- ADMIN: LEADS ----------------------

export const adminListLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminUpdateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "in_progress", "closed"]).optional(),
        notes: z.string().max(4000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("leads").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("leads").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------------------- CUSTOM SECTIONS ----------------------

export const PAGE_LOCATIONS = [
  { value: "home", label: "Home" },
  { value: "azienda", label: "Azienda" },
  { value: "settori", label: "Settori (indice)" },
  { value: "referenze", label: "Referenze" },
  { value: "certificazioni", label: "Certificazioni" },
  { value: "contatti", label: "Contatti" },
] as const;

export const getCustomSectionsByPage = createServerFn({ method: "GET" })
  .inputValidator((d: { page: string }) =>
    z
      .object({
        page: z
          .string()
          .min(1)
          .max(40)
          .regex(/^[a-z0-9_-]+$/),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabasePublic
      .from("custom_sections")
      .select("*")
      .eq("page_location", data.page)
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

const customSectionInput = z.object({
  id: z.string().uuid().optional(),
  page_location: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_-]+$/),
  eyebrow: z.string().max(120).nullable().optional(),
  title: z.string().min(1).max(240),
  heading_level: z.number().int().min(2).max(4).default(2),
  subtitle: z.string().max(400).nullable().optional(),
  body: z.string().max(8000).nullable().optional(),
  image_url: z.string().url().max(1000).nullable().optional().or(z.literal("")),
  image_position: z.enum(["left", "right", "top", "background", "none"]).default("right"),
  cta_label: z.string().max(80).nullable().optional(),
  cta_url: z.string().max(1000).nullable().optional(),
  background_style: z.enum(["default", "muted", "dark", "gradient"]).default("default"),
  sort_order: z.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});

export const adminListCustomSections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("custom_sections")
      .select("*")
      .order("page_location", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const adminSaveCustomSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => customSectionInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const payload = {
      ...data,
      image_url: data.image_url || null,
      eyebrow: data.eyebrow || null,
      subtitle: data.subtitle || null,
      body: data.body || null,
      cta_label: data.cta_label || null,
      cta_url: data.cta_url || null,
    };
    const { error } = data.id
      ? await context.supabase.from("custom_sections").update(payload).eq("id", data.id)
      : await context.supabase.from("custom_sections").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteCustomSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("custom_sections").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------------------- ADMIN: BOOTSTRAP FIRST ADMIN ----------------------

// One-shot: if NO admin exists yet, the currently signed-in user becomes admin.
// After the first admin is created this is a no-op.
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // `user_roles` non ha policy di INSERT: l'assegnazione passa dalla funzione
    // SECURITY DEFINER `zicca.claim_first_admin`, che assegna il ruolo a chi
    // chiama solo se non esiste ancora alcun amministratore (con lock, così due
    // richieste simultanee non diventano entrambe admin).
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw error;
    return { claimed: data === true };
  });
