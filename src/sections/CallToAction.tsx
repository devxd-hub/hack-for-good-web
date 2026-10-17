import React, { useState } from 'react';
import { Button } from '../components/Button';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useRouter } from '../lib/router';

export const CallToAction: React.FC = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail] = useState('');
  const { navigate } = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/register?email=${encodeURIComponent(email.trim())}`, true);
    }
  };

  return (
    <section
      id="registration"
      className="relative w-full py-28 sm:py-36 lg:py-44 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[rgba(241,238,231,0.12)]"
    >
      {/* 1. Full-Section Panoramic Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/hero/registration.png"
          alt="Registration Background"
          className="w-full h-full object-cover object-center pointer-events-none select-none"
        />
        {/* Soft edge blend at the top and bottom only to keep center background fully vibrant */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#08090C] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#08090C] to-transparent pointer-events-none" />
      </div>

      {/* 2. Crystal-Clear Apple Glass Registration Card */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <div
          id="cta"
          className="relative backdrop-blur-md backdrop-saturate-150 bg-black/15 hover:bg-black/20 border border-white/35 hover:border-white/50 rounded-3xl p-8 sm:p-12 md:p-16 flex flex-col items-center text-center gap-8 shadow-[0_24px_70px_rgba(0,0,0,0.4),inset_0_1.5px_1px_0_rgba(255,255,255,0.45),inset_0_-1px_1px_0_rgba(255,255,255,0.15)] transition-all duration-300"
        >
          {/* Header Typography with Apple crispness */}
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 border border-white/40 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <Sparkles size={13} className="text-[#FFB088]" />
              <span className="font-mono text-[11px] font-bold text-[#FFD5C0] tracking-widest uppercase drop-shadow">
                Get Involved
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white font-display tracking-tight text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
              Ready to build for good?
            </h2>
            <p className="text-base sm:text-lg text-white/95 font-medium leading-relaxed text-pretty max-w-md mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Register for Hack for Good and turn your ideas into impactful solutions.
            </p>
          </div>

          {/* Registration Form / Success Feedback */}
          {isRegistered ? (
            <div className="flex items-center gap-3 px-6 py-4 bg-black/40 backdrop-blur-md border border-white/40 rounded-2xl text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)]">
              <CheckCircle2 size={20} className="text-[#FF9D6C] shrink-0" />
              <span className="font-medium drop-shadow">
                Thank you for registering! You will receive hackathon updates directly.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md flex flex-col sm:flex-row gap-3 pt-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your student or personal email"
                className="flex-1 bg-black/35 backdrop-blur-md border border-white/35 hover:border-white/50 focus:border-[#FF9D6C] px-4 py-3 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#FF9D6C]/40 focus:bg-black/55 rounded-xl transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_2px_10px_rgba(0,0,0,0.2)]"
              />
              <Button
                type="submit"
                size="md"
                variant="primary"
                className="shadow-[0_8px_30px_rgba(217,119,69,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_10px_40px_rgba(229,160,111,0.8)] font-semibold transition-all"
              >
                Register Now
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
