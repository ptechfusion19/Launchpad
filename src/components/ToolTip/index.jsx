import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const ToolTip = ({ tooltipContent }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip Icon */}
      <FontAwesomeIcon
        icon={faInfoCircle}
        size="lg" // Adjust size as needed
        className="cursor-pointer text-white" // You can customize color and size
      />

      {/* Tooltip Content */}
      {showTooltip && (
        <div
          id="tooltip-default"
          role="tooltip"
          className="absolute z-10 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700"
          style={{
            top: "80%",
            left: "30%",
            transform: "translateX(-50%)",
            marginTop: "5px",
          }} // Adjust position as needed
        >
          {tooltipContent}
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      )}
    </div>
  );
};

export default ToolTip;
