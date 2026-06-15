import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Smartphone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
    const [step, setStep] = useState<'CONTACT' | 'OTP' | 'SUCCESS'>('CONTACT');
    const [contactInfo, setContactInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // OTP State
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setStep('CONTACT');
            setContactInfo('');
            setOtp(['', '', '', '', '', '']);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSendCode = () => {
        if (!contactInfo) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('OTP');
        }, 1000);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if complete
        if (newOtp.every(v => v !== '')) {
            verifyOtp();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const verifyOtp = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep('SUCCESS');
            setTimeout(() => {
                onLoginSuccess();
                onClose();
            }, 1500);
        }, 1200);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col"
                >
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 text-gray-500">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 pt-12">
                        {step === 'CONTACT' && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                    <Smartphone className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black mb-2">Welcome to Nexmart</h2>
                                <p className="text-gray-500 mb-8 font-medium">Enter your email or phone number to sign in or create an account.</p>

                                <div className="w-full relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Email or Phone Number"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                                    />
                                </div>

                                <button 
                                    onClick={handleSendCode}
                                    disabled={!contactInfo || isLoading}
                                    className="w-full mt-4 bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </motion.div>
                        )}

                        {step === 'OTP' && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center text-center"
                            >
                                <h2 className="text-2xl font-black mb-2">Check your device</h2>
                                <p className="text-gray-500 mb-8 font-medium">We sent a 6-digit code to <br/><span className="text-black font-bold">{contactInfo}</span></p>

                                <div className="flex gap-2 justify-center w-full mb-8">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        />
                                    ))}
                                </div>

                                {isLoading && (
                                    <div className="flex items-center gap-2 text-blue-600 font-medium animate-pulse">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 'SUCCESS' && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center py-8"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                    <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
                                </motion.div>
                                <h2 className="text-3xl font-black mb-2 text-green-600">Verified!</h2>
                                <p className="text-gray-500 font-medium">Logging you in securely...</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
