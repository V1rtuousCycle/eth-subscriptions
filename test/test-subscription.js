const WETH = artifacts.require('WETH9');
const Subsciption = artifacts.require('Subscription');

const sleep = m => new Promise(r => setTimeout(r, m))
const userNonce = async (account, subscriptionInstance) => { const nonce = await subscriptionInstance.extraNonce(account); return nonce }

contract('Subscription', function(accounts) {
    let wethInstance;
    let subscriptionInstance;


    before(async () => {
        wethInstance = await WETH.deployed();
        subscriptionInstance = await Subsciption.deployed();
    })

    it("Should have correct instantiation parameters", async () => {
        assert.equal(await subscriptionInstance.requiredToAddress(), accounts[1]);
    });

    it('Should deposit WETH from user 2', async () => {
        await wethInstance.deposit({ from: accounts[2], value: 1e18 });
        await wethInstance.approve(subscriptionInstance.address, 1e9, {from: accounts[2]});
        assert.equal(await wethInstance.balanceOf(accounts[2]), 1e18);
    })

    it('Subscription should become ready', async () => {
        assert.equal(await userNonce(accounts[2], subscriptionInstance), 0);
        assert.equal(accounts[1], await subscriptionInstance.requiredToAddress());

        let subscriberWeth = await wethInstance.balanceOf(accounts[2]).then(r => r.toString());
        assert.equal(subscriberWeth, 1e18);

        // GET THE SUBSCRIPTION HASH
        const subscriptionHash = await subscriptionInstance.getSubscriptionHash(accounts[2], accounts[1], wethInstance.address, 1, 5, 1, await userNonce(accounts[2], subscriptionInstance) + 1);
        
        // const sig = await subscriptionInstance.getSubscriptionSigner(subscriptionHash, signedSubscription);
        const signedSubscription = await web3.eth.sign(subscriptionHash, accounts[2]);        

        const isReady = await subscriptionInstance.isSubscriptionReady(accounts[2], accounts[1], wethInstance.address, 1, 5, 1, await userNonce(accounts[2], subscriptionInstance) + 1, signedSubscription);

        assert.equal(isReady, true);

        // Execute the subscription 2 times
        const executeSubscription1 = await subscriptionInstance.executeSubscription(accounts[2], accounts[1], wethInstance.address, 1, 5, 1, await userNonce(accounts[2], subscriptionInstance) + 1, signedSubscription);
        assert.equal(subscriberWeth, 1e18 - 2);

        await (async () => {
            console.time("Slept for")
            await sleep(6000)
            console.timeEnd("Slept for")
        })()

        // GET THE SUBSCRIPTION HASH
        console.log('Subscriber nonce: ', await subscriptionInstance.extraNonce(accounts[2]));
        const subscriptionHash2 = await subscriptionInstance.getSubscriptionHash(accounts[2], accounts[1], wethInstance.address, 1, 5, 1, await userNonce(accounts[2], subscriptionInstance) + 1);
        
        // const sig = await subscriptionInstance.getSubscriptionSigner(subscriptionHash, signedSubscription);
        const signedSubscription2 = await web3.eth.sign(subscriptionHash2, accounts[2]);    

        const isReady2 = await subscriptionInstance.isSubscriptionReady(accounts[2], accounts[1], wethInstance.address, 1, 5, 1, await userNonce(accounts[2], subscriptionInstance) + 1, signedSubscription2);
        console.log(isReady2);
        // const executeSubscription2 = await subscriptionInstance.executeSubscription(accounts[2], accounts[1], wethInstance.address, 1, 5, 1, await userNonce(accounts[2], subscriptionInstance) + 1, signedSubscription2);
        assert.equal(subscriberWeth, 1e18 - 6);


        // const executeSubscription1 = await subscriptionInstance.executeSubscription(accounts[2], accounts[1], wethInstance.address, 1, 5, 1, await userNonce(accounts[2], subscriptionInstance) + 1, signedSubscription);


        console.log(executeSubscription1.logs)
    });
});