// src/pages/ProfilePage.jsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Calendar, BookOpen, Upload, Edit2, Save, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../hooks/useApi';

const profileSchema = Yup.object({
  name:        Yup.string().min(2).max(60).required('Full name is required'),
  email:       Yup.string().email('Enter a valid email').required('Email is required'),
  phone:       Yup.string().optional(),
  dateOfBirth: Yup.string().optional(),
  bio:         Yup.string().max(500).optional(),
});

export default function ProfilePage({ isDarkMode, toggleTheme }) {
  const { user, updateUser } = useAuth();
  const [isEditing,  setIsEditing]  = useState(false);
  const [previewPic, setPreviewPic] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    usersApi.getMyEnrollments()
      .then(setEnrollments)
      .catch(() => {});
  }, []);

  const formik = useFormik({
    initialValues: {
      name:        user?.name        || '',
      email:       user?.email       || '',
      phone:       user?.phone       || '',
      dateOfBirth: user?.dateOfBirth || '',
      bio:         user?.bio         || '',
    },
    enableReinitialize: true,
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setServerError('');
      try {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => fd.append(k, v));
        if (avatarFile) fd.append('avatar', avatarFile);
        const updated = await usersApi.updateMe(fd);
        updateUser(updated);
        setPreviewPic(null);
        setAvatarFile(null);
        setIsEditing(false);
      } catch (err) {
        setServerError(err.message);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    setPreviewPic(null);
    setAvatarFile(null);
    setIsEditing(false);
    setServerError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPic(reader.result);
    reader.readAsDataURL(file);
  };

  const avatarSrc = previewPic
    || (user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : '')
    || `https://avatar.vercel.sh/${user?.name}`;

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'U';

  const field = (name, type = 'text') => ({
    id: name, name, type,
    value:    formik.values[name],
    onChange: formik.handleChange,
    onBlur:   formik.handleBlur,
    className: `mt-1 dark:bg-gray-900 dark:border-gray-700 ${formik.touched[name] && formik.errors[name] ? 'border-red-500' : ''}`,
  });

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information</p>
            </div>
            <div className="flex items-center gap-3">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={formik.handleSubmit} disabled={formik.isSubmitting}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Save className="h-4 w-4" /> {formik.isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline"
                    className="flex items-center gap-2 dark:border-gray-700 dark:text-gray-300">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{serverError}</p>
            </div>
          )}

          <Card className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
            <CardContent className="p-6 space-y-6">

              {/* Avatar + Name */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarSrc} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer">
                      <Upload className="h-3 w-3 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div>
                      <Input {...field('name')} placeholder="Full name"
                        className={`text-xl font-bold mb-1 dark:bg-gray-900 dark:border-gray-700 ${formik.touched.name && formik.errors.name ? 'border-red-500' : ''}`} />
                      {formik.touched.name && formik.errors.name && (
                        <p className="text-red-500 text-xs mt-0.5">{formik.errors.name}</p>
                      )}
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
                  )}
                  <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{user?.role || 'Student'}</p>
                </div>
              </div>

              <Separator className="dark:bg-gray-800" />

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Email</Label>
                  {isEditing ? (
                    <>
                      <Input {...field('email', 'email')} placeholder="Email address" />
                      {formik.touched.email && formik.errors.email && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{user?.email}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Phone</Label>
                  {isEditing ? (
                    <>
                      <Input {...field('phone', 'tel')} placeholder="Phone number" />
                      {formik.touched.phone && formik.errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{user?.phone || '—'}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Date of Birth</Label>
                  {isEditing ? (
                    <Input {...field('dateOfBirth', 'date')} />
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white">{user?.dateOfBirth || '—'}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="dark:bg-gray-800" />

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Me</h3>
                {isEditing ? (
                  <>
                    <textarea
                      name="bio" value={formik.values.bio}
                      onChange={formik.handleChange} onBlur={formik.handleBlur}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white dark:border-gray-700 resize-none ${formik.touched.bio && formik.errors.bio ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {formik.touched.bio && formik.errors.bio && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.bio}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 text-right">{formik.values.bio.length}/500</p>
                  </>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{user?.bio || 'No bio yet.'}</p>
                )}
              </div>

              <Separator className="dark:bg-gray-800" />

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.skills?.length > 0 ? user.skills.map((skill, i) => (
                    <Badge key={i} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {skill}
                    </Badge>
                  )) : <p className="text-gray-500 dark:text-gray-400 text-sm">No skills added yet.</p>}
                </div>
              </div>

              <Separator className="dark:bg-gray-800" />

              {/* Enrolled Courses */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Enrolled Courses</h3>
                {enrollments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No courses enrolled yet.</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((e) => (
                      <div key={e._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{e.course?.title}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{e.course?.instructor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{e.progress}%</p>
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                              <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: `${e.progress}%` }} />
                            </div>
                          </div>
                          <Badge className={e.status === 'Completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}>
                            {e.status}
                          </Badge>
                          {e.grade && (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {e.grade}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
