import React, { useState } from 'react';
import { Mail, Github, Linkedin } from 'lucide-react';
import Card from '../components/Card.jsx';
import { SITE } from '../data/site.js';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      return;
    }
    
    setStatus('sending');

    // 2. Send the data to Formspree via fetch
    try {
      const response = await fetch('https://formspree.io/f/xzezbzgn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // Tells Formspree to return a JSON response, preventing redirects
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', message: '' }); // Clear the form on success
      } else {
        // Formspree rejected it (e.g., invalid email format)
        setStatus('error'); 
      }
    } catch (error) {
      // Network error
      setStatus('error');
    }
  };

  return (
    <div className="page container">
      <div className="section-head">
        <h2 className="h2">Let&rsquo;s talk</h2>
        <p className="lede">
          Open to remote, employee-track frontend roles. If there&rsquo;s overlap with your team&rsquo;s
          hours or your stack, I&rsquo;d like to hear from you.
        </p>
      </div>

      <div className="contact-grid">
        <div className="contact-links">
          <a href={`mailto:${SITE.email}`} className="card contact-link">
            <Mail size={18} /> <p className='contact-link-visible'>{SITE.email}</p>
          </a>
          <a href={SITE.github} target="_blank" rel="noreferrer" className="card contact-link">
            <Github size={18} /> <p className='contact-link-visible'>{SITE.github.replace('https://', '')}</p>
          </a>
          <a href={SITE.linkedin} target="_blank" rel="noreferrer" className="card contact-link">
            <Linkedin size={18} /> <p className='contact-link-visible'>{SITE.linkedin.replace('https://', '')}</p> 
          </a>
        </div>

        <Card className="contact-form">
          {/* Removed the action and method from the form tag since fetch handles it now */}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              {/* Added name="name" */}
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange('name')} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              {/* Added name="email" */}
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange('email')} />
            </div>
            <div className="field">
              <label htmlFor="message">Message</label>
              {/* Added name="message" */}
              <textarea id="message" name="message" value={form.message} onChange={handleChange('message')} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
            
            {status === 'error' && <p className="form-note error">Please fill in all fields correctly before sending.</p>}
            {status === 'sent' && <p className="form-note success">Message received — I&rsquo;ll reply within a couple of days.</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}