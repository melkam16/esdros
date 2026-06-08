'use client';

import { useState, useEffect } from 'react';

interface FacultyFormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  password: string;
  confirmPassword: string;
  pictureUrl: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface FacultyManagementProps {
  departments: Department[];
}

export default function FacultyManagement({ departments }: FacultyManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const generateTemporaryPassword = () => {
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const specials = '!@#$%&*';
    const allChars = lowercase + uppercase + digits + specials;
    
    let pass = '';
    pass += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    pass += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    pass += digits.charAt(Math.floor(Math.random() * digits.length));
    pass += specials.charAt(Math.floor(Math.random() * specials.length));
    
    for (let i = 0; i < 8; i++) {
      pass += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    return pass.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const [formData, setFormData] = useState<FacultyFormData>({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    departmentId: departments[0]?.id || '',
    password: '',
    confirmPassword: '',
    pictureUrl: '',
  });

  useEffect(() => {
    if (isOpen) {
      const securePass = generateTemporaryPassword();
      setFormData((prev) => ({
        ...prev,
        password: securePass,
        confirmPassword: securePass,
      }));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.departmentId) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/faculty/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || undefined,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          departmentId: formData.departmentId,
          password: formData.password,
          pictureUrl: formData.pictureUrl || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Faculty member added successfully!' });
        const nextPass = generateTemporaryPassword();
        setFormData({
          title: '',
          firstName: '',
          lastName: '',
          email: '',
          departmentId: departments[0]?.id || '',
          password: nextPass,
          confirmPassword: nextPass,
          pictureUrl: '',
        });
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add faculty member' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while adding faculty member' });
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
        >
          {isOpen ? '✕ Cancel' : '＋ Add Faculty Member'}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Add New Faculty Member</h3>

          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Title select prefix */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Faculty Title Prefix</label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">None (No Prefix)</option>
                  <option value="Fr.">Fr.</option>
                  <option value="Fr. Dr.">Fr. Dr.</option>
                  <option value="Dn.">Dn.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Dn. Dr.">Dn. Dr.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                </select>
              </div>

              {/* Department selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department Affiliation</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Portrait URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Picture URL (Optional)</label>
                <input
                  type="url"
                  name="pictureUrl"
                  value={formData.pictureUrl}
                  onChange={handleChange}
                  placeholder="Enter portrait image URL"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Generated Password */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Generated Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-mono focus:outline-none cursor-not-allowed text-sm"
                    value={formData.password}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const securePass = generateTemporaryPassword();
                      setFormData((prev) => ({
                        ...prev,
                        password: securePass,
                        confirmPassword: securePass,
                      }));
                    }}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold whitespace-nowrap transition"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">This temporary password will be sent automatically in the welcome email.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
            >
              {isLoading ? 'Adding Faculty Member...' : 'Add Faculty Member'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
