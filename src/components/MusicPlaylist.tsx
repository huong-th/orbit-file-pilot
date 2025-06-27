import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

const mockMusicData = [
  {
    id: '1',
    title: 'Death Bed',
    artist: 'Powfu',
    artwork: 'https://samplesongs.netlify.app/album-arts/death-bed.jpg',
    url: 'https://samplesongs.netlify.app/Death%20Bed.mp3'
  },
  {
    id: '2',
    title: 'Bad Liar',
    artist: 'Imagine Dragons',
    artwork: 'https://samplesongs.netlify.app/album-arts/bad-liar.jpg',
    url: 'https://samplesongs.netlify.app/Bad%20Liar.mp3'
  },
  {
    id: '3',
    title: 'Faded',
    artist: 'Alan Walker',
    artwork: 'https://samplesongs.netlify.app/album-arts/faded.jpg',
    url: 'https://samplesongs.netlify.app/Faded.mp3'
  },
  {
    id: '4',
    title: 'Hate Me',
    artist: 'Ellie Goulding',
    artwork: 'https://samplesongs.netlify.app/album-arts/hate-me.jpg',
    url: 'https://samplesongs.netlify.app/Hate%20Me.mp3'
  },
  {
    id: '5',
    title: 'Solo',
    artist: 'Clean Bandit',
    artwork: 'https://samplesongs.netlify.app/album-arts/solo.jpg',
    url: 'https://samplesongs.netlify.app/Solo.mp3'
  },
  {
    id: '6',
    title: 'Without Me',
    artist: 'Halsey',
    artwork: 'https://samplesongs.netlify.app/album-arts/without-me.jpg',
    url: 'https://samplesongs.netlify.app/Without%20Me.mp3'
  }
];

interface CircularProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  children: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress, size, strokeWidth, children }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="absolute inset-0 transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-white transition-all duration-300 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const MusicPlaylist: React.FC = () => {
  const { currentTrack, isPlaying, progress, playTrack } = useAudioPlayer();

  const handlePlayPause = (track: typeof mockMusicData[0]) => {
    playTrack(track);
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Music Library</h2>
        <p className="text-muted-foreground">Your collection of audio tracks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {mockMusicData.map((track) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isCurrentlyPlaying = isCurrentTrack && isPlaying;
          const trackProgress = isCurrentTrack ? progress : 0;

          return (
            <div key={track.id} className="group">
              {/* Album Artwork Container */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 shadow-lg group-hover:shadow-xl transition-all duration-300">
                {/* Album Art */}
                <img
                  src={track.artwork}
                  alt={`${track.title} by ${track.artist}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Play/Pause Button with Progress */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => handlePlayPause(track)}
                    className="relative transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
                  >
                    {isCurrentlyPlaying ? (
                      <CircularProgress progress={trackProgress} size={64} strokeWidth={3}>
                        <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-200">
                          <Pause className="w-5 h-5 text-gray-800 ml-0.5" />
                        </div>
                      </CircularProgress>
                    ) : (
                      <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    )}

                    {/* Always visible play button for current non-playing track */}
                    {isCurrentTrack && !isPlaying && (
                      <div className="absolute inset-0 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-100">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Track Info */}
              <div className="mt-3 space-y-1">
                <h3 className={`font-semibold text-sm leading-tight transition-colors duration-200 ${
                  isCurrentTrack ? 'text-primary' : 'text-foreground'
                }`}>
                  {track.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {track.artist}
                </p>
                {isCurrentTrack && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                    }`} />
                    <span className="text-muted-foreground">
                      {isPlaying ? 'Now Playing' : 'Paused'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MusicPlaylist;
