import React, { useEffect, useRef } from 'react';

interface SplashScreenUniverseProps {
    onComplete?: () => void;
}

const SplashScreenUniverse: React.FC<SplashScreenUniverseProps> = ({ onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Arrays para diferentes elementos do universo
        const stars: Star[] = [];
        const shootingStars: ShootingStar[] = [];
        const starCount = 300;

        // Classe Estrela Realista
        class Star {
            x: number;
            y: number;
            depth: number;
            size: number;
            color: number[];
            brightness: number;
            twinkleSpeed: number;
            twinklePhase: number;
            speedX: number;
            speedY: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.depth = Math.random();
                this.size = (0.3 + this.depth * 2.5) * (Math.random() * 0.5 + 0.5);

                const rand = Math.random();
                if (rand < 0.4) {
                    this.color = [255, 255, 255]; // Branca
                } else if (rand < 0.65) {
                    this.color = [200, 220, 255]; // Azul
                } else if (rand < 0.85) {
                    this.color = [255, 244, 220]; // Amarela
                } else if (rand < 0.95) {
                    this.color = [255, 220, 180]; // Laranja
                } else {
                    this.color = [255, 200, 200]; // Vermelha
                }

                this.brightness = Math.random();
                this.twinkleSpeed = (Math.random() * 0.015 + 0.003) * (1 - this.depth * 0.5);
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.speedX = (Math.random() - 0.5) * 0.05 * this.depth;
                this.speedY = (Math.random() - 0.5) * 0.05 * this.depth;
            }

            update() {
                this.twinklePhase += this.twinkleSpeed;
                this.brightness = (Math.sin(this.twinklePhase) + 1) / 2;

                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                const alpha = this.brightness * (0.4 + this.depth * 0.6);
                const [r, g, b] = this.color;

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                if (this.size > 1.2 && this.depth > 0.5) {
                    const gradient = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, this.size * 4
                    );
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
                    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (this.size > 1.8 && this.brightness > 0.7 && this.depth > 0.6) {
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`;
                    ctx.lineWidth = 0.5;
                    const crossSize = this.size * 3;

                    ctx.beginPath();
                    ctx.moveTo(this.x - crossSize, this.y);
                    ctx.lineTo(this.x + crossSize, this.y);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - crossSize);
                    ctx.lineTo(this.x, this.y + crossSize);
                    ctx.stroke();
                }
            }
        }

        // Classe Cometa/Estrela Cadente
        class ShootingStar {
            x: number;
            y: number;
            angle: number;
            length: number;
            speed: number;
            opacity: number;
            tail: { x: number; y: number }[];

            constructor() {
                this.x = 0;
                this.y = 0;
                this.angle = 0;
                this.length = 0;
                this.speed = 0;
                this.opacity = 1;
                this.tail = [];
                this.reset();
            }

            reset() {
                const side = Math.floor(Math.random() * 4);

                if (side === 0) {
                    this.x = Math.random() * canvas.width;
                    this.y = 0;
                    this.angle = Math.random() * Math.PI;
                } else if (side === 1) {
                    this.x = canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.angle = Math.PI / 2 + Math.random() * Math.PI;
                } else if (side === 2) {
                    this.x = 0;
                    this.y = Math.random() * canvas.height;
                    this.angle = -Math.PI / 2 + Math.random() * Math.PI;
                } else {
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height;
                    this.angle = Math.PI + Math.random() * Math.PI;
                }

                this.length = Math.random() * 80 + 40;
                this.speed = Math.random() * 6 + 4;
                this.opacity = 1;
                this.tail = [];
            }

            update() {
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                this.tail.unshift({ x: this.x, y: this.y });
                if (this.tail.length > 20) this.tail.pop();

                this.opacity -= 0.01;

                if (this.x > canvas.width || this.y > canvas.height || this.opacity <= 0) {
                    this.reset();
                }
            }

            draw() {
                ctx.save();

                for (let i = 0; i < this.tail.length; i++) {
                    const alpha = (this.opacity * (1 - i / this.tail.length)) * 0.8;
                    const size = (1 - i / this.tail.length) * 2;

                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(this.tail[i].x, this.tail[i].y, size, 0, Math.PI * 2);
                    ctx.fill();
                }

                const gradient = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, 6
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
                gradient.addColorStop(0.5, `rgba(150, 200, 255, ${this.opacity * 0.5})`);
                gradient.addColorStop(1, `rgba(100, 150, 255, 0)`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // Inicializar estrelas
        function initUniverse() {
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }

            for (let i = 0; i < 5; i++) {
                shootingStars.push(new ShootingStar());
            }
        }

        // Desenhar nebulosa de fundo
        function drawNebula() {
            const nebulaGradient = ctx.createRadialGradient(
                canvas.width * 0.3, canvas.height * 0.3, 0,
                canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.6
            );
            nebulaGradient.addColorStop(0, 'rgba(30, 60, 120, 0.1)');
            nebulaGradient.addColorStop(0.5, 'rgba(50, 80, 150, 0.05)');
            nebulaGradient.addColorStop(1, 'rgba(10, 20, 40, 0)');

            ctx.fillStyle = nebulaGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Animar universo
        function animateUniverse() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawNebula();

            stars.forEach(star => {
                star.update();
                star.draw();
            });

            shootingStars.forEach(shootingStar => {
                shootingStar.update();
                shootingStar.draw();
            });

            requestAnimationFrame(animateUniverse);
        }

        // Redimensionar canvas
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        initUniverse();
        animateUniverse();

        // Auto-fechar splash screen após 7.5 segundos
        const timer = setTimeout(() => {
            if (onComplete) {
                onComplete();
            }
        }, 7500);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timer);
        };
    }, [onComplete]);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d1b2a 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                overflow: 'hidden'
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                }}
            />

            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    animation: 'fadeInContent 2.25s ease-out 0.75s forwards',
                    opacity: 0
                }}
            >
                <div
                    style={{
                        fontSize: '4rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        letterSpacing: '0.1em',
                        textShadow: '0 0 20px rgba(66, 153, 225, 0.5)',
                        marginBottom: '1rem',
                        position: 'relative'
                    }}
                >
                    HumaniQ <span style={{
                        color: '#4A90E2',
                        textShadow: '0 0 10px rgba(74, 144, 226, 0.8), 0 0 20px rgba(74, 144, 226, 0.6), 0 0 30px rgba(74, 144, 226, 0.4)'
                    }}>AI</span>

                    <svg
                        viewBox="0 0 800 120"
                        preserveAspectRatio="xMidYMid meet"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100px',
                            top: '85%',
                            left: 0,
                            overflow: 'visible',
                            opacity: 0,
                            animation: 'fadeInArc 1.5s ease-out 0.8s forwards'
                        }}
                    >
                        <defs>
                            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#4A90E2', stopOpacity: 0.95 }} />
                                <stop offset="50%" style={{ stopColor: '#5BA3F5', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#7AB8E8', stopOpacity: 1 }} />
                            </linearGradient>

                            <clipPath id="arcReveal">
                                <rect x="0" y="0" width="0" height="120">
                                    <animate attributeName="width" from="0" to="800" dur="3s" begin="1.2s" fill="freeze" />
                                </rect>
                            </clipPath>

                            <radialGradient id="arcEndGlow">
                                <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 1 }} />
                                <stop offset="30%" style={{ stopColor: '#7AB8E8', stopOpacity: 0.95 }} />
                                <stop offset="70%" style={{ stopColor: '#4A90E2', stopOpacity: 0.6 }} />
                                <stop offset="100%" style={{ stopColor: '#4A90E2', stopOpacity: 0 }} />
                            </radialGradient>
                        </defs>

                        <g clipPath="url(#arcReveal)">
                            <path
                                d="M 30,20 Q 400,90 770,20"
                                stroke="url(#arcGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                fill="none"
                                filter="drop-shadow(0 0 10px rgba(74, 144, 226, 0.7))"
                            />

                            <circle
                                cx="773"
                                cy="18"
                                r="10"
                                fill="url(#arcEndGlow)"
                                filter="drop-shadow(0 0 15px rgba(122, 184, 232, 0.95))"
                                opacity="0.95"
                            />

                            <circle
                                cx="773"
                                cy="18"
                                r="6"
                                fill="rgba(255, 255, 255, 0.8)"
                                filter="blur(2px)"
                                opacity="0.9"
                            />
                        </g>
                    </svg>
                </div>

                <div
                    style={{
                        fontSize: '1.2rem',
                        fontWeight: 300,
                        color: '#7AB8E8',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        marginTop: '4rem',
                        opacity: 0,
                        animation: 'fadeInSubtitle 2.25s ease-out 1.8s forwards'
                    }}
                >
                    INTELIGÊNCIA PSICOSSOCIAL
                </div>
            </div>

            <style>{`
        @keyframes fadeInContent {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInSubtitle {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInArc {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          div[style*="fontSize: '4rem'"] {
            font-size: 2.5rem !important;
          }
          div[style*="fontSize: '1.2rem'"] {
            font-size: 0.9rem !important;
          }
        }
      `}</style>
        </div>
    );
};

export default SplashScreenUniverse;
