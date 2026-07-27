import React from "react";

export default function FluidGradient() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-80 mix-blend-screen animate-[spin_30s_linear_infinite]">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-violet-600 rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 right-1/4 w-[45vw] h-[45vw] bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] animate-[pulse_12s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-1/4 right-1/3 w-[50vw] h-[50vw] bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_11s_ease-in-out_infinite_4s]" />
        <div className="absolute bottom-1/3 left-1/3 w-[35vw] h-[35vw] bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-[pulse_14s_ease-in-out_infinite_6s]" />
      </div>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[60px]" />
    </div>
  );
}
