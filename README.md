# Genie Bulk Listing Cancellation

The request was to create a contract that can bulk cancel listings made on OpenSea.

In the project there is a contract called BatchCancel.sol, which has a public function batchCancel. This function is the implementation that was requested, which takes in an array of orders and proceeds to cancel them. I consequentially made a batch list function called listOrders which takes in an array of NFTs that the user owns and proceeds to list them on OpenSea. I made this to appropriately test that my batch canceller worked. Sidenote, it does not fully list them on OpenSea, meaning that it lists them through the contract, but I did not call the OpenSea SDK to fully post the items. It puts them in their orderbook which subsequently allowed me to cancel them.

Scott mentioned to me that he plans on implementing this for any exchange, so I made an implementation for that. The function is called generalBatchCanceller and it takes in an input of an array of [exchangeId, calldata]. So this allows you to call the cancel function with any parameters for any exchange that has one. This is achieved with simply holding an array of exchanges and a parameter of a CancelInstruction is the exchangeId, which is simply a pointer to an exchange in the array. Then you proceed to call the given exchange using the appropriate calldata.

The contract is currently deployed on Rinkeby at the address here: 0x796b0F208480a7bEa455B3154D4fEAA40E5C1215. I have tested that all the functions work properly, however, only on OpenSea, though it should work with Rarible. You are able to view the transaction logs where you can see that it created listings through OpenSea and proceeded to cancel them.

There are scripts in the script folder that allow you to interact with the contract. For instance there is one to createListings, cancelListings, addExchanges, etc. All which I used to update the contract appropriately and to test the functionality.

I have also written a few tests, however, I have not tested the cancellation functions because I did not have enough time to handle the argument decoding, etc.