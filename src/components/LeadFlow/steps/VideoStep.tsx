import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { FlowStepWithFields } from '@/types/leadFlow';
import { Button } from '@/components/ui/button';

interface VideoStepProps {
  step: FlowStepWithFields;
  styleConfig?: any;
}

export default function VideoStep({ step, styleConfig }: VideoStepProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  // Extract video configuration
  const videoUrl = step.settings?.videoUrl || '';
  const videoType = step.settings?.videoType || 'mp4';
  const autoplay = step.settings?.autoplay || false;
  const showControls = step.settings?.showControls !== false;
  const aspectRatio = step.settings?.aspectRatio || '16:9';
  const maxWidth = step.settings?.maxWidth || '800px';
  const provider = step.settings?.provider || 'direct'; // 'direct', 'youtube', 'vimeo'
  
  useEffect(() => {
    if (autoplay && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [autoplay]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);
  
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = newTime;
  };
  
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Render YouTube or Vimeo embed
  if (provider !== 'direct') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {step.title && (
          <h2 className="text-2xl font-bold text-center">{step.title}</h2>
        )}
        
        {step.content && (
          <div 
            className="prose prose-gray max-w-none text-center"
            dangerouslySetInnerHTML={{ __html: step.content }}
          />
        )}
        
        <div className="flex justify-center">
          <div 
            className="relative w-full rounded-lg overflow-hidden shadow-xl"
            style={{ maxWidth, aspectRatio }}
          >
            {provider === 'youtube' && (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoUrl}?autoplay=${autoplay ? 1 : 0}`}
                title={step.title || 'Video'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            
            {provider === 'vimeo' && (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://player.vimeo.com/video/${videoUrl}?autoplay=${autoplay ? 1 : 0}`}
                title={step.title || 'Video'}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Render direct video player
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {step.title && (
        <h2 className="text-2xl font-bold text-center">{step.title}</h2>
      )}
      
      {step.content && (
        <div 
          className="prose prose-gray max-w-none text-center"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
      )}
      
      <div className="flex justify-center">
        <div 
          className="relative group w-full rounded-lg overflow-hidden shadow-xl bg-black"
          style={{ maxWidth, aspectRatio }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={videoUrl}
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type={`video/${videoType}`} />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom Controls Overlay */}
          {showControls && (
            <div className={`
              absolute inset-0 bg-gradient-to-t from-black/50 to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `}>
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors">
                  {isPlaying ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </div>
              </button>
              
              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                {/* Progress Bar */}
                <div className="mb-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${styleConfig?.primaryColor || '#3B82F6'} 0%, ${styleConfig?.primaryColor || '#3B82F6'} ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={togglePlayPause}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                    
                    <span className="text-white text-sm">
                      {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
