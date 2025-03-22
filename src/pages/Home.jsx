import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Preload } from "@react-three/drei";

import sakura from "../assets/sakura.mp3";
import { HomeInfo, Loader } from "../components";
import { soundoff, soundon } from "../assets/icons";
import { Bird, Island, Plane, Sky } from "../models";

const Home = () => {
  // Create audio instance only once with useRef
  const audioRef = useRef(null);
  
  // Only create a new Audio instance once
  useEffect(() => {
    audioRef.current = new Audio(sakura);
    audioRef.current.volume = 0.4;
    audioRef.current.loop = true;
    
    // Clean up audio on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const [currentStage, setCurrentStage] = useState(1);
  const [isRotating, setIsRotating] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // Optimize audio playing logic - only execute on state change
  useEffect(() => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.play().catch(error => console.log("Audio playback error:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlayingMusic]);

  // Use useMemo to avoid recalculating on every render
  const [biplaneScale, biplanePosition] = useMemo(() => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [1.5, 1.5, 1.5];
      screenPosition = [0, -1.5, 0];
    } else {
      screenScale = [3, 3, 3];
      screenPosition = [0, -4, -4];
    }

    return [screenScale, screenPosition];
  }, []);

  const [islandScale, islandPosition] = useMemo(() => {
    let screenScale, screenPosition;

    if (window.innerWidth < 768) {
      screenScale = [0.9, 0.9, 0.9];
      screenPosition = [0, -6.5, -43.4];
    } else {
      screenScale = [1, 1, 1];
      screenPosition = [0, -6.5, -43.4];
    }

    return [screenScale, screenPosition];
  }, []);

  // Memoize the cursor className
  const cursorClassName = useMemo(() => 
    `w-full h-screen bg-transparent ${isRotating ? "cursor-grabbing" : "cursor-grab"}`,
    [isRotating]
  );

  // Use useCallback for the toggle music function
  const toggleMusic = useCallback(() => {
    setIsPlayingMusic(prev => !prev);
  }, []);

  // Memoize light settings
  const lightElements = useMemo(() => (
    <>
      <directionalLight position={[1, 1, 1]} intensity={2} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 5, 10]} intensity={2} />
      <spotLight
        position={[0, 50, 10]}
        angle={0.15}
        penumbra={1}
        intensity={2}
      />
      <hemisphereLight
        skyColor='#b1e1ff'
        groundColor='#000000'
        intensity={1}
      />
    </>
  ), []);

  return (
    <section className='w-full h-screen relative'>
      {currentStage && (
        <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
          <HomeInfo currentStage={currentStage} />
        </div>
      )}

      <Canvas
        className={cursorClassName}
        camera={{ near: 0.1, far: 1000 }}
        dpr={[1, 1.5]} // Dynamic pixel ratio - better performance on high-DPI screens
        gl={{ 
          antialias: false, // Turn off antialiasing for performance
          powerPreference: "high-performance" 
        }}
        performance={{ min: 0.5 }} // Allow ThreeJS to reduce quality to maintain framerate
      >
        <Suspense fallback={<Loader />}>
          {lightElements}

          <Bird />
          <Sky isRotating={isRotating} />
          <Island
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
            position={islandPosition}
            rotation={[0.1, 4.7077, 0]}
            scale={islandScale}
          />
          <Plane
            isRotating={isRotating}
            position={biplanePosition}
            rotation={[0, 20.1, 0]}
            scale={biplaneScale}
          />
          <Preload all /> {/* Preload all assets */}
        </Suspense>
      </Canvas>

      <div className='absolute bottom-2 left-2'>
        <img
          src={!isPlayingMusic ? soundoff : soundon}
          alt='jukebox'
          onClick={toggleMusic}
          className='w-10 h-10 cursor-pointer object-contain'
        />
      </div>
    </section>
  );
};

export default Home;