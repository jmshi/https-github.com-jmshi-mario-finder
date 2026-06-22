import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  Sparkles, 
  Settings,
  MapPin, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  HelpCircle,
  Eye,
  EyeOff,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Award,
  Clock,
  ChevronRight,
  RefreshCw,
  Sparkle,
  Smartphone,
  Check,
  Flame,
  Layout,
  Layers,
  Sparkles as SparklesIcon
} from "lucide-react";

// Web Audio API Synthesizer Helper for real retro 8-bit Mario audio cues
function play8BitSound(type: "coin" | "correct" | "incorrect" | "click" | "win", isMuted: boolean) {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } 
    else if (type === "coin") {
      // Mario coin sound: two distinct high pitches
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } 
    else if (type === "correct") {
      // Success chord
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.08, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.4);
      });
    } 
    else if (type === "incorrect") {
      // Flat low buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } 
    else if (type === "win") {
      // Ultimate victory melody
      const now = ctx.currentTime;
      const notes = [659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0, 783.99, 0, 0, 392.00];
      const duration = 0.11;
      notes.forEach((freq, idx) => {
        if (freq === 0) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * duration);
        gain.gain.setValueAtTime(0.09, now + idx * duration);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * duration + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * duration);
        osc.stop(now + idx * duration + duration);
      });
    }
  } catch (error) {
    console.warn("Web Audio is blocked or not sustained on this browser", error);
  }
}

// 3 Gorgeous, custom themes & their target sprites hidden inside the images
const CANDIDATE_LEVELS = [
  {
    id: "mario-plaza",
    name: "Level 1: Mushroom Kingdom Plaza",
    theme: "Classic Toad Town Marketplace",
    image: "/src/assets/images/mario_parade_map_1781998259592.jpg",
    description: "A gorgeous, bustling 2D cartoon layout filled to the brim with colorful Toads, cute Yoshis, marching Goombas, and retro brick columns. Mario, Luigi, Peach, and the Star are cleverly integrated into this high-density layout.",
    difficulty: "Medium",
    color: "from-blue-600 to-cyan-500",
    bgColor: "bg-blue-950/40",
    borderColor: "border-blue-500/30",
    glowColor: "shadow-blue-500/10",
    targets: [
      { name: "Mario", icon: "🔴", avatar: "👨‍🔧", avatarUrl: "/src/assets/images/mario_avatar_1781999048135.jpg", found: false },
      { name: "Luigi", icon: "🟢", avatar: "🏃‍♂️", avatarUrl: "/src/assets/images/luigi_avatar_1781999059821.jpg", found: false },
      { name: "Princess Peach", icon: "👑", avatar: "👸", avatarUrl: "/src/assets/images/peach_avatar_1781999070504.jpg", found: false },
      { name: "Golden Star", icon: "⭐", avatar: "🌟", avatarUrl: "/src/assets/images/star_avatar_1781999132685.jpg", found: false }
    ],
    hotspots: [
      { x: 66, y: 58, radius: 2, name: "Princess Peach" },
      { x: 25, y: 89, radius: 2, name: "Mario" },
      { x: 69, y: 71, radius: 2, name: "Luigi" },
      { x: 52, y: 28, radius: 2, name: "Golden Star" }
    ]
  },
  {
    id: "mario-party",
    name: "Level 2: Party Fortress Castle Siege",
    theme: "Retro Royal Castle Siege",
    image: "/src/assets/images/hard_level2_fortress_v3_1782014397946.jpg",
    description: "An incredibly high-density ancient fortress siege crowded with thousands of miniature Mario Party characters (Shy Guys, Goombas, Koopas, and Bob-ombs). Our four target heroes (Luigi, Yoshi, Toad, and Waluigi) are hidden microscopically and camouflaged exactly once each. Can you find them all in the massive crowd?",
    difficulty: "Hard",
    color: "from-purple-600 to-pink-500",
    bgColor: "bg-purple-950/40",
    borderColor: "border-purple-500/30",
    glowColor: "shadow-purple-500/10",
    targets: [
      { name: "Luigi", icon: "🟢", avatar: "🏃‍♂️", avatarUrl: "/src/assets/images/luigi_avatar_1781999059821.jpg", found: false },
      { name: "Yoshi", icon: "🦕", avatar: "🦖", avatarUrl: "/src/assets/images/yoshi_avatar_1781999078672.jpg", found: false },
      { name: "Toad", icon: "🍄", avatar: "🍄", avatarUrl: "/src/assets/images/toad_avatar_1781999089063.jpg", found: false },
      { name: "Waluigi", icon: "💜", avatar: "👿", avatarUrl: "/src/assets/images/waluigi_avatar_1781999098608.jpg", found: false }
    ],
    hotspots: [
      { x: 73, y: 11, radius: 2, name: "Luigi" },
      { x: 23, y: 42, radius: 2, name: "Yoshi" },
      { x: 69, y: 59, radius: 2, name: "Toad" },
      { x: 60, y: 20, radius: 2, name: "Waluigi" }
    ]
  }
  /*
  {
    id: "bowser-castle",
    name: "Level 3: Castle Volcano Dungeon",
    theme: "Fiery Underworld Keep",
    image: "/src/assets/images/hard_level3_volcano_micro_1782015779202.jpg",
    description: "A scorching volcano underworld populated by small fire sprites, lava bubbles, spinies, and basalt columns. Bowser, Wario, Princess Daisy, and the Fire Flower are hidden microscopically (4 times smaller than before) in this intense pixel-scaled crowd. Can you find them all?",
    difficulty: "Expert",
    color: "from-amber-600 to-red-500",
    bgColor: "bg-amber-950/40",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    targets: [
      { name: "Bowser", icon: "🐢", avatar: "🦖", avatarUrl: "/src/assets/images/bowser_avatar_1781999108882.jpg", found: false },
      { name: "Princess Daisy", icon: "🌼", avatar: "💃", avatarUrl: "/src/assets/images/daisy_avatar_1781999150394.jpg", found: false },
      { name: "Wario", icon: "🟡", avatarUrl: "/src/assets/images/wario_avatar_1781999116901.jpg", found: false },
      { name: "Fire Flower", icon: "🔥", avatar: "🌸", avatarUrl: "/src/assets/images/flower_avatar_1781999142009.jpg", found: false }
    ],
    hotspots: [
      { x: 26, y: 39, radius: 1.8, name: "Bowser" },
      { x: 62, y: 68, radius: 1.8, name: "Princess Daisy" },
      { x: 41, y: 76, radius: 1.8, name: "Wario" },
      { x: 80, y: 83, radius: 1.8, name: "Fire Flower" }
    ]
  }
  */
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  
  // Refs for tracking mouse/touch drag offsets to prevent false positive click triggers
  const dragStartCoords = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  
  // Game states
  const [gameFoundList, setGameFoundList] = useState<string[]>([]);
  const [pinnedTargets, setPinnedTargets] = useState<{ x: number; y: number; name?: string; accurate?: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [wrongClickCount, setWrongClickCount] = useState(0);
  const [levelCompletionTimes, setLevelCompletionTimes] = useState<{ [key: string]: number }>({});
  
  // Highscore state stored in local storage
  const [highScores, setHighScores] = useState<{ [key: string]: number }>({});

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerIsActive, setTimerIsActive] = useState(true);

  // Orientation & Mobile Rotation Warning states
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissedRotationPrompt, setDismissedRotationPrompt] = useState(false);

  // Sound/Vibe options
  const [selectedTool, setSelectedTool] = useState<"pointer" | "magnifier" | "cheat">("pointer");
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number; y: number } | null>(null);
  const [lastClickedDevCoords, setLastClickedDevCoords] = useState<{ x: number; y: number } | null>(null);
  const [magnifierCoords, setMagnifierCoords] = useState({ x: 0, y: 0, show: false });
  const [lastNotification, setLastNotification] = useState<{ text: string; type: "success" | "bubble" | "error" | null }>({
    text: "Spot the hidden Mario characters to start the timer!",
    type: "bubble"
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const currentLevel = CANDIDATE_LEVELS[selectedLevelIndex];

  // Initialize and load persistent Highscores
  useEffect(() => {
    const savedScores = localStorage.getItem("mario_finder_highscores");
    if (savedScores) {
      try {
        setHighScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Failed to parse highscores", e);
      }
    }
  }, []);

  // Timer simulation loop
  useEffect(() => {
    let interval: any = null;
    if (timerIsActive && gameFoundList.length < currentLevel.targets.length) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerIsActive, gameFoundList, currentLevel]);

  // Handle portrait detection & resize listener
  useEffect(() => {
    const handleOrientationCheck = () => {
      // Portrait is defined as viewport height > width on smaller screens/devices (< 1024px width)
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setIsPortrait(portrait);
    };

    handleOrientationCheck();
    window.addEventListener("resize", handleOrientationCheck);
    return () => window.removeEventListener("resize", handleOrientationCheck);
  }, []);

  // Reset levels state when active level switches
  useEffect(() => {
    setGameFoundList([]);
    setPinnedTargets([]);
    setElapsedTime(0);
    setWrongClickCount(0);
    setTimerIsActive(true);
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setLastNotification({
      text: `Level Shift: Scan carefully for ${currentLevel.targets.map(t => t.name).join(", ")}!`,
      type: "bubble"
    });
    play8BitSound("click", isMuted);
  }, [selectedLevelIndex]);

  const startPlayingLevel = (index: number) => {
    setSelectedLevelIndex(index);
    setIsPlaying(true);
    setGameFoundList([]);
    setPinnedTargets([]);
    setElapsedTime(0);
    setWrongClickCount(0);
    setTimerIsActive(true);
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setIsPanelCollapsed(false);
    setLastNotification({
      text: `Speed-run started! Spot the hidden characters to start the timer!`,
      type: "bubble"
    });
    play8BitSound("win", isMuted);
  };

  const backToLobby = () => {
    setIsPlaying(false);
    setTimerIsActive(false);
    play8BitSound("click", isMuted);
  };

  const handleTryLandscapeLocked = async () => {
    play8BitSound("click", isMuted);
    try {
      const doc = document.documentElement as any;
      if (doc.requestFullscreen) {
        await doc.requestFullscreen();
      } else if (doc.webkitRequestFullscreen) {
        await doc.webkitRequestFullscreen();
      } else if (doc.msRequestFullscreen) {
        await doc.msRequestFullscreen();
      }
      
      const screenObj = window.screen as any;
      if (screenObj && screenObj.orientation && screenObj.orientation.lock) {
        await screenObj.orientation.lock("landscape");
      }
      
      setLastNotification({
        text: "Switching to fullscreen landscape arcade view! Let the Waldo hunt begin!",
        type: "success"
      });
    } catch (err) {
      console.warn("Screen orientation lock is not supported or was blocked:", err);
      setLastNotification({
        text: "Orientation lock not allowed or supported on this device. Please rotate manually!",
        type: "bubble"
      });
    }
  };

  // Handle map interaction - touch and mouse friendly
  const handleStageClickOrTouch = (clientX: number, clientY: number) => {
    if (hasDragged.current) {
      // It was a drag/pan action, not a crisp click/tap. Reset flag and ignore.
      hasDragged.current = false;
      return;
    }

    const viewportElement = document.getElementById("classic-game-viewport");
    if (!viewportElement) return;
    const rect = viewportElement.getBoundingClientRect();

    // Calculate mouse/tap raw position relative to static viewport
    const x_view = clientX - rect.left;
    const y_view = clientY - rect.top;
    const W_view = rect.width;
    const H_view = rect.height;

    // Inverse mathematical translation & zoom calculation back to unscaled image space
    const x_un = W_view / 2 + (x_view - W_view / 2 - panOffset.x) / zoomLevel;
    const y_un = H_view / 2 + (y_view - H_view / 2 - panOffset.y) / zoomLevel;

    // Convert to unscaled percentage coordinates mapped inside [0, 100]
    const pctX = Math.round((x_un / W_view) * 100);
    const pctY = Math.round((y_un / H_view) * 100);

    // Filter sanity bounds to prevent searching outside image canvas area
    if (pctX < 0 || pctX > 100 || pctY < 0 || pctY > 100) return;

    if (selectedTool === "cheat") {
      setLastClickedDevCoords({ x: pctX, y: pctY });
      setLastNotification({
        text: `🛠️ Live Captured Hotspot point at X: ${pctX}%, Y: ${pctY}%! Copy-paste from the dev box below!`,
        type: "success"
      });
      play8BitSound("coin", isMuted);
      return;
    }

    // Search level hotspots with a standard buffer range for accessibility
    let hitSomething = false;
    let targetName = "";

    for (const spot of currentLevel.hotspots) {
      const distance = Math.sqrt(Math.pow(spot.x - pctX, 2) + Math.pow(spot.y - pctY, 2));
      // Exact hotspot radius match
      if (distance <= spot.radius) {
        hitSomething = true;
        targetName = spot.name;
        break;
      }
    }

    if (hitSomething) {
      if (!gameFoundList.includes(targetName)) {
        const nextList = [...gameFoundList, targetName];
        setGameFoundList(nextList);
        
        // Push success pinned target overlay
        setPinnedTargets(prev => [
          ...prev.filter(p => p.name !== targetName),
          { x: pctX, y: pctY, name: targetName, accurate: true }
        ]);

        // Double note check
        const isLevelCleared = nextList.length === currentLevel.targets.length;
        if (isLevelCleared) {
          play8BitSound("win", isMuted);
          setTimerIsActive(false);
          
          // Save highscore if it is faster or doesn't exist
          const currentBest = highScores[currentLevel.id];
          if (!currentBest || elapsedTime < currentBest) {
            const nextHighScores = { ...highScores, [currentLevel.id]: elapsedTime };
            setHighScores(nextHighScores);
            localStorage.setItem("mario_finder_highscores", JSON.stringify(nextHighScores));
            setLastNotification({
              text: `👑 NEW HIGH SCORE! Spatially solved in ${elapsedTime} seconds!`,
              type: "success"
            });
          } else {
            setLastNotification({
              text: `🎉 LEVEL COMPLETED in ${elapsedTime} seconds! Excellent scanning speed!`,
              type: "success"
            });
          }
        } else {
          // Play standard coin collect sound
          play8BitSound("coin", isMuted);
          setLastNotification({
            text: `🎯 FANTASTIC! You found ${targetName}!`,
            type: "success"
          });
        }
      } else {
        play8BitSound("click", isMuted);
        setLastNotification({
          text: `🔍 You already tagged ${targetName} here!`,
          type: "bubble"
        });
      }
    } else {
      // Wrong tap
      play8BitSound("incorrect", isMuted);
      setWrongClickCount(prev => prev + 1);
      
      // Find nearest hotspot to give clear calibration info
      let nearestHotspot = "";
      let minDistance = 999;
      let targetRadius = 7;
      for (const s of currentLevel.hotspots) {
        const d = Math.sqrt(Math.pow(s.x - pctX, 2) + Math.pow(s.y - pctY, 2));
        if (d < minDistance) {
          minDistance = d;
          nearestHotspot = s.name;
          targetRadius = s.radius;
        }
      }

      // Pin incorrect marker temporary
      setPinnedTargets(prev => [
        ...prev,
        { x: pctX, y: pctY, accurate: false }
      ]);
      setLastNotification({
        text: `❌ Tapped at (${pctX}%, ${pctY}%). Nearest: ${nearestHotspot} (is ${minDistance.toFixed(1)}% away, requires within ${targetRadius}%)`,
        type: "error"
      });

      // Clear wrong pointer after 2s so the screen doesn't clutter
      setTimeout(() => {
        setPinnedTargets(prev => prev.filter(p => p.accurate !== false));
      }, 2000);
    }
  };

  // Convert mouse/touch coordinates for panning
  const startDrag = (clientX: number, clientY: number) => {
    setIsPanning(true);
    setInitialMousePos({ x: clientX - panOffset.x, y: clientY - panOffset.y });
    dragStartCoords.current = { x: clientX, y: clientY };
    hasDragged.current = false;
  };

  const onDrag = (clientX: number, clientY: number) => {
    if (!isPanning) return;
    const newX = clientX - initialMousePos.x;
    const newY = clientY - initialMousePos.y;
    
    // Bounds boundaries to prevent panning completely out of screen layout
    setPanOffset({ x: newX, y: newY });

    // Measure visual drag displacement to suppress click trigger if dragging
    const dx = clientX - dragStartCoords.current.x;
    const dy = clientY - dragStartCoords.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 5) {
      hasDragged.current = true;
    }
  };

  const endDrag = () => {
    setIsPanning(false);
  };

  const triggerZoom = (delta: number) => {
    setZoomLevel((v) => Math.min(Math.max(v + delta, 1), 4));
    play8BitSound("click", isMuted);
  };

  // Magnifier glass calculations when moving mouse
  const handleMagnifierMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool !== "magnifier") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMagnifierCoords({ x, y, show: true });
  };

  const handleMagnifierTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (selectedTool !== "magnifier") return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setMagnifierCoords({ x, y, show: true });
  };

  const handleMagnifierTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (selectedTool !== "magnifier") return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setMagnifierCoords({ x, y, show: true });
  };

  const handleHoverCoords = (clientX: number, clientY: number) => {
    const viewportElement = document.getElementById("classic-game-viewport");
    if (!viewportElement) return;
    const rect = viewportElement.getBoundingClientRect();
    const x_view = clientX - rect.left;
    const y_view = clientY - rect.top;
    const W_view = rect.width;
    const H_view = rect.height;
    
    const x_un = W_view / 2 + (x_view - W_view / 2 - panOffset.x) / zoomLevel;
    const y_un = H_view / 2 + (y_view - H_view / 2 - panOffset.y) / zoomLevel;
    
    const pctX = Math.round((x_un / W_view) * 100);
    const pctY = Math.round((y_un / H_view) * 100);
    
    if (pctX >= 0 && pctX <= 100 && pctY >= 0 && pctY <= 100) {
      setHoveredCoords({ x: pctX, y: pctY });
    } else {
      setHoveredCoords(null);
    }
  };

  // Quick helper to format timer seconds
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-600 selection:text-white pb-20">
      
      {/* LANDSCAPE ORIENTATION ADVISORY OVERLAY */}
      {isPortrait && !dismissedRotationPrompt && (
        <div className="fixed inset-x-0 bottom-4 z-[9999] px-4 pointer-events-auto">
          <div className="max-w-md mx-auto bg-slate-900/95 border border-rose-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md ring-4 ring-rose-500/10">
            <div className="flex items-start gap-3">
              <div className="bg-rose-500/20 p-2 rounded-xl text-rose-400">
                <Smartphone className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest font-mono flex items-center gap-2">
                  🔄 Landscape Suggested!
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  Finding tiny characters on these detailed arcade boards is much easier in <b>Landscape mode</b>. Please rotate your device or activate the full arcade mode below!
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleTryLandscapeLocked}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] uppercase tracking-wider font-extrabold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-md shadow-rose-950/50"
                  >
                    <span>Full Arcade Rotate</span>
                    <Maximize2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setDismissedRotationPrompt(true);
                      play8BitSound("click", isMuted);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] uppercase font-bold py-2 px-3 rounded-lg transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER BANNER */}
      <header className="border-b border-slate-900 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 md:px-8 py-1.5 sm:py-2.5 flex flex-row items-center justify-between gap-2">
          
          {/* Logo & Game Title */}
          <div className="flex items-center gap-2 overflow-hidden">
            {isPlaying && (
              <button
                onClick={backToLobby}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-white rounded-lg font-mono flex items-center gap-1 cursor-pointer transition shadow-sm shrink-0"
                title="Go back to home map selection"
              >
                🏠 Lobby
              </button>
            )}
            <div className="hidden sm:flex bg-rose-600 text-white font-black px-2 py-1 rounded-lg text-[10px] shadow-lg shadow-rose-900/30 items-center gap-1 tracking-wider uppercase font-mono transform -rotate-1 hover:rotate-0 transition duration-300 select-none shrink-0">
              <span className="animate-bounce">🔴</span> WALDO
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-black text-white tracking-tight flex items-center gap-1 select-none truncate">
                Nintendo Finder <span className="text-rose-500 font-bold hidden xs:inline">Arcade</span>
              </h1>
            </div>
          </div>

          {/* Global Game Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Audio Toggle button */}
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                play8BitSound("click", !isMuted);
              }}
              className={`p-1.5 px-2 rounded-lg border flex items-center gap-1 text-[10px] sm:text-xs transition-all cursor-pointer font-bold ${
                isMuted 
                  ? "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                  : "bg-emerald-950/80 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950"
              }`}
              title={isMuted ? "Unmute Sounds" : "Mute Sounds"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3 w-3" />
                  <span className="hidden xs:inline">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3 w-3 text-emerald-400 animate-pulse" />
                  <span className="hidden xs:inline">Synth On</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            {isPlaying && (
              <button
                onClick={() => {
                  setGameFoundList([]);
                  setPinnedTargets([]);
                  setElapsedTime(0);
                  setWrongClickCount(0);
                  setTimerIsActive(true);
                  play8BitSound("click", isMuted);
                  setLastNotification({ text: "Progress reset, speed-run initiated!", type: "success" });
                }}
                className="p-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono rounded-lg text-slate-300 flex items-center gap-1 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className="h-3 w-3 text-rose-500" />
                <span className="hidden sm:inline">Restart Level</span>
                <span className="inline sm:hidden">Reset</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* ARCADE GAME CONTROLS GRID */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6 space-y-6">
        
        {!isPlaying ? (
          /* THE LOBBY ENTRY VIEW */
          <div className="space-y-10 py-6 max-w-5xl mx-auto">
            
            {/* STAGE DESCRIPTION AND WELCOME BANNER */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-rose-500 animate-spin-slow" />
                <span>Choose Your Level Cup & Begin the Hunt</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight uppercase font-mono select-none">
                SELECT A SEEKING CUP
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto font-sans select-none">
                Welcome to Super Waldo Party! Explore gorgeous, micro-scale artwork crammed with thousands of elements. Each map has precisely <b>four</b> hidden Nintendo stars and characters small-scale camouflaged into the scenery. Tap with 100% precision!
              </p>
            </div>

            {/* SELECTION CARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {CANDIDATE_LEVELS.map((level, index) => {
                const hasBestTime = highScores[level.id];
                return (
                  <div
                    key={level.id}
                    onClick={() => startPlayingLevel(index)}
                    className="bg-slate-900/80 rounded-3xl border border-slate-800/80 hover:border-rose-500 hover:ring-4 hover:ring-rose-500/10 p-5 flex flex-col justify-between transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
                  >
                    
                    {/* Difficulty Badge */}
                    <div className="absolute top-4 right-4 z-10 animate-fade-in">
                      <span className={`text-[10px] font-black uppercase font-mono px-2.5 py-1 rounded-full ${
                        level.difficulty === "Medium"
                          ? "bg-blue-950 text-blue-400 border border-blue-500/20"
                          : "bg-pink-950 text-pink-400 border border-pink-500/20"
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Thumbnail frame */}
                      <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 relative">
                        <img 
                          src={level.image} 
                          alt={level.name} 
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-80 group-hover:opacity-100 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex items-end p-4">
                          <span className="text-[10px] text-rose-400 font-mono tracking-widest uppercase font-bold">
                            Stage 0{index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Header title */}
                      <div className="space-y-1.5 text-left">
                        <h3 className="text-lg font-black text-slate-100 group-hover:text-rose-400 transition-colors uppercase font-mono">
                          {level.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">
                          Theme Flag: <span className="text-slate-300 font-sans">{level.theme}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 leading-normal font-sans">
                          {level.description}
                        </p>
                      </div>

                      {/* Checklist targets list */}
                      <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/60 space-y-2 text-left">
                        <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider block">Targets inside:</span>
                        <div className="flex flex-wrap gap-2">
                          {level.targets.map((t, idx2) => (
                            <div 
                              key={idx2} 
                              className="bg-slate-900 py-1 px-2.5 rounded-lg border border-slate-800 text-[11px] flex items-center gap-1.5"
                            >
                              {t.avatarUrl ? (
                                <img 
                                  src={t.avatarUrl} 
                                  alt={t.name} 
                                  className="w-4 h-4 rounded-full object-cover border border-slate-600 pointer-events-none" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span>{t.icon}</span>
                              )}
                              <span className="text-slate-300 font-bold font-sans text-[10px] pointer-events-none">{t.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-500 text-sm">🏆</span>
                        <div>
                          <span className="text-slate-500 uppercase text-[9px] block">Personal Best</span>
                          <span className="font-bold text-emerald-400 font-mono text-[11px]">
                            {hasBestTime ? `${formatTime(hasBestTime)}` : "None yet"}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          startPlayingLevel(index);
                        }}
                        className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase rounded-xl flex items-center gap-1 transition cursor-pointer shadow shadow-rose-900/30"
                      >
                        Enter Stage <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* ACTIVE PLAYING VIEW */
          <div className="space-y-6">

            {/* UPPER REALTIME SCORE & LEVEL STATS PANEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
              
              <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/10">
                  <Clock className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Current Stopwatch</span>
                  <span className="text-xl font-mono font-bold text-slate-100">{formatTime(elapsedTime)}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10">
                  <Award className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">My High Score (Best Time)</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {highScores[currentLevel.id] ? `${formatTime(highScores[currentLevel.id])}` : "No time yet"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-sky-500/10 p-3 rounded-xl border border-sky-500/10">
                  <Sparkles className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Wrong Clicks Penalty</span>
                  <span className={`text-xl font-mono font-bold ${wrongClickCount > 0 ? "text-amber-500" : "text-slate-400"}`}>
                    {wrongClickCount} mistakes
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
                <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/10">
                  <CheckCircle2 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Progress spotted</span>
                  <span className="text-md font-mono font-bold text-slate-200">
                    {gameFoundList.length} of {currentLevel.targets.length} characters
                  </span>
                </div>
              </div>

            </div>

            {/* FEEDBACK ANNOTATOR BAR */}
            {lastNotification.text && (
              <div className={`p-3.5 rounded-xl border font-mono text-xs flex items-center justify-between gap-2.5 transition-all ${
                lastNotification.type === "success" 
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                  : lastNotification.type === "error"
                  ? "bg-rose-950/20 border-rose-500/30 text-rose-400"
                  : "bg-slate-900/80 border-slate-800 text-slate-300"
              }`}>
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">📣</span>
                  <span className="leading-relaxed">{lastNotification.text}</span>
                </div>
                
                <button 
                  onClick={() => setLastNotification({ text: "", type: null })}
                  className="text-slate-500 hover:text-slate-300 px-1 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* PRIMARY INTERACTIVE DESKTOP & MOBILE PLAYGROUND */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              
              {/* THE ZOOMABLE PANNING STAGE CONTAINER (COL SPAN 3 or 4) */}
              <div className={`${isPanelCollapsed ? "lg:col-span-4" : "lg:col-span-3"} space-y-4`}>
            
            {/* STAGE MAIN INTERFACE */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
              
              {/* STAGE HEADER CONTROL RAIL */}
              <div className="bg-slate-950 px-4 md:px-6 py-4 border-b border-slate-900 flex flex-wrap items-center justify-between gap-4">
                
                {/* Stage Title */}
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-rose-500 animate-spin-slow animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider font-mono">
                      Mario Board Scanning Frame
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Drag to pan around. Click / Tap characters to test your observation skills.
                    </p>
                  </div>
                </div>

                {/* View/Zoom Slider Controls */}
                <div className="flex items-center gap-3">
                  
                  {/* Zoom controller */}
                  <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                    <button 
                      onClick={() => triggerZoom(-0.2)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer active:scale-90 transition-all"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    
                    <span className="text-xs font-mono font-bold text-slate-300 w-12 text-center select-none">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    
                    <button 
                      onClick={() => triggerZoom(0.2)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer active:scale-90 transition-all"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Center reset view */}
                  <button
                    onClick={() => {
                      setZoomLevel(1.0);
                      setPanOffset({ x: 0, y: 0 });
                      play8BitSound("click", isMuted);
                    }}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 hover:text-white cursor-pointer transition"
                    title="Center view map"
                  >
                    Center View
                  </button>

                  {/* Panel show/hide toggle */}
                  <button
                    onClick={() => {
                      setIsPanelCollapsed(!isPanelCollapsed);
                      play8BitSound("click", isMuted);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPanelCollapsed
                        ? "bg-rose-950/80 border-rose-500/30 text-rose-300 hover:bg-rose-900"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                    }`}
                    title={isPanelCollapsed ? "Expand targets panel" : "Collapse targets panel"}
                  >
                    {isPanelCollapsed ? (
                      <>
                        <Eye className="h-4 w-4 text-rose-500 animate-pulse" />
                        <span>Show Checklist</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 text-slate-500" />
                        <span>Hide Checklist</span>
                      </>
                    )}
                  </button>

                </div>

              </div>

              {/* GAME STAGE VIEWPORT CONTAINER */}
              <div 
                className="relative overflow-hidden bg-slate-950 aspect-[16/9] select-none cursor-crosshair group flex items-center justify-center border-b border-slate-900"
                id="classic-game-viewport"
                onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
                onMouseMove={(e) => {
                  onDrag(e.clientX, e.clientY);
                  handleMagnifierMove(e);
                  handleHoverCoords(e.clientX, e.clientY);
                }}
                onMouseUp={endDrag}
                onMouseLeave={() => {
                  endDrag();
                  setMagnifierCoords(prev => ({ ...prev, show: false }));
                  setHoveredCoords(null);
                }}
                
                // Native Touch handlers for responsive Mobile drags and swipes
                onTouchStart={(e) => {
                  if (e.touches.length === 1) {
                    startDrag(e.touches[0].clientX, e.touches[0].clientY);
                    handleMagnifierTouchStart(e);
                    handleHoverCoords(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 1) {
                    onDrag(e.touches[0].clientX, e.touches[0].clientY);
                    handleMagnifierTouchMove(e);
                    handleHoverCoords(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchEnd={() => {
                  endDrag();
                  setMagnifierCoords(prev => ({ ...prev, show: false }));
                  setHoveredCoords(null);
                }}
              >
                
                {/* Hover / Magnify lens coordinate layout */}
                {selectedTool === "magnifier" && magnifierCoords.show && (() => {
                  const vpEl = document.getElementById("classic-game-viewport");
                  const activeW = vpEl?.getBoundingClientRect().width || 1000;
                  const activeH = vpEl?.getBoundingClientRect().height || 562;
                  
                  // Translate the magnifier screen coords back into unscaled image coordinates
                  const x_un = activeW / 2 + (magnifierCoords.x - activeW / 2 - panOffset.x) / zoomLevel;
                  const y_un = activeH / 2 + (magnifierCoords.y - activeH / 2 - panOffset.y) / zoomLevel;
                  
                  // Compute fractional value relative to unscaled image width and height
                  const fractX = x_un / activeW;
                  const fractY = y_un / activeH;
                  
                  const mag = 3.2; // Magnification multiplier relative to the unscaled image size
                  const lensRadius = 70; // Half of the 140px lens size
                  
                  const outerWidth = activeW * mag;
                  const outerHeight = activeH * mag;
                  
                  const left = lensRadius - fractX * outerWidth;
                  const top = lensRadius - fractY * outerHeight;
                  
                  return (
                    <div 
                      className="absolute pointer-events-none rounded-full border-4 border-rose-500 shadow-2xl z-20"
                      style={{
                        left: magnifierCoords.x - 70,
                        top: magnifierCoords.y - 70,
                        width: "140px",
                        height: "140px",
                        overflow: "hidden",
                      }}
                    >
                      <div 
                        className="absolute pointer-events-none"
                        style={{
                          width: `${outerWidth}px`,
                          height: `${outerHeight}px`,
                          left: `${left}px`,
                          top: `${top}px`,
                        }}
                      >
                        <img 
                          src={currentLevel.image} 
                          alt="Magnified slice" 
                          className="w-full h-full object-cover pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* ZOOMABLE INTERACTION STAGE CORE */}
                <div 
                  ref={mapContainerRef}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clientX = e.clientX;
                    const clientY = e.clientY;
                    handleStageClickOrTouch(clientX, clientY);
                  }}
                  className="w-full h-full relative origin-center"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                    transition: isPanning ? "none" : "transform 0.1s ease-out",
                  }}
                >
                  <img 
                    src={currentLevel.image} 
                    alt={currentLevel.name}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                  />

                  {/* Character Spoted Pin Indicators */}
                  {pinnedTargets.map((pin, index) => (
                    <div
                      key={index}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    >
                      {/* Active green spot block */}
                      <div className={`rounded-full border-2 animate-bounce flex items-center justify-center shadow-2xl ${
                        pin.accurate 
                          ? "w-8 h-8 border-emerald-400 bg-emerald-950 text-emerald-300 ring-4 ring-emerald-500/30" 
                          : "w-6 h-6 border-rose-500 bg-rose-950 text-rose-400 ring-2 ring-rose-500/20"
                      }`}>
                        {pin.accurate ? "✓" : "?"}
                      </div>

                      {pin.name && (
                        <div className="bg-slate-950/95 backdrop-blur border border-slate-800 text-white text-[9px] font-mono px-2 py-0.5 rounded shadow-xl mt-1 whitespace-nowrap">
                          {pin.name} Spotted!
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Developer mode hotspots preview */}
                  {selectedTool === "cheat" && currentLevel.hotspots.map((spot, i) => (
                    <div
                      key={`dev-${i}`}
                      className="absolute border-2 border-dashed border-emerald-400 bg-emerald-500/10 rounded-full flex items-center justify-center pointer-events-none z-10 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                      style={{
                        left: `${spot.x}%`,
                        top: `${spot.y}%`,
                        width: `${spot.radius * 2}%`,
                        height: `${spot.radius * 2}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="absolute -top-7 text-[9px] font-mono font-bold bg-slate-950/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 shadow-md whitespace-nowrap">
                        🎯 {spot.name || "Target"}: ({spot.x}%, {spot.y}%)
                      </div>
                    </div>
                  ))}

                </div>

                {/* LEVEL SUMMARY VICTORY SCREEN */}
                {gameFoundList.length === currentLevel.targets.length && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border-2 border-emerald-500/40 max-w-sm space-y-4 shadow-2xl transform scale-100 transition duration-300">
                      
                      <div className="inline-flex bg-emerald-950/50 p-4 rounded-full border border-emerald-500/20 shadow-inner">
                        <span className="text-4xl animate-bounce">🏆</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-white uppercase tracking-widest font-mono">
                          Level Solved!
                        </h4>
                        <p className="text-xs text-slate-400">
                          {currentLevel.name}
                        </p>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-left space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">⏱️ Solving Time:</span>
                          <span className="text-white font-bold">{formatTime(elapsedTime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">🎯 Total Mistakes:</span>
                          <span className="text-rose-400 font-bold">{wrongClickCount} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">🌟 Level Rating:</span>
                          <span className="text-yellow-400 font-bold">
                            {wrongClickCount === 0 ? "⭐⭐⭐ Perfect" : wrongClickCount <= 2 ? "⭐⭐ Great" : "⭐ Solved"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-center pt-2">
                        <button
                          onClick={() => {
                            setGameFoundList([]);
                            setPinnedTargets([]);
                            setElapsedTime(0);
                            setWrongClickCount(0);
                            setTimerIsActive(true);
                            play8BitSound("click", isMuted);
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-xl cursor-pointer text-slate-300 transition"
                        >
                          Play Again
                        </button>
                        
                        <button 
                          onClick={() => {
                            setSelectedLevelIndex((selectedLevelIndex + 1) % CANDIDATE_LEVELS.length);
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-mono rounded-xl text-white font-bold flex items-center gap-1 cursor-pointer transition shadow-lg shadow-rose-900/40"
                        >
                          Next Level <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* STAGE BOTTOM STATUS TOOLSET SELECTOR */}
              <div className="bg-slate-950 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Active Tool:</span>
                  <div className="flex gap-1.5">
                    
                    <button
                      onClick={() => {
                        setSelectedTool("pointer");
                        play8BitSound("click", isMuted);
                      }}
                      className={`px-3 py-1 rounded-lg border font-bold text-[10px] uppercase transition cursor-pointer ${
                        selectedTool === "pointer"
                          ? "bg-rose-950/50 text-rose-400 border-rose-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      👆 Touch Pointer
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTool("magnifier");
                        play8BitSound("click", isMuted);
                        setLastNotification({ text: "Hover magnifier is active. Sweep around!", type: "bubble" });
                      }}
                      className={`px-3 py-1 rounded-lg border font-bold text-[10px] uppercase transition cursor-pointer ${
                        selectedTool === "magnifier"
                          ? "bg-sky-950/50 text-sky-400 border-sky-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🔍 Hover Magnify Glass
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTool("cheat");
                        play8BitSound("click", isMuted);
                        setLastNotification({ text: "🛠️ Dev Coordinate Mode Active! Hover to see coordinates, Click to capture.", type: "success" });
                      }}
                      className={`px-3 py-1 rounded-lg border font-bold text-[10px] uppercase transition cursor-pointer ${
                        selectedTool === "cheat"
                          ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/40"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🛠️ Dev Coordinates
                    </button>

                  </div>
                </div>

                {/* Quick calibration status layout */}
                <div className="text-slate-500 text-[11px] flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                  <span>Pan / Swift state synchronized: <b>Touch Drag</b> Enabled</span>
                </div>

              </div>

              {/* DEVELOPER CALIBRATION LIVE CONSOLE */}
              {selectedTool === "cheat" && (
                <div className="bg-slate-950/90 border-t border-emerald-500/30 p-5 font-mono text-xs text-emerald-400 space-y-3 rounded-b-2xl">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold border-b border-slate-800 pb-2">
                    <span className="p-1 bg-emerald-950 rounded border border-emerald-500/30 text-[11px]">DEVELOPER OPTIONS</span>
                    <span>Live Map Calibrator & Cloner</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Hover or move your touch across the map viewport. The application dynamically computes normalized fractional <span className="text-emerald-300">X / Y percentage coordinates</span> mapped precisely to the original unscaled image dimension:
                      </p>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-500 text-[10px] uppercase">Hover Position:</span>
                        <span className="font-bold text-white bg-slate-950 border border-slate-800 px-2 py-0.5 rounded shadow">
                          {hoveredCoords ? `X: ${hoveredCoords.x}%, Y: ${hoveredCoords.y}%` : "Hover image workspace..."}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Click / Tap any key point on the image. It registers high-fidelity coordinates, generating copy-ready standard React config blocks mapping exactly to this spot:
                      </p>
                      <div className="bg-slate-900 p-2 border border-slate-800/80 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase font-black">Generated Hotspot Node:</span>
                          {lastClickedDevCoords && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`{ x: ${lastClickedDevCoords.x}, y: ${lastClickedDevCoords.y}, radius: 7, name: "Name" }`);
                                setLastNotification({ text: "📋 Copied config block to clipboard!", type: "success" });
                                play8BitSound("coin", isMuted);
                              }}
                              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white rounded text-[9px] cursor-pointer"
                            >
                              Copy block
                            </button>
                          )}
                        </div>
                        {lastClickedDevCoords ? (
                          <code className="block select-all bg-slate-950 p-2 rounded text-[10px] text-emerald-300 border border-slate-900 overflow-x-auto whitespace-pre">
                            {`{ x: ${lastClickedDevCoords.x}, y: ${lastClickedDevCoords.y}, radius: 7, name: "Target" }`}
                          </code>
                        ) : (
                          <span className="italic block text-slate-600 text-[10px]">Click any character to clone spot...</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-emerald-950/20 px-3 py-2 rounded-lg border border-emerald-500/10 text-[10px] text-emerald-400/80 leading-normal">
                    💡 <b>Tip:</b> While Dev Mode is active, glowing dashed emerald circles are rendered on the map over all currently configured Level Hotspots. Observe where they are placed relative to the characters, then adjust the levels array config elements in <code className="text-white text-[9px] bg-slate-900 px-1 py-0.5 rounded">/src/App.tsx</code> accordingly!
                  </div>
                </div>
              )}

            </div>

            {/* ARTWORK DETAILS & MAP CREATION NOTES */}
            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest block font-mono">
                Level Map Design Notes
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {currentLevel.description} Every level holds exactly four hidden elements placed to match vintage <b>"Where's Waldo"</b> proportion matrixes. If you get stuck, look at the clues cards on the right-hand panel!
              </p>
            </div>

          </div>

          {/* RIGHT SIDEBAR: CURRENT TARGETS DETAILED LIST CARD (COL SPAN 1) */}
          {!isPanelCollapsed && (
            <div className="space-y-6">
            
            {/* CHARACTER CHECKLIST */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-1.5">
                  <Search className="h-4.5 w-4.5 text-rose-500" />
                  <h3 className="font-extrabold text-sm text-slate-200 font-mono uppercase tracking-wider">
                    Looking for:
                  </h3>
                </div>
                <span className="bg-rose-950 hover:bg-rose-900 text-rose-400 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
                  {gameFoundList.length}/{currentLevel.targets.length} Found
                </span>
              </div>

              {/* Characters Cards mapped */}
              <div className="space-y-3">
                {currentLevel.targets.map((target, idx) => {
                  const isFound = gameFoundList.includes(target.name);
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isFound
                          ? "bg-emerald-950/15 border-emerald-500/30 text-slate-200"
                          : "bg-slate-900/50 border-slate-800/60 hover:bg-slate-900 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        
                        {/* Avatar Image */}
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border-2 border-slate-700 shadow-md bg-slate-950 flex items-center justify-center">
                          {target.avatarUrl ? (
                            <img 
                              src={target.avatarUrl} 
                              alt={target.name} 
                              className={`w-full h-full object-cover transition-all duration-305 ${isFound ? "grayscale-0 opacity-100" : "grayscale-[15%] brightness-105 hover:scale-110"}`}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-xl">
                              {target.icon}
                            </div>
                          )}
                          
                          {isFound && (
                            <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[0.5px] flex items-center justify-center">
                              <Check className="h-6 w-6 text-emerald-400 stroke-[3.5] drop-shadow-md" />
                            </div>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-xs text-white">
                              {target.name}
                            </span>

                            {isFound ? (
                              <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase shrink-0 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> Spotted
                              </span>
                            ) : (
                              <span className="text-[9px] text-amber-500 font-mono uppercase font-bold shrink-0 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                                Seeking
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar indicator */}
              <div className="bg-slate-905 border border-slate-900 bg-slate-900/60 p-3 rounded-2xl flex flex-col gap-2 text-xs font-mono">
                <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
                  <span>Level Completion Status</span>
                  <span>{Math.round((gameFoundList.length / currentLevel.targets.length) * 100)}%</span>
                </div>
                
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/30">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${(gameFoundList.length / currentLevel.targets.length) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* QUICK RETRO ARCADE STATS & COMPARISON REF CARD */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-xl text-xs">
              
              <div className="border-b border-slate-800/80 pb-3 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-emerald-400" />
                <h4 className="font-bold text-slate-200 uppercase tracking-widest font-mono text-[11px]">
                  How to Play:
                </h4>
              </div>

              <div className="space-y-2.5 text-slate-400 font-sans leading-relaxed text-[11px]">
                <p>
                  1. Select your target stage from the lobby cup selection. Click with 100% precision!
                </p>
                <p>
                  2. Use the <b>Touch Pointer</b> or the <b>Magnify Glass</b> to inspect the image. You can use two fingers on touchscreens, or click-and-drag your mouse to pan around the grid.
                </p>
                <p>
                  3. If you find one of the characters on the checklist, click/tap directly on them.
                </p>
                <p>
                  4. Try to clear all level targets in the fastest time with 0 mistakes!
                </p>
              </div>

            </div>

          </div>
          )}

        </div>

      </div>
      )}



      </main>

    </div>
  );
}
