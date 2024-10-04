import React, { useState } from 'react';
import Image from 'next/image';
import ToolTipImg from '../../../public/information.png'; // Import the image

const ToolTip = ({ tooltipContent }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Tooltip Image */}
            <Image
                src={ToolTipImg}
                alt="Tooltip icon"
                width={20} // Adjust width as needed
                height={20} // Adjust height as needed
                className="cursor-pointer"
            />

            {/* Tooltip Content */}
            {showTooltip && (
                <div
                    id="tooltip-default"
                    role="tooltip"
                    className="absolute z-10 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700"
                    style={{ top: '80%', left: '30%', transform: 'translateX(-50%)', marginTop: '5px' }} // Adjust position as needed
                >
                    {tooltipContent}
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
            )}
        </div>
    );
};

export default ToolTip;
