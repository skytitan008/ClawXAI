/**
 * Live2D Demo Script
 *
 * Test the Live2D renderer with mock mode
 * Run: node demo.mjs
 */

import { Live2DRenderer } from "./src/renderer.js";

async function runDemo() {
  console.log("🦎 ClawXAI Live2D Demo Starting...\n");

  const renderer = new Live2DRenderer();

  try {
    // Create mock canvas (for Node.js environment)
    const mockCanvas = {
      width: 800,
      height: 600,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      getContext: () => ({
        canvas: mockCanvas,
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Array(4) }),
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        setTransform: () => {},
        resetTransform: () => {},
        save: () => {},
        restore: () => {},
        fill: () => {},
        stroke: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        arc: () => {},
        rect: () => {},
        clip: () => {},
        rotate: () => {},
        translate: () => {},
        scale: () => {},
        setLineDash: () => {},
        getLineDash: () => [],
        createImageData: () => ({ data: new Array(4) }),
        putImageData: () => {},
        drawImage: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createPattern: () => ({}),
        isPointInPath: () => false,
        isPointInStroke: () => false,
        lineCap: "butt",
        lineJoin: "miter",
        lineWidth: 1,
        miterLimit: 10,
        fillStyle: "#000000",
        strokeStyle: "#000000",
        font: "10px sans-serif",
        textAlign: "start",
        textBaseline: "alphabetic",
        globalAlpha: 1,
        globalCompositeOperation: "source-over",
        imageSmoothingEnabled: true,
      }),
    };

    console.log("1. Initializing renderer...");
    await renderer.init(mockCanvas);
    console.log("   ✅ Renderer initialized\n");

    const state = renderer.getState();
    console.log("2. Initial state:");
    console.log("   - Initialized:", state.initialized);
    console.log("   - Mock Mode:", state.isMockMode);
    console.log("   - Has Live2D:", state.hasLive2DLibrary);
    console.log("");

    console.log("3. Testing emotion transitions...");
    const emotions = ["neutral", "joy", "sadness", "anger", "surprise", "fear", "disgust"];

    for (const emotion of emotions) {
      console.log(`   → Setting emotion: ${emotion}`);
      await renderer.setEmotion(emotion);
      await sleep(500);
    }
    console.log("   ✅ All emotions tested\n");

    console.log("4. Getting expression stats...");
    const stats = renderer.getExpressionStats();
    console.log("   - Total expressions:", stats.total);
    console.log("   - Most used:", stats.mostUsed);
    console.log("");

    console.log("5. Final state:");
    const finalState = renderer.getState();
    console.log("   - Current expression:", finalState.currentExpression);
    console.log("   - Expression history:", Object.keys(finalState.expressionHistory || {}).length);
    console.log("");

    console.log("6. Cleaning up...");
    await renderer.dispose();
    console.log("   ✅ Renderer disposed\n");

    console.log("🎉 Demo completed successfully!\n");
    console.log("📝 Note: Running in mock mode (no Live2D library)");
    console.log("   To enable real Live2D rendering:");
    console.log("   1. Install pixi-live2d-display: pnpm add pixi-live2d-display");
    console.log("   2. Install live2d-cubism-core: pnpm add live2d-cubism-core");
    console.log("   3. Provide a Live2D model file\n");
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run demo
runDemo().catch(console.error);
