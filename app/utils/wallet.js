export async function authenticate() {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Request access to the user's MetaMask accounts
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Check the current network
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });
      const currentChainId = parseInt(chainIdHex, 16);
      console.log(currentChainId.toString());

      var desiredChainId = 80001; // Polygon (Matic) Mumbai testnet

      // Switch to the desired network if not already on it
      if (currentChainId !== desiredChainId) {
        try {
          // Attempt to switch the network
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${desiredChainId.toString(16)}` }],
          });
        } catch (error) {
          // If the network switch fails, prompt the user to add the network manually
          await window.ethereum.request({
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
                rpcUrls: ["https://rpc.ankr.com/polygon_mumbai"],
                blockExplorerUrls: ["https://mumbai.polygonscan.com"],
              },
            ],
          });
        }
      }

      // Return the first account address
      return accounts[0];
    } catch (error) {
      throw new Error("Failed to connect to MetaMask");
    }
  } else {
    throw new Error("MetaMask is not installed");
  }
}
