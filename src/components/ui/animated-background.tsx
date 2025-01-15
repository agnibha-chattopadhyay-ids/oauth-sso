"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useTheme } from "@/context/themeContext";

export const AnimatedBackground = ({
  className,
  dappId,
}: {
  className?: string;
  dappId?: string | null;
}) => {
  const [init, setInit] = useState(false);
  const controls = useAnimation();
  const { getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig(dappId || undefined);
  console.log(themeConfig);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async () => {
    await controls.start({
      opacity: 1,
      transition: {
        duration: 1,
      },
    });
  };

  return (
    <motion.div 
      animate={controls} 
      initial={{ opacity: 0 }}
      className={cn("fixed inset-0 -z-10", className)}
    >
      {init && (
        <Particles
          id="tsparticles"
          className="h-full w-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: {
              color: themeConfig.backgroundColor,
            },
            fpsLimit: 60,
            particles: {
              color: {
                value: themeConfig.particleColor,
              },
              links: {
                color: themeConfig.particleColor,
                distance: 150,
                enable: true,
                opacity: 0.4,
                width: 1,
              },
              move: {
                enable: true,
                direction: "none",
                outModes: {
                  default: "out",
                },
                speed: 0.8,
                straight: false,
              },
              number: {
                value: 160,
                density: {
                  enable: true,
                },
              },
              opacity: {
                value: { min: 0.3, max: 0.7 },
                animation: {
                  enable: true,
                  speed: 0.5,
                  sync: false,
                },
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 4 },
                animation: {
                  enable: true,
                  speed: 1,
                  sync: false,
                },
              },
            },
            detectRetina: true,
            fullScreen: {
              enable: false,
              zIndex: -1,
            },
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: "grab",
                },
                resize: {
                  enable: true,
                },
              },
              modes: {
                grab: {
                  distance: 180,
                  links: {
                    opacity: 0.8,
                  },
                },
              },
            },
          }}
        />
      )}
    </motion.div>
  );
}; 