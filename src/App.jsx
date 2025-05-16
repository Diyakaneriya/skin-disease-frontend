import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UserModal from './components/UserModal'; // Corrected Import
import { useState, useEffect } from 'react';
import Admin from "./pages/admin";


const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reset form validation errors when modal is opened
    useEffect(() => {
        if (isModalOpen) {
            // Add a class to body to prevent scrolling when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scrolling when modal is closed
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            // Clean up
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

    return (
        <BrowserRouter>
            <div>
                <button onClick={() => setIsModalOpen(true)}>User</button>
                <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> {/* Fixed Component Usage */}
                
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;
