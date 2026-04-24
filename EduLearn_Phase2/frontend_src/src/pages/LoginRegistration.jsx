// src/pages/LoginRegistration.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, Mail, Lock } from 'lucide-react';
import TopNavbar from '../components/TopNavbar';
import { useAuth } from '../context/AuthContext';
import './LoginRegistration.css';

const loginSchema = Yup.object({
  email:    Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const registerSchema = Yup.object({
  username: Yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email:    Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

const LoginRegistration = () => {
  const [searchParams] = useSearchParams();
  // ?tab=login → open Login tab, anything else → Registration
  const initialTab = searchParams.get('tab') === 'login' ? 'Login' : 'Registration';
  const [action, setAction] = useState(initialTab);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const isLogin = action === 'Login';

  // ── Role-based redirect after login ────────────────────────────────────────
  const redirectByRole = (user) => {
    if (user?.role === 'admin')      return navigate('/admin');
    if (user?.role === 'instructor') return navigate('/instructor');
    return navigate('/dashboard');
  };

  const formik = useFormik({
    initialValues: { username: '', email: '', password: '', confirmPassword: '' },
    validationSchema: isLogin ? loginSchema : registerSchema,
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      setServerError('');
      try {
        let result;
        if (isLogin) {
          result = await login(values.email, values.password);
        } else {
          result = await register(values.username, values.email, values.password);
        }
        helpers.resetForm();
        // result contains { user, token } from AuthContext
        redirectByRole(result?.user);
      } catch (err) {
        setServerError(err.message);
      }
    },
  });

  const switchAction = (newAction) => {
    setAction(newAction);
    setServerError('');
    formik.resetForm();
  };

  const err = (field) =>
    formik.touched[field] && formik.errors[field] ? (
      <p className="field-error">{formik.errors[field]}</p>
    ) : null;

  return (
    <div className="lr-page">
      <TopNavbar />
      <div className="lr-body">
        <div className="container">

          <div className="header">
            <div className="text">{action}</div>
            <div className="underline"></div>
          </div>

          {serverError && (
            <p style={{ color: '#ff4d4d', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
              {serverError}
            </p>
          )}

          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="inputs">

              {!isLogin && (
                <div className="input-group">
                  <div className={`input ${formik.touched.username && formik.errors.username ? 'input-error' : ''}`}>
                    <User size={18} className="input-icon" />
                    <input type="text" name="username" placeholder="Username"
                      value={formik.values.username} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  </div>
                  {err('username')}
                </div>
              )}

              <div className="input-group">
                <div className={`input ${formik.touched.email && formik.errors.email ? 'input-error' : ''}`}>
                  <Mail size={18} className="input-icon" />
                  <input type="email" name="email" placeholder="Email"
                    value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
                {err('email')}
              </div>

              <div className="input-group">
                <div className={`input ${formik.touched.password && formik.errors.password ? 'input-error' : ''}`}>
                  <Lock size={18} className="input-icon" />
                  <input type="password" name="password" placeholder="Password"
                    value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                </div>
                {err('password')}
              </div>

              {!isLogin && (
                <div className="input-group">
                  <div className={`input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'input-error' : ''}`}>
                    <Lock size={18} className="input-icon" />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password"
                      value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                  </div>
                  {err('confirmPassword')}
                </div>
              )}
            </div>

            {isLogin && (
              <div className="forgot-password">
                Forgot password?{' '}
                <Link to="/forgot-password" className="forgot-link">Click here</Link>
              </div>
            )}

            <div className="button">
              <button
                type={action === 'Registration' ? 'submit' : 'button'}
                className={action === 'Registration' ? 'submit' : 'submit gray'}
                onClick={action !== 'Registration' ? () => switchAction('Registration') : undefined}
                disabled={formik.isSubmitting}
              >
                Sign Up
              </button>
              <button
                type={action === 'Login' ? 'submit' : 'button'}
                className={action === 'Login' ? 'submit' : 'submit gray'}
                onClick={action !== 'Login' ? () => switchAction('Login') : undefined}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? 'Please wait...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegistration;
