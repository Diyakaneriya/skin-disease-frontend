import { useState, useEffect } from "react";
import { imageService, authService } from "../services/api"; // Import the services

const images = [
  "./images3.jpeg",
  "./images1.jpeg",
  "./images2.jpeg",
];

const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [features, setFeatures] = useState(null);
  const [classification, setClassification] = useState(null);
  const [showFeatures, setShowFeatures] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (["jpg", "jpeg", "png"].includes(fileExtension)) {
        setSelectedImage(URL.createObjectURL(file));
        
        // Check if user is logged in
        if (!user) {
          alert("Please login to upload images");
          return;
        }
        
        // Upload the image
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const response = await imageService.uploadImage(formData);
          setUploadStatus('Image uploaded successfully!');
          
          // Store the features and classification from the response
          console.log('Response from server:', response);
          if (response.features) {
            console.log('Features received:', response.features);
            setFeatures(response.features);
            setShowFeatures(true);
          } else {
            console.log('No features in response');
          }
          
          if (response.classification) {
            console.log('Classification received:', response.classification);
            setClassification(response.classification);
          } else {
            console.log('No classification in response');
          }
          
          alert('Image uploaded successfully!');
        } catch (error) {
          setUploadStatus('Upload failed. Please try again.');
          alert('Upload failed: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
          setUploading(false);
        }
      } else {
        alert("Please upload an image with .jpg, .jpeg, or .png extension.");
      }
    }
  };
  
  const handleButtonClick = () => {
    if (!user) {
      alert("Please login to upload images");
      return;
    }
    document.getElementById("file-upload").click();
  };
  
  const styles = {
    // Keep all the existing styles
    container: {
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      overflow: "auto"
    },
    imageContainer: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%"
    },
    image: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "opacity 1s ease-in-out"
    },
    overlay: {
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(4px)"
    },
    content: {
      position: "relative",
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      paddingTop: "30px",
      paddingBottom: "30px"
    },
    box: {
      maxWidth: "42rem",
      margin: "0 auto",
      padding: "32px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(8px)",
      borderRadius: "16px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      textAlign: "center",
      overflowY: "visible"
    },
    heading: {
      fontSize: "2.25rem",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "16px"
    },
    text: {
      fontSize: "1.125rem",
      color: "#374151",
      marginBottom: "32px"
    },
    button: {
      display: "inline-flex",
      alignItems: "center",
      padding: "12px 24px",
      backgroundColor: "#111827",
      color: "white",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      fontSize: "1rem"
    },
    fileInput: {
      display: "none"
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            style={{
              ...styles.image,
              opacity: index === currentImage ? 1 : 0
            }}
          />
        ))}
        <div style={styles.overlay} />
      </div>
      <div style={styles.content}>
        <div style={styles.box}>
          <h1 style={styles.heading}>Skin Disease Detection</h1>
          <p style={styles.text}>
            Upload your skin image for instant analysis using our advanced AI
            technology. Get quick and accurate assessments to help identify
            potential skin conditions.
          </p>
          <button 
            style={styles.button} 
            onClick={handleButtonClick}
            disabled={uploading}
          >
            <i className="fa-solid fa-file-import"></i>
            {uploading ? ' Uploading...' : ' Upload Image'}
          </button>
          <input
            type="file"
            id="file-upload"
            accept=".jpg,.jpeg,.png"
            style={styles.fileInput}
            onChange={handleFileChange}
          />
          
          {selectedImage && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center',
              padding: '10px'
            }}>
              <img 
                src={selectedImage} 
                alt="Selected skin image" 
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          )}
          
          {showFeatures && features && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'left',
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#333', textAlign: 'center' }}>Dermatological Features Analysis</h3>
              
              {/* Display Asymmetry Score */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', color: '#444' }}>Asymmetry Score</h4>
                <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                  <div style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '50%', 
                    backgroundColor: features.Asymmetry === 0 ? '#4CAF50' : features.Asymmetry === 1 ? '#FFC107' : '#F44336',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '10px'
                  }}>
                    {features.Asymmetry}
                  </div>
                  <span>
                    {features.Asymmetry === 0 ? 'Symmetric' : 
                     features.Asymmetry === 1 ? 'Asymmetric in one axis' : 
                     'Asymmetric in both axes'}
                  </span>
                </div>
              </div>
              
              {/* Display ABCDE Features */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', color: '#444' }}>Structural Features</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong>Pigment Network:</strong> 
                    <span style={{ 
                      marginLeft: '5px', 
                      padding: '2px 5px', 
                      backgroundColor: features.Pigment_Network === 'AT' ? '#FFC107' : '#4CAF50',
                      borderRadius: '3px',
                      color: 'white'
                    }}>
                      {features.Pigment_Network === 'AT' ? 'Atypical' : 'Typical'}
                    </span>
                  </div>
                  <div>
                    <strong>Dots/Globules:</strong> 
                    <span style={{ 
                      marginLeft: '5px', 
                      padding: '2px 5px', 
                      backgroundColor: features.Dots_Globules === 'A' ? '#4CAF50' : 
                                      features.Dots_Globules === 'AT' ? '#FFC107' : '#4CAF50',
                      borderRadius: '3px',
                      color: 'white'
                    }}>
                      {features.Dots_Globules === 'A' ? 'Absent' : 
                       features.Dots_Globules === 'AT' ? 'Atypical' : 'Typical'}
                    </span>
                  </div>
                  <div>
                    <strong>Streaks:</strong> 
                    <span style={{ 
                      marginLeft: '5px', 
                      padding: '2px 5px', 
                      backgroundColor: features.Streaks === 'P' ? '#FFC107' : '#4CAF50',
                      borderRadius: '3px',
                      color: 'white'
                    }}>
                      {features.Streaks === 'P' ? 'Present' : 'Absent'}
                    </span>
                  </div>
                  <div>
                    <strong>Regression Areas:</strong> 
                    <span style={{ 
                      marginLeft: '5px', 
                      padding: '2px 5px', 
                      backgroundColor: features.Regression_Areas === 'P' ? '#FFC107' : '#4CAF50',
                      borderRadius: '3px',
                      color: 'white'
                    }}>
                      {features.Regression_Areas === 'P' ? 'Present' : 'Absent'}
                    </span>
                  </div>
                  <div>
                    <strong>Blue-Whitish Veil:</strong> 
                    <span style={{ 
                      marginLeft: '5px', 
                      padding: '2px 5px', 
                      backgroundColor: features.Blue_Whitish_Veil === 'P' ? '#FFC107' : '#4CAF50',
                      borderRadius: '3px',
                      color: 'white'
                    }}>
                      {features.Blue_Whitish_Veil === 'P' ? 'Present' : 'Absent'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Display Color Features */}
              <div>
                <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '5px', color: '#444' }}>Color Analysis</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    backgroundColor: features.White ? '#f5f5f5' : '#e0e0e0',
                    border: '1px solid #ccc',
                    color: features.White ? '#000' : '#888',
                    fontWeight: features.White ? 'bold' : 'normal'
                  }}>
                    White {features.White ? '✓' : ''}
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    backgroundColor: features.Red ? '#ffebee' : '#e0e0e0',
                    border: '1px solid #ccc',
                    color: features.Red ? '#c62828' : '#888',
                    fontWeight: features.Red ? 'bold' : 'normal'
                  }}>
                    Red {features.Red ? '✓' : ''}
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    backgroundColor: features.Light_Brown ? '#efebe9' : '#e0e0e0',
                    border: '1px solid #ccc',
                    color: features.Light_Brown ? '#795548' : '#888',
                    fontWeight: features.Light_Brown ? 'bold' : 'normal'
                  }}>
                    Light Brown {features.Light_Brown ? '✓' : ''}
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    backgroundColor: features.Dark_Brown ? '#d7ccc8' : '#e0e0e0',
                    border: '1px solid #ccc',
                    color: features.Dark_Brown ? '#4e342e' : '#888',
                    fontWeight: features.Dark_Brown ? 'bold' : 'normal'
                  }}>
                    Dark Brown {features.Dark_Brown ? '✓' : ''}
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    backgroundColor: features.Blue_Gray ? '#e3f2fd' : '#e0e0e0',
                    border: '1px solid #ccc',
                    color: features.Blue_Gray ? '#1565c0' : '#888',
                    fontWeight: features.Blue_Gray ? 'bold' : 'normal'
                  }}>
                    Blue/Gray {features.Blue_Gray ? '✓' : ''}
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    backgroundColor: features.Black ? '#d6d6d6' : '#e0e0e0',
                    border: '1px solid #ccc',
                    color: features.Black ? '#000' : '#888',
                    fontWeight: features.Black ? 'bold' : 'normal'
                  }}>
                    Black {features.Black ? '✓' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Display Classification Results */}
          {classification && classification.success && (
            <div style={{
              marginTop: '20px',
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f0f7ff',
              borderRadius: '8px',
              textAlign: 'left',
              maxHeight: '500px',
              overflowY: 'auto',
              border: '1px solid #cce5ff'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#0056b3', textAlign: 'center' }}>AI Classification Results</h3>
              
              {/* Display Grad-CAM Visualization */}
              {classification.gradcam && classification.gradcam.success && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ borderBottom: '1px solid #cce5ff', paddingBottom: '5px', color: '#0056b3' }}>AI Visualization (Grad-CAM)</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ flex: '1 1 48%', minWidth: '250px' }}>
                      <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px', fontSize: '0.9rem' }}>Original Image</p>
                      <img 
                        src={`data:image/png;base64,${classification.gradcam.original_image}`} 
                        alt="Original skin lesion" 
                        style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ flex: '1 1 48%', minWidth: '250px' }}>
                      <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px', fontSize: '0.9rem' }}>Grad-CAM Heatmap</p>
                      <img 
                        src={`data:image/png;base64,${classification.gradcam.gradcam_image}`} 
                        alt="Grad-CAM visualization" 
                        style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
                      />
                      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px', textAlign: 'center' }}>
                        Highlighted areas show regions that influenced the AI's decision
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Display Top 3 Classifications */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ borderBottom: '1px solid #cce5ff', paddingBottom: '5px', color: '#0056b3' }}>Diagnosis Prediction</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  {classification.classification.map((result, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: index === 0 ? '#e6f3ff' : '#f8f9fa',
                      borderRadius: '5px',
                      border: index === 0 ? '1px solid #b3d7ff' : '1px solid #e9ecef'
                    }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: index === 0 ? '#007bff' : index === 1 ? '#6c757d' : '#adb5bd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        marginRight: '15px'
                      }}>
                        {result.rank}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: index === 0 ? '#0056b3' : '#343a40' }}>
                          {result.class_name}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          Code: {result.class_code}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: 
                          result.confidence_percent > 85 ? '#28a745' : 
                          result.confidence_percent > 60 ? '#ffc107' : '#dc3545',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {result.confidence_percent}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Display Confidence Level and Recommendation */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ borderBottom: '1px solid #cce5ff', paddingBottom: '5px', color: '#0056b3' }}>Clinical Assessment</h4>
                <div style={{
                  padding: '15px',
                  backgroundColor: 
                    classification.confidence_level === 'high' ? '#e8f5e9' : 
                    classification.confidence_level === 'medium' ? '#fff8e1' : '#ffebee',
                  borderRadius: '5px',
                  marginTop: '10px',
                  border: 
                    classification.confidence_level === 'high' ? '1px solid #c8e6c9' : 
                    classification.confidence_level === 'medium' ? '1px solid #ffecb3' : '1px solid #ffcdd2'
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '10px',
                    color: 
                      classification.confidence_level === 'high' ? '#2e7d32' : 
                      classification.confidence_level === 'medium' ? '#f57f17' : '#c62828'
                  }}>
                    {classification.confidence_level === 'high' ? 'High Confidence Assessment' : 
                     classification.confidence_level === 'medium' ? 'Medium Confidence Assessment' : 
                     'Low Confidence Assessment'}
                  </div>
                  <div style={{ lineHeight: '1.5' }}>
                    {classification.recommendation}
                  </div>
                </div>
              </div>
              
              {/* Disclaimer */}
              <div style={{ 
                marginTop: '20px', 
                padding: '10px', 
                backgroundColor: '#f8d7da', 
                borderRadius: '5px',
                border: '1px solid #f5c6cb',
                fontSize: '0.9rem',
                color: '#721c24'
              }}>
                <strong>DISCLAIMER:</strong> {classification.disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;