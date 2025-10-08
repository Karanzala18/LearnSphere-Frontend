import React, { useState, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';

const CreateModal = React.memo(({ type, onClose, onSubmit, subjects }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleChange = useCallback((e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value
    }));
  }, []);

  // Memoized form fields based on type
  const formFields = useMemo(() => {
    switch (type) {
      case 'subject':
        return <SubjectForm handleChange={handleChange} />;
      case 'quiz':
        return <QuizForm handleChange={handleChange} subjects={subjects} />;
      case 'assignment':
        return <AssignmentForm handleChange={handleChange} subjects={subjects} formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  }, [type, handleChange, subjects, formData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md border border-gray-200 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Create {type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
            >
              Create {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateModal.displayName = 'CreateModal';

// Subject Form Component
const SubjectForm = React.memo(({ handleChange }) => (
  <>
    <FormInput label="Subject Name" name="name" required placeholder="Enter subject name" onChange={handleChange} />
    <FormInput label="Subject Code" name="code" required placeholder="e.g., CS301" onChange={handleChange} />
    <FormInput label="Department" name="department" placeholder="e.g., Computer Science" onChange={handleChange} />
    <FormInput label="Credits" name="credits" type="number" min="1" max="6" placeholder="3" onChange={handleChange} />
    <FormSelect label="Semester" name="semester" required onChange={handleChange}>
      <option value="">Select semester</option>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
        <option key={sem} value={sem}>{sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Semester</option>
      ))}
    </FormSelect>
    <FormTextarea label="Description" name="description" rows="3" placeholder="Enter subject description" onChange={handleChange} />
  </>
));

SubjectForm.displayName = 'SubjectForm';

// Quiz Form Component
const QuizForm = React.memo(({ handleChange, subjects }) => (
  <>
    <FormInput label="Quiz Title" name="title" required placeholder="Enter quiz title" onChange={handleChange} />
    <FormSelect label="Subject" name="subject_id" required onChange={handleChange}>
      <option value="">Select subject</option>
      {subjects.map((subject) => (
        <option key={subject.id} value={subject.id}>
          {subject.name} ({subject.code})
        </option>
      ))}
    </FormSelect>
    <FormInput label="Due Date" name="due_date" type="datetime-local" required onChange={handleChange} />
    <FormInput label="Duration (minutes)" name="duration" type="number" required placeholder="60" onChange={handleChange} />
    <FormTextarea label="Instructions" name="instructions" rows="3" placeholder="Enter quiz instructions" onChange={handleChange} />
  </>
));

QuizForm.displayName = 'QuizForm';

// Assignment Form Component
const AssignmentForm = React.memo(({ handleChange, subjects, formData, setFormData }) => (
  <>
    <FormInput label="Assignment Title" name="title" required placeholder="Enter assignment title" onChange={handleChange} />
    <FormSelect label="Subject" name="subject_id" required onChange={handleChange}>
      <option value="">Select subject</option>
      {subjects.map((subject) => (
        <option key={subject.id} value={subject.id}>
          {subject.name} ({subject.code})
        </option>
      ))}
    </FormSelect>
    <FormInput label="Due Date" name="due_date" type="datetime-local" required onChange={handleChange} />
    <FormInput label="Max Points" name="max_points" type="number" required placeholder="100" onChange={handleChange} />
    <FormTextarea label="Description" name="description" rows="3" required placeholder="Enter assignment description" onChange={handleChange} />
    
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">AI Grading Criteria</label>
      <div className="space-y-2">
        {[
          { name: 'check_grammar', label: 'Check Grammar' },
          { name: 'check_structure', label: 'Check Structure' },
          { name: 'check_plagiarism', label: 'Check Plagiarism' },
          { name: 'check_content', label: 'Check Content Quality' }
        ].map(({ name, label }) => (
          <label key={name} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={name}
              onChange={(e) => setFormData({...formData, [name]: e.target.checked})}
              className="rounded border-gray-200 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">{label}</span>
          </label>
        ))}
      </div>
    </div>
  </>
));

AssignmentForm.displayName = 'AssignmentForm';

// Reusable Form Components
const FormInput = React.memo(({ label, name, type = "text", required, placeholder, onChange, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      required={required}
      onChange={onChange}
      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      {...props}
    />
  </div>
));

FormInput.displayName = 'FormInput';

const FormSelect = React.memo(({ label, name, required, onChange, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
    <select
      name={name}
      required={required}
      onChange={onChange}
      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  </div>
));

FormSelect.displayName = 'FormSelect';

const FormTextarea = React.memo(({ label, name, rows, required, placeholder, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
    <textarea
      name={name}
      rows={rows}
      required={required}
      onChange={onChange}
      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
    />
  </div>
));

FormTextarea.displayName = 'FormTextarea';

export default CreateModal;
