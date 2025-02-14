#!/bin/bash

set -e

npm install
npm run build

cd packages/common
npm install
npm run test
npm pack

cd ../census
npm install ../common/vocdoni-common*.tgz
cd ../client
npm install ../common/vocdoni-common*.tgz
cd ../data-models
npm install ../common/vocdoni-common*.tgz
cd ../encryption
npm install ../common/vocdoni-common*.tgz
cd ../voting
npm install ../common/vocdoni-common*.tgz
cd ../wallets
npm install ../common/vocdoni-common*.tgz
cd ..

cd signing
npm install
npm run test
npm pack

cd ../census
npm install ../signing/vocdoni-signing*.tgz
cd ../client
npm install ../signing/vocdoni-signing*.tgz
cd ../voting
npm install ../signing/vocdoni-signing*.tgz
cd ../wallets
npm install ../signing/vocdoni-signing*.tgz
cd ..

cd hashing
npm install
npm run test
npm pack

cd ../census
npm install ../hashing/vocdoni-hashing*.tgz
cd ../voting
npm install ../hashing/vocdoni-hashing*.tgz
cd ..

cd encryption
npm install
npm run test
npm pack

cd ../data-models
npm install ../encryption/vocdoni-encryption*.tgz
cd ../voting
npm install ../encryption/vocdoni-encryption*.tgz
cd ..

cd contract-wrappers
npm install
npm run test
npm pack

cd ../data-models
npm install ../contract-wrappers/vocdoni-contract-wrappers*.tgz
cd ../census
npm install ../contract-wrappers/vocdoni-contract-wrappers*.tgz
cd ../voting
npm install ../contract-wrappers/vocdoni-contract-wrappers*.tgz
cd ..

cd data-models
npm install
npm run test
npm pack

cd ../client
npm install ../data-models/vocdoni-data-models*.tgz
cd ../census
npm install ../data-models/vocdoni-data-models*.tgz
cd ../voting
npm install ../data-models/vocdoni-data-models*.tgz
cd ..

cd wallets
npm install
npm run test
npm pack

cd ..

cd client
npm install
npm run test
npm pack

cd ../census
npm install ../client/vocdoni-client*.tgz
cd ../voting
npm install ../client/vocdoni-client*.tgz
cd ..

cd census
npm install
npm run test
npm pack

cd ..

cd voting
npm install
npm run test
npm pack

cd ..
