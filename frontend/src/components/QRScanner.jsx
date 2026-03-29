import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaQrcode, FaTimes } from 'react-icons/fa';

const QRScanner = ({ onScanSuccess, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied. Please use manual code entry.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanSuccess(manualCode.trim());
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <FaQrcode /> QR Code Check-In
          </h2>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            {error}
          </div>
        )}

        <div style={styles.content}>
          {/* Camera Scanner */}
          <div style={styles.scannerSection}>
            <h3 style={styles.sectionTitle}>Scan QR Code</h3>
            
            {!scanning ? (
              <div style={styles.cameraPlaceholder}>
                <FaCamera style={styles.cameraIcon} />
                <p>Click to start camera</p>
                <button onClick={startCamera} style={styles.startBtn}>
                  Start Camera
                </button>
              </div>
            ) : (
              <div style={styles.videoContainer}>
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={styles.video}
                />
                <div style={styles.scannerOverlay}>
                  <div style={styles.scannerBox}></div>
                  <p style={styles.scannerText}>Position QR code within frame</p>
                </div>
                <button onClick={stopCamera} style={styles.stopBtn}>
                  Stop Camera
                </button>
              </div>
            )}
            
            <p style={styles.note}>
              📱 Point your camera at the QR code displayed at the office entrance
            </p>
          </div>

          {/* Manual Code Entry */}
          <div style={styles.divider}>
            <span style={styles.dividerText}>OR</span>
          </div>

          <div style={styles.manualSection}>
            <h3 style={styles.sectionTitle}>Enter Code Manually</h3>
            <form onSubmit={handleManualSubmit} style={styles.form}>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter QR code manually"
                style={styles.input}
              />
              <button type="submit" style={styles.submitBtn}>
                Check In
              </button>
            </form>
            <p style={styles.note}>
              💡 Type the code shown on the office display
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '16px 16px 0 0'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorBanner: {
    background: '#fee',
    color: '#c00',
    padding: '12px 20px',
    borderLeft: '4px solid #c00',
    margin: '0'
  },
  content: {
    padding: '30px'
  },
  scannerSection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '15px',
    color: '#333'
  },
  cameraPlaceholder: {
    background: '#f8f9fa',
    border: '2px dashed #cbd5e0',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center',
    color: '#666'
  },
  cameraIcon: {
    fontSize: '48px',
    color: '#cbd5e0',
    marginBottom: '15px'
  },
  startBtn: {
    marginTop: '15px',
    padding: '12px 30px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  videoContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#000'
  },
  video: {
    width: '100%',
    display: 'block',
    borderRadius: '12px'
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  scannerBox: {
    width: '250px',
    height: '250px',
    border: '3px solid #43e97b',
    borderRadius: '12px',
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
  },
  scannerText: {
    color: 'white',
    marginTop: '20px',
    fontSize: '14px',
    background: 'rgba(0,0,0,0.7)',
    padding: '8px 16px',
    borderRadius: '8px'
  },
  stopBtn: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 30px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  divider: {
    textAlign: 'center',
    margin: '30px 0',
    position: 'relative'
  },
  dividerText: {
    background: 'white',
    padding: '0 15px',
    color: '#999',
    fontSize: '14px',
    position: 'relative',
    zIndex: 1
  },
  manualSection: {
    marginTop: '30px'
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  submitBtn: {
    padding: '12px 30px',
    background: '#43e97b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  note: {
    fontSize: '13px',
    color: '#666',
    margin: '10px 0',
    fontStyle: 'italic'
  }
};

export default QRScanner;
