/**
 * Island component with rotation and interaction functionality
 * Based on model from: Skylar Muffin (https://sketchfab.com/boopdesignstudio)
 * License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
 * Source: https://sketchfab.com/3d-models/stylized-3d-floating-island-and-mine-house-3cb24182a8504d439ee4e3c500565ac5
 */

import { a } from "@react-spring/three";
import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

import islandScene from "../assets/3d/islands.glb";

export function Island({
  isRotating,
  setIsRotating,
  setCurrentStage,
  currentFocusPoint,
  ...props
}) {
  const islandRef = useRef();
  // Get access to the Three.js renderer and viewport
  const { gl, viewport } = useThree();
  const { nodes, materials } = useGLTF(islandScene);

  // Use a ref for the last mouse x position
  const lastX = useRef(0);
  // Use a ref for rotation speed
  const rotationSpeed = useRef(0);
  // Define a damping factor to control rotation damping
  const dampingFactor = 0.95;

  // Handle pointer (mouse or touch) down event
  const handlePointerDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);

    // Calculate the clientX based on whether it's a touch event or a mouse event
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;

    // Store the current clientX position for reference
    lastX.current = clientX;
  };

  // Handle pointer (mouse or touch) up event
  const handlePointerUp = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);
  };

  // Handle pointer (mouse or touch) move event
  const handlePointerMove = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (isRotating) {
      // If rotation is enabled, calculate the change in clientX position
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;

      // calculate the change in the horizontal position of the mouse cursor or touch input,
      // relative to the viewport's width
      const delta = (clientX - lastX.current) / viewport.width;

      // Update the island's rotation based on the mouse/touch movement
      islandRef.current.rotation.y += delta * 0.01 * Math.PI;

      // Update the reference for the last clientX position
      lastX.current = clientX;

      // Update the rotation speed
      rotationSpeed.current = delta * 0.01 * Math.PI;
    }
  };

  // Handle keydown events
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

  // Handle keyup events
  const handleKeyUp = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      setIsRotating(false);
    }
  };

  // Touch events for mobile devices
  const handleTouchStart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
  
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    lastX.current = clientX;
  }
  
  const handleTouchEnd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(false);
  }
  
  const handleTouchMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
  
    if (isRotating) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = (clientX - lastX.current) / viewport.width;
  
      islandRef.current.rotation.y += delta * 0.01 * Math.PI;
      lastX.current = clientX;
      rotationSpeed.current = delta * 0.01 * Math.PI;
    }
  }

  useEffect(() => {
    // Add event listeners for pointer and keyboard events
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchmove", handleTouchMove);

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
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

  // This function is called on each frame update
  useFrame(() => {
    // If not rotating, apply damping to slow down the rotation (smoothly)
    if (!isRotating) {
      // Apply damping factor
      rotationSpeed.current *= dampingFactor;

      // Stop rotation when speed is very small
      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      // When rotating, determine the current stage based on island's orientation
      const rotation = islandRef.current.rotation.y;

      // Normalize the rotation value to ensure it stays within the range [0, 2 * Math.PI]
      const normalizedRotation =
        ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      // Set the current stage based on the island's orientation
      // You may need to adjust these rotation values based on your new model's orientation
      switch (true) {
        case normalizedRotation >= 5.45 && normalizedRotation <= 5.85:
          setCurrentStage(4);
          break;
        case normalizedRotation >= 0.85 && normalizedRotation <= 1.3:
          setCurrentStage(3);
          break;
        case normalizedRotation >= 2.4 && normalizedRotation <= 2.6:
          setCurrentStage(2);
          break;
        case normalizedRotation >= 4.25 && normalizedRotation <= 4.75:
          setCurrentStage(1);
          break;
        default:
          setCurrentStage(null);
      }
    }
  });

  return (
    <a.group ref={islandRef} {...props} scale={0.38}>
      <group position={[-42.281, -1.801, 11.779]} rotation={[0, -0.185, 0]}>
        <mesh geometry={nodes.Final_Bridge1_SF_Bridge_Mat001_0.geometry} material={materials['SF_Bridge_Mat.001']} />
        <mesh geometry={nodes.Final_Bridge1_SF_Roof_Final_0.geometry} material={materials.SF_Roof_Final} />
        <mesh geometry={nodes.Final_Bridge1_SF_Roof_Final_0_1.geometry} material={materials.SF_Roof_Final} />
        <mesh geometry={nodes.Final_Bridge1_SF_Roof_Final_0_2.geometry} material={materials.SF_Roof_Final} />
        <mesh geometry={nodes.Final_Bridge1_SF_Roof_Final_0_3.geometry} material={materials.SF_Roof_Final} />
        <mesh geometry={nodes.Final_Bridge1_SF_Rocks_Mat_0.geometry} material={materials.SF_Rocks_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Windows_Mat_0.geometry} material={materials.SF_Windows_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Windows_Mat_0_1.geometry} material={materials.SF_Windows_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Windows_Mat_0_2.geometry} material={materials.SF_Windows_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Bush_Mat_0.geometry} material={materials.SF_Bush_Mat} />
        {/* <mesh geometry={nodes.Final_Bridge1_SF_TreeWood_Mat_0.geometry} material={materials.SF_TreeWood_Mat} /> */}
        {/* <mesh geometry={nodes.Final_Bridge1_SF_TreeWood_Mat_0_1.geometry} material={materials.SF_TreeWood_Mat} /> */}
        <mesh geometry={nodes.Final_Bridge1_SF_TreeLeaf_Mat_0.geometry} material={materials.SF_TreeLeaf_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_HouseSupport_Mat_0.geometry} material={materials.SF_HouseSupport_Mat} />
        {/* <mesh geometry={nodes.Final_Bridge1_SF_HouseJoins_Mat_0.geometry} material={materials.SF_HouseJoins_Mat} /> */}
        {/* <mesh geometry={nodes.Final_Bridge1_SF_Chimney_Mat_0.geometry} material={materials.SF_Chimney_Mat} /> */}
        <mesh geometry={nodes.Final_Bridge1_SF_CutRock_Mat_0.geometry} material={materials.SF_CutRock_Mat} />
        {/* <mesh geometry={nodes.Final_Bridge1_SF_Stalagmites_Mat_0.geometry} material={materials.SF_Stalagmites_Mat} /> */}
        <mesh geometry={nodes.Final_Bridge1_SF_WoodTex_Mat_0.geometry} material={materials.SF_WoodTex_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_PlasterTex_Mat_0.geometry} material={materials.SF_PlasterTex_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_StoneBrick_Mat_0.geometry} material={materials.SF_StoneBrick_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Island_Mat_0.geometry} material={materials.SF_Island_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Grass_Mat_0.geometry} material={materials.SF_Grass_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Rail_Mat_0.geometry} material={materials.SF_Rail_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0.geometry} material={materials.SF_GrassCards_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0_1.geometry} material={materials.SF_GrassCards_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0_2.geometry} material={materials.SF_GrassCards_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_GrassCards_Mat_0_3.geometry} material={materials.SF_GrassCards_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_Sack_Mat_0.geometry} material={materials.SF_Sack_Mat} />
        <mesh geometry={nodes.Final_Bridge1_SF_MineCart_Mat_0.geometry} material={materials.SF_MineCart_Mat} />
        {/* <mesh geometry={nodes.Final_Bridge1_SF_Bridge_Mat_0.geometry} material={materials.SF_Bridge_Mat} /> */}
        {/* <mesh geometry={nodes.Final_Bridge1_SF_Door_Mat_0.geometry} material={materials.SF_Door_Mat} /> */}
        {/* <mesh geometry={nodes.Final_Bridge1_SF_Water_Mat_0.geometry} material={materials.SF_Water_Mat} /> */}
        <mesh geometry={nodes.Final_Bridge1_Final_Water001_0.geometry} material={materials['Final_Water.001']} />
        <mesh geometry={nodes.Final_Bridge1_Final_Rocks2_Mat_0.geometry} material={materials.Final_Rocks2_Mat} />
        {/* <mesh geometry={nodes.Final_Bridge1_Black_0.geometry} material={materials.Black} /> */}
        <mesh geometry={nodes.Final_Bridge1_SF_ButterFly_Mat_0.geometry} material={materials.SF_ButterFly_Mat} />
        {/* <mesh geometry={nodes.Final_Bridge1_SF_Lillypad_Mat_0.geometry} material={materials.SF_Lillypad_Mat} /> */}
      </group>
    </a.group>
  );
}

useGLTF.preload(islandScene);