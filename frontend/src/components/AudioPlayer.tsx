import React from "react";

interface Props {
    url: string | null;
}

export const AudioPlayer: React.FC<Props> = ({ url }) => {
    if (!url) return <p className="text-gray-400 text-sm">No audio available</p>;

    return (
        <audio
            controls
            src={url}
            className="w-full mt-4"
        />
    );
};
