import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ChevronRight } from 'lucide-react';

const IntroVideo = ({ onFinished }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Attempt autoplay with sound if possible, fallback to muted
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay with sound prevented, playing muted:", error);
        setIsMuted(true);
      });
    }
  }, []);

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const triggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onFinished();
    }, 800); // Allow fade animation to complete
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          {/* Main Video Element */}
          <video
            ref={videoRef}
            src="/intro.mp4"
            autoPlay
            muted={isMuted}
            playsInline
            onEnded={triggerExit}
            className="w-full h-full object-cover"
          />

          {/* Saffron Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Narrative Subtitle overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center w-full max-w-2xl px-6 pointer-events-none"
          >
            <p className="text-gold font-display text-lg md:text-xl tracking-wide font-medium gold-text-glow">
              "The threads of memory begin to fade..."
            </p>
            <p className="text-xs text-parchment-dark mt-1 font-sans">
              Decipher the saga, reclaim our lost heritage.
            </p>
          </motion.div>

          {/* Sound Controls & Skip Intro Controls */}
          <div className="absolute top-6 right-6 flex items-center gap-4 z-55">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleMute}
              className="p-2.5 bg-black/60 border border-gold/30 hover:border-gold text-gold rounded-full transition-all backdrop-blur-md cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Skip Button */}
            <button
              onClick={triggerExit}
              className="flex items-center gap-1.5 px-4 py-2 bg-black/60 border border-gold hover:bg-gold hover:text-maroon-dark text-gold font-display text-sm font-semibold rounded transition-all backdrop-blur-md cursor-pointer gold-glow"
            >
              <span>Skip Intro</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Branding Logo overlay */}
          <div className="absolute top-6 left-6 z-55 pointer-events-none">
            <span className="text-gold/40 font-display text-sm tracking-widest font-bold">
              LOST THREADS OF BHARAT
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroVideo;
