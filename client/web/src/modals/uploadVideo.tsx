import { useRef, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { uploadVideo, resetUpload } from '../store/videoUploadSlice';
import { toast } from 'react-toastify';
interface UploadVideoProps {
  isOpen: boolean;
  onClose: () => void;
}

function UploadVideo({ isOpen, onClose }: UploadVideoProps) {
  const fileInputRef = useRef<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const dispatch = useAppDispatch();
  const { isUploading, success } = useAppSelector((state) => state.videoUpload) as {
    isUploading: boolean;
    success: boolean;
  };

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      dispatch(resetUpload());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (success) {
      onClose();
    }
  }, [success, onClose]);

  const handleFiles = (files: FileList) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast("Failed to upload!"); 
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('video', selectedFile);

    dispatch(uploadVideo(formData));
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Upload videos</h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="mb-3 text-start">
              <label className="form-label">Title (required)</label>
              <input
                type="text"
                className="form-control bg-transparent text-light white-placeholder"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title that describes your video (type @ to mention a channel)"
                required
                disabled={isUploading}
              />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Description</label>
              <textarea
                className="form-control text-light white-placeholder"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what your video is about (type @ to mention a channel)"
                rows={3}
                disabled={isUploading}
              />
            </div>

            <div
              className="upload-area p-4 mb-3"
              style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
              onClick={!isUploading ? handleFileSelect : undefined}
            >
              {selectedFile ? (
                <div className="text-center">
                  <i className="bi bi-file-earmark-play text-success" style={{ fontSize: '48px' }}></i>
                  <p className="mt-2 mb-0">{selectedFile.name}</p>
                  <small className="text-secondary">
                    {isUploading ? 'Uploading...' : 'Click to change file'}
                  </small>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-upload text-secondary" style={{ fontSize: '48px' }}></i>
                  </div>
                  <h6 className="mb-2">Drag and drop video files to upload</h6>
                  <p className="text-secondary small mb-3">Your videos will be private until you publish them.</p>
                  <button className="btn bg-white text-dark rounded-pill" type="button" disabled={isUploading}>
                    Select files
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="video/*"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                disabled={isUploading}
              />
            </div>
            {selectedFile && (
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !title.trim()}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadVideo;