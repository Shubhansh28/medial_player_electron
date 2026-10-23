import { useEffect, useRef, useState } from 'react';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function VideoPlayer({ media, source, onError }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    setDuration(0);
    setCurrentTime(0);
    setSpeed(1);
  }, [media]);

  function handleLoadedMetadata() {
    setDuration(videoRef.current?.duration || 0);
  }

  function handleTimeUpdate() {
    setCurrentTime(videoRef.current?.currentTime || 0);
  }

  function handleSpeedChange(event) {
    const nextSpeed = Number(event.target.value);
    setSpeed(nextSpeed);

    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  }

  return (
    <section className="player-section" aria-label="Video player">
      <div className="player-heading">
        <div>
          <p className="eyebrow">NOW SELECTED</p>
          <h2 title={media.name}>{media.name}</h2>
        </div>
        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      <video
        ref={videoRef}
        className="video-player"
        key={source}
        src={source}
        controls
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={onError}
      >
        Your browser does not support video playback.
      </video>
      <div className="player-toolbar">
        <span className="player-hint">Use the native controls to play, pause, seek, adjust volume, or enter fullscreen.</span>
        <label className="speed-control">
          Speed
          <select value={speed} onChange={handleSpeedChange}>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </label>
      </div>
    </section>
  );
}

export default VideoPlayer;
