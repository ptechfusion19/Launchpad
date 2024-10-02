import React, { useContext, useState } from "react";
import solfareImg from "../../assets/home/solfareimg.webp";
import phantomImg from "../../assets/home/phantom.webp";
import LaunchPadContext from "../../context/LaunchPadContext";
import Image from "next/image";

const ConnectModalComp = ({
  connectToPhantom,
  connectToSolflare,
  disconnectFromWallet,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [hover, setHover] = useState(false); // State to manage hover status
  const { connected, balance } = useContext(LaunchPadContext);

  const handleConnect = (value) => {
    if (value === "solfare") {
      connectToSolflare();
    }
    if (value === "phantom") {
      connectToPhantom();
    }
    setShowModal(false);
  };

  const handleDisconnect = () => {
    if (connected) {
      disconnectFromWallet(); // Disconnect from wallet
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <button
        onClick={() => {
          if (connected) {
            handleDisconnect();
          } else {
            handleShowModal();
          }
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        type="button"
        className="connect-button bg-white text-black md:font-bold md:p-3 py-1 px-2 rounded-xl md:rounded-2xl  md:text-md sm:text-sm text-sm cursor-pointer headerMobileBtn"
        aria-haspopup="dialog"
        aria-expanded={showModal}
        aria-controls="modal"
      >
        {connected
          ? hover
            ? "Click to Disconnect"
            : `Balance: ${balance?.toFixed(3)} Sol`
          : "Select Wallet"}
      </button>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div
            id="hs-static-backdrop-modal"
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${showModal ? "animate-fadeIn" : "animate-fadeOut"
              }`}
            role="dialog"
            aria-labelledby="hs-static-backdrop-modal-label"
            aria-modal="true"
            data-hs-overlay-keyboard="false"
            tabIndex="-1"
          >
            <div className="flex flex-col bg-black shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70 md:w-2/6 w-5/6 md:max-w-lg mx-auto ">
              <div className="flex justify-between items-center py-3 px-4 ">
                <h5 className="modal-title" id="staticBackdropLabel">
                  Choose Any Wallet
                </h5>
                <button
                  onClick={handleCloseModal}
                  type="button"
                  className="inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-400 dark:focus:bg-neutral-600"
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                {/* <div
                                    onClick={() => handleConnect("solfare")}
                                    className="m-2 flex items-center px-2 py-3  mx-auto"
                                    style={{
                                        width: "300px",
                                        backgroundColor: "#2e2e55",
                                        borderRadius: "5px",
                                    }}
                                >
                                    <span>
                                        <img src={solfareImg} />
                                    </span>
                                    <button
                                        type="button"
                                        className="bg-transparent text-white modalbtn pl-2"
                                    >
                                        Connect to Solfare
                                    </button>
                                </div> */}
                <div
                  onClick={() => handleConnect("phantom")}
                  className="m-2 flex items-center px-2 py-3  mx-auto"
                  style={{
                    width: "300px",
                    backgroundColor: "#2e2e55",
                    borderRadius: "5px",
                  }}
                >
                  <span>
                    <Image src={phantomImg} />
                  </span>
                  <button
                    type="button"
                    className="bg-transparent text-white modalbtn pl-2"
                  >
                    Connect to Phantom
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectModalComp;
