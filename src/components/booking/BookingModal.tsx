"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/lib/services";
import type { UserProfile } from "@/lib/firebase/types";
import { getAllProfessionals } from "@/lib/firebase/firestore";
import CalEmbed from "./CalEmbed";

export type Step = "summary" | "professional" | "calendar" | "success";

interface BookingModalProps {
    service: Service;
    onClose: () => void;
    initialProfessional?: UserProfile | null;
    initialStep?: Step;
}

const stepLabels: Record<Step, string> = {
    summary: "Servicio",
    professional: "Profesional",
    calendar: "Fecha y Hora",
    success: "Confirmación",
};
const stepOrder: Step[] = ["summary", "professional", "calendar", "success"];

const accentColors: Record<string, string> = {
    "bg-green-light": "bg-green text-white",
    "bg-blue-light": "bg-blue text-white",
    "bg-yellow-light": "bg-orange text-white",
};

// Fallback avatar initials
function Initials({ name }: { name: string }) {
    const parts = name.trim().split(" ");
    const initials = parts.length >= 2
        ? parts[0][0] + parts[1][0]
        : parts[0].slice(0, 2);
    return (
        <span className="text-lg font-bold text-white">
            {initials.toUpperCase()}
        </span>
    );
}

export default function BookingModal({ service, onClose, initialProfessional, initialStep }: BookingModalProps) {
    const [step, setStep] = useState<Step>(initialStep ?? "summary");
    const [visible, setVisible] = useState(false);
    const [professionals, setProfessionals] = useState<UserProfile[]>([]);
    const [loadingPros, setLoadingPros] = useState(false);
    const [selectedPro, setSelectedPro] = useState<UserProfile | null>(initialProfessional ?? null);

    // Animate in
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    // Load professionals when reaching step 2
    useEffect(() => {
        if (step === "professional" && professionals.length === 0) {
            setLoadingPros(true);
            getAllProfessionals()
                .then(setProfessionals)
                .catch(console.error)
                .finally(() => setLoadingPros(false));
        }
    }, [step, professionals.length]);

    // Close with animation
    function handleClose() {
        setVisible(false);
        setTimeout(onClose, 300);
    }

    // Keyboard Escape to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const currentStepIndex = stepOrder.indexOf(step);
    const accentClass = accentColors[service.bg] ?? "bg-foreground text-white";

    // Build cal link from selected professional
    const calLink = selectedPro?.calUsername
        ? `${selectedPro.calUsername}/${service.slug}`
        : null;

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Panel */}
            <div
                className={`relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] transition-transform duration-300 ${visible ? "translate-y-0 sm:scale-100" : "translate-y-full sm:scale-95"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${accentClass}`}>
                            {currentStepIndex + 1}
                        </span>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                Paso {currentStepIndex + 1} de {stepOrder.length}
                            </p>
                            <p className="font-semibold text-foreground text-sm">
                                {stepLabels[step]}
                            </p>
                        </div>
                    </div>

                    {/* Step dots */}
                    <div className="hidden sm:flex items-center gap-2">
                        {stepOrder.map((s, i) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${i <= currentStepIndex
                                        ? "w-6 bg-foreground"
                                        : "w-2 bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleClose}
                        className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                        aria-label="Cerrar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1">

                    {/* ── STEP 1: Summary ── */}
                    {step === "summary" && (
                        <div className="p-6 sm:p-8">
                            {/* Service card */}
                            <div className={`rounded-2xl ${service.bg} p-6 mb-6`}>
                                <h2 className="text-2xl font-black text-foreground">{service.name}</h2>
                                <p className="mt-1 text-gray-600 text-sm leading-relaxed">{service.description}</p>
                                <div className="mt-4 flex items-center gap-4">
                                    <span className="text-2xl font-black text-foreground">{service.price}</span>
                                    <span className="text-sm text-gray-500">/ {service.duration}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {service.features.map((feat) => (
                                    <li key={feat} className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            {/* Trust bar */}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-8">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Pago seguro Webpay
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Confirmación por email
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Cancela hasta 24h antes
                                </span>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => setStep("professional")}
                                className="w-full flex items-center justify-center gap-2 rounded-full bg-foreground py-4 text-white font-semibold text-base hover:bg-foreground/90 transition-colors"
                            >
                                Seleccionar profesional
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: Professional Selection ── */}
                    {step === "professional" && (
                        <div className="p-6 sm:p-8">
                            {/* Mini service info */}
                            <div className="flex items-center justify-between mb-6 px-1">
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{service.name}</p>
                                    <p className="text-xs text-gray-500">{service.price} · {service.duration}</p>
                                </div>
                                <button
                                    onClick={() => setStep("summary")}
                                    className="text-xs text-blue underline underline-offset-2 hover:text-blue-dark"
                                >
                                    ← Volver
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm mb-4">
                                Elige con quién quieres trabajar:
                            </p>

                            {/* Loading state */}
                            {loadingPros && (
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                                    ))}
                                </div>
                            )}

                            {/* Empty state */}
                            {!loadingPros && professionals.length === 0 && (
                                <div className="rounded-2xl bg-yellow-light p-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        No hay profesionales disponibles aún. Contáctanos directamente.
                                    </p>
                                </div>
                            )}

                            {/* Professional cards */}
                            {!loadingPros && professionals.length > 0 && (
                                <div className="space-y-3">
                                    {professionals.map((pro) => {
                                        const isSelected = selectedPro?.uid === pro.uid;
                                        const hasCalendar = !!pro.calUsername;
                                        return (
                                            <button
                                                key={pro.uid}
                                                onClick={() => hasCalendar && setSelectedPro(pro)}
                                                disabled={!hasCalendar}
                                                className={`w-full text-left rounded-2xl p-5 border-2 transition-all ${isSelected
                                                        ? "border-foreground bg-foreground/5"
                                                        : hasCalendar
                                                            ? "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                                            : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Avatar */}
                                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-blue flex items-center justify-center">
                                                        {pro.photoURL ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={pro.photoURL}
                                                                alt={pro.displayName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <Initials name={pro.displayName} />
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-foreground">{pro.displayName}</p>
                                                        {pro.bio && (
                                                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{pro.bio}</p>
                                                        )}
                                                        {!hasCalendar && (
                                                            <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Calendario no configurado
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Selection indicator */}
                                                    {hasCalendar && (
                                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-foreground bg-foreground" : "border-gray-300"
                                                            }`}>
                                                            {isSelected && (
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* CTA */}
                            {selectedPro && (
                                <button
                                    onClick={() => setStep("calendar")}
                                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-foreground py-4 text-white font-semibold text-base hover:bg-foreground/90 transition-colors"
                                >
                                    Elegir fecha con {selectedPro.displayName.split(" ")[0]}
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── STEP 3: Calendar ── */}
                    {step === "calendar" && (
                        <div className="p-4 sm:p-6">
                            {/* Mini info */}
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{service.name}</p>
                                    <p className="text-xs text-gray-500">
                                        con {selectedPro?.displayName} · {service.price} · {service.duration}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setStep("professional")}
                                    className="text-xs text-blue underline underline-offset-2 hover:text-blue-dark"
                                >
                                    ← Cambiar
                                </button>
                            </div>

                            {calLink ? (
                                <div className="min-h-[480px]">
                                    <CalEmbed
                                        calLink={calLink}
                                        onBookingSuccessful={() => setStep("success")}
                                    />
                                </div>
                            ) : (
                                <div className="rounded-2xl bg-yellow-light p-8 text-center">
                                    <p className="text-sm text-gray-600">
                                        Este profesional aún no tiene su calendario configurado.
                                        Contáctanos para agendar manualmente.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 4: Success ── */}
                    {step === "success" && (
                        <div className="p-8 flex flex-col items-center text-center min-h-[400px] justify-center">
                            <div className="w-24 h-24 rounded-full bg-green flex items-center justify-center mb-6">
                                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-foreground">¡Listo!</h2>
                            <p className="mt-3 text-gray-500 max-w-xs leading-relaxed">
                                Tu hora con <strong>{selectedPro?.displayName}</strong> está reservada.
                                Revisa tu email para la confirmación.
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                                Cualquier duda escríbenos directamente.
                            </p>
                            <button
                                onClick={handleClose}
                                className="mt-8 rounded-full bg-foreground px-8 py-3 text-white font-semibold hover:bg-foreground/90 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
