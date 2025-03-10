import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import { random } from "lodash";
import { DIRECTION_IN_NUMBER } from "../constants/contracts";
import {
  convertBigNumbersToCoordinate,
  convertPlayerPositionToGameCoordinate,
} from "./numbers";
let MaWContractCache = null;

const MaWAbi = require("../contracts/MAW.json").abi;

export const findContractByAddress = async (contractAddress, abi) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new Contract(contractAddress, abi, signer);
  return contract;
};

export const getMAWContract = async () => {
  if (MaWContractCache) return MaWContractCache;

  const contractAddress = process.env.REACT_APP_MAW_CONTRACT_ADDRESS;
  const contract = await findContractByAddress(contractAddress, MaWAbi);
  MaWContractCache = contract;
  return contract;
};

export const join = async (positionX, positionY) => {
  const contract = await getMAWContract();
  const directionNum = random(0, 3);
  const tx = await contract.join(positionX, positionY, directionNum);
  await tx.wait();
};

export const whap = async (targetAddress) => {
  try {
    const contract = await getMAWContract();
    const tx = await contract.whap(targetAddress);
    await tx.wait();
  } catch (error) {
    console.log("🚀 ~ file: contract.js:43 ~ whap ~ error", error);
  }
};

export const findBoatByAddress = async (address) => {
  const contract = await getMAWContract();
  const boat = await contract.getPlayer(address);
  return formatBoatData(boat);
};

export const formatBoatData = (boatDataFromContract) => {
  const [positionX, positionY, directionNum, isAlive] = boatDataFromContract;
  let x, y;
  if (isAlive) {
    const position = convertBigNumbersToCoordinate(positionX, positionY);
    x = position.x;
    y = position.y;
  }
  return {
    x,
    y,
    positionX,
    positionY,
    directionNum,
    isAlive,
  };
};

export const move = async (direction) => {
  const directionNum = DIRECTION_IN_NUMBER[direction];
  const contract = await getMAWContract();
  const tx = await contract.move(directionNum);
  await tx.wait();
};

export const getCurrentPlayerCoordinates = async (address) => {
  const currentPlayer = await findBoatByAddress(address);

  if (!currentPlayer || !currentPlayer.isAlive) {
    return null;
  }

  const currentPlayerPosition = convertPlayerPositionToGameCoordinate({
    x: currentPlayer.x,
    y: currentPlayer.y,
  });

  return currentPlayerPosition;
};
