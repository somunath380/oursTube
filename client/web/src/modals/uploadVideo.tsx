import { useRef } from 'react';

interface UploadVideoProps {
  isOpen: boolean;
  onClose: () => void;
}

function UploadVideo({ isOpen, onClose }: UploadVideoProps) {
  const fileInputRef = useRef<any>(null);

  const handleFiles = (files: FileList) => {
    console.log('Files to upload:', files);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Upload videos</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body text-center p-5">
            <div 
              className="upload-area p-5 mb-3"
              style={{ cursor: 'pointer' }}
            >
              <div className="mb-4">
                <i className="bi bi-upload text-secondary" style={{ fontSize: '48px' }}></i>
              </div>
              <h6 className="mb-2">Drag and drop video files to upload</h6>
              <p className="text-secondary small mb-4">Your videos will be private until you publish them.</p>
              <button className="btn bg-white text-dark rounded-pill" onClick={handleFileSelect}>
                Select files
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="d-none" 
                accept="video/*"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadVideo;