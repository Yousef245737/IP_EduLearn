import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TopNavbar from '../components/TopNavbar';
import './ForgotPassword.css';

const forgotSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
});

function ForgotPassword() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: forgotSchema,
    onSubmit: (values) => {
      alert(`Reset link sent to ${values.email}!`);
      navigate('/reset-password');
    },
  });

  return (
    <div className="forgot-page">
      <TopNavbar />
      <div className="forgot-container">
        <div className="forgot-box">
          <h2>Forgot Password</h2>

          <form onSubmit={formik.handleSubmit} noValidate>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.email && formik.errors.email ? 'input-error' : ''}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="field-error">{formik.errors.email}</p>
            )}

            <button type="submit">Send Reset Link</button>
          </form>

          <div className="back-link">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;