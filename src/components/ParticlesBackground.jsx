import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

/**
 * Shared particle background component.
 * Replaces 4 duplicate particle setups across pages.
 * Props:
 *   count   – number of particles (default 35)
 *   speed   – movement speed (default 0.3)
 *   opacity – particle opacity (default 0.15)
 *   id      – unique canvas id (default "tsparticles-bg")
 */
const ParticlesBackground = ({
    count = 35,
    speed = 0.3,
    opacity = 0.15,
    id = "tsparticles-bg",
}) => {
    const init = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id={id}
            className="absolute inset-0 z-0"
            init={init}
            options={{
                fullScreen: false,
                background: { color: "transparent" },
                particles: {
                    color: { value: "#ffffff" },
                    links: {
                        enable: true,
                        distance: 120,
                        color: "#ffffff",
                        opacity: opacity * 0.7,
                    },
                    move: { enable: true, speed },
                    number: { value: count },
                    opacity: { value: opacity },
                    size: { value: 1.5 },
                },
            }}
        />
    );
};

export default ParticlesBackground;
