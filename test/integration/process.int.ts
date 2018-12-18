import {assert} from "chai";
import Web3 = require("web3");

import Process from "../../src/process";

describe("Voting Process", () => {
    const blockchainUrl: string = "http://localhost:8545";
    const votingProcessContractPath: string = "/contracts/VotingProcess.json";
    const votingProcessContractAddress: string = "0x1faf6ef088c2cd328c722eae15f690fe594f4cc5";
    const votingProcessOrganizerAddress: string = "0x4f0e20f8d2ef3cc32fb3f0c0a96e419748dc4476";
    const votingProcessOrganizerAddress2: string = "0x4fc7a3f2ef6cdb7bea6bcf6db80bbb54c4c961ae";

    let process: Process;
    const inputProcessMetadata = {
        censusMerkleRoot: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        endBlock: 1,
        name: "This is a process name",
        question: "Blue pill or red pill?",
        startBlock: 0,
        voteEncryptionPrivateKey: "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        voteEncryptionPublicKey: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        votesBatch1: "0x1111111111111111111111111111111111111111111111111111111111111111",
        votingOptions: ["0x0000000000000000000000000000000000000000000000000000000000000000",
                        "0x1111111111111111111111111111111111111111111111111111111111111111"],
    };

    describe("Creates and checks voting process creation", () => {
        let processId: string;

        before(() => {
            process = new Process(blockchainUrl, votingProcessContractPath, votingProcessContractAddress);
        });

        it("Creates a new process and verify metadata is stored correctly", async () => {
            await process.create(inputProcessMetadata, votingProcessOrganizerAddress);
            processId = await process.getId(inputProcessMetadata.name, votingProcessOrganizerAddress);
            assert.isString(processId, "ProcessId is a string");

            const metadata = await process.getMetadata(processId);

            assert.equal(metadata.name,
                        inputProcessMetadata.name,
                        "The name should match the input");
            assert.equal(metadata.startBlock,
                        inputProcessMetadata.startBlock.valueOf(),
                        "The startBlock should match the input");
            assert.equal(metadata.endBlock,
                        inputProcessMetadata.endBlock.valueOf(),
                        "The endBlock should match the input");
            assert.equal(metadata.censusMerkleRoot,
                        inputProcessMetadata.censusMerkleRoot,
                        "The censusMerkleRoot should match the input");
            assert.equal(metadata.question,
                        inputProcessMetadata.question,
                        "The question should match the input");
            assert.equal(metadata.votingOptions[0],
                        inputProcessMetadata.votingOptions[0],
                        "The votingOptions[0] should match the input");
            assert.equal(metadata.votingOptions[1],
                        inputProcessMetadata.votingOptions[1],
                        "The votingOptions[1] should match the input");
            assert.equal(metadata.voteEncryptionPublicKey,
                        inputProcessMetadata.voteEncryptionPublicKey,
                        "The voteEncryptionPublicKey should match the input");
        });

        it("Creates a some more processes and checks they are listed correctly", async () => {
            let p = Object.assign({}, inputProcessMetadata);
            p.name += "_2";
            await process.create(p, votingProcessOrganizerAddress);

            p = Object.assign({}, inputProcessMetadata);
            p.name += "_3";
            await process.create(p, votingProcessOrganizerAddress);

            p = Object.assign({}, inputProcessMetadata);
            p.name += "_other";
            await process.create(p, votingProcessOrganizerAddress2);

            const processes = await process.getProcessesByOrganizer(votingProcessOrganizerAddress);

            assert.equal(processes.length, 3, "We have 3 processes for the test organitzation");
            assert.equal(processes[1].name, "This is a process name_2", "2nd process name should end with _2");
            assert.equal(processes[2].name, "This is a process name_3", "3rd process name should end with _3");
        });
    });
});
