// import detectEthereumProvider from "@metamask/detect-provider";
import { MetaMaskSDK } from '@metamask/sdk';


export async function authenticate() {
  const MMSDK = new MetaMaskSDK(options);

  let ethereum;

  // Detect the Ethereum provider (MetaMask) on both desktop and mobile
  try {
    ethereum = await detectEthereumProvider();
  } catch (error) {
    throw new Error(
      "Failed to detect Ethereum provider. Make sure you have MetaMask installed."
    );
  }

  if (!ethereum) {
    throw new Error(
      "MetaMask is not available. Make sure you have MetaMask installed."
    );
  }

    // Check if the detected provider is the same as window.ethereum
    if (ethereum !== window.ethereum) {
      throw new Error("Multiple wallets detected. Please disable other wallets and use MetaMask.");
    }
  

  try {
    if (ethereum.isMetaMask) {
      // Request access to the user's MetaMask accounts
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // Check the current network
      const chainIdHex = await ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(chainIdHex, 16);
      console.log(currentChainId.toString());

      var desiredChainId = 80001; // Polygon (Matic) Mumbai testnet
      // Switch to the desired network if not already on it
      if (currentChainId !== desiredChainId) {
        try {
          // Attempt to switch the network
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
          });
        } catch (error) {
          // If the network switch fails, prompt the user to add the network manually
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${desiredChainId.toString(16)}`,
                chainName: "Polygon (Matic) Mumbai Testnet",
                nativeCurrency: {
                  name: "Matic",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc-mumbai.matic.today"],
                blockExplorerUrls: ["https://mumbai.polygonscan.com"],
              },
            ],
          });
        }
      }

      // Return the first account address
      return accounts[0];
    } else {
      throw new Error("MetaMask is not installed or not supported.");
    }
  } catch (error) {
    throw new Error("Failed to connect to MetaMask. Please try again later.");
  }
}
