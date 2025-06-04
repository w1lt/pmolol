"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowRight, Link as LinkIcon, BarChart3, Globe } from "lucide-react";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import type { Container, ISourceOptions } from "tsparticles-engine";

// Move usernames outside component since it's static data
const usernames = ["will", "jey", "wowie", "yeet", "jpork", "lit", "wut"];

export default function Home() {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageSlug, setPageSlug] = useState("");
  const router = useRouter();

  useEffect(() => {
    const currentUsername = usernames[currentIndex];
    const baseTypingSpeed = isDeleting ? 75 : 100;
    const randomOffset = Math.random() * 30 - 15; // Random offset between -15ms and +15ms
    const typingSpeed = Math.max(20, baseTypingSpeed + randomOffset); // Ensure minimum 20ms
    const pauseTime = isDeleting ? 1000 : 5000; // Pause longer when word is complete

    const timer = setTimeout(() => {
      if (!isDeleting && currentText === currentUsername) {
        // Finished typing, start deleting after pause
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentText === "") {
        // Finished deleting, move to next word
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % usernames.length);
      } else if (isDeleting) {
        // Continue deleting
        setCurrentText(currentUsername.substring(0, currentText.length - 1));
      } else {
        // Continue typing
        setCurrentText(currentUsername.substring(0, currentText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, currentIndex, isDeleting]);

  const particlesInit = useCallback(async (engine: Engine) => {
    console.log("Particles engine initializing:", engine);
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container?: Container) => {
    console.log("Particles container loaded:", container);
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 2,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.15,
          width: 1,
        },
        collisions: {
          enable: true,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1.5,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 60,
        },
        opacity: {
          value: 0.2,
        },
        shape: {
          type: "triangle",
        },
        size: {
          value: { min: 1, max: 4 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  const handleCreatePage = () => {
    // For now, just go to edit page. Later this can check auth and redirect accordingly
    router.push("/edit");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreatePage();
    }
  };

  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={options}
        className="fixed top-0 left-0 w-full h-full z-[-1]"
      />

      <div className="relative z-10 flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            pmo.lol/
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {currentText}
            </span>
          </h1>

          <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            Create a stunning, personalized link page that reflects your unique
            style. Share all your important links in one beautiful, customizable
            space.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 pt-8">
            {/* URL Input Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg pointer-events-none opacity-90">
                  pmo.lol/
                </span>
                <Input
                  type="text"
                  placeholder="user"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-lg px-4 py-3 pl-20 h-12 bg-background border border-border rounded-lg shadow-lg"
                />
              </div>
              <Button
                size="lg"
                onClick={handleCreatePage}
                disabled={!pageSlug.trim()}
                className="h-12 px-4 text-lg font-semibold group hover:cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Claim
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Choose your custom URL and start building your page
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to make your link page stand out from the crowd
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:ring-2 hover:ring-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Custom URL</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose your own memorable URL slug like{" "}
                <code className="px-2 py-1 bg-muted rounded text-sm">
                  pmo.lol/yourname
                </code>
              </p>
            </div>

            <div className="group p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:ring-2 hover:ring-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <LinkIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Unlimited Links</h3>
              <p className="text-muted-foreground leading-relaxed">
                Add as many links as you need and organize them exactly how you
                want
              </p>
            </div>

            <div className="group p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:ring-2 hover:ring-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">
                Detailed Analytics
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Track views, clicks, and understand your audience with
                comprehensive analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
