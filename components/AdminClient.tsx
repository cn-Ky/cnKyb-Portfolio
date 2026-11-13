"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase, defaultProfile, type Message, type Profile, type Project } from "@/lib/supabase";
const empty: Project = { id: "", title: "", caption: "", tags: [], url: "", repo: "", image: "" };
export default function AdminClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"projects" | "messages" | "profile">("projects");
  const [err, setErr] = useState(""); const [edit, setEdit] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]); const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile>(defaultProfile); const [image, setImage] = useState("");

  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("messages").select("*").order("created_at", { ascending: false }),
      supabase.from("profile").select("*").eq("id", 1).single()]);
    setProjects((a.data as Project[]) ?? []); setMessages((b.data as Message[]) ?? []); if (c.data) setProfile(c.data as Profile);
  }, []);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (authed) load(); }, [authed, load]);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
    setErr(error ? "E-posta veya şifre yanlış." : "");
  }
  async function upload(file: File) {
    const name = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("project-images").upload(name, file);
    if (error) return setErr("Görsel yüklenemedi: " + error.message);
    setImage(supabase.storage.from("project-images").getPublicUrl(name).data.publicUrl);
  }
  async function saveProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const row = { title: String(f.get("title")), caption: String(f.get("caption")), url: String(f.get("url")), repo: String(f.get("repo")), image: String(f.get("image")),
      tags: String(f.get("tags")).split(",").map((t) => t.trim()).filter(Boolean) };
    const { error } = await (edit?.id ? supabase.from("projects").update(row).eq("id", edit.id) : supabase.from("projects").insert(row));
    if (error) return setErr(error.message);
    setErr(""); setEdit(null); load();
  }
  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const { error } = await supabase.from("profile").update({ ...f, available: f.available === "on" }).eq("id", 1);
    setErr(error ? error.message : ""); load();
  }

  if (authed === null) return <main className="min-h-screen grid place-content-center">Yükleniyor…</main>;
  if (!authed) return (
    <main className="min-h-screen grid place-content-center p-6">
      <form onSubmit={login} className="panel p-8 w-80 grid gap-4">
        <h1 className="font-title text-4xl">Yönetim</h1>
        <input name="email" type="email" placeholder="E-posta" className="field" autoFocus aria-label="E-posta" />
        <input name="password" type="password" placeholder="Şifre" className="field" aria-label="Şifre" />
        {err && <p className="text-blood" role="alert">{err}</p>}
        <button className="font-title text-xl bg-sodium text-black py-2 border-2 border-black">Giriş yap</button>
      </form>
    </main>
  );
  const unread = messages.filter((m) => !m.read).length;
  const Tab = ({ id, children }: { id: typeof tab; children: React.ReactNode }) =>
    <button onClick={() => setTab(id)} className={`font-title text-xl px-4 py-2 border-2 border-bone ${tab === id ? "bg-bone text-black" : ""}`}>{children}</button>;
  return (
    <main className="mx-auto max-w-5xl p-4 md:p-8 grid gap-6">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="font-title text-4xl">Yönetim paneli</h1>
        <div className="flex gap-2 flex-wrap">
          <Tab id="projects">Projeler</Tab><Tab id="messages">Mesajlar{unread ? ` (${unread})` : ""}</Tab><Tab id="profile">Profil</Tab>
          <Link href="/" className="px-3 py-2 underline">Siteyi gör</Link>
          <button onClick={() => supabase.auth.signOut()} className="px-3 py-2 underline">Çıkış yap</button>
        </div>
      </header>
      {err && <p className="text-blood" role="alert">{err}</p>}
      {tab === "projects" && <section className="grid gap-4">
        <button onClick={() => { setEdit(empty); setImage(""); }} className="font-title text-xl bg-sodium text-black px-4 py-2 border-2 border-black w-fit">Proje ekle</button>
        {edit && <form key={edit.id || "new"} onSubmit={saveProject} className="panel p-5 grid gap-3 md:grid-cols-2">
          <input name="title" defaultValue={edit.title} placeholder="Başlık" required className="field" />
          <input name="tags" defaultValue={edit.tags.join(", ")} placeholder="Etiketler (virgülle)" className="field" />
          <textarea name="caption" defaultValue={edit.caption} placeholder="Kısa açıklama" rows={3} className="field md:col-span-2" />
          <input name="url" defaultValue={edit.url} placeholder="Canlı bağlantı" className="field" />
          <input name="repo" defaultValue={edit.repo} placeholder="GitHub bağlantısı" className="field" />
          <input name="image" value={image || edit.image} onChange={(e) => setImage(e.target.value)} placeholder="Görsel URL" className="field md:col-span-2" />
          <label className="md:col-span-2 text-sm">Ya da görsel yükle: <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
          <div className="flex gap-3"><button className="bg-sodium text-black px-4 py-2 font-title text-lg">Kaydet</button><button type="button" onClick={() => setEdit(null)} className="underline">Vazgeç</button></div>
        </form>}
        {projects.map((p) => <div key={p.id} className="panel p-4 flex justify-between gap-4 items-center">
          <div><h2 className="font-title text-2xl">{p.title}</h2><p className="text-sm text-bone/70">{p.tags.join(", ")}</p></div>
          <div className="flex gap-4 text-sm underline"><button onClick={() => { setEdit(p); setImage(p.image); }}>Düzenle</button>
            <button onClick={async () => { if (confirm("Bu proje silinsin mi?")) { await supabase.from("projects").delete().eq("id", p.id); load(); } }}>Sil</button></div>
        </div>)}
      </section>}
      {tab === "messages" && <section className="grid gap-4">
        {messages.length === 0 && <p className="panel p-6">Henüz mesaj yok.</p>}
        {messages.map((m) => <article key={m.id} className={`panel p-5 ${m.read ? "opacity-70" : ""}`}>
          <p className="font-title text-2xl">{m.name || "İsimsiz"} <a className="text-sodium text-base underline" href={`mailto:${m.email}`}>{m.email}</a></p>
          <p className="text-xs text-bone/60">{new Date(m.created_at).toLocaleString("tr-TR")}{m.budget && ` — Bütçe: ${m.budget}`}</p>
          <p className="caption mt-3 whitespace-pre-wrap">{m.text}</p>
          <div className="mt-3 flex gap-4 text-sm underline">
            {!m.read && <button onClick={async () => { await supabase.from("messages").update({ read: true }).eq("id", m.id); load(); }}>Okundu işaretle</button>}
            <button onClick={async () => { if (confirm("Mesaj silinsin mi?")) { await supabase.from("messages").delete().eq("id", m.id); load(); } }}>Sil</button>
          </div>
        </article>)}
      </section>}
      {tab === "profile" && <form key={profile.name + profile.bio} onSubmit={saveProfile} className="panel p-5 grid gap-3 md:grid-cols-2">
        {(["name", "role", "email", "github"] as const).map((k) => <input key={k} name={k} defaultValue={profile[k]} placeholder={k} className="field" />)}
        <input name="tagline" defaultValue={profile.tagline} placeholder="Açılış cümlesi" className="field md:col-span-2" />
        <textarea name="bio" defaultValue={profile.bio} rows={4} className="field md:col-span-2" />
        <label className="flex items-center gap-2"><input type="checkbox" name="available" defaultChecked={profile.available} /> Yeni işlere müsaitim</label>
        <button className="bg-sodium text-black px-4 py-2 font-title text-lg w-fit">Kaydet</button>
      </form>}
    </main>
  );
}
