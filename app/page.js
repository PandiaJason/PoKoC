"use client";
import { authenticate } from "../app/utils/wallet.js";
import { useState, useEffect } from "react";
import { getJSNblog, contributePost, initContract } from "./utils/contract.js";

export default function JSNcrypts() {
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(1);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState({});
  const [hasRefreshed, setHasRefreshed] = useState(false);

  const handleConnectMetaMask = async () => {
    try {
      if (!connectedAddress) {
        const address = await authenticate();
        setConnectedAddress(address);
        if (!hasRefreshed) {
          setHasRefreshed(true);
          window.location.reload(); // Refresh the page after authentication only once
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.message); // Display the error message in an alert box
    }
  };

  const getTokens = async () => {
    try {
      const fetchedTokens = await getJSNblog(startIndex, endIndex);
      if (fetchedTokens.length > 0) {
        setTokens((prevTokens) => [...prevTokens, ...fetchedTokens]);
        setLoading(false);
      } else {
        setReachedEnd(true);
      }
    } catch (error) {
      console.log("Error fetch :", error);
    }
  };

  useEffect(() => {
    getTokens();
  }, [startIndex, endIndex]);

  const handleScroll = () => {
    const scrollPosition = window.innerHeight + window.pageYOffset;
    const pageHeight = document.documentElement.scrollHeight;

    const scrollThreshold = pageHeight * 0.9;

    if (scrollPosition >= scrollThreshold && !loading && !reachedEnd) {
      setLoading(true);
      setStartIndex((prevStartIndex) => prevStartIndex + 1);
      setEndIndex((prevEndIndex) => prevEndIndex + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading, reachedEnd]);

  const handleInputChange = (event, index) => {
    const numericValue = Number(event.target.value);
    setInputValues({ [index]: isNaN(numericValue) ? "" : numericValue });
    // Fetch the latest token ownership quantity from the chain before the transaction
    reFetchTokenData(index);
  };

  const userInput = async (tokenId) => {
    try {
      const inputValue = inputValues[tokenId];
      console.log(`User input for Token ${tokenId}:`, inputValue);
      setTransactionStatus((prevStatus) => ({
        ...prevStatus,
        [tokenId]: true,
      }));

      await contributePost(tokenId, inputValue);
    } catch (error) {
      console.error(error);
    } finally {
      // Set the transaction status for the specific token back to false

      // Fetch the latest token ownership quantity from the chain
      const contract = initContract(); // Initialize the contract instance
      const token = await contract.blogPosts(tokenId);
      const tokenOwnershipQty = token.ownershipQty.toNumber();
      // Update the token quantity in the tokens state
      setTokens((prevTokens) => {
        const updatedTokens = [...prevTokens];
        updatedTokens[tokenId].ownershipQty = tokenOwnershipQty; // Convert from BigNumber to string (if required)
        return updatedTokens;
      });
      setTransactionStatus((prevStatus) => ({
        ...prevStatus,
        [tokenId]: false,
      }));
      setInputValues((prevInputValues) => {
        const updatedInputValues = { ...prevInputValues };
        delete updatedInputValues[tokenId];
        return updatedInputValues;
      });
    }
  };

  const reFetchTokenData = async (tokenId) => {
    try {
      const contract = initContract();
      const token = await contract.blogPosts(tokenId);
      const tokenOwnershipQty = token.ownershipQty.toNumber();
      setTokens((prevTokens) => {
        const updatedTokens = [...prevTokens];
        updatedTokens[tokenId].ownershipQty = tokenOwnershipQty;
        return updatedTokens;
      });
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };

  // const updateTokenQuantities = async () => {
  //   if (tokens.length > 0) {
  //     tokens.forEach((token, index) => {
  //       reFetchTokenData(index); // Fetch the latest ownershipQty for each token in the tokens array
  //     });
  //   }
  // };

  // useEffect(() => {
  //   // Call the updateTokenQuantities function every 5 seconds (adjust the interval time as needed)
  //   const intervalId = setInterval(updateTokenQuantities, 5000);

  //   // Clean up the interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, [tokens]); // Run the effect whenever the tokens state changes

  return (
    <>
      <div className="connect-wrapper">
        <h1>PoKoC CMS</h1>
        <p className="connect-text"></p>
        <button onClick={handleConnectMetaMask} className="connect-button">
          {connectedAddress ? "Loading" : "Click Me"}
        </button>
      </div>

      <div>
        {tokens.map((token, index) => (
          <div className="space-card">
            <div key={index} className="card">
              <h2>{token.title}</h2>
              <p>{token.content}</p>
              <p>
                <b>Buyable Ownership: {token.ownershipQty}</b>
              </p>
              <div className="support-warpper">
                <input
                  id={`contributeInput-${index}`}
                  inputMode="number"
                  pattern="[0-9]*"
                  placeholder="Enter quantity"
                  value={inputValues[index] || ""}
                  onChange={(event) => handleInputChange(event, index)}
                  className="support-input"
                />

                <button
                  id={`contributeButton-${index}`}
                  onClick={() => userInput(index)}
                  className="support-button"
                  onMouseEnter={(event) => {
                    event.target.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(event) => {
                    event.target.style.transform = "scale(1)";
                  }}
                  disabled={transactionStatus[index]} // Disable the button while transaction is pending for the specific token
                >
                  {transactionStatus[index] ? "Supporting" : "Support"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {loading && !reachedEnd && (
        <div className="loading-container">
          <div className="loading-animation"></div>
        </div>
      )}

      {reachedEnd && (
        <div className="end-container">
          <p>No more content to load.</p>
        </div>
      )}
    </>
  );
}
