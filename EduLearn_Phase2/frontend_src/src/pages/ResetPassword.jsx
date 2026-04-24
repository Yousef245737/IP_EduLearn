import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import TopNavbar from '../components/TopNavbar';


const resetSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

function ResetPassword() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: resetSchema,
    onSubmit: () => {
      alert('Password reset successfully!');
      navigate('/login');
    },
  });

  return (
    <div className="reset-page">
      <TopNavbar />
      <div className="reset-container">
        <div className="reset-box">
          <h2>Reset Password</h2>

          <form onSubmit={formik.handleSubmit} noValidate>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.password && formik.errors.password ? 'input-error' : ''}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="field-error">{formik.errors.password}</p>
            )}

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'input-error' : ''}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="field-error">{formik.errors.confirmPassword}</p>
            )}

            <button type="submit">Reset Password</button>
          </form>

          <div className="back-link">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;