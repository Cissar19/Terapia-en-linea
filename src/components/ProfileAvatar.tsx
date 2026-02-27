"use client";

import { useState, useRef } from "react";

interface ProfileAvatarProps {
    photoURL: string | null | undefined;
    displayName: string;
    size?: "sm" | "md" | "lg";
    editable?: boolean;
    onFileSelect?: (file: File) => void;
}

const sizeMap = {
    sm: { container: "h-10 w-10", text: "text-sm" },
    md: { container: "h-16 w-16", text: "text-xl" },
    lg: { container: "h-24 w-24", text: "text-3xl" },
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");
}

export default function ProfileAvatar({
    photoURL,
    displayName,
    size = "md",
    editable = false,
    onFileSelect,
}: ProfileAvatarProps) {
    const [imgError, setImgError] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const s = sizeMap[size];
    const initials = getInitials(displayName || "U");
    const showImage = photoURL && !imgError;

    const avatar = (
        <div
            className={`${s.container} rounded-full overflow-hidden flex items-center justify-center shrink-0 relative select-none`}
            style={
                showImage
                    ? undefined
                    : { background: "linear-gradient(135deg, #4361EE, #FF6B9D)" }
            }
        >
            {showImage ? (
                <img
                    src={photoURL}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                    referrerPolicy="no-referrer"
                />
            ) : (
                <span className={`${s.text} font-bold text-white leading-none`}>
                    {initials}
                </span>
            )}

            {editable && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center group cursor-pointer rounded-full">
                    <svg
                        className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );

    if (!editable) return avatar;

    return (
        <>
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="focus:outline-none focus:ring-2 focus:ring-pink/40 rounded-full"
            >
                {avatar}
            </button>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && onFileSelect) onFileSelect(file);
                    e.target.value = "";
                }}
            />
        </>
    );
}
