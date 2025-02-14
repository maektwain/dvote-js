import "mocha" // using @types/mocha
import { expect, } from "chai"
import { addCompletionHooks } from "../mocha-hooks"
import { computePublicKey } from "@ethersproject/signing-key"
import { Wallet } from "@ethersproject/wallet"

import { JsonSignature, BytesSignature } from "../../src"

addCompletionHooks()

describe("JSON signing", () => {
    it("Should reorder JSON objects alphabetically", () => {
        let strA = JSON.stringify(JsonSignature.sort("abc"))
        let strB = JSON.stringify(JsonSignature.sort("abc"))
        expect(strA).to.equal(strB)

        strA = JSON.stringify(JsonSignature.sort(123))
        strB = JSON.stringify(JsonSignature.sort(123))
        expect(strA).to.equal(strB)

        strA = JSON.stringify(JsonSignature.sort({}))
        strB = JSON.stringify(JsonSignature.sort({}))
        expect(strA).to.equal(strB)

        strA = JSON.stringify(JsonSignature.sort({ a: 1, b: 2 }))
        strB = JSON.stringify(JsonSignature.sort({ b: 2, a: 1 }))
        expect(strA).to.equal(strB)

        strA = JSON.stringify(JsonSignature.sort({ a: 1, b: { c: 3, d: 4 } }))
        strB = JSON.stringify(JsonSignature.sort({ b: { d: 4, c: 3 }, a: 1 }))
        expect(strA).to.equal(strB)

        strA = JSON.stringify(JsonSignature.sort({ a: 1, b: [{ a: 10, m: 10, z: 10 }, { b: 11, n: 11, y: 11 }, 4, 5] }))
        strB = JSON.stringify(JsonSignature.sort({ b: [{ z: 10, m: 10, a: 10 }, { y: 11, n: 11, b: 11 }, 4, 5], a: 1 }))
        expect(strA).to.equal(strB)

        strA = JSON.stringify(JsonSignature.sort({ a: 1, b: [5, 4, 3, 2, 1, 0] }))
        strB = JSON.stringify(JsonSignature.sort({ b: [5, 4, 3, 2, 1, 0], a: 1 }))
        expect(strA).to.equal(strB)
    })
    it("Should sign a JSON payload, regardless of the order of the fields", async () => {
        let wallet = new Wallet("8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb")

        const jsonBody1 = { "method": "getVisibility", "timestamp": 1582196988554 }
        const jsonBody2 = { "timestamp": 1582196988554, "method": "getVisibility" }

        const signature1 = await JsonSignature.sign(jsonBody1, wallet)
        const signature2 = await JsonSignature.sign(jsonBody2, wallet)

        expect(signature1).to.equal("0xc99cf591678a1eb545d9c77cf6b8d3873552624c3631e77c82cc160f8c9593354f369a4e57e8438e596073bbe89c8f4474ba45bae2ca7f6c257a0a879d10d4281b")
        expect(signature2).to.equal("0xc99cf591678a1eb545d9c77cf6b8d3873552624c3631e77c82cc160f8c9593354f369a4e57e8438e596073bbe89c8f4474ba45bae2ca7f6c257a0a879d10d4281b")
    })
    it("Should produce and recognize valid signatures, regardless of the order of the fields (isValid)", async () => {
        let wallet = new Wallet("8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb")

        const jsonBody1 = { "method": "getVisibility", "timestamp": 1582196988554 }
        const jsonBody2 = { "timestamp": 1582196988554, "method": "getVisibility" }

        const signature1 = await JsonSignature.sign(jsonBody1, wallet)
        const signature2 = await JsonSignature.sign(jsonBody2, wallet)

        expect(JsonSignature.isValid(signature1, computePublicKey(wallet.publicKey, true), jsonBody1)).to.be.true
        expect(JsonSignature.isValid(signature2, computePublicKey(wallet.publicKey, true), jsonBody2)).to.be.true
        expect(JsonSignature.isValid(signature1, wallet.publicKey, jsonBody1)).to.be.true
        expect(JsonSignature.isValid(signature2, wallet.publicKey, jsonBody2)).to.be.true
    })
    it("Should produce and recognize valid signatures with UTF-8 data (BytesSignature.isValid)", async () => {
        const wallet = new Wallet("8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb")
        const publicKeyComp = computePublicKey(wallet.publicKey, true)
        const publicKey = wallet.publicKey

        const jsonBody1 = '{ "a": "àèìòù", "b": "áéíóú" }'
        const jsonBody2 = '{ "b": "test&", "a": "&test" }'
        const jsonBody3 = '{ "b": "😃🌟🌹⚖️🚀", "a": "&test" }'

        const bytesBody1 = new TextEncoder().encode(jsonBody1)
        const bytesBody2 = new TextEncoder().encode(jsonBody2)
        const bytesBody3 = new TextEncoder().encode(jsonBody3)

        const signature1 = await BytesSignature.sign(bytesBody1, wallet)
        const signature2 = await BytesSignature.sign(bytesBody2, wallet)
        const signature3 = await BytesSignature.sign(bytesBody3, wallet)

        expect(BytesSignature.isValid(signature1, publicKeyComp, bytesBody1)).to.be.true
        expect(BytesSignature.isValid(signature2, publicKeyComp, bytesBody2)).to.be.true
        expect(BytesSignature.isValid(signature3, publicKeyComp, bytesBody3)).to.be.true
        expect(BytesSignature.isValid(signature1, publicKey, bytesBody1)).to.be.true
        expect(BytesSignature.isValid(signature2, publicKey, bytesBody2)).to.be.true
        expect(BytesSignature.isValid(signature3, publicKey, bytesBody3)).to.be.true
    })
    it("Should produce and recognize valid signatures, regardless of the order of the fields (BytesSignature.isValid)", async () => {
        let wallet = new Wallet("8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb")

        const jsonBody1 = '{ "method": "getVisibility", "timestamp": 1582196988554 }'
        const bytesBody1 = new TextEncoder().encode(jsonBody1)
        const jsonBody2 = '{ "timestamp": 1582196988554, "method": "getVisibility" }'
        const bytesBody2 = new TextEncoder().encode(jsonBody2)

        const signature1 = await BytesSignature.sign(bytesBody1, wallet)
        const signature2 = await BytesSignature.sign(bytesBody2, wallet)

        expect(BytesSignature.isValid(signature1, computePublicKey(wallet.publicKey, true), bytesBody1)).to.be.true
        expect(BytesSignature.isValid(signature2, computePublicKey(wallet.publicKey, true), bytesBody2)).to.be.true
        expect(BytesSignature.isValid(signature1, wallet.publicKey, bytesBody1)).to.be.true
        expect(BytesSignature.isValid(signature2, wallet.publicKey, bytesBody2)).to.be.true
    })
    it("Should recover the public key from a JSON and a signature", async () => {
        let wallet = new Wallet("8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb")

        const jsonBody1 = { a: 1, b: "hi", c: false, d: [1, 2, 3, 4, 5, 6] }
        const jsonBody2 = { d: [1, 2, 3, 4, 5, 6], c: false, b: "hi", a: 1 }

        const signature1 = await JsonSignature.sign(jsonBody1, wallet)
        const signature2 = await JsonSignature.sign(jsonBody2, wallet)

        const recoveredPubKeyComp1 = JsonSignature.recoverPublicKey(jsonBody1, signature1)
        const recoveredPubKeyComp2 = JsonSignature.recoverPublicKey(jsonBody2, signature2)
        const recoveredPubKey1 = JsonSignature.recoverPublicKey(jsonBody1, signature1, true)
        const recoveredPubKey2 = JsonSignature.recoverPublicKey(jsonBody2, signature2, true)

        expect(recoveredPubKeyComp1).to.equal(recoveredPubKeyComp2)
        expect(recoveredPubKeyComp1).to.equal(computePublicKey(wallet.publicKey, true))
        expect(recoveredPubKeyComp1).to.equal("0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca")

        expect(recoveredPubKey1).to.equal(recoveredPubKey2)
        expect(recoveredPubKey1).to.equal(wallet.publicKey)
        expect(recoveredPubKey1).to.equal("0x04cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5caeaeb67fbce49e44f089a28f46a4d815abd51bc5fc122065518ea4adb199ba780")
    })
    it("Should recover the public key from a JSON with UTF-8 data and a signature", async () => {
        let wallet = new Wallet("8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb")

        const jsonBody1 = { a: "àèìòù", b: "áéíóú" }
        const jsonBody2 = { b: "áéíóú", a: "àèìòù" }

        const signature1 = await JsonSignature.sign(jsonBody1, wallet)
        const signature2 = await JsonSignature.sign(jsonBody2, wallet)

        const recoveredPubKeyComp1 = JsonSignature.recoverPublicKey(jsonBody1, signature1)
        const recoveredPubKeyComp2 = JsonSignature.recoverPublicKey(jsonBody2, signature2)
        const recoveredPubKey1 = JsonSignature.recoverPublicKey(jsonBody1, signature1, true)
        const recoveredPubKey2 = JsonSignature.recoverPublicKey(jsonBody2, signature2, true)

        expect(recoveredPubKeyComp1).to.equal(recoveredPubKeyComp2)
        expect(recoveredPubKeyComp1).to.equal(computePublicKey(wallet.publicKey, true))
        expect(recoveredPubKeyComp1).to.equal("0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca")

        expect(recoveredPubKey1).to.equal(recoveredPubKey2)
        expect(recoveredPubKey1).to.equal(wallet.publicKey)
        expect(recoveredPubKey1).to.equal("0x04cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5caeaeb67fbce49e44f089a28f46a4d815abd51bc5fc122065518ea4adb199ba780")

    })
    it("Should correctly verify signature of messages singed by go-dvote", () => {
        const bodyHex = "7b226d656d62657273223a5b7b22636f6e73656e746564223a66616c73652c22637265617465644174223a22303030312d30312d30315430303a30303a30305a222c22646174654f664269727468223a22303030312d30312d30315430303a30393a32312b30303a3039222c22656d61696c223a2266657272616e40766f63646f6e692e696f222c22656e746974794964223a226748582f776b594c49574c39567a722b71467545516a2f32656b5930644a444355616368783471767971303d222c2266697273744e616d65223a2246657272616e222c226964223a2239353461663662312d663338382d346463302d396666372d613834346330313531363464222c226c6173744e616d65223a2246657272222c22757064617465644174223a22303030312d30312d30315430303a30303a30305a222c227665726966696564223a22303030312d30312d30315430303a30393a32312b30303a3039227d2c7b22636f6e73656e746564223a66616c73652c22637265617465644174223a22303030312d30312d30315430303a30303a30305a222c22646174654f664269727468223a22303030312d30312d30315430303a30393a32312b30303a3039222c22656d61696c223a226c6175406d61696c2e636f6d222c22656e746974794964223a226748582f776b594c49574c39567a722b71467545516a2f32656b5930644a444355616368783471767971303d222c2266697273744e616d65223a224c6175222c226964223a2239633766393235332d643539302d346438622d613839622d336137663931303038643766222c226c6173744e616d65223a224c6175222c227075626c69634b6579223a224250654845555761716573306e65596a4847626d7537526e484a354c4d366372374d714a745436304f674b4b4a5a77767350686e524949706e716a775349374b4b384e697a744b316e6f6742787a7373324b48497435513d222c22757064617465644174223a22303030312d30312d30315430303a30303a30305a222c227665726966696564223a22323032302d31312d30335431363a34333a31352e3730313331392b30313a3030227d2c7b22636f6e73656e746564223a66616c73652c22637265617465644174223a22303030312d30312d30315430303a30303a30305a222c22646174654f664269727468223a22303030312d30312d30315430303a30393a32312b30303a3039222c22656d61696c223a226d616e6f7340766f63646f6e692e696f222c22656e746974794964223a226748582f776b594c49574c39567a722b71467545516a2f32656b5930644a444355616368783471767971303d222c2266697273744e616d65223a224d616e222c226964223a2239336564356637352d353238352d346466372d623830642d376434383362373332663063222c226c6173744e616d65223a224d616e73222c22757064617465644174223a22303030312d30312d30315430303a30303a30305a222c227665726966696564223a22303030312d30312d30315430303a30393a32312b30303a3039227d2c7b22636f6e73656e746564223a66616c73652c22637265617465644174223a22303030312d30312d30315430303a30303a30305a222c22646174654f664269727468223a22303030312d30312d30315430303a30393a32312b30303a3039222c22656d61696c223a2273746566406d61696c2e636f6d222c22656e746974794964223a226748582f776b594c49574c39567a722b71467545516a2f32656b5930644a444355616368783471767971303d222c2266697273744e616d65223a2253746566222c226964223a2234373536393638612d616266662d343734662d383962622d313535343232333732323935222c226c6173744e616d65223a2253746566222c22757064617465644174223a22303030312d30312d30315430303a30303a30305a222c227665726966696564223a22303030312d30312d30315430303a30393a32312b30303a3039227d2c7b22636f6e73656e746564223a66616c73652c22637265617465644174223a22303030312d30312d30315430303a30303a30305a222c22646174654f664269727468223a22303030312d30312d30315430303a30393a32312b30303a3039222c22656d61696c223a226c6f67696e7340766f63646f6e692e696f222c22656e746974794964223a226748582f776b594c49574c39567a722b71467545516a2f32656b5930644a444355616368783471767971303d222c2266697273744e616d65223a224c6f67696e73222c226964223a2239383265646665342d633832622d346263372d616261662d663436393635336238653934222c226c6173744e616d65223a22566f63222c22757064617465644174223a22303030312d30312d30315430303a30303a30305a222c227665726966696564223a22303030312d30312d30315430303a30393a32312b30303a3039227d5d2c226f6b223a747275652c2272657175657374223a2265383161373166376633222c2274696d657374616d70223a313630353130333934377d"
        const bodyBytes = Uint8Array.from(Buffer.from(bodyHex, 'hex'))
        const signature = "8d2945bd594622e73d0d8b9cf536571f4ffbd3f37c911e1dd1e3b59be9872a8c708adb5a0cbe8d658165bcd6ff05a0f91456f248824b02a121dfc98b6524942200"
        const publicKey = "026d619ede0fe5db4213acec7a989b46f94b00fdfb28f80532e1182037f36e2ef3"
        expect(BytesSignature.isValid(signature, publicKey, bodyBytes)).to.be.true
    })
    it("Should create the sanme signature as go-dvote", async () => {
        const wallet = new Wallet("c6446f24d08a34fdefc2501d6177b25e8a1d0f589b7a06f5a0131e9a8d0307e4")
        const jsonBody = '{"a":"1"}'
        const bytesBody = new TextEncoder().encode(jsonBody)
        let signature = await BytesSignature.sign(bytesBody, wallet)
        signature = signature.substring(0, signature.length - 2)
        let expectedSignature = "0x361d97d64186bc85cf41d918c9f4bb4ffa08cd756cfb57ab9fe2508808eabfdd5ab16092e419bb17840db104f07ee5452e0551ba61aa6b458e177bae224ee5ad00"
        expectedSignature = expectedSignature.substring(0, expectedSignature.length - 2)
        expect(signature).to.equal(expectedSignature)
    })
})
