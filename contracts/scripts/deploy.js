const hre = require('hardhat');

async function main() {
  console.log('Deploying Notary contract...');

  // Get the contract factory
  const Notary = await hre.ethers.getContractFactory('Notary');

  // Deploy the contract
  const notary = await Notary.deploy();

  // Wait for deployment to finish
  await notary.deployed();

  console.log(`Notary contract deployed to: ${notary.address}`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
