"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function ContactForm() {
  const [state, setState] = useState<string>("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    if (f.get("website")) return setState("done"); // honeypot
    setState("sending");
    const { error } = await supabase.from("messages").insert({
      name: String(f.get("name") || ""), email: String(f.get("email") || ""),
      budget: String(f.get("budget") || ""), text: String(f.get("text") || ""),
    });
    setState(error ? "Gönderilemedi. E-postanı ve mesajını kontrol edip tekrar dene." : "done");
  }
  if (state === "done") return <p className="caption text-lg">Teklifin ulaştı. En kısa sürede e-postana döneceğim.</p>;
  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      <input name="name" placeholder="Adın" className="field" aria-label="Adın" maxLength={100} />
      <input name="email" type="email" required placeholder="E-posta" className="field" aria-label="E-posta" />
      <input name="budget" placeholder="Bütçe (isteğe bağlı)" className="field md:col-span-2" aria-label="Bütçe" maxLength={60} />
      <textarea name="text" required rows={5} maxLength={3000} placeholder="Projeni ve zaman çizelgeni anlat" className="field md:col-span-2" aria-label="Mesaj" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button disabled={state === "sending"} className="font-title text-2xl tracking-wide bg-sodium text-black px-6 py-3 border-2 border-black shadow-[4px_4px_0_#000] hover:bg-bone md:col-span-2">
        {state === "sending" ? "Gönderiliyor…" : "Teklifi gönder"}
      </button>
      {state !== "idle" && state !== "sending" && <p className="text-blood md:col-span-2" role="alert">{state}</p>}
    </form>
  );
}
