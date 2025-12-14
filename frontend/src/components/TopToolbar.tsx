// src/components/TopToolbar.tsx
import React, { type ChangeEvent } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Person3Icon from '@mui/icons-material/Person3';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';

interface TopToolbarProps {
    search: string;
    setSearch: (value: string) => void;
    handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
    visible: boolean;
    setVisible: (v: boolean) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
                                                          search,
                                                          handleSearchChange,
                                                          visible,
                                                          setVisible
                                                      }) => {

    // --- Toolbar Contents ---

    const leftContents = (
        <div className="flex items-center space-x-3 w-1/3">
            <Button
                icon="pi pi-bars"
                className="p-button-text p-button-rounded p-button-secondary text-white"
                onClick={() => setVisible(true)}
                style={{ visibility: visible ? 'hidden' : 'visible' }}
            />
            <div className="logo flex items-center gap-2 text-xl font-bold p-2">
                <AudiotrackIcon fontSize="inherit" /> <span id="platform-name">WaveOn</span>
            </div>
        </div>
    );

    const centerContents = (
        <div className="flex items-center space-x-2 p-input-icon-left">
            {/* The search icon remains fixed */}
            <i className="pi pi-search ml-3 mr-1 text-gray-200 absolute left-0 z-10" style={{marginLeft: '1.5rem'}}/>

            <InputText
                value={search}
                onChange={handleSearchChange}
                placeholder="Search for songs, artists.."
                // *Enforcing the rounded contour and background from Canva design*
                className="search-bar bg-opacity-10 border border-opacity-20 border-white text-white rounded-full w-full"
                style={{
                    width: "400px", // Keep fixed width for the search input itself
                    paddingLeft: "40px", // Pushes text past the search icon
                    borderRadius: "9999px", // Ensure maximum rounding (rounded-full equivalent)
                    background: 'rgba(255, 255, 255, 0.1)', // Matches the Canva design's background
                }}
            />
        </div>

    );

    const rightContents = (
        <div className="flex justify-end items-center w-1/3">
            <div className="user-actions flex gap-4 items-center">
                <div className="text-white cursor-pointer" style={{position: 'relative'}}>
                    <Person3Icon fontSize="large"/>
                </div>
            </div>
        </div>
    );

    return (
        <Toolbar
            left={leftContents}
            center={centerContents}
            right={rightContents}
            className="bg-transparent border-none p-0 mb-8"
        />
    );
};