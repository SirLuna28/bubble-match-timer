import { useEffect, useRef, useState } from 'react';

export const useAudioContext = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio();
      audio.src = '/manus-storage/interstellar-ambient_e70aa5fb.wav';
      audio.loop = true;
      audio.volume = 0.3; // Set to 30% volume for ambient background
      audioRef.current = audio;
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const play = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const setVolume = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return { play, pause, setVolume, isPlaying };
};
