import JSNcrypts from "../abi/JSNcrypts.json";
import { ethers } from "ethers";

var j = 0;
export function initContract() {
  const abi = JSNcrypts && JSNcrypts.abi;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractAddress = "0x5a799f15Db72d065e3F01BF95f0a3e2A70a75D9E";//0x3495ff126afe3fb85501efb88fb1bdd2c107984c
  const contract = new ethers.Contract(contractAddress, abi, signer);
  console.log(contract);
  return contract;
}

export async function getJSNblog(startIndex, endIndex) {
  const contract = initContract();
  if (!contract) {
    console.error("Contract not available");
    return [];
  }
  const tokenCount = await contract.currentTokenId();
  const tokens = [];
  if (j < tokenCount) {
    for (let i = startIndex; i < endIndex; i++) {
      const token = await contract.blogPosts(i);
      tokens.push({
        tokenId: j,
        author: token.author,
        authorName: token.authorName,
        title: token.title,
        content: token.content,
        ownershipQty: token.ownershipQty.toNumber(),
      });
      j++;
    }
  }
  console.log("tokens", tokens);
  return tokens;
}

export async function contributePost(tokenId, quantity) {
  const contract = initContract(); // Initialize the contract instance

  if (!contract) {
    console.error("Contract not available");
    return;
  }

  const amountToSend = ethers.utils.parseEther((0.1 * quantity).toString()); // Calculate the total amount to be sent

  try {
    const transaction = await contract.contributePost(tokenId, quantity, {
      value: amountToSend, // Set the amount of Ether to be sent with the transaction
    });
    console.log(transaction.hash);

    // Wait for the transaction to be confirmed on the blockchain
    await transaction.wait();
  } catch (error) {
    console.error("Error contributing to post:", error);
  }
}

// export async function mintPost(title, content, quantity) {
//   if (!contract) {
//     console.error("Contract not available");
//     return;
//   }

//   try {
//     const newPost = await contract.createBlogPost(title, content, quantity);
//     console.log(newPost.hash);

//     // Wait for the transaction to be confirmed on the blockchain
//     await newPost.wait();
//   } catch (error) {
//     console.error("Error minting a to post:", error);
//   }
// }
