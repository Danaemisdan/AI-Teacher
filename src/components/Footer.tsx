import React from "react";

export default function Footer() {
    return (
        <footer className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-hidden py-32">

            {/* The SVG Logo Stencil - Scaled Massive */}
            <div className="relative w-[90vw] h-[50vh] md:w-[80vw] md:h-[60vh] lg:w-[70vw] lg:[70vh] max-w-[1600px] flex items-center justify-center">
                <video
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                        WebkitMaskImage: "url('/2.svg')",
                        WebkitMaskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskImage: "url('/2.svg')",
                        maskSize: "contain",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                    }}
                >
                    <source src="/waves.mp4" type="video/mp4" />
                </video>
            </div>

        </footer>
    );
}
