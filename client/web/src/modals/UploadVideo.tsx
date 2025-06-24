// client/web/src/modals/UploadVideo.tsx
import React, { useState } from 'react';
import { uploadVideo } from '../services/VideoService';
import TagInput from '../components/TagInput';

interface UploadVideoProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadVideo = ({ isOpen, onClose, onUploadSuccess }: UploadVideoProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !description) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags.join(','))

    try {
      await uploadVideo(formData);
      setFile(null);
      setTitle('');
      setDescription('');
      setTags([]);
      onUploadSuccess(); // callback to refresh video list
      onClose();
    } catch (err) {
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#222',
          padding: 32,
          borderRadius: 12,
          minWidth: 350,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}
      >
        <h5 className="text-white mb-2" style={{ textAlign: 'center' }}>Upload Video</h5>
        <input
          type="file"
          accept="video/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          required
          style={{ background: '#181818', color: '#fff', border: 'none', padding: 8, borderRadius: 6 }}
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={{ background: '#181818', color: '#fff', border: 'none', padding: 8, borderRadius: 6 }}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          style={{ background: '#181818', color: '#fff', border: 'none', padding: 8, borderRadius: 6, minHeight: 60 }}
        />
        <TagInput tags={tags} setTags={setTags} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#9147ff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 24px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 24px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideo;