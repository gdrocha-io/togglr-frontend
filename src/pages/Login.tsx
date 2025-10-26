import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ToggleLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toggle1, setToggle1] = useState(false);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(false);
  const [particles, setParticles] = useState([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [collectEffects, setCollectEffects] = useState([]);
  const { login, user } = useAuth();

  const codeSymbols = ['{}', '[]', '()', '<>', '/>', '&&', '||', '==', '!=', '=>'];

  useEffect(() => {
    if (collectedCount >= 10) {
      setParticles([]);
      return;
    }

    const createParticle = () => {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        symbol: codeSymbols[Math.floor(Math.random() * codeSymbols.length)],
        rotation: Math.random() * 360
      };
      setParticles(prev => [...prev.slice(-10), newParticle]);
    };

    const interval = setInterval(createParticle, 2000);
    return () => clearInterval(interval);
  }, [collectedCount]);

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 16) { // ~60fps
        setParticles(prev => prev.map(particle => {
          const newY = particle.y + particle.vy * 0.3;
          const newX = particle.x + particle.vx * 0.3;
          
          let newVy = particle.vy;
          if (newY > (typeof window !== 'undefined' ? window.innerHeight : 800) - 50) {
            newVy = -particle.vy * 0.6;
          } else {
            newVy += 0.02;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY,
            vy: newVy,
            vx: particle.vx * 0.995
          };
        }).filter(p => p.y < (typeof window !== 'undefined' ? window.innerHeight : 800) + 100));
        
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background cursor-custom-default">
      {/* Animated Background SVGs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 cursor-pointer hover:scale-110 transition-all duration-300" onClick={() => console.log('Hexagons clicked!')}>
          <svg className="w-full h-full text-primary/10 hover:text-primary/20 transition-colors duration-300" viewBox="0 0 200 200">
            <polygon points="100,20 160,60 160,140 100,180 40,140 40,60" fill="currentColor" opacity="0.2" />
            <polygon points="100,40 140,70 140,130 100,160 60,130 60,70" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '15s' }} />
            <polygon points="100,60 120,80 120,120 100,140 80,120 80,80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" className="animate-spin" style={{ transformOrigin: '100px 100px', animationDuration: '20s', animationDirection: 'reverse' }} />
          </svg>
        </div>
        
        <svg className="absolute top-20 right-20 w-64 h-64 text-primary/20 animate-spin cursor-pointer hover:text-primary/40 hover:scale-105 transition-all duration-300" style={{ animationDuration: '20s' }} viewBox="0 0 100 100" onClick={() => console.log('Circles clicked!')}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3,3" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2,2" />
        </svg>

        <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute bottom-20 left-20 w-6 h-6 bg-primary/25 rounded-full cursor-pointer hover:bg-primary/50 hover:scale-150 transition-all duration-300" style={{ animation: 'bounce 3s ease-in-out infinite, float 6s ease-in-out infinite' }} onClick={() => console.log('Bubble 1 popped!')}></div>
          <div className="absolute bottom-40 left-40 w-4 h-4 bg-primary/30 rounded-full cursor-pointer hover:bg-primary/60 hover:scale-150 transition-all duration-300" style={{ animation: 'bounce 4s ease-in-out infinite, float 7s ease-in-out infinite', animationDelay: '1s' }} onClick={() => console.log('Bubble 2 popped!')}></div>
          <div className="absolute bottom-60 left-10 w-3 h-3 bg-primary/35 rounded-full cursor-pointer hover:bg-primary/70 hover:scale-150 transition-all duration-300" style={{ animation: 'bounce 5s ease-in-out infinite, float 8s ease-in-out infinite', animationDelay: '2s' }} onClick={() => console.log('Bubble 3 popped!')}></div>
          <div className="absolute bottom-32 left-60 w-8 h-8 bg-primary/20 rounded-full cursor-pointer hover:bg-primary/40 hover:scale-150 transition-all duration-300" style={{ animation: 'bounce 3.5s ease-in-out infinite, float 6.5s ease-in-out infinite', animationDelay: '0.5s' }} onClick={() => console.log('Bubble 4 popped!')}></div>
          <div className="absolute bottom-16 left-80 w-5 h-5 bg-primary/28 rounded-full cursor-pointer hover:bg-primary/56 hover:scale-150 transition-all duration-300" style={{ animation: 'bounce 4.5s ease-in-out infinite, float 7.5s ease-in-out infinite', animationDelay: '1.5s' }} onClick={() => console.log('Bubble 5 popped!')}></div>
        </div>

        {/* Interactive Toggle-like elements */}
        <div className="absolute top-20 left-1/4 opacity-35 cursor-pointer hover:opacity-60 transition-all duration-300 z-50" style={{ animation: 'organicFloat1 8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} onClick={() => setToggle1(!toggle1)}>
          <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${toggle1 ? 'bg-primary/60' : 'bg-primary/20'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${toggle1 ? 'left-7' : 'left-1'}`}></div>
          </div>
        </div>
        
        <div className="absolute top-60 right-40 opacity-25 cursor-pointer hover:opacity-45 transition-all duration-300" style={{ animation: 'organicFloat2 10s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite', animationDelay: '2s' }} onClick={() => setToggle2(!toggle2)}>
          <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${toggle2 ? 'bg-primary/60' : 'bg-primary/20'}`}>
            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-300 ${toggle2 ? 'left-6' : 'left-1'}`}></div>
          </div>
        </div>

        <div className="absolute bottom-80 right-20 opacity-18 cursor-pointer hover:opacity-38 transition-all duration-300" style={{ animation: 'organicFloat3 12s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite', animationDelay: '4s' }} onClick={() => setToggle3(!toggle3)}>
          <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${toggle3 ? 'bg-primary/60' : 'bg-primary/20'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 ${toggle3 ? 'left-8' : 'left-1'}`}></div>
          </div>
        </div>

        {/* Code Particles */}
        {collectedCount < 10 && particles.map(particle => (
          <div
            key={particle.id}
            className="absolute text-primary/50 font-mono text-sm select-none hover:text-primary/80 hover:scale-110 transition-all duration-200 pointer-events-auto hover:shadow-md hover:shadow-primary/30"
            style={{
              left: particle.x + 'px',
              top: particle.y + 'px',
              transform: `rotate(${particle.rotation}deg)`,
              zIndex: 5,
              cursor: 'var(--cursor-collect)'
            }}

            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const counterRect = document.querySelector('.collected-counter')?.getBoundingClientRect();
              const effect = {
                id: Date.now(),
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                targetX: counterRect ? counterRect.left + counterRect.width / 2 : window.innerWidth - 100,
                targetY: counterRect ? counterRect.top + counterRect.height / 2 : 50,
                symbol: particle.symbol
              };
              setCollectEffects(prev => [...prev, effect]);
              setParticles(prev => prev.filter(p => p.id !== particle.id));
              setCollectedCount(prev => prev + 1);
              
              setTimeout(() => {
                setCollectEffects(prev => prev.filter(e => e.id !== effect.id));
              }, 1000);
            }}
          >
            {particle.symbol}
          </div>
        ))}

        {/* Collect Effects */}
        {collectEffects.map(effect => (
          <React.Fragment key={effect.id}>
            <div 
              className="absolute text-green-400 font-mono text-lg font-bold pointer-events-none"
              style={{
                left: effect.x + 'px',
                top: effect.y + 'px',
                zIndex: 100,
                animation: 'collectPulse 0.6s ease-out'
              }}
            >
              +1
            </div>
            <div 
              className="absolute text-primary/60 font-mono text-sm pointer-events-none"
              style={{
                left: effect.x + 'px',
                top: effect.y + 'px',
                zIndex: 99,
                animation: 'flyToCounter 1s ease-out',
                '--dx': (effect.targetX - effect.x) + 'px',
                '--dy': (effect.targetY - effect.y) + 'px'
              } as React.CSSProperties}
            >
              {effect.symbol}
            </div>
          </React.Fragment>
        ))}

        {/* Collected Counter */}
        {collectedCount > 0 && (
          <div className={`collected-counter absolute top-4 right-4 backdrop-blur-sm rounded-lg px-3 py-2 font-mono text-sm border transition-all duration-300 ${
            collectedCount >= 5 
              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 animate-bounce' 
              : 'bg-primary/20 border-primary/30 text-primary'
          }`}>
            <span className={collectedCount > 0 ? 'animate-pulse' : ''}>
              {collectedCount >= 5 ? '🎮 ' : ''}Coletados: {collectedCount}
              {collectedCount >= 10 && ' 🤯'}
            </span>
          </div>
        )}

        <style jsx>{`
          .cursor-custom-default {
            cursor: var(--cursor-default);
          }
          :root {
            --cursor-default: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' stroke='%23ffffff' stroke-width='1' d='M3 3l18 9-8 2-2 8z'/%3E%3C/svg%3E") 8 8, auto;
            --cursor-collect: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' stroke='%23ffffff' stroke-width='1' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E") 9 9, pointer;
          }
          .dark {
            --cursor-default: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' stroke='%23000000' stroke-width='1' d='M3 3l18 9-8 2-2 8z'/%3E%3C/svg%3E") 8 8, auto;
            --cursor-collect: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' stroke='%23000000' stroke-width='1' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E") 9 9, pointer;
          }
          @keyframes collectPulse {
            0% { transform: scale(1) translateY(0); opacity: 1; }
            50% { transform: scale(1.5) translateY(-10px); opacity: 0.8; }
            100% { transform: scale(0) translateY(-30px); opacity: 0; }
          }
          @keyframes flyToCounter {
            0% { 
              transform: scale(1) translate(0, 0); 
              opacity: 1; 
            }
            70% { 
              transform: scale(0.8) translate(calc(var(--dx) * 0.7), calc(var(--dy) * 0.7)); 
              opacity: 0.6; 
            }
            100% { 
              transform: scale(0.3) translate(var(--dx), var(--dy)); 
              opacity: 0; 
            }
          }
          @keyframes organicFloat1 {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            25% { transform: translateY(-8px) translateX(3px) rotate(1deg); }
            50% { transform: translateY(-15px) translateX(-2px) rotate(-0.5deg); }
            75% { transform: translateY(-5px) translateX(4px) rotate(0.8deg); }
            100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          }
          @keyframes organicFloat2 {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            30% { transform: translateY(-12px) translateX(-4px) rotate(-1.2deg); }
            60% { transform: translateY(-8px) translateX(5px) rotate(0.7deg); }
            85% { transform: translateY(-18px) translateX(-1px) rotate(-0.3deg); }
            100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          }
          @keyframes organicFloat3 {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            20% { transform: translateY(-6px) translateX(2px) rotate(0.5deg); }
            45% { transform: translateY(-22px) translateX(-3px) rotate(-1deg); }
            70% { transform: translateY(-10px) translateX(6px) rotate(1.5deg); }
            100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          }
        `}</style>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="max-w-md text-center space-y-8">
          <div className="relative cursor-pointer hover:scale-110 transition-all duration-500 group" onClick={() => console.log('Logo clicked!')}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500"></div>
            <div className="relative bg-primary/10 backdrop-blur-sm rounded-full p-8 border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-500">
              <ToggleLeft className="h-24 w-24 text-primary mx-auto group-hover:rotate-180 transition-transform duration-700" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Togglr
            </h1>
            <p className="text-xl text-muted-foreground">
              Advanced Feature Toggle Management
            </p>
            <p className="text-sm text-muted-foreground/80">
              Control your features with precision. Deploy with confidence.
            </p>
          </div>

          {/* Tech Elements */}
          <div className="flex justify-center space-x-4 opacity-60">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <ToggleLeft className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to continue to Togglr</p>
          </div>

          {/* Login Form */}
          <div className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl transition-all duration-300 ${
            collectedCount >= 5 ? 'animate-pulse ring-2 ring-primary/50 shadow-primary/20' : ''
          }`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                  collectedCount >= 5 ? 'animate-bounce shadow-lg shadow-primary/30' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Secure • Reliable • Modern</p>
          </div>
        </div>
      </div>
    </div>
  );
}