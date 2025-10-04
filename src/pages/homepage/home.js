import React, { useEffect } from "react";

const Home = () => {
  useEffect(() => {
    // Create floating particles
    function createParticle() {
      const particle = document.createElement("div");
      particle.className = "particle";

      const size = Math.random() * 4 + 2;
      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = Math.random() * 3 + 5 + "s";
      particle.style.animationDelay = Math.random() * 2 + "s";

      document.getElementById("particles")?.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 8000);
    }

    const interval = setInterval(createParticle, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-hidden font-['Inter']">
      {/* Animated Background Particles */}
      <div id="particles" className="fixed inset-0 pointer-events-none z-0"></div>

      {/* Hero Section */}
      <section className="gradient-bg min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Floating Circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white opacity-10 rounded-full floating-animation"></div>
        <div
          className="absolute bottom-20 right-10 w-24 h-24 bg-white opacity-10 rounded-full floating-animation"
          style={{ animationDelay: "-3s" }}
        ></div>
        <div
          className="absolute top-1/2 left-5 w-16 h-16 bg-white opacity-10 rounded-full floating-animation"
          style={{ animationDelay: "-1.5s" }}
        ></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="fade-in inline-flex items-center px-4 py-2 rounded-full glass-effect text-white text-sm font-medium mb-8">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Trusted by 500+ Educational Institutions
            </div>

            {/* Main Heading */}
            <h1 className="fade-in fade-in-delay-1 text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Complete{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                CRM Solution
              </span>
              <br /> for Multi-Institute Management
            </h1>

            {/* Subtitle */}
            <p className="fade-in fade-in-delay-2 text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              From admissions to analytics — streamline your entire education
              business with our powerful, intuitive CRM platform designed for
              modern institutions.
            </p>

            {/* CTA Buttons */}
            <div className="fade-in fade-in-delay-3 flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <a
                href="/sinfode-admin/login"
                className="btn-hover group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold text-lg shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  SUPER ADMIN LOGIN
                </div>
              </a>

              <a
                href="/sinfode-manager/login"
                className="btn-hover group px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-semibold text-lg shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                  </svg>
                  BRANCH MANAGER LOGIN
                </div>
              </a>

              <a
                href="/staff/login"
                className="btn-hover group px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  STAFF LOGIN
                </div>
              </a>

              <a
                href="/account/login"
                className="btn-hover group px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl font-semibold text-lg shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                  </svg>
                  ACCOUNTANT LOGIN
                </div>
              </a>

            </div>
          </div>
        </div>
      </section>


      {/* ---- Extra Styles ---- */}
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .fade-in {
          animation: fadeInUp 1s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        .fade-in-delay-1 { animation-delay: 0.2s; }
        .fade-in-delay-2 { animation-delay: 0.4s; }
        .fade-in-delay-3 { animation-delay: 0.6s; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-hover {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-hover:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .btn-hover:hover:before { left: 100%; }
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          pointer-events: none;
          animation: particle-float 8s infinite linear;
        }
        @keyframes particle-float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        .stats-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default Home;
