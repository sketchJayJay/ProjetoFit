import React, { useEffect, useRef } from "react";
import { X, ArrowUpRight, Activity } from "lucide-react";
import { initials } from "../lib/model";

export function Brand({ small = false }) {
  return (
    <div className={`brand ${small ? "small" : ""}`}>
      <img
        className="brand-logo"
        src="/logo-otavio-garcez.jpg"
        alt="Otávio Garcez Personal"
        width="532"
        height="243"
      />
    </div>
  );
}
export function Avatar({ name, index = 0, size = "" }) {
  return (
    <span
      className={`avatar color-${Math.abs(Number(index) || 0) % 4} ${size}`}
    >
      {initials(name)}
    </span>
  );
}
export function Pill({ children, tone = "" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
export function Action({
  children,
  onClick,
  secondary = false,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`action ${secondary ? "secondary" : ""} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
export function Panel({ children, className = "", ...props }) {
  return (
    <section className={`panel ${className}`} {...props}>
      {children}
    </section>
  );
}
export function PanelHead({ eyebrow, title, action }) {
  return (
    <div className="panel-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h3>{title}</h3>
      </div>
      {action}
    </div>
  );
}
export function Empty({ icon: Icon = Activity, title, text, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const container = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    container.current?.focus();
    const handle = (e) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const nodes = container.current?.querySelectorAll(
          'button:not(:disabled),input:not(:disabled),textarea,select,a[href],[tabindex="0"]',
        );
        if (!nodes?.length) return;
        if (e.shiftKey && document.activeElement === nodes[0]) {
          e.preventDefault();
          nodes[nodes.length - 1].focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === nodes[nodes.length - 1]
        ) {
          e.preventDefault();
          nodes[0].focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={container}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`modal ${wide ? "wide" : ""}`}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function LinkAction({ children, onClick }) {
  return (
    <button className="text-action" onClick={onClick}>
      {children}
      <ArrowUpRight size={16} />
    </button>
  );
}
export function Ring({ value, label, sublabel, size = 150 }) {
  const radius = 50,
    c = 2 * Math.PI * radius;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="ring-track" cx="60" cy="60" r={radius} />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, Math.max(0, value)) / 100)}
        />
      </svg>
      <div>
        <strong>{label}</strong>
        <small>{sublabel}</small>
      </div>
    </div>
  );
}
