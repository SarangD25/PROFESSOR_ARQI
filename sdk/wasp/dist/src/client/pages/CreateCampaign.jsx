// src/client/pages/CreateCampaign.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAction } from 'wasp/client/operations';
import { createCampaign } from 'wasp/client/operations';
export function CreateCampaign() {
    const navigate = useNavigate();
    const createCampaignAction = useAction(createCampaign);
    const [formData, setFormData] = useState({
        title: '',
        examName: 'GATE CS',
        topic: '',
        difficulty: 'medium',
        deadline: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const examOptions = [
        'GATE CS', 'GATE ECE', 'GATE ME', 'GATE EE', 'GATE CE',
        'JEE Main', 'JEE Advanced', 'NEET', 'UPSC Prelims'
    ];
    const topicOptions = {
        'GATE CS': ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Theory of Computation'],
        'GATE ECE': ['Network Theory', 'Signals & Systems', 'Digital Circuits', 'Communications', 'Control Systems'],
        'JEE Main': ['Physics', 'Chemistry', 'Mathematics'],
        'NEET': ['Biology', 'Physics', 'Chemistry'],
        default: ['General Aptitude', 'Engineering Mathematics']
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'examName')
            setFormData(prev => ({ ...prev, topic: '' }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await createCampaignAction({
                title: formData.title,
                examName: formData.examName,
                topic: formData.topic,
                difficulty: formData.difficulty,
                deadline: new Date(formData.deadline).toISOString()
            });
            navigate('/teacher');
        }
        catch (err) {
            setError(err.message || 'Failed to create campaign');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const availableTopics = topicOptions[formData.examName] || topicOptions.default;
    return (<div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Campaign</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Campaign Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border border-gray-600 rounded bg-gray-800" placeholder="e.g., Week 3 - DS Practice"/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Exam *</label>
          <select name="examName" value={formData.examName} onChange={handleChange} required className="w-full p-2 border border-gray-600 rounded bg-gray-800">
            {examOptions.map(exam => (<option key={exam} value={exam}>{exam}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Topic *</label>
          <select name="topic" value={formData.topic} onChange={handleChange} required className="w-full p-2 border border-gray-600 rounded bg-gray-800">
            <option value="">Select a topic</option>
            {availableTopics.map(topic => (<option key={topic} value={topic}>{topic}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full p-2 border border-gray-600 rounded bg-gray-800">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deadline *</label>
          <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} required className="w-full p-2 border border-gray-600 rounded bg-gray-800"/>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </button>
          <button type="button" onClick={() => navigate('/teacher')} className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700">
            Cancel
          </button>
        </div>
      </form>
    </div>);
}
//# sourceMappingURL=CreateCampaign.jsx.map