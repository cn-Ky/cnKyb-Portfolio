"use client";
import { useEffect, useState } from "react";
import { supabase, defaultProfile, type Profile, type Project } from "@/lib/supabase";
import ContactForm from "./ContactForm";
export default function Home() {
  const [p, setP] = useState<Profile>(defaultProfile);
  const [projects, setProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    supabase.from("profile").select("*").eq("id", 1).single().then(({ data }) => data && setP(data as Profile));
    supabase.from("projects").select("*").order("created_at", { ascending: false }).then(({ data }) => setProjects((data as Project[]) ?? []));
  }, []);
  return (
    <main className="mx-auto max-w-6xl p-3 md:p-6 grid gap-4 md:gap-6">
      <section className="panel tint-blue min-h-[78vh] grid content-end p-6 md:p-12 -rotate-[0.4deg]">
        <div className="rain" />
        <div className="relative z-10 max-w-3xl">
          <p className="caption type-in inline-block max-w-full text-sm md:text-base">{p.tagline}</p>
          <h1 className="sfx font-title text-[22vw] leading-[.85] md:text-[11rem] mt-6 text-bone">{p.name}</h1>
          <p className="text-xl md:text-2xl mt-2 text-sodium">{p.role}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#hire" className="font-title text-xl bg-sodium text-black px-5 py-2 border-2 border-black shadow-[4px_4px_0_#000]">{p.available ? "İş teklifi ver" : "Mesaj bırak"}</a>
            <a href={p.github} className="font-title text-xl border-2 border-bone px-5 py-2 hover:bg-bone hover:text-black">GitHub</a>
          </div>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4 md:gap-6">
        <div className="panel tint-amber p-6 md:col-span-2 rotate-[0.3deg]"><p className="caption text-base md:text-lg leading-relaxed">{p.bio || "…"}</p></div>
        <div className="panel p-6 grid place-content-center text-center">
          <p className="font-title text-4xl">{p.available ? "Müsaitim" : "Şu an dolu"}</p>
          <p className="text-sm mt-1 text-bone/70">{p.available ? "Yeni projelere açığım." : "Mesaj bırak, sıraya alırım."}</p>
        </div>
      </section>
      <section className="grid md:grid-cols-6 gap-4 md:gap-6">
        {projects?.length === 0 && <p className="panel p-6 md:col-span-6">Henüz proje yok.</p>}
        {projects?.map((pr, i) => (
          <article key={pr.id} className={`panel group ${i % 3 === 0 ? "md:col-span-4" : "md:col-span-2"} ${i % 2 ? "tint-amber" : "tint-blue"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {pr.image && <img src={pr.image} alt="" loading="lazy" className="w-full h-48 md:h-56 object-cover grayscale contrast-125 group-hover:grayscale-0 transition" />}
            <div className="p-5 relative z-10">
              <h2 className="font-title text-3xl">{pr.title}</h2>
              <p className="caption mt-3 text-sm">{pr.caption}</p>
              <p className="mt-3 text-sm text-sodium">{pr.tags.join(", ")}</p>
              <div className="mt-3 flex gap-4 text-sm underline underline-offset-4">
                {pr.url && <a href={pr.url} target="_blank" rel="noreferrer">Canlı</a>}
                {pr.repo && <a href={pr.repo} target="_blank" rel="noreferrer">Kaynak kod</a>}
              </div>
            </div>
          </article>
        ))}
      </section>
      <section id="hire" className="panel tint-blue p-6 md:p-10">
        <h2 className="font-title text-5xl md:text-6xl mb-2">Projen var mı?</h2>
        <p className="mb-6 text-bone/80">Formu doldur. Mesaj doğrudan bana ulaşır.</p>
        <ContactForm />
      </section>
      <footer className="text-center text-sm text-bone/50 py-6">© {new Date().getFullYear()} {p.name}</footer>
    </main>
  );
}
