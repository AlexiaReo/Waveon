
import { Button } from "primereact/button";

interface StudyModeOverlayProps {
    isActive: boolean;
    onClose: () => void;
    onActivate: (studyMin: number, breakMin: number) => void;
    isStudyActive: boolean;
    timeLeft: number;
    mode: 'STUDY' | 'BREAK';
    onGiveUp: () => void;
}

export const StudyModeOverlay: React.FC<StudyModeOverlayProps> = ({
                                                                      isActive, onClose, onActivate, isStudyActive
                                                                  }) => {
    // ONLY show this if the user clicked the button and hasn't started yet
    if (!isActive || isStudyActive) return null;

    const buttonStyle = {
        borderColor: '#ee5f33',
        color: 'white',
        backgroundColor: '#ee5f33'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <div className="text-center p-8 bg-gray-900 rounded-lg border border-gray-700">
                <h2 className="text-2xl mb-6">Select Study Session</h2>
                <div className="flex flex-col gap-4">
                    <Button label="2 min Study / 1 min Break" onClick={() => onActivate(2, 1)} style={buttonStyle} className="p-button-outlined" />
                    <Button label="20 min Study / 5 min Break" onClick={() => onActivate(20, 5)} style={buttonStyle} className="p-button-outlined" />
                    <Button label="30 min Study / 10 min Break" onClick={() => onActivate(30, 10)} style={buttonStyle} className="p-button-outlined" />
                    <Button label="60 min Study / 15 min Break" onClick={() => onActivate(60, 15)} style={buttonStyle} className="p-button-outlined" />
                    <Button label="Cancel" onClick={onClose} className="p-button-text text-gray-400" />
                </div>
            </div>
        </div>
    );
};