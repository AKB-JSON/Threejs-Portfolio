import { a } from "@react-spring/three";
import { useEffect, useRef, useState, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

// Import the model but don't preload it immediately
import islandScene from "../assets/3d/islands.glb";

// Detect mobile devices
const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export function Island({
  isRotating,
  setIsRotating,
  setCurrentStage,
  currentFocusPoint,
  ...props
}) {
  const islandRef = useRef();
  const { gl, viewport } = useThree();
  
  // Optimize by only loading the model once and memoizing the result
  const { nodes, materials } = useGLTF(islandScene);
  
  // Use a ref for the last mouse x position
  const lastX = useRef(0);
  // Use a ref for rotation speed
  const rotationSpeed = useRef(0);
  // Define a damping factor to control rotation damping
  const dampingFactor = 0.95;
  
  // Track performance to adaptively reduce quality if needed
  const [performanceIssue, setPerformanceIssue] = useState(false);
  
  // Optimize for mobile
  const modelScale = useMemo(() => isMobile ? 0.35 : 0.41, []);
  
  // Throttle function to limit how often we update during movement
  const throttle = (callback, delay) => {
    let previousCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - previousCall > delay) {
        previousCall = now;
        callback(...args);
      }
    };
  };

  // Event handlers with throttling for better performance
  const handlePointerDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    lastX.current = clientX;
  };

  const handlePointerUp = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);
  };

  const handlePointerMove = throttle((event) => {
    if (!isRotating) return;
    
    event.stopPropagation();
    event.preventDefault();
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const delta = (clientX - lastX.current) / viewport.width;
    
    islandRef.current.rotation.y += delta * 0.01 * Math.PI;
    lastX.current = clientX;
    rotationSpeed.current = delta * 0.01 * Math.PI;
  }, isMobile ? 30 : 16); // More aggressive throttling on mobile

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      if (!isRotating) setIsRotating(true);
      islandRef.current.rotation.y += 0.005 * Math.PI;
      rotationSpeed.current = 0.007;
    } else if (event.key === "ArrowRight") {
      if (!isRotating) setIsRotating(true);
      islandRef.current.rotation.y -= 0.005 * Math.PI;
      rotationSpeed.current = -0.007;
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      setIsRotating(false);
    }
  };

  // Optimized touch event handlers
  const handleTouchStart = handlePointerDown;
  const handleTouchEnd = handlePointerUp;
  const handleTouchMove = handlePointerMove;

  useEffect(() => {
    // Add event listeners for pointer and keyboard events
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

    // Monitor performance - if we detect low FPS, we'll reduce quality
    let lastTime = performance.now();
    let frames = 0;
    const fpsCheck = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime > 1000) {
        const fps = frames * 1000 / (now - lastTime);
        if (fps < 30 && !performanceIssue) {
          setPerformanceIssue(true);
        }
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(fpsCheck);
    };
    
    const fpsCheckId = requestAnimationFrame(fpsCheck);

    // Remove event listeners when component unmounts
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(fpsCheckId);
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove, performanceIssue]);

  // Optimized frame update
  useFrame(() => {
    if (!islandRef.current) return;
    
    if (!isRotating) {
      // Apply damping factor
      rotationSpeed.current *= dampingFactor;

      // Stop rotation when speed is very small
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
        return; // Skip the rest if we're not really moving
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      // Only check stage when it's actively rotating
      const rotation = islandRef.current.rotation.y;

      // Normalize the rotation value
      const normalizedRotation =
        ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      // Optimized stage detection with simpler checks
      let stage = null;
      
      if (normalizedRotation >= 5.45 && normalizedRotation <= 5.85) {
        stage = 4;
      } else if (normalizedRotation >= 0.85 && normalizedRotation <= 1.3) {
        stage = 3;
      } else if (normalizedRotation >= 2.4 && normalizedRotation <= 2.6) {
        stage = 2;
      } else if (normalizedRotation >= 4.25 && normalizedRotation <= 4.75) {
        stage = 1;
      }
      
      if (stage !== null) {
        setCurrentStage(stage);
      }
    }
  });

  // Decide which meshes to render based on device and performance
  const renderMeshes = useMemo(() => {
    // Only render a subset of meshes on mobile or with performance issues
    const isReducedQuality = isMobile || performanceIssue;
    
    // Essential meshes that should always be rendered
    const essentialMeshes = [
      <mesh key="island" geometry={nodes.Final_Bridge1_SF_Island_Mat_0.geometry} material={materials.SF_Island_Mat} />,
      // <mesh key="rocks" geometry={nodes.Final_Bridge1_SF_Rocks_Mat_0.geometry} material={materials.SF_Rocks_Mat} />,
      <mesh key="grasscards" geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0.geometry} material={materials.SF_GrassCards_Mat} />,
      <mesh key="grasscards1" geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0_1.geometry} material={materials.SF_GrassCards_Mat} />,
      <mesh key="grasscards2" geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0_2.geometry} material={materials.SF_GrassCards_Mat} />,
      <mesh key="grasscards3" geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0_3.geometry} material={materials.SF_GrassCards_Mat} />,
      <mesh key="roof" geometry={nodes.Final_Bridge1_SF_Roof_Final_0.geometry} material={materials.SF_Roof_Final} />,
      <mesh key="roof1" geometry={nodes.Final_Bridge1_SF_Roof_Final_0_1.geometry} material={materials.SF_Roof_Final} />,
      <mesh key="roof2" geometry={nodes.Final_Bridge1_SF_Roof_Final_0_2.geometry} material={materials.SF_Roof_Final} />,
      <mesh key="roof3" geometry={nodes.Final_Bridge1_SF_Roof_Final_0_3.geometry} material={materials.SF_Roof_Final} />,
      <mesh key="water" geometry={nodes.Final_Bridge1_Final_Water001_0.geometry} material={materials['Final_Water.001']} />,

      <mesh key="plastertex" geometry={nodes.Final_Bridge1_SF_PlasterTex_Mat_0.geometry} material={materials.SF_PlasterTex_Mat} />,
      // <mesh key="stonebrick" geometry={nodes.Final_Bridge1_SF_StoneBrick_Mat_0.geometry} material={materials.SF_StoneBrick_Mat} />,
      <mesh key="housesupport" geometry={nodes.Final_Bridge1_SF_HouseSupport_Mat_0.geometry} material={materials.SF_HouseSupport_Mat} />,
      // <mesh key="rocks2" geometry={nodes.Final_Bridge1_Final_Rocks2_Mat_0.geometry} material={materials.Final_Rocks2_Mat} />,
      <mesh key="treeleaf" geometry={nodes.Final_Bridge1_SF_TreeLeaf_Mat_0.geometry} material={materials.SF_TreeLeaf_Mat} />,
      <mesh key="grass" geometry={nodes.Final_Bridge1_SF_Grass_Mat_0.geometry} material={materials.SF_Grass_Mat} />,

    ];
    
    // These meshes can be skipped on mobile or low-performance devices
    const detailMeshes = !isReducedQuality ? [
      <mesh key="woodtex" geometry={nodes.Final_Bridge1_SF_WoodTex_Mat_0.geometry} material={materials.SF_WoodTex_Mat} />,
      <mesh key="bridge" geometry={nodes.Final_Bridge1_SF_Bridge_Mat001_0.geometry} material={materials['SF_Bridge_Mat.001']} />,
      <mesh key="bush" geometry={nodes.Final_Bridge1_SF_Bush_Mat_0.geometry} material={materials.SF_Bush_Mat} />,
      <mesh key="cutrock" geometry={nodes.Final_Bridge1_SF_CutRock_Mat_0.geometry} material={materials.SF_CutRock_Mat} />,

      <mesh key="minecart" geometry={nodes.Final_Bridge1_SF_MineCart_Mat_0.geometry} material={materials.SF_MineCart_Mat} />,

      <mesh key="rail" geometry={nodes.Final_Bridge1_SF_Rail_Mat_0.geometry} material={materials.SF_Rail_Mat} />,
    ] : [];
    
    // These meshes can be completely skipped on low-performance devices
    const highDetailMeshes = (!isMobile && !performanceIssue) ? [
      <mesh key="sack" geometry={nodes.Final_Bridge1_SF_Sack_Mat_0.geometry} material={materials.SF_Sack_Mat} />,
      <mesh key="butterfly" geometry={nodes.Final_Bridge1_SF_ButterFly_Mat_0.geometry} material={materials.SF_ButterFly_Mat} />,
        <mesh key="windows" geometry={nodes.Final_Bridge1_SF_Windows_Mat_0.geometry} material={materials.SF_Windows_Mat} />,
      <mesh key="windows1" geometry={nodes.Final_Bridge1_SF_Windows_Mat_0_1.geometry} material={materials.SF_Windows_Mat} />,
      <mesh key="windows2" geometry={nodes.Final_Bridge1_SF_Windows_Mat_0_2.geometry} material={materials.SF_Windows_Mat} />,
    ] : [];
    
    return [...essentialMeshes, ...detailMeshes, ...highDetailMeshes];
  }, [nodes, materials, performanceIssue]);

  return (
    <a.group ref={islandRef} {...props} scale={modelScale}>
      <group position={[-42.281, -1.801, 11.779]} rotation={[0, -0.185, 0]}>
        {renderMeshes}
      </group>
    </a.group>
  );
}

// Only preload on desktop devices
if (!isMobile) {
  useGLTF.preload(islandScene);
}