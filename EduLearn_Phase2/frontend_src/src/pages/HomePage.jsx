// src/pages/HomePage.jsx
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import hero_img from '../Assets/hero.png';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      color: 'white',
      fontFamily: "'Poppins', sans-serif",
    }}>
      <TopNavbar />

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 10%',
        maxWidth: 1400,
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: 40,
      }}>
        {/* Text side */}
        <div style={{ flex: 1, minWidth: 280, textAlign: 'left' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.2, margin: '20px 0' }}>
            Empowering Students <br /> Through Learning <br />
            <span style={{ color: '#ff7a50' }}>-Amazing</span>
          </h1>
          <p style={{ color: '#ccc', maxWidth: 500, marginBottom: 36, lineHeight: 1.7, fontSize: 16 }}>
            Explore lessons, develop your skills, and achieve your educational
            goals step by step.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {/* Get Started → Registration tab */}
            <button
              onClick={() => navigate('/login?tab=register')}
              style={{
                background: '#1abc9c',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: 30,
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                transition: '0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Get Started
            </button>

            {/* Login → Login tab */}
            <button
              onClick={() => navigate('/login?tab=login')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '15px 30px',
                borderRadius: 30,
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
                transition: '0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1abc9c'; e.currentTarget.style.color = '#1abc9c'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'white'; }}
            >
              Login
            </button>
          </div>
        </div>

        {/* Image side */}
        <div style={{ flex: 1, minWidth: 280, position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            position: 'absolute',
            width: 400,
            height: 400,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
          }} />
          <img
            src={hero_img}
            alt="Student"
            style={{ width: '80%', position: 'relative', zIndex: 2 }}
          />
        </div>
      </section>

      {/* ── Stats Section ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 10%', textAlign: 'center' }}>
        <p style={{ color: '#1abc9c', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
          Why EduLearn?
        </p>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', margin: '0 0 50px', fontWeight: 700 }}>
          We are passionate about empowering learners
        </h2>
        <p style={{ color: '#aaa', marginTop: -40, marginBottom: 50 }}>
          Worldwide with high-quality, accessible &amp; engaging education.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 24,
          background: 'rgba(255,255,255,0.05)',
          padding: '40px',
          borderRadius: 20,
          backdropFilter: 'blur(10px)',
        }}>
          {[
            { value: '25+',  label: 'Years of eLearning\nEducation Experience' },
            { value: '56k',  label: 'Students Enrolled in\nEduLearn Courses' },
            { value: '170+', label: "Experienced Teachers\nin service." },
          ].map(({ value, label }) => (
            <div key={value} style={{ minWidth: 140 }}>
              <h3 style={{ fontSize: '2.5rem', color: 'white', marginBottom: 10, fontWeight: 800 }}>{value}</h3>
              <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────── */}
      <section style={{ padding: '60px 10%' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: 40, fontWeight: 700 }}>
          Everything you need to succeed
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}>
          {[
            { icon: '📅', title: 'Exam Calendar',         desc: 'Track all your exams and never miss a deadline.' },
            { icon: '📊', title: 'Progress Tracking',     desc: 'Monitor your course progress in real time.' },
            { icon: '📝', title: 'Interactive Quizzes',   desc: 'Test your knowledge with timed quizzes.' },
            { icon: '⚙️', title: 'Personalized Settings', desc: 'Customize your learning experience your way.' },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '28px 24px',
                textAlign: 'center',
                transition: '0.3s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(26,188,156,0.5)';
                e.currentTarget.style.background = 'rgba(26,188,156,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────── */}
      <section style={{ padding: '60px 10%', textAlign: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(26,188,156,0.3)',
          borderRadius: 24,
          padding: '50px 30px',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: 16, fontWeight: 700 }}>
            Ready to start your journey?
          </h2>
          <p style={{ color: '#aaa', marginBottom: 30, fontSize: 15 }}>
            Join thousands of students already learning on EduLearn.
          </p>
          {/* Join Now → Registration tab */}
          <button
            onClick={() => navigate('/login?tab=register')}
            style={{
              background: '#1abc9c',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              borderRadius: 30,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              transition: '0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Join Now — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 10%',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        color: '#555',
        fontSize: 13,
      }}>
        © {new Date().getFullYear()} EduLearn Student Portal. All rights reserved.
      </footer>
    </div>
  );
}
