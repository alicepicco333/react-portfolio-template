import React, { useState } from "react";

// A small contact form for a static site: messages are relayed to the business address by FormSubmit
// (no server needed). If sending fails, the visitor is offered a ready-made email instead.
const ENDPOINT = (email) => `https://formsubmit.co/ajax/${email}`;

const field =
  "w-full border border-bone/40 bg-transparent px-3 py-3 text-[16px] text-bone placeholder:text-bone/50 focus:border-bone focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-olive";

const ContactForm = ({ email }) => {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | failed

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const check = () => {
    const e = {};
    if (!values.name.trim()) e.name = "Add your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) e.email = "Add an email address I can reply to, like name@example.com.";
    if (values.message.trim().length < 10) e.message = "Write a few words about what you have in mind.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (ev.target.elements._honey?.value) return; // a bot filled the hidden field
    if (!check()) return;
    setState("sending");
    try {
      const res = await fetch(ENDPOINT(email), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...values, _subject: `Portfolio: message from ${values.name}`, _template: "table", _captcha: "false" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      setValues({ name: "", email: "", message: "" });
    } catch (e) {
      setState("failed");
    }
  };

  const mailto = `mailto:${email}?subject=${encodeURIComponent(`Portfolio: message from ${values.name || "a visitor"}`)}&body=${encodeURIComponent(values.message)}`;

  if (state === "sent") {
    return (
      <p className="border border-bone/40 px-4 py-5 text-[18px]" role="status">
        Thank you, your message is on its way. I usually reply within a few days.
      </p>
    );
  }

  const err = (k) =>
    errors[k] ? (
      <p id={`cf-${k}-error`} className="font-mono text-[14px] text-bone">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5" aria-label="Contact form">
      <div className="grid gap-5 tablet:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="cf-name" className="font-mono text-[14px] text-bone/80">
            Name
          </label>
          <input id="cf-name" name="name" autoComplete="name" value={values.name} onChange={set("name")} className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? "cf-name-error" : undefined} />
          {err("name")}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cf-email" className="font-mono text-[14px] text-bone/80">
            Email
          </label>
          <input id="cf-email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} className={field} aria-invalid={!!errors.email} aria-describedby={errors.email ? "cf-email-error" : undefined} />
          {err("email")}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="cf-message" className="font-mono text-[14px] text-bone/80">
          Message
        </label>
        <textarea id="cf-message" name="message" rows={5} value={values.message} onChange={set("message")} className={`${field} resize-y`} aria-invalid={!!errors.message} aria-describedby={errors.message ? "cf-message-error" : undefined} />
        {err("message")}
      </div>
      {/* hidden from people; bots that fill it are ignored */}
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === "sending"} className="fu-btn border-bone bg-bone text-ink hover:border-olive hover:bg-olive hover:text-white disabled:opacity-60">
          {state === "sending" ? "Sending..." : "Send message"}
        </button>
        {state === "failed" && (
          <p className="text-[16px]" role="alert">
            The message could not be sent.{" "}
            <a href={mailto} className="underline decoration-olive decoration-2 underline-offset-4">
              Send it by email instead
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
